// WhatsApp webhook handler — handles Meta verification handshake (GET) and inbound events (POST).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appSecret = Deno.env.get("WHATSAPP_APP_SECRET") ?? "";

const supabase = createClient(supabaseUrl, serviceKey);

async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader || !appSecret) return false;
  const expected = signatureHeader.replace("sha256=", "");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === expected;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // -------- Meta verification handshake --------
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge") ?? "";

    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("whatsapp_verify_token")
      .limit(1)
      .single();

    if (error) {
      console.error("Failed to load verify token", error);
      return new Response("Server error", { status: 500, headers: corsHeaders });
    }

    const expected = (settings?.whatsapp_verify_token ?? "").trim();
    const provided = (token ?? "").trim();

    if (mode === "subscribe" && expected.length > 0 && provided === expected) {
      // Meta requires the raw challenge string back, plain text, status 200.
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.warn("Webhook verification failed", {
      mode,
      providedLen: provided.length,
      expectedLen: expected.length,
    });
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  // -------- Inbound event --------
  if (req.method === "POST") {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const valid = await verifySignature(rawBody, signature);

    let payload: unknown = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { _raw: rawBody };
    }

    const { error } = await supabase.from("whatsapp_webhook_events").insert({
      payload: payload as Record<string, unknown>,
      signature_valid: valid,
    });
    if (error) console.error("Failed to log webhook event", error);

    // Always 200 — Meta retries on non-200.
    return new Response("ok", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
