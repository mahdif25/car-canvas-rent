

# Manual Reservation Enhancements, Coupon Copy Button & Form Persistence

## Changes

### 1. Manual Reservation — Coupon & Custom Daily Rate (`ManualReservationDialog.tsx`)

**Coupon discount**: Add a promo code input field with "Appliquer" button in the price preview section. Validates against the `coupons` table (same logic as public checkout). Stores `coupon_id` and `discount_amount` on the reservation insert.

**Custom daily rate override**: Add an editable "Prix/jour" input next to the vehicle selector, pre-filled with the tier rate. When the admin changes it, the override is used for all calculations instead of the tier rate. The `calc` memo will check for a `customDailyRate` state and use it when set.

**Price breakdown update**: Show discount line when a coupon is applied. Total = vehicleTotal + addonsTotal + deliveryFee - discount.

### 2. Manual Reservation — Form Persistence via localStorage

On every field change, serialize the entire form state to `localStorage` under `manual_reservation_draft`. On component mount, check for a saved draft and restore all fields.

Clear the draft only on successful submission or when the admin clicks a new **"Réinitialiser"** (reset) button.

**Reset button**: Add a visible "Réinitialiser" button alongside "Annuler" and "Créer" in the footer. On mobile it will be full-width above the other buttons. Clears localStorage draft and resets all fields.

### 3. Coupon Copy Button (`AdminMarketing.tsx`)

Add a copy icon button next to each coupon code (both desktop table and mobile cards). On click, copies the code to clipboard and shows a toast "Code copié".

### Files Modified
- `src/components/admin/ManualReservationDialog.tsx` — coupon input, custom daily rate, localStorage persistence, reset button
- `src/pages/admin/AdminMarketing.tsx` — copy button next to coupon codes

### No database changes needed
The `reservations` table already has `coupon_id` and `discount_amount` columns.

