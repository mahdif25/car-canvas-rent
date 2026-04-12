
ALTER TABLE public.reservations
  ADD COLUMN customer_cin text,
  ADD COLUMN customer_passport text,
  ADD COLUMN customer_license_delivery_date date,
  ADD COLUMN customer_cin_expiry_date date;

ALTER TABLE public.additional_drivers
  ADD COLUMN cin text,
  ADD COLUMN passport text,
  ADD COLUMN license_delivery_date date,
  ADD COLUMN cin_expiry_date date;
