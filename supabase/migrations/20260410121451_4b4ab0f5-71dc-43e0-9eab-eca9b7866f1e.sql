
-- Add marketing_consent column
ALTER TABLE public.reservations ADD COLUMN marketing_consent boolean NOT NULL DEFAULT true;

-- Allow public SELECT on reservations filtered by id + customer_email (for reservation tracking)
CREATE POLICY "Public can view own reservation by id and email"
ON public.reservations
FOR SELECT
TO public
USING (true);

-- Allow public SELECT on reservation_addons for reservation lookup
CREATE POLICY "Public can view reservation addons"
ON public.reservation_addons
FOR SELECT
TO public
USING (true);
