

# Coupon Usage Conditions System

## Overview
Add conditional rules to coupons: minimum total price and/or minimum rental days. These conditions are enforced at checkout, displayed in promotional emails, and auto-revoked if the user changes their reservation to no longer meet the criteria.

## Database Migration
Add two nullable columns to the `coupons` table:
- `min_total_price` (numeric, nullable) — minimum reservation subtotal required
- `min_rental_days` (integer, nullable) — minimum number of rental days required

No RLS changes needed — existing policies cover these columns.

## Changes

### 1. Admin Coupon Creation (`AdminMarketing.tsx`)
- Add two optional fields to the "Créer un coupon" dialog:
  - "Montant minimum de réservation (MAD)" — number input
  - "Nombre minimum de jours" — number input
- Display conditions as badges in the coupon table rows (e.g., "Min 1500 MAD", "Min 7 jours")

### 2. Admin Broadcast (`AdminBroadcast.tsx`)
- Add the same two optional condition fields when creating unique/referral coupons in the broadcast workflow
- Pass `min_total_price` and `min_rental_days` when inserting coupons in the `send-broadcast` edge function

### 3. Checkout Promo Validation (`StepSummary.tsx`)
- When applying a promo code, fetch and check `min_total_price` and `min_rental_days` from the coupon
- If conditions not met, show a descriptive error: "Ce coupon nécessite un minimum de X jours de location" or "Ce coupon nécessite un montant minimum de X MAD"
- Store the coupon conditions in form state so they can be re-validated on changes
- **Auto-revoke**: When vehicle, dates, or add-ons change and the subtotal or days drop below the coupon's thresholds, automatically remove the coupon and show a toast explaining which condition is no longer met

### 4. Promotional Email Template (`promotional-email.tsx`)
- Display coupon conditions below the coupon code when present (e.g., "Valable pour les réservations de 7 jours minimum" / "Valable pour les réservations à partir de 1500 MAD")

### 5. Edge Function (`send-broadcast/index.ts`)
- Pass `min_total_price` and `min_rental_days` from broadcast config when inserting unique/referral coupons

### 6. Types Update
- Update the `Coupon` interface in `AdminMarketing.tsx` and the `ReservationFormData` type if needed to carry condition metadata

## Files Modified
1. `src/pages/admin/AdminMarketing.tsx` — add condition fields to create dialog + display in table
2. `src/components/reservation/StepSummary.tsx` — validate conditions on apply + auto-revoke on changes
3. `src/pages/admin/AdminBroadcast.tsx` — add condition fields for unique/referral coupon creation
4. `supabase/functions/send-broadcast/index.ts` — pass conditions when inserting coupons
5. `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx` — show conditions in email

## Execution Order
1. Database migration (add 2 columns)
2. Update AdminMarketing coupon creation + display
3. Update StepSummary validation + auto-revoke logic
4. Update AdminBroadcast coupon fields
5. Update send-broadcast edge function
6. Update promotional email template

