

# Edit Custom Daily Rate on Confirmed Reservations

## Problem
- Manual reservations support a custom price/day, but it's only used to compute `total_price` at insert — the per-day rate isn't stored.
- On the admin Reservations page, the edit panel only lets you change vehicle/dates/locations/addons, and the price is auto-recomputed from `vehicle_pricing_tiers`. There's no way to override the daily rate after the reservation exists.

## Solution

### 1. Database — store the override
Add one nullable column to `reservations`:
- `custom_daily_rate` (numeric, nullable) — when set, overrides the tier rate for both display and total calculation.

If `null`, the reservation continues to use `getDailyRateFromTiers()` as today.

### 2. Manual reservation creation
In `ManualReservationDialog.handleSubmit`, also persist `custom_daily_rate: form.customDailyRate ? Number(form.customDailyRate) : null` so the override survives.

### 3. Admin Reservations — editable daily rate
In `AdminReservations.tsx`:
- Extend `EditState` with `custom_daily_rate: string` (empty = use tier rate).
- In `useCalc`, prefer `edit.custom_daily_rate` over the tier rate when set, mirroring the manual dialog logic.
- In the expanded row's pricing section, render the daily rate as an editable inline field (Input with "MAD/jour" suffix) next to "Véhicule". A small "Réinitialiser" link clears the override and falls back to the tier rate.
- `saveReservation` writes `custom_daily_rate` (number or null) along with the recomputed `total_price`.
- Works for **all** reservations (manual or online), so any admin can adjust pricing post-confirmation.

### 4. Email after price change
The existing `saveReservation.onSuccess` already triggers the `reservation-update` transactional email with the new `dailyRate` / `vehicleTotal` / `totalPrice`. We simply ensure those values come from the new override when present — so the email sent after saving reflects the corrected price automatically. No new email template needed.

### 5. Receipt printout
`handlePrint` already reads `calc.dailyRate` / `calc.vehicleTotal`, so it picks up the override for free.

### 6. Responsiveness
The new daily-rate input replaces the read-only "× MAD" segment inline on desktop and stacks below the label on mobile (`flex-col sm:flex-row` in the existing pricing row). Reset link wraps cleanly. No layout changes elsewhere.

## Files
| File | Change |
|---|---|
| New migration | `ALTER TABLE reservations ADD COLUMN custom_daily_rate numeric` |
| `src/components/admin/ManualReservationDialog.tsx` | Persist `custom_daily_rate` on insert |
| `src/pages/admin/AdminReservations.tsx` | Add editable daily-rate field, use override in `useCalc`, save to DB, send updated email |

## Notes
- Email is only sent on Save (existing behavior), so admins can preview the new total before triggering it.
- If admin sets `0` or clears the field, falls back to tier rate (same semantics as manual creation).

