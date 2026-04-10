
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_bg_type TEXT NOT NULL DEFAULT 'color',
  hero_bg_value TEXT DEFAULT '',
  hero_overlay_opacity NUMERIC DEFAULT 0.6,
  facebook_pixel_id TEXT DEFAULT '',
  tiktok_pixel_id TEXT DEFAULT '',
  google_analytics_id TEXT DEFAULT '',
  google_tag_manager_id TEXT DEFAULT '',
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT DEFAULT '',
  whatsapp_message TEXT DEFAULT '',
  notification_email TEXT DEFAULT '',
  send_reservation_emails BOOLEAN DEFAULT true,
  google_reviews_url TEXT DEFAULT '',
  show_reviews_section BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed a default row
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid());
