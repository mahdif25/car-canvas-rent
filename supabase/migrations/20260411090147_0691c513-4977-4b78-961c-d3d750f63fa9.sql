
-- Add per-device offset columns
ALTER TABLE public.site_settings
  ADD COLUMN hero_video_mobile_offset_x integer NOT NULL DEFAULT 50,
  ADD COLUMN hero_video_mobile_offset_y integer NOT NULL DEFAULT 50,
  ADD COLUMN hero_video_tablet_offset_x integer NOT NULL DEFAULT 50,
  ADD COLUMN hero_video_tablet_offset_y integer NOT NULL DEFAULT 50,
  ADD COLUMN hero_video_desktop_offset_x integer NOT NULL DEFAULT 50,
  ADD COLUMN hero_video_desktop_offset_y integer NOT NULL DEFAULT 50;

-- Create hero-videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-videos', 'hero-videos', true);

-- Anyone can view hero videos
CREATE POLICY "Anyone can view hero videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-videos');

-- Admins can upload hero videos
CREATE POLICY "Admins can upload hero videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-videos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update hero videos
CREATE POLICY "Admins can update hero videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-videos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete hero videos
CREATE POLICY "Admins can delete hero videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-videos' AND public.has_role(auth.uid(), 'admin'));
