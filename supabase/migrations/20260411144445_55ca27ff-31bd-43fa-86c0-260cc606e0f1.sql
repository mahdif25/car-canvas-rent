
ALTER TABLE public.vehicle_colors
  ADD COLUMN image_flipped boolean NOT NULL DEFAULT false,
  ADD COLUMN image_scale_home numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_home_mobile numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_home_tablet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_fleet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_fleet_mobile numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_fleet_tablet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_detail numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_detail_mobile numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_detail_tablet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_reservation numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_reservation_mobile numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_reservation_tablet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_sidebar numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_sidebar_mobile numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_sidebar_tablet numeric NOT NULL DEFAULT 1.0;
