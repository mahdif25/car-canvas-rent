
CREATE TABLE public.fleet_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_id uuid NOT NULL REFERENCES public.fleet_plates(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  amount numeric NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fleet expenses"
  ON public.fleet_expenses
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
