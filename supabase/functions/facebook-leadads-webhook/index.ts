import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-test-webhook, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INTERNAL_TEST_HEADER = "x-lovable-test-webhook";
const GRAPH_VERSION = "v19.0";

// Common Facebook Lead Ad form field names → leads table columns
const FIELD_MAP: Record<string, string> = {
  email: "email",
  phone: "phone",
  phone_number: "phone",
  full_name: "__full_name__",
  first_name: "first_name",
  last_name: "last_name",
  date_of_birth: "dob",
  dob: "dob",
};

async function verifySignature(payload: string, signature: string, appSecret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `sha256=${hex}` === signature;
}

async function getSettings(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from("site_settings")
    .select("fb_leadads_app_secret, fb_leadads_verify_token, fb_leadads_page_access_token, fb_ad_account_id, fb_leadads_pixel_id, facebook_pixel_id")
    .limit(1)
    .single();
  return {
    appSecret: data?.fb_leadads_app_secret || Deno.env.get("FACEBOOK_APP_SECRET") || "",
    verifyToken: data?.fb_leadads_verify_token || Deno.env.get("FB_LEADADS_VERIFY_TOKEN") || "",
    pageAccessToken: data?.fb_leadads_page_access_token || Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN") || "",
    fallbackAdAccountId: data?.fb_ad_account_id || "",
    fallbackPixelId: data?.fb_leadads_pixel_id || data?.facebook_pixel_id || "",
  };
}

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  return authorization.slice(7).trim() || null;
}

async function isAuthorizedInternalTestRequest(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  if (req.headers.get(INTERNAL_TEST_HEADER) !== "true") return false;
  const token = getBearerToken(req);
  if (!token) return false;
  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return false;
  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
    _user_id: authData.user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) return false;
  return true;
}

function detectLeadType(opts: {
  fieldData: Array<{ name: string; values: string[] }>;
  isOrganic: boolean | undefined;
  userAgent: string;
  isInternalTest: boolean;
  hasCreatedTime: boolean;
}): { type: "real_user" | "facebook_bot" | "test_lead"; isTest: boolean } {
  const { fieldData, isOrganic, userAgent, isInternalTest, hasCreatedTime } = opts;

  if (isInternalTest) return { type: "test_lead", isTest: true };

  // Test lead markers
  const hasTestField = fieldData.some(
    (fd) =>
      fd.name === "is_test_lead" ||
      (fd.values || []).some((v) => /^test/i.test(String(v || "")))
  );
  if (hasTestField || (isOrganic === true && !hasCreatedTime)) {
    return { type: "test_lead", isTest: true };
  }

  // Bot / scraper markers
  const ua = userAgent.toLowerCase();
  if ((ua.includes("facebookexternalhit") || ua.includes("meta-externalagent")) && fieldData.length === 0) {
    return { type: "facebook_bot", isTest: false };
  }

  return { type: "real_user", isTest: false };
}

function mapFieldsToColumns(fieldData: Array<{ name: string; values: string[] }>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const fd of fieldData) {
    const value = fd.values?.[0] || null;
    if (!value) continue;
    const key = FIELD_MAP[fd.name?.toLowerCase()];
    if (!key) continue;
    if (key === "__full_name__") {
      const parts = String(value).trim().split(/\s+/);
      if (!out.first_name) out.first_name = parts[0] || null;
      if (!out.last_name) out.last_name = parts.slice(1).join(" ") || null;
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function fetchGraph(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const secrets = await getSettings(supabase);

  // GET = Facebook verification handshake
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === secrets.verifyToken) {
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const body = await req.text();
  const isInternalTest = await isAuthorizedInternalTestRequest(req, supabase);
  const userAgent = req.headers.get("user-agent") || "";

  // Verify signature
  if (secrets.appSecret && !isInternalTest) {
    const signature = req.headers.get("x-hub-signature-256") || "";
    const valid = await verifySignature(body, signature, secrets.appSecret);
    if (!valid) {
      console.error("Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const data = JSON.parse(body);
  console.log("Received webhook:", JSON.stringify(data));

  const entries = data.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== "leadgen") continue;
      const leadgenId = change.value?.leadgen_id;
      const pageId = change.value?.page_id;
      const formId = change.value?.form_id;
      const adId = change.value?.ad_id;
      const createdTimeRaw = change.value?.created_time;

      if (!leadgenId) continue;

      // Build base record
      const baseRecord: Record<string, any> = {
        source: "facebook_lead_ad",
        visitor_id: `fb_lead_${leadgenId}`,
        session_id: pageId ? `fb_page_${pageId}` : null,
        last_reservation_step: 0,
        fb_leadgen_id: String(leadgenId),
        fb_page_id: pageId ? String(pageId) : null,
        fb_form_id: formId ? String(formId) : null,
        fb_ad_id: adId ? String(adId) : null,
        fb_user_agent: userAgent || null,
        fb_created_time: createdTimeRaw ? new Date(createdTimeRaw * 1000).toISOString() : null,
      };

      let leadDetails: any = null;
      let formDetails: any = null;
      let adDetails: any = null;
      let fieldData: Array<{ name: string; values: string[] }> = [];

      if (!isInternalTest && secrets.pageAccessToken) {
        // Fetch full lead details
        const leadFields = "field_data,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,is_organic,partner_name,platform,custom_disclaimer_responses";
        leadDetails = await fetchGraph(
          `https://graph.facebook.com/${GRAPH_VERSION}/${leadgenId}?fields=${leadFields}&access_token=${secrets.pageAccessToken}`
        );
        if (leadDetails) {
          fieldData = leadDetails.field_data || [];
          baseRecord.fb_raw_field_data = fieldData;
          baseRecord.fb_raw_payload = leadDetails;
          baseRecord.fb_ad_id = leadDetails.ad_id || baseRecord.fb_ad_id;
          baseRecord.fb_ad_name = leadDetails.ad_name || null;
          baseRecord.fb_adset_id = leadDetails.adset_id || null;
          baseRecord.fb_adset_name = leadDetails.adset_name || null;
          baseRecord.fb_campaign_id = leadDetails.campaign_id || null;
          baseRecord.fb_campaign_name = leadDetails.campaign_name || null;
          baseRecord.fb_form_id = leadDetails.form_id || baseRecord.fb_form_id;
          baseRecord.fb_is_organic = leadDetails.is_organic ?? null;
          baseRecord.fb_platform = leadDetails.platform || null;
          baseRecord.fb_partner_name = leadDetails.partner_name || null;
          if (leadDetails.created_time) {
            baseRecord.fb_created_time = new Date(leadDetails.created_time).toISOString();
          }
        }

        // Resolve form name
        const fid = baseRecord.fb_form_id;
        if (fid) {
          formDetails = await fetchGraph(
            `https://graph.facebook.com/${GRAPH_VERSION}/${fid}?fields=name,page&access_token=${secrets.pageAccessToken}`
          );
          if (formDetails?.name) baseRecord.fb_form_name = formDetails.name;
        }

        // Resolve ad → ad account + pixel (best effort)
        const aid = baseRecord.fb_ad_id;
        if (aid) {
          adDetails = await fetchGraph(
            `https://graph.facebook.com/${GRAPH_VERSION}/${aid}?fields=account_id,tracking_specs&access_token=${secrets.pageAccessToken}`
          );
          if (adDetails?.account_id) baseRecord.fb_ad_account_id = `act_${adDetails.account_id}`.replace(/^act_act_/, "act_");
          if (adDetails?.tracking_specs) {
            const pixelSpec = adDetails.tracking_specs.find((s: any) => s.fb_pixel)?.fb_pixel?.[0];
            if (pixelSpec) baseRecord.fb_pixel_id = String(pixelSpec);
          }
        }
      } else if (isInternalTest) {
        // Internal test — synthesize field data
        fieldData = [
          { name: "full_name", values: ["Test Lead"] },
          { name: "email", values: [`test+${leadgenId}@internal.local`] },
          { name: "phone_number", values: ["+212000000000"] },
        ];
        baseRecord.fb_raw_field_data = fieldData;
        baseRecord.fb_raw_payload = { synthetic: true, change_value: change.value };
      }

      // Fallback IDs from settings if Graph didn't return them
      if (!baseRecord.fb_ad_account_id && secrets.fallbackAdAccountId) {
        baseRecord.fb_ad_account_id = secrets.fallbackAdAccountId;
      }
      if (!baseRecord.fb_pixel_id && secrets.fallbackPixelId) {
        baseRecord.fb_pixel_id = secrets.fallbackPixelId;
      }

      // Detect lead type
      const detection = detectLeadType({
        fieldData,
        isOrganic: baseRecord.fb_is_organic ?? undefined,
        userAgent,
        isInternalTest,
        hasCreatedTime: !!baseRecord.fb_created_time,
      });
      baseRecord.fb_lead_type = detection.type;
      baseRecord.fb_is_test_lead = detection.isTest;

      // Map known fields onto typed columns
      const mapped = mapFieldsToColumns(fieldData);
      Object.assign(baseRecord, mapped);

      // Upsert on fb_leadgen_id for idempotency
      const { error } = await supabase
        .from("leads")
        .upsert(baseRecord, { onConflict: "fb_leadgen_id" });

      if (error) {
        console.error("Failed to upsert lead:", error);
      } else {
        console.log(`Lead ${leadgenId} upserted (${detection.type})`);
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
