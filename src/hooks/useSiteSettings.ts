import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  hero_bg_type: string;
  hero_bg_value: string;
  hero_overlay_opacity: number;
  facebook_pixel_id: string;
  facebook_capi_token: string;
  tiktok_pixel_id: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  whatsapp_message: string;
  notification_email: string;
  send_reservation_emails: boolean;
  google_reviews_url: string;
  show_reviews_section: boolean;
  lead_capture_mode: string;
  logo_height: number;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as SiteSettings;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SiteSettings>) => {
      // Get the single row id first
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .single();
      if (!existing) throw new Error("No site settings row found");
      const { error } = await supabase
        .from("site_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}
