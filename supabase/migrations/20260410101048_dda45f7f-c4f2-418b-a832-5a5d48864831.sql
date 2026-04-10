
-- Create vehicle_images table
CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view vehicle images"
ON public.vehicle_images FOR SELECT
USING (true);

CREATE POLICY "Admins can insert vehicle images"
ON public.vehicle_images FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update vehicle images"
ON public.vehicle_images FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vehicle images"
ON public.vehicle_images FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);

-- Add slug column to vehicles
ALTER TABLE public.vehicles ADD COLUMN slug TEXT UNIQUE;
