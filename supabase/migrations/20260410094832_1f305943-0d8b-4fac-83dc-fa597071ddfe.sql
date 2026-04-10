
ALTER TABLE public.vehicles ADD COLUMN has_climatisation boolean NOT NULL DEFAULT true;
ALTER TABLE public.vehicles ADD COLUMN has_gps boolean NOT NULL DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN has_bluetooth boolean NOT NULL DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN has_usb boolean NOT NULL DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN has_camera boolean NOT NULL DEFAULT false;
