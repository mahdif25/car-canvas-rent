

# Fix WhatsApp Webhook Verification

## Root cause
Meta verifies a webhook by sending a `GET` request to your URL with `hub.mode=subscribe&hub.verify_token=...&hub.challenge=...` and expects the `hub.challenge` value echoed back. Your URL `https://...supabase.co/functions/v1/whatsapp-webhook` returns **404** because the function doesn't exist yet — so both Meta's "Verify and save" and our "Vérifier l'abonnement" button fail.

## What I'll build

### 1. New edge function `whatsapp-webhook`
Deployed with `verify_jwt = false` (Meta calls it unauthenticated) at the URL the wizard already shows.

**On `GET`** (Meta verification handshake):
- Read `hub.mode`, `hub.verify_token`, `hub.challenge` from query string
- Load `whatsapp_verify_token` from `site_settings`
- If `mode === "subscribe"` AND token matches → respond `200` with the raw `hub.challenge` value (plain text, no JSON wrap — Meta requires this exact format)
- Otherwise → `403`

**On `POST`** (incoming messages — placeholder for now):
- Verify `X-Hub-Signature-256` HMAC using `WHATSAPP_APP_SECRET`
- Log payload to `whatsapp_webhook_events` (new lightweight log table) so you can see Meta's pings even before the chat UI is built
- Return `200` immediately (Meta retries on non-200)

### 2. Tiny migration
Add `whatsapp_webhook_events` table (id, payload jsonb, signature_valid bool, received_at) — admin-only RLS — so incoming events are captured from day one and visible later in the chat dashboard build.

### 3. Wizard tweak — Step 4
- Add a **"Tester la vérification"** button next to the existing copy button. It calls our own webhook with `?hub.mode=subscribe&hub.verify_token={current}&hub.challenge=test123` and shows ✅ if `test123` comes back, ❌ with the actual response otherwise. This lets you confirm the endpoint works **before** going to Meta.
- Make the verify-token input save **immediately on change** (not only on blur) so what you paste into Meta always matches what's in the DB. Today's bug: if you typed in the field then jumped to Meta without blurring, Meta sees the old token.
- Show the currently saved verify token in a read-only confirmation row above the Meta instructions, so there's zero ambiguity about which value to paste.

### 4. Files

| File | Change |
|---|---|
| `supabase/functions/whatsapp-webhook/index.ts` | **New** — GET handshake + POST signature-verified ingest |
| Migration | New `whatsapp_webhook_events` table + RLS |
| `src/components/admin/WhatsAppBusinessSetup.tsx` | Add "Tester la vérification" button, immediate save on verify-token edit, saved-value confirmation row |

## After this ships — your steps
1. Open Admin → Settings → WhatsApp → Step 4
2. Click **Tester la vérification** → must show ✅
3. In Meta WhatsApp Configuration → paste the URL + verify token → click **Verify and save** → success
4. Subscribe to `messages` field
5. Back in the wizard → **Vérifier l'abonnement** → ✅

## Responsive
Step 4 changes are all inside the existing accordion card — copy/test/generate buttons stack vertically on mobile (`flex-col sm:flex-row`), full-width inputs everywhere, same pattern as current setup.

