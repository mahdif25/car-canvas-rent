

# Auto-Recalculate + Addon Editing for Admin Reservations

## Overview
When any field (vehicle, dates, locations, addons) changes in the admin reservation editor, the price recalculates automatically and displays a live preview. No manual "Recalculer" button needed — it becomes a "Sauvegarder" (save) button.

## Database Migration
Add DELETE policy on `reservation_addons` for admins (currently missing):
```sql
CREATE POLICY "Admins can delete reservation addons"
  ON public.reservation_addons FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

## File: `src/pages/admin/AdminReservations.tsx`

### Changes:
1. **Add addon editing** — checkbox grid of all available addons, pre-checked from existing `reservation_addons` for that reservation. Selected addon IDs stored in `editState[id].addons`.

2. **Auto-recalculate with `useMemo`-style logic** — every time `editState[id]` changes (vehicle, dates, locations, addons), compute and display:
   - Vehicle daily rate × days
   - Addons total (each addon's `price_per_day` × days)
   - Delivery fee (from locations)
   - New deposit amount (from selected vehicle)
   - Grand total = vehicle + addons + delivery fee
   - Show this as a live "Nouveau total" preview section

3. **Replace "Recalculer" with "Sauvegarder"** — always enabled when any edit exists. On click:
   - Update reservation row (vehicle_id, dates, locations, total_price, delivery_fee, deposit_amount)
   - Delete all existing `reservation_addons` for this reservation
   - Insert the new set of selected addon IDs
   - Clear edit state and refresh

4. **Initialize edit state on expand** — when a reservation is expanded, auto-populate `editState[id].addons` from `reservationAddons` data.

### UI in expanded detail:
- Existing fields: vehicle selector, date inputs, location dropdowns (unchanged)
- New "Options" section: checkbox grid showing addon name + price/day
- New "Aperçu tarif" box: shows breakdown (vehicle cost, addons, delivery, total) — updates live
- "Sauvegarder" button replaces "Recalculer"

## Files Changed
1. `src/pages/admin/AdminReservations.tsx` — addon checkboxes, live price preview, save with addon sync
2. Migration — DELETE policy on `reservation_addons`

