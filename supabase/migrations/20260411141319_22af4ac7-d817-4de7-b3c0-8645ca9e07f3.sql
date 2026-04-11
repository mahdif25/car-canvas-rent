ALTER TABLE public.reservations
  ADD COLUMN is_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN payment_method text NOT NULL DEFAULT 'pickup';