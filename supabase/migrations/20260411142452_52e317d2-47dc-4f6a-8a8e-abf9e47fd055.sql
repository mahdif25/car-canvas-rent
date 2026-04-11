
-- Create fleet_plates table
CREATE TABLE public.fleet_plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  plate_number text NOT NULL UNIQUE,
  brand text NOT NULL,
  model text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_plates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fleet plates"
  ON public.fleet_plates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view fleet plates"
  ON public.fleet_plates FOR SELECT
  TO public
  USING (true);

-- Add assigned_plate_id to reservations
ALTER TABLE public.reservations
  ADD COLUMN assigned_plate_id uuid REFERENCES public.fleet_plates(id);

-- Validation trigger: cannot set status to 'active' without assigned plate
CREATE OR REPLACE FUNCTION public.validate_reservation_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.assigned_plate_id IS NULL THEN
    RAISE EXCEPTION 'Cannot activate reservation without an assigned vehicle plate';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_reservation_active
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_reservation_active();
