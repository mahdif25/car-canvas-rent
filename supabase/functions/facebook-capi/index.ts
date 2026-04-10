import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { event_name, event_id, event_source_url, user_data, custom_data } = await req.json();

    if (!event_name || !event_id) {
      return new Response(JSON.stringify({ error: "event_name and event_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read settings using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await supabase
      .from("site_settings")
      .select("facebook_pixel_id, facebook_capi_token")
      .limit(1)
      .single();

    if (!settings?.facebook_pixel_id || !settings?.facebook_capi_token) {
      return new Response(JSON.stringify({ error: "Facebook Pixel ID or CAPI token not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build user_data with hashed PII
    const hashedUserData: Record<string, any> = {};
    if (user_data?.em) hashedUserData.em = [await sha256Hash(user_data.em)];
    if (user_data?.fn) hashedUserData.fn = [await sha256Hash(user_data.fn)];
    if (user_data?.ln) hashedUserData.ln = [await sha256Hash(user_data.ln)];
    if (user_data?.ph) hashedUserData.ph = [await sha256Hash(user_data.ph.replace(/[^0-9]/g, ""))];
    if (user_data?.fbc) hashedUserData.fbc = user_data.fbc;
    if (user_data?.fbp) hashedUserData.fbp = user_data.fbp;
    if (user_data?.fbclid) hashedUserData.fbclid = user_data.fbclid;

    // Get client IP from request headers
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip");
    if (clientIp) hashedUserData.client_ip_address = clientIp;

    const clientUserAgent = req.headers.get("user-agent");
    if (clientUserAgent) hashedUserData.client_user_agent = clientUserAgent;

    const eventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url: event_source_url || undefined,
      action_source: "website",
      user_data: hashedUserData,
      custom_data: custom_data || undefined,
    };

    const payload = {
      data: [eventData],
    };

    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${settings.facebook_pixel_id}/events?access_token=${settings.facebook_capi_token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const fbResult = await fbResponse.json();

    return new Response(JSON.stringify({ success: true, fb_response: fbResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Facebook CAPI error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
