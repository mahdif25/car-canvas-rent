ALTER TABLE public.site_settings
  ADD COLUMN hero_video_mobile_scale numeric NOT NULL DEFAULT 1.5,
  ADD COLUMN hero_video_desktop_scale numeric NOT NULL DEFAULT 1.2,
  ADD COLUMN hero_video_offset_y integer NOT NULL DEFAULT 50;