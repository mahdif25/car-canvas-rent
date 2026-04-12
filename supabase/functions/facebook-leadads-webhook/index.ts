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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // GET = Facebook verification handshake
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = Deno.env.get("FB_LEADADS_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Facebook webhook verified");
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  // POST = incoming lead data
  if (req.method === "POST") {
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");
    const body = await req.text();

    // Verify signature if app secret is set
    if (appSecret) {
      const signature = req.headers.get("x-hub-signature-256") || "";
      const valid = await verifySignature(body, signature, appSecret);
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Process each entry
    const entries = data.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "leadgen") continue;
        const leadgenId = change.value?.leadgen_id;
        const pageId = change.value?.page_id;

        if (!leadgenId) continue;

        // Fetch lead data from Facebook Graph API
        const accessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
        if (!accessToken) {
          console.error("FACEBOOK_PAGE_ACCESS_TOKEN not set, storing minimal lead");
          // Store what we have
          await supabase.from("leads").insert({
            source: "facebook_lead_ad",
            visitor_id: `fb_lead_${leadgenId}`,
            session_id: `fb_page_${pageId}`,
          });
          continue;
        }

        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
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
          // Still store minimal data
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
