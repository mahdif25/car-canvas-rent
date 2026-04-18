

# Enhanced Facebook Lead Ads Capture

## What
Capture **everything** Facebook sends in a Lead Ad webhook — all form fields (any custom field, not just email/phone/name), the originating Page/Form/Ad/Adset/Campaign/Pixel IDs, lead type (real user vs Facebook bot/test lead), and creation timestamp — then surface only what was actually captured in the admin Leads view.

## Approach

### 1. Database — new columns on `leads` (migration)

Add columns to store full FB lead context:

| Column | Type | Purpose |
|---|---|---|
| `fb_leadgen_id` | text | Unique FB lead id (dedup) |
| `fb_page_id` | text | Page that received the lead |
| `fb_form_id` | text | Lead form id |
| `fb_form_name` | text | Lead form name |
| `fb_ad_id` / `fb_ad_name` | text | Ad info |
| `fb_adset_id` / `fb_adset_name` | text | Ad set info |
| `fb_campaign_id` / `fb_campaign_name` | text | Campaign info |
| `fb_ad_account_id` | text | Ad account |
| `fb_pixel_id` | text | Tracking pixel id (if returned) |
| `fb_is_organic` | boolean | True if `is_organic` flag set |
| `fb_is_test_lead` | boolean | True if `field_data` contains test marker / `is_test=true` / lead created via FB Lead Ads Testing Tool |
| `fb_lead_type` | text | "real_user", "facebook_bot", or "test_lead" |
| `fb_created_time` | timestamptz | FB-provided lead creation time |
| `fb_raw_field_data` | jsonb | Full raw `field_data` array (every field exactly as sent) |
| `fb_raw_payload` | jsonb | Full Graph API response for debugging |

Add a unique index on `fb_leadgen_id` to prevent duplicates if FB retries the webhook.

### 2. Edge function — `facebook-leadads-webhook/index.ts`

Per Facebook Lead Ads API docs, when fetching a lead with `?fields=...` we can request:
`field_data,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,is_organic,partner_name,platform,custom_disclaimer_responses`

Also call `/{form_id}?fields=name,page,leadgen_export_csv_url` to resolve form name, and `/{ad_id}?fields=account_id,creative{effective_object_story_id}` to resolve ad account + linked pixel (best effort — skipped silently if permissions missing).

Detection logic:
- **Test lead** → `is_organic === true` AND payload contains the FB test signature (e.g. field values prefixed with `test`, `created_time` absent, or `field_data[].name === "is_test_lead"`). Also flag if our internal `x-lovable-test-webhook` header is set.
- **Facebook bot / scraper** → user-agent header contains `facebookexternalhit` / `meta-externalagent` AND no real `field_data`, OR signature missing on a non-test request that still parses.
- **Real user** → everything else where `field_data` has values.

Store **all** field_data entries verbatim in `fb_raw_field_data`, then map the common ones into existing typed columns (`email`, `phone`, `first_name`, `last_name`, `dob`, `city`, etc.) using a normalized lookup (`full_name`, `first_name`, `last_name`, `email`, `phone_number`, `phone`, `date_of_birth`, `city`, `street_address`, `post_code`, `company_name`, `job_title`, `vehicle_type`, etc.).

Use **upsert on `fb_leadgen_id`** to avoid duplicates from FB retries.

### 3. Admin UI — `AdminLeads.tsx`

For Facebook leads, the expanded card adds:

- **Lead type badge** — green "Utilisateur réel", gray "Test Facebook", orange "Bot Facebook"
- **Campaign breadcrumb** — Campaign → Ad set → Ad → Form (only the parts we actually got)
- **Pixel & Ad Account** chips when present
- **Dynamic field list** rendered from `fb_raw_field_data` — show only fields that came back with a value (no empty placeholders), labelled with the FB field `name`
- **FB lead created time** alongside our captured time

Source filter gains: "FB Lead Ad – Real", "FB Lead Ad – Test", "FB Lead Ad – Bot".

### 4. Setup wizard — `FacebookLeadAdsSetup.tsx`

Add a small note in Step 5 (Page Access Token) listing the **required permissions** for full data: `leads_retrieval`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `ads_read` (for ad/campaign/account/pixel resolution). Add an optional **Pixel ID** + **Ad Account ID** input (saved to `site_settings`) used as a fallback display when Graph API doesn't return them, and to cross-reference with the existing Facebook Pixel (`facebook_pixel_id`) already in settings — show a green check if they match.

### 5. Files

| File | Change |
|---|---|
| Migration | Add new columns to `leads` + unique index on `fb_leadgen_id` + 2 columns to `site_settings` (`fb_ad_account_id`, optional override) |
| `supabase/functions/facebook-leadads-webhook/index.ts` | Fetch full lead fields, detect lead type, map all fields, upsert |
| `src/pages/admin/AdminLeads.tsx` | Render FB-specific section with dynamic fields, lead type badge, campaign chain — only when data exists |
| `src/components/admin/FacebookLeadAdsSetup.tsx` | Add permissions note, optional Ad Account / Pixel fields, pixel match indicator |
| `src/hooks/useSiteSettings.ts` | New typed fields |

### 6. Responsiveness
All admin additions use the existing card-first mobile layout — chips wrap, dynamic field grid is `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`, badges stay inline on desktop and stack on mobile.

## Notes on Facebook docs compliance
- Webhook signature verification (already implemented) is mandatory ✅
- Use Graph API **v19.0+** with the page access token (already done) ✅
- `leads_retrieval` permission is required to read field_data ✅
- Page must be subscribed to the `leadgen` field (already in wizard) ✅
- Idempotency via `leadgen_id` is recommended by FB (we'll add it) ✅

