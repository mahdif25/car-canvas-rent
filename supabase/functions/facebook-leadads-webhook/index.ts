import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    .select("fb_leadads_app_secret, fb_leadads_verify_token, fb_leadads_page_access_token")
    .limit(1)
    .single();
  return {
    appSecret: data?.fb_leadads_app_secret || Deno.env.get("FACEBOOK_APP_SECRET") || "",
    verifyToken: data?.fb_leadads_verify_token || Deno.env.get("FB_LEADADS_VERIFY_TOKEN") || "",
    pageAccessToken: data?.fb_leadads_page_access_token || Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN") || "",
  };
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
      console.log("Facebook webhook verified");
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  // POST = incoming lead data
  if (req.method === "POST") {
    const body = await req.text();

    // Verify signature if app secret is set
    if (secrets.appSecret) {
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

    // Process each entry
    const entries = data.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "leadgen") continue;
        const leadgenId = change.value?.leadgen_id;
        const pageId = change.value?.page_id;

        if (!leadgenId) continue;

        if (!secrets.pageAccessToken) {
          console.error("Page Access Token not set, storing minimal lead");
          await supabase.from("leads").insert({
            source: "facebook_lead_ad",
            visitor_id: `fb_lead_${leadgenId}`,
            session_id: `fb_page_${pageId}`,
          });
          continue;
        }

        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${secrets.pageAccessToken}`
          );
          const leadData = await res.json();
          console.log("Lead data from FB:", JSON.stringify(leadData));

          const fields: Record<string, string> = {};
          for (const fd of leadData.field_data || []) {
            fields[fd.name] = fd.values?.[0] || "";
          }

          await supabase.from("leads").insert({
            source: "facebook_lead_ad",
            email: fields.email || null,
            phone: fields.phone_number || fields.phone || null,
            first_name: fields.first_name || fields.full_name?.split(" ")[0] || null,
            last_name: fields.last_name || fields.full_name?.split(" ").slice(1).join(" ") || null,
            visitor_id: `fb_lead_${leadgenId}`,
            session_id: `fb_page_${pageId}`,
            last_reservation_step: 0,
          });
          console.log("Lead inserted successfully");
        } catch (err) {
          console.error("Error fetching lead from FB:", err);
          await supabase.from("leads").insert({
            source: "facebook_lead_ad",
            visitor_id: `fb_lead_${leadgenId}`,
            session_id: `fb_page_${pageId}`,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
