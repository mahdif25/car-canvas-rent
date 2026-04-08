import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Get IP from headers
    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Try free geo lookup
    let country = null;
    let city = null;
    if (ip_address && ip_address !== "unknown") {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip_address}?fields=country,city`);
        if (geo.ok) {
          const geoData = await geo.json();
          country = geoData.country || null;
          city = geoData.city || null;
        }
      } catch {
        // geo lookup failed, continue
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("analytics_events").insert({
      session_id: body.session_id,
      visitor_id: body.visitor_id,
      event_type: body.event_type,
      page_path: body.page_path || null,
      referrer: body.referrer || null,
      ip_address,
      country,
      city,
      device_type: body.device_type || null,
      browser: body.browser || null,
      os: body.os || null,
      user_agent: body.user_agent || null,
      metadata: body.metadata || {},
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
