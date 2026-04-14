

# Facebook Lead Ads Webhook Setup Wizard

## Problem
The current Facebook Lead Ads section in Admin Settings is a flat list of credential fields with minimal instructions. There is no save button for the credentials, no step-by-step guided flow, no connection testing, and no visual feedback on whether the setup is complete.

## Plan

### 1. Create a dedicated `FacebookLeadAdsSetup` component
Extract the Facebook Lead Ads section from `AdminSettings.tsx` into a new component at `src/components/admin/FacebookLeadAdsSetup.tsx`. This component will feature a guided, step-by-step accordion/stepper UI.

**Steps in the wizard:**

- **Step 1 — Create a Facebook App**: Read-only instructions with links to `developers.facebook.com`. Includes a checklist: create Business app, add Webhooks product, add "Page" subscriptions. A "J'ai créé mon app" checkbox to mark complete.

- **Step 2 — Configure App Secret**: Input field for `fb_leadads_app_secret` with clear instructions on where to find it (Settings → Basic → App Secret). Individual save button. Shows green checkmark when saved (non-empty value).

- **Step 3 — Set Your Verify Token**: Input for `fb_leadads_verify_token` with a "Generate random token" button that auto-fills a secure random string. Individual save button. Shows green checkmark when saved.

- **Step 4 — Subscribe the Webhook**: Displays the webhook URL with copy button. Step-by-step instructions: go to Webhooks in the Facebook app, select "Page", paste the URL and verify token, subscribe to `leadgen` field. A "Test Connection" button that calls the webhook with a simulated GET verification request and shows success/failure.

- **Step 5 — Page Access Token**: Input for `fb_leadads_page_access_token` with detailed instructions on generating a permanent token via Graph API Explorer (permissions: `pages_show_list`, `pages_manage_ads`, `leads_retrieval`, `pages_read_engagement`). Individual save button. Shows green checkmark when saved.

- **Step 6 — Test & Verify**: A "Send Test Lead" button that POSTs a simulated lead payload to the webhook, then checks the `leads` table for the test entry. Shows success/failure result. Links to the Facebook Lead Ads Testing Tool.

**Visual design:**
- Each step has a number badge, title, status indicator (pending/complete)
- Completed steps show a green checkmark
- Overall progress indicator at the top
- Collapsible accordion — completed steps auto-collapse
- The landing page URL section remains at the bottom

### 2. Ensure credentials save properly
Each credential field gets its own dedicated save button that calls the existing `save()` function with just that field. After saving, a toast confirms success and the step's status updates to "complete" based on the saved value being non-empty.

### 3. Update `AdminSettings.tsx`
Replace the inline Facebook Lead Ads section in the Tracking tab with the new `<FacebookLeadAdsSetup />` component, passing `form`, `setForm`, `save`, and `updateMutation` as props.

## Files Modified
- `src/components/admin/FacebookLeadAdsSetup.tsx` — new component with step-by-step wizard
- `src/pages/admin/AdminSettings.tsx` — replace inline section with the new component

## Technical Details
- Uses existing `useSiteSettings` hook and `save()` pattern from AdminSettings
- Accordion UI built with shadcn `Accordion` component
- Test connection button uses `supabase.functions.invoke` to call the webhook
- Random verify token generated via `crypto.randomUUID()`
- All responsive: works on mobile, tablet, and desktop

