// WhatsApp Cloud API diagnostic endpoint — admin-only
// Verifies token, WhatsApp Business Account ID, Phone Number ID, and webhook subscription.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

type CheckType = "token" | "waba" | "phone" | "subscription" | "send_test";

interface Body {
  check: CheckType;
  waba_id?: string;
  phone_id?: string;
  to?: string; // for send_test
}

async function graphGet(path: string, token: string) {
  const r = await fetch(`${GRAPH}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ ok: false, message: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, message: "WHATSAPP_ACCESS_TOKEN n'est pas configuré dans les secrets." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.check === "token") {
      // /debug_token requires app token (app_id|app_secret) — fall back to /me
      const me = await graphGet(`/me?fields=id,name`, token);
      if (!me.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: `Token invalide: ${me.json?.error?.message ?? "erreur inconnue"}`,
            details: me.json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          message: `Token valide${appSecret ? " · App Secret présent" : " · ⚠ App Secret manquant"}`,
          details: { ...me.json, app_secret_present: !!appSecret },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.check === "waba") {
      if (!body.waba_id) {
        return new Response(
          JSON.stringify({ ok: false, message: "WhatsApp Business Account ID requis" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const r = await graphGet(`/${body.waba_id}?fields=id,name,currency,timezone_id`, token);
      if (!r.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: `WABA introuvable: ${r.json?.error?.message ?? r.status}`,
            details: r.json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          message: `Compte WhatsApp Business: ${r.json?.name ?? r.json?.id}`,
          details: r.json,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.check === "phone") {
      if (!body.phone_id) {
        return new Response(
          JSON.stringify({ ok: false, message: "Phone Number ID requis" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const r = await graphGet(
        `/${body.phone_id}?fields=display_phone_number,verified_name,quality_rating,code_verification_status`,
        token,
      );
      if (!r.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: `Numéro introuvable: ${r.json?.error?.message ?? r.status}`,
            details: r.json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          message: `${r.json?.display_phone_number ?? "Numéro"} (${r.json?.verified_name ?? "—"}) · qualité: ${r.json?.quality_rating ?? "n/a"}`,
          details: r.json,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.check === "subscription") {
      if (!body.waba_id) {
        return new Response(
          JSON.stringify({ ok: false, message: "WhatsApp Business Account ID requis" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const r = await graphGet(`/${body.waba_id}/subscribed_apps`, token);
      if (!r.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: `Impossible de lire les abonnements: ${r.json?.error?.message ?? r.status}`,
            details: r.json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const apps = (r.json?.data ?? []) as Array<Record<string, unknown>>;
      if (apps.length === 0) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: "Aucune app abonnée à ce WABA. Abonnez votre app dans Meta puis réessayez.",
            details: r.json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          message: `${apps.length} app(s) abonnée(s) à ce WABA ✓`,
          details: r.json,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.check === "send_test") {
      if (!body.phone_id || !body.to) {
        return new Response(
          JSON.stringify({ ok: false, message: "Phone Number ID et numéro destinataire requis" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const r = await fetch(`${GRAPH}/${body.phone_id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: body.to.replace(/\D/g, ""),
          type: "template",
          template: { name: "hello_world", language: { code: "en_US" } },
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: `Échec envoi: ${json?.error?.message ?? r.status}`,
            details: json,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          message: `Message envoyé ✓ (id: ${json?.messages?.[0]?.id ?? "?"})`,
          details: json,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: false, message: "Type de vérification inconnu" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
