CREATE TABLE public.whatsapp_webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature_valid boolean NOT NULL DEFAULT false,
  received_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view whatsapp webhook events"
ON public.whatsapp_webhook_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert whatsapp webhook events"
ON public.whatsapp_webhook_events
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);

CREATE INDEX idx_whatsapp_webhook_events_received_at ON public.whatsapp_webhook_events (received_at DESC);