ALTER TABLE public.fleet_plates
ADD COLUMN image_flipped boolean NOT NULL DEFAULT false,
ADD COLUMN image_scale numeric NOT NULL DEFAULT 1.0,
ADD COLUMN image_offset_y numeric NOT NULL DEFAULT 50;