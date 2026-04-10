ALTER TABLE public.vehicles
  ADD COLUMN image_flipped boolean NOT NULL DEFAULT false,
  ADD COLUMN image_scale numeric NOT NULL DEFAULT 1.0;