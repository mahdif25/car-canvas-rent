ALTER TABLE public.site_settings
  ADD COLUMN hero_video_tablet_scale numeric NOT NULL DEFAULT 1.3,
  ADD COLUMN hero_video_offset_x integer NOT NULL DEFAULT 50;