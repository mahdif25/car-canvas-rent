

# Coupon / Promo Code System

## Overview
Add a Marketing section in the admin dashboard to create and manage discount coupons, and a promo code input field in the reservation checkout (Step 4 - Driver Info) that applies the discount to the total.

## Database Migration

**New table: `coupons`**
- `id` uuid PK
- `code` text UNIQUE NOT NULL — the promo code (uppercase)
- `discount_amount` numeric NOT NULL — fixed price discount in MAD
- `max_uses` integer NULL — NULL = unlimited
- `current_uses` integer DEFAULT 0
- `is_active` boolean DEFAULT true
- `expires_at` timestamptz NULL
- `created_at` timestamptz DEFAULT now()

**New table: `coupon_usages`** — tracks who used each coupon
- `id` uuid PK
- `coupon_id` uuid REFERENCES coupons(id)
- `reservation_id` uuid REFERENCES reservations(id)
- `customer_email` text NOT NULL
- `discount_applied` numeric NOT NULL
- `created_at` timestamptz DEFAULT now()

**Add columns to `reservations`:**
- `coupon_id` uuid NULL
- `discount_amount` numeric DEFAULT 0

**RLS:**
- Coupons: public SELECT (for validation), admin INSERT/UPDATE/DELETE
- Coupon usages: public INSERT (to record usage), admin SELECT
- Update on coupon_usages insert: a trigger increments `coupons.current_uses`

## New Admin Page: `src/pages/admin/AdminMarketing.tsx`

- Table listing all coupons: code, discount amount, uses / max uses, status, expiry
- "Create coupon" dialog with fields: code, discount amount, max uses (optional), expiry date (optional)
- Toggle active/inactive
- Click a coupon row to expand and see usage history (who used it, reservation ID, date)

## Checkout Integration

**`src/lib/types.ts`** — add `promo_code` and `discount_amount` to `ReservationFormData`

**`src/components/reservation/StepDriverInfo.tsx`** — add a "Code promo" input field with an "Appliquer" button. On click:
1. Query `coupons` table where `code` matches, `is_active = true`, not expired, `current_uses < max_uses` (or max_uses is null)
2. If valid, set `discount_amount` in form state and show success message
3. If invalid, show error toast

**`src/components/reservation/ReservationSidebar.tsx`** — show discount line item if applied, subtract from total

**`src/pages/Reservation.tsx`** — in `handleConfirm`:
- Subtract discount from `totalPrice`
- Save `coupon_id` and `discount_amount` on the reservation
- Insert into `coupon_usages`

**`src/components/reservation/StepConfirmation.tsx`** — show discount in the summary

## Navigation

**`src/components/admin/AdminLayout.tsx`** — add "Marketing" nav item with `Tag` icon
**`src/App.tsx`** — add `/admin/marketing` route

## Files Changed

1. Migration — `coupons`, `coupon_usages` tables + trigger + `reservations` columns
2. `src/pages/admin/AdminMarketing.tsx` — new page
3. `src/lib/types.ts` — add promo fields to form data
4. `src/components/reservation/StepDriverInfo.tsx` — promo code input
5. `src/components/reservation/ReservationSidebar.tsx` — discount line
6. `src/components/reservation/StepConfirmation.tsx` — discount in summary
7. `src/pages/Reservation.tsx` — apply discount on submit
8. `src/components/admin/AdminLayout.tsx` — nav item
9. `src/App.tsx` — route

