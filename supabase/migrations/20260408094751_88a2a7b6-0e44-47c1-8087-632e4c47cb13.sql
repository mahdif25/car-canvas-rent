CREATE POLICY "Admins can delete reservation addons"
  ON public.reservation_addons FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));