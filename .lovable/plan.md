

# WhatsApp Business Chat Integration

## What
Build a 2-way WhatsApp chat inside the admin where:
1. Every conversation from WhatsApp (including FB "Click-to-WhatsApp" ads) auto-creates a **lead** with name + number
2. Admin can reply live from the website
3. A **bot** auto-asks for vehicle + days, returns price = days × daily rate, lets the customer try other cars, waits for confirmation
4. Once confirmed, lead is marked "WhatsApp – Confirmed" in the existing Leads dashboard

## Approach

### 1. Provider — WhatsApp Cloud API (Meta)
Free Meta-hosted API, same Facebook Business account already used for Lead Ads. Required: a WhatsApp Business number, a Meta App with `whatsapp_business_messaging` + `whatsapp_business_management` permissions, a permanent System User token, and a Phone Number ID.

(Twilio is an alternative — usable via the existing Twilio connector — but adds per-message cost. Meta Cloud API is recommended; we'll wire that path.)

### 2. Database (one migration)

**`whatsapp_conversations`** — one row per phone number
- `id`, `wa_phone` (unique), `wa_name`, `lead_id` (links to existing `leads`), `bot_state` (enum: `idle`, `awaiting_vehicle`, `awaiting_days`, `awaiting_confirmation`, `handed_off`), `bot_context` (jsonb: selected_vehicle_id, days, last_quote), `last_message_at`, `unread_count`, `assigned_admin_id`, `created_at`

**`whatsapp_messages`** — every inbound + outbound message
- `id`, `conversation_id`, `direction` (`in`/`out`), `wa_message_id`, `body`, `message_type` (`text`/`image`/`template`/`bot`), `media_url`, `sent_by` (`customer`/`bot`/`admin`), `admin_id`, `status` (`sent`/`delivered`/`read`/`failed`), `created_at`

Realtime enabled on both. RLS: admin-only read/write.

Extend `leads` source enum values to include `whatsapp` and `whatsapp_ad` (Click-to-WhatsApp ads — detected from `referral` payload Meta sends).

Extend `site_settings` with: `whatsapp_phone_number_id`, `whatsapp_business_account_id`, `whatsapp_verify_token`, `whatsapp_bot_enabled`, `whatsapp_bot_welcome_message`, `whatsapp_bot_handoff_keyword`.

Secrets (added via `add_secret`): `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`.

### 3. Edge functions

| Function | Purpose |
|---|---|
| `whatsapp-webhook` | Meta calls this. Verifies signature, stores inbound message, upserts conversation + lead, runs bot logic if `bot_state ≠ handed_off`, sends auto-reply via Cloud API. Detects `referral.source_type === "ad"` to flag CTWA leads with `ad_id` / `ctwa_clid` saved into the lead's `fb_ad_id`. |
| `whatsapp-send` | Admin UI calls this to send outbound messages. Marks conversation `handed_off` so bot stops. |
| `whatsapp-bot-engine` (shared module) | Pure logic: given `bot_state` + customer text + vehicles/tiers, returns next state + reply text. |

### 4. Bot conversation flow

```text
Customer:  (any first message, or CTWA ad click)
Bot:       "Bonjour {name} 👋 Quelle voiture vous intéresse ?
            1. Dacia Logan
            2. Renault Clio
            3. Hyundai Tucson
            ... (numbered list of available vehicles)"
Customer:  "2"  (or "Clio")
Bot:       "Parfait, Renault Clio 🚗
            Pour combien de jours ?"
Customer:  "5"
Bot:       "Renault Clio × 5 jours = 1 250 MAD
            (250 MAD/jour selon nos tarifs)
            
            Tapez OUI pour confirmer, AUTRE pour voir un autre véhicule."
Customer:  "AUTRE"  → back to vehicle list
Customer:  "OUI"   → "Merci ! Un agent vous contactera pour finaliser ✅"
                     → conversation marked confirmed, lead updated
```

Pricing uses existing `getDailyRateFromTiers()` so the same tiered logic the website uses. Any free-text the bot doesn't understand → sends a short fallback + keeps state. Keyword `AGENT` (configurable) → instantly hands off and pings admins.

### 5. Admin UI — new `/admin/whatsapp` page

Layout (responsive — three patterns):
- **Desktop ≥ lg**: 3-column — conversation list | message thread | lead/customer panel
- **Tablet md**: 2-column — list + thread, lead panel in a Sheet
- **Mobile**: single column, list → thread navigation, sticky composer

Components:
- `ConversationList` — search + unread badges + last message preview, realtime updates
- `MessageThread` — bubbles (customer left grey, admin right green, bot italic muted), auto-scroll, attachment preview
- `MessageComposer` — text + emoji + send (Enter to send, Shift+Enter newline)
- `BotControlBar` — toggle "Bot active / Pause bot" per conversation, shows current state + context
- `CustomerSidePanel` — name, number, linked lead, current quote, "Open lead" button → existing Leads page

Realtime subscription on `whatsapp_messages` so new messages appear instantly without refresh.

### 6. Leads dashboard integration
`AdminLeads.tsx` source filter gains: **"WhatsApp"** and **"WhatsApp Ad"**. WhatsApp leads show:
- Name + phone (WhatsApp profile)
- Current bot state badge
- Selected vehicle + days + quote (from `bot_context`)
- "Open chat" button → jumps to that conversation in `/admin/whatsapp`
CTWA leads also keep their `fb_ad_id` / `fb_campaign_id` so they appear under the Facebook attribution chain.

### 7. Settings UI — new tab in `AdminSettings`
"WhatsApp Business" section with:
- Phone Number ID, Business Account ID, Verify Token (auto-generated), Webhook URL (read-only, copy button)
- Bot toggle + welcome message editor + handoff keyword
- "Test connection" button calling `/whatsapp-send` with a test template

### 8. Files

| File | Change |
|---|---|
| Migration | New tables + leads source values + site_settings columns |
| `supabase/functions/whatsapp-webhook/index.ts` | New — verify, ingest, bot, auto-reply |
| `supabase/functions/whatsapp-send/index.ts` | New — outbound send (admin) |
| `supabase/functions/_shared/whatsapp-bot.ts` | New — bot state machine |
| `src/pages/admin/AdminWhatsApp.tsx` | New — chat UI |
| `src/components/admin/whatsapp/*` | New — list, thread, composer, panel |
| `src/hooks/useWhatsAppConversations.ts` | New — realtime hook |
| `src/components/admin/AdminLayout.tsx` | Add "WhatsApp" nav item with unread badge |
| `src/pages/admin/AdminLeads.tsx` | Add WhatsApp source filter + chat link |
| `src/components/admin/WhatsAppSettings.tsx` | New — settings tab |
| `src/pages/admin/AdminSettings.tsx` | Mount WhatsApp tab |
| `src/hooks/useSiteSettings.ts` | New typed fields |

### 9. Setup the user has to do once
1. Create/use a Meta App, add the WhatsApp product
2. Add a phone number in WhatsApp Manager → copy **Phone Number ID** + **Business Account ID**
3. Generate a **System User permanent token** with `whatsapp_business_messaging` + `whatsapp_business_management`
4. Paste the webhook URL we display + verify token into Meta dashboard, subscribe to `messages` field
5. (For ads) Use existing Click-to-WhatsApp ads — they'll start landing automatically

## Notes
- Meta Cloud API: 1000 free service conversations/month, customer-initiated within 24h is free
- After 24h of silence, only approved **template messages** can re-open — admin UI will surface this clearly with a disabled composer + "Send template" button
- All communications references stay user-facing as "WhatsApp" / "Lovable Cloud backend"

