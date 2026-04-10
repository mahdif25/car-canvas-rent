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

export function useAnalytics() {
  const visitorId = useRef(getOrCreate(localStorage, "clc_visitor_id"));
  const sessionId = useRef(getOrCreate(sessionStorage, "clc_session_id"));
  const device = useRef(detectDevice());

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
        // silent fail – analytics should never break UX
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

  // Auto-track page view on mount
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const leadIdRef = useRef<string | null>(null);

  const captureLeadField = useCallback(
    async (fields: Record<string, string>, step: number) => {
      try {
        if (leadIdRef.current) {
          // Update existing lead for this session
          await supabase
            .from("leads")
            .update({
              ...fields,
              last_reservation_step: step,
              updated_at: new Date().toISOString(),
            })
            .eq("id", leadIdRef.current);
        } else {
          // First capture this session — insert new row
          const { data } = await supabase
            .from("leads")
            .insert({
              visitor_id: visitorId.current,
              session_id: sessionId.current,
              ...fields,
              last_reservation_step: step,
            })
            .select("id")
            .single();
          if (data) {
            leadIdRef.current = data.id;
          }
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
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .eq("visitor_id", visitorId.current)
          .order("created_at", { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase
            .from("leads")
            .update({ reservation_completed: true, reservation_id: reservationId, updated_at: new Date().toISOString() })
            .eq("id", existing[0].id);
        }
      } catch {
        // silent
      }
    },
    []
  );

  return {
    visitorId: visitorId.current,
    sessionId: sessionId.current,
    trackPageView,
    trackReservationStep,
    trackFieldCapture,
    captureLeadField,
    markLeadCompleted,
  };
}
