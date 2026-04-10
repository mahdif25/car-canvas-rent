

# Email Broadcast System with Coupon Distribution

## Overview
Add a broadcast email feature to the admin panel. Admins can filter leads, compose a promotional email, and optionally attach a coupon (shared or unique per-recipient). All generated coupons are stored in the existing `coupons` table and managed from the existing Marketing > Coupons section. Coupons have optional expiration dates set by the admin.

## Database Changes

### New tables
- **`email_broadcasts`** — campaign metadata: `id`, `subject`, `body_html`, `coupon_mode` (none/shared/unique/referral), `source_coupon_id` (nullable, for shared mode), `coupon_prefix` (for unique mode), `discount_amount`, `coupon_expires_at` (nullable), `filters_json`, `recipient_count`, `sent_count`, `status` (draft/sending/sent/failed), `created_at`
- **`broadcast_recipients`** — per-recipient tracking: `id`, `broadcast_id` (FK), `email`, `name`, `coupon_id` (nullable, FK to `coupons`), `friend_coupon_id` (nullable, FK to `coupons`), `status` (pending/sent/failed), `created_at`

Both tables: RLS admin-only for all operations.

### No changes to `coupons` table
Auto-generated unique/referral coupons will be inserted into the existing `coupons` table with `max_uses = 1` and the admin-specified `expires_at`. They appear in the Marketing > Coupons list like any other coupon.

## New Edge Function: `send-broadcast`

- Receives `broadcast_id`
- Reads broadcast config + recipients from DB
- For **shared** mode: attaches the existing coupon code to all emails
- For **unique** mode: generates a coupon per recipient (`{PREFIX}-{FIRSTNAME}` or `{PREFIX}-{RANDOM}`), inserts into `coupons` with `max_uses=1` and optional `expires_at`
- For **referral** mode: generates 2 coupons per recipient (one for them, one for their friend)
- Calls `send-transactional-email` for each recipient
- Updates recipient status and broadcast sent_count

## New Email Template: `promotional-email`

Accepts: `recipientName`, `subject`, `bodyHtml`, `couponCode`, `discountAmount`, `expiresAt`, `friendCouponCode` (optional). Registered in `registry.ts`.

## Admin UI: `AdminBroadcast.tsx` (route: `/admin/broadcast`)

3-step workflow:

1. **Audience** — Filter leads by status (Lead/Abandonné/Client), step reached, date range. Select/deselect individuals. Only leads with emails shown.
2. **Content** — Subject, body (textarea), coupon mode picker:
   - None: no coupon
   - Shared: pick existing coupon from dropdown
   - Unique: set prefix + discount amount + optional expiry
   - Referral: set prefix + customer discount + friend discount + optional expiry
3. **Review & Send** — Recipient count, preview, send button

## Navigation
Add "Broadcast" item in `AdminLayout.tsx` sidebar (under Marketing or as `Mail` icon entry).

## Files

### Created
1. `src/pages/admin/AdminBroadcast.tsx`
2. `supabase/functions/send-broadcast/index.ts`
3. `supabase/functions/send-broadcast/deno.json`
4. `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx`

### Modified
1. `src/App.tsx` — add `/admin/broadcast` route
2. `src/components/admin/AdminLayout.tsx` — add nav item
3. `supabase/functions/_shared/transactional-email-templates/registry.ts` — register promotional template
4. `supabase/config.toml` — add `send-broadcast` function config

### Migration
1 migration for `email_broadcasts` + `broadcast_recipients` tables with RLS policies

## Execution Order
1. Database migration (2 tables + RLS)
2. Create promotional email template + update registry
3. Create `send-broadcast` edge function
4. Build `AdminBroadcast.tsx` page
5. Update AdminLayout nav + App routes + config.toml

