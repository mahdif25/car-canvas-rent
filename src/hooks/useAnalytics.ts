import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

function getOrCreate(storage: Storage, key: string): string {
  let val = storage.getItem(key);
  if (!val) {
    val = crypto.randomUUID();
    storage.setItem(key, val);
  }
  return val;
}

function detectDevice(): { device_type: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(ua)) os = "iOS";

  return { device_type, browser, os };
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, params?: Record<string, any>) => void; page: () => void };
    gtag?: (...args: any[]) => void;
  }
}

export function useAnalytics() {
  const visitorId = useRef(getOrCreate(localStorage, "clc_visitor_id"));
  const sessionId = useRef(getOrCreate(sessionStorage, "clc_session_id"));
  const device = useRef(detectDevice());

  // Capture fbclid on init
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      sessionStorage.setItem("fbclid", fbclid);
      sessionStorage.setItem("fbc", `fb.1.${Date.now()}.${fbclid}`);
    }
  }, []);

  const track = useCallback(
    async (event_type: string, metadata: Record<string, any> = {}, page_path?: string) => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/track-analytics`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId.current,
            visitor_id: visitorId.current,
            event_type,
            page_path: page_path || window.location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            ...device.current,
            metadata,
          }),
        });
      } catch {
        // silent fail
      }
    },
    []
  );

  const trackPageView = useCallback(
    (path?: string) => track("page_view", {}, path),
    [track]
  );

  const trackReservationStep = useCallback(
    (step: number, meta: Record<string, any> = {}) =>
      track("reservation_step", { step, ...meta }),
    [track]
  );

  const trackFieldCapture = useCallback(
    (fields: Record<string, string>) => track("form_field_capture", fields),
    [track]
  );

  // Facebook event tracking (Pixel + CAPI)
  const trackFacebookEvent = useCallback(
    async (eventName: string, customData: Record<string, any> = {}) => {
      const eventId = crypto.randomUUID();

      // Client-side Pixel
      try {
        if (window.fbq) {
          window.fbq("track", eventName, customData, { eventID: eventId });
        }
      } catch {
        // silent
      }

      // Server-side CAPI
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/facebook-capi`;
        const userData: Record<string, string> = {};
        const em = sessionStorage.getItem("fb_em");
        const fn = sessionStorage.getItem("fb_fn");
        const ln = sessionStorage.getItem("fb_ln");
        const ph = sessionStorage.getItem("fb_ph");
        const fbc = sessionStorage.getItem("fbc");
        const fbp = sessionStorage.getItem("fbp");
        const fbclid = sessionStorage.getItem("fbclid");
        if (em) userData.em = em;
        if (fn) userData.fn = fn;
        if (ln) userData.ln = ln;
        if (ph) userData.ph = ph;
        if (fbc) userData.fbc = fbc;
        if (fbp) userData.fbp = fbp;
        if (fbclid) userData.fbclid = fbclid;

        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_name: eventName,
            event_id: eventId,
            event_source_url: window.location.href,
            user_data: userData,
            custom_data: customData,
          }),
        });
      } catch {
        // silent
      }
    },
    []
  );

  // Auto-track page view on mount
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const leadIdRef = useRef<string | null>(
    sessionStorage.getItem("pending_lead_id")
  );

  const captureLeadField = useCallback(
    async (fields: Record<string, string>, step: number, capi_allowed: boolean = true) => {
      try {
        if (leadIdRef.current) {
          await supabase
            .from("leads")
            .update({
              ...fields,
              last_reservation_step: step,
              capi_allowed,
              updated_at: new Date().toISOString(),
            })
            .eq("id", leadIdRef.current);
        } else {
          const newId = crypto.randomUUID();
          await supabase
            .from("leads")
            .insert({
              id: newId,
              visitor_id: visitorId.current,
              session_id: sessionId.current,
              ...fields,
              last_reservation_step: step,
              capi_allowed,
            });
          leadIdRef.current = newId;
          sessionStorage.setItem("pending_lead_id", newId);
        }
      } catch {
        // silent
      }
    },
    []
  );

  const markLeadCompleted = useCallback(
    async (reservationId: string) => {
      try {
        let targetId = leadIdRef.current;
        if (!targetId) {
          const { data: existing } = await supabase
            .from("leads")
            .select("id")
            .eq("visitor_id", visitorId.current)
            .order("created_at", { ascending: false })
            .limit(1);
          if (existing && existing.length > 0) targetId = existing[0].id;
        }
        if (targetId) {
          await supabase
            .from("leads")
            .update({ reservation_completed: true, reservation_id: reservationId, updated_at: new Date().toISOString() })
            .eq("id", targetId);
        }
      } catch {
        // silent
      }
    },
    []
  );

  const trackTikTokEvent = useCallback(
    (eventName: string, params: Record<string, any> = {}) => {
      try {
        if (window.ttq) window.ttq.track(eventName, params);
      } catch { /* silent */ }
    },
    []
  );

  const trackGAEvent = useCallback(
    (eventName: string, params: Record<string, any> = {}) => {
      try {
        if (window.gtag) window.gtag("event", eventName, params);
      } catch { /* silent */ }
    },
    []
  );

  return {
    visitorId: visitorId.current,
    sessionId: sessionId.current,
    trackPageView,
    trackReservationStep,
    trackFieldCapture,
    trackFacebookEvent,
    trackTikTokEvent,
    trackGAEvent,
    captureLeadField,
    markLeadCompleted,
  };
}
