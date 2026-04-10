ALTER TABLE public.vehicles
  ADD COLUMN image_scale_home numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_fleet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_detail numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_reservation numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_sidebar numeric NOT NULL DEFAULT 1.0;

UPDATE public.vehicles SET
  image_scale_home = image_scale,
  image_scale_fleet = image_scale,
  image_scale_detail = image_scale,
  image_scale_reservation = image_scale,
  image_scale_sidebar = image_scale;

ALTER TABLE public.vehicles DROP COLUMN image_scale;