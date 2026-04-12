
CREATE TABLE public.fleet_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_id uuid NOT NULL,
  bank_name text NOT NULL,
  loan_amount numeric NOT NULL,
  monthly_payment numeric NOT NULL,
  loan_duration_months integer NOT NULL,
  start_date date NOT NULL,
  interest_rate numeric NOT NULL DEFAULT 0,
  remaining_amount numeric NOT NULL,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fleet loans"
ON public.fleet_loans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
