

# WhatsApp Setup — Reuse Facebook App + Guided Wizard

## What you'll get
The same Meta App you already use for Lead Ads will also handle WhatsApp. The same permanent System User token + the same App Secret are reused — no new credentials needed beyond what you already generated. A new **6-step guided wizard** in Admin Settings walks you through configuring WhatsApp, with **inline verification at each step** and **auto-save** so you never lose progress.

## How

### 1. Reuse existing credentials (no duplication)
- `WHATSAPP_ACCESS_TOKEN` secret = your existing permanent System User token (the one already used for Lead Ads). One value, one secret.
- `WHATSAPP_APP_SECRET` secret = same App Secret already configured for Lead Ads webhook signature verification. We reuse it; no separate secret needed.
- The Lead Ads webhook function and the new WhatsApp webhook function both read the same App Secret from env.

We'll add the two secrets through the secret prompt (you paste them once, they're stored in Lovable Cloud).

### 2. New `WhatsAppSettings.tsx` — 6-step accordion wizard

Same pattern as your existing `FacebookLeadAdsSetup.tsx`. Each step has:
- Plain-language explanation
- **"Where to find this"** link to the exact Meta dashboard page
- Input field that **auto-saves on blur** to `site_settings`
- **Green "Vérifier" button** that calls a Graph API check and shows ✅ or ❌ with the exact error
- Steps stay collapsed/expanded based on completion status (badge on each step header: `À configurer` / `Vérifié`)

| Step | Field | Verification |
|---|---|---|
| 1. Reuse existing app | (info only — confirms `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_APP_SECRET` exist) | `GET /debug_token` to confirm token validity, expiry = "never", and required scopes present |
| 2. WhatsApp Business Account ID | `whatsapp_business_account_id` | `GET /{waba-id}?fields=id,name,currency` |
| 3. Phone Number ID | `whatsapp_phone_number_id` | `GET /{phone-id}?fields=display_phone_number,verified_name,quality_rating` — shows your number + quality |
| 4. Webhook URL + Verify Token | `whatsapp_verify_token` (auto-generated UUID, regenerable) + read-only webhook URL with copy button | After you paste into Meta and subscribe to `messages` field, click **"Vérifier abonnement"** → calls `GET /{waba-id}/subscribed_apps` |
| 5. Bot configuration | `whatsapp_bot_enabled`, `whatsapp_bot_welcome_message`, `whatsapp_bot_handoff_keyword` | Local validation + preview |
| 6. Test message | Send a real WhatsApp message to a number you provide | Calls `whatsapp-send` with a template — shows ✅ "Message livré" or ❌ with reason |

### 3. Auto-save & persistence
- Every input uses **debounced auto-save** (500ms) → writes to `site_settings` via `useUpdateSiteSettings`
- A small "✓ Enregistré" indicator flashes next to the field after each save
- Completion state of each step is derived from the saved values, so reloading the page re-opens at the right step
- A top-of-wizard summary card always shows: token status, WABA ID, phone number, webhook subscription status, bot toggle — reflects current saved state on every render

### 4. Step-by-step instructions inside each step
Each step header expands to a **clear visual guide** (no jargon). Example for Step 2:

> **Trouver votre WhatsApp Business Account ID**
> 1. Ouvrez [business.facebook.com/wa/manage/home](https://business.facebook.com/wa/manage/home)
> 2. Sélectionnez votre compte WhatsApp Business en haut
> 3. Cliquez ⚙ **Paramètres** → **Informations sur le compte**
> 4. Copiez le numéro affiché sous **"ID du compte WhatsApp Business"**
> 5. Collez-le ci-dessous → cliquez **Vérifier**

Same pattern for each step, with screenshots-style numbered lists and a direct link button **"Ouvrir dans Meta"** that opens the right Meta page in a new tab.

### 5. New diagnostic endpoint
`supabase/functions/whatsapp-diagnostic/index.ts` — admin-only, accepts `{ check: "token" | "waba" | "phone" | "subscription", ...ids }`, runs the matching Graph API call using the saved access token, returns `{ ok, message, details }`. The wizard's "Vérifier" buttons all call this single endpoint.

### 6. Files

| File | Change |
|---|---|
| Migration | Add `whatsapp_*` columns to `site_settings` (already in the approved WhatsApp plan — confirming) |
| `supabase/functions/whatsapp-diagnostic/index.ts` | **New** — single endpoint for all "Vérifier" buttons |
| `src/components/admin/WhatsAppSettings.tsx` | **New** — 6-step accordion wizard with auto-save and inline verification |
| `src/pages/admin/AdminSettings.tsx` | Mount the new "WhatsApp Business" tab |
| `src/hooks/useSiteSettings.ts` | Add the new typed fields |
| Secret prompts | Request `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_APP_SECRET` (you paste your existing values) |

### 7. Responsive
Same accordion + card pattern as `FacebookLeadAdsSetup.tsx` — works on mobile (single column, full-width inputs, copy buttons stack), tablet (two-column instructions/input layout in each step), and desktop (sidebar summary card stays visible).

### 8. After this wizard is done
The actual WhatsApp **chat UI**, **bot engine**, and **webhook ingestion** (everything from the previously approved WhatsApp plan) are built next as planned — this wizard is just the configuration surface that makes the rest work.

## Notes
- The same App Secret powering your Lead Ads webhook will also verify WhatsApp webhook signatures (Meta uses the same HMAC-SHA256 scheme for both `leadgen` and `messages` events).
- Token reuse is officially supported: a single System User token with both `leads_retrieval` and `whatsapp_business_messaging` scopes works for both products.
- No new App Review needed if your existing app already has the WhatsApp permissions approved (or is in dev mode with you as a tester).

