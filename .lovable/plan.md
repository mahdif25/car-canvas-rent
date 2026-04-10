

# Reorganize Reservation Flow: Capture Info Earlier, Show Fees Later

## Current Flow (4 steps + confirmation)
1. Dates & Location → 2. Vehicle → 3. Add-ons → 4. Driver Info + Promo → 5. Confirmation

## New Flow (3 steps + confirmation)
1. **Dates & Location** — pickup/return dates, location (no delivery fee shown yet)
2. **Vehicle** — select car, show only car daily rate × days
3. **Driver Info** — capture personal details early (name, email, phone, license, etc.)
4. **Summary & Confirm** — show full breakdown: car total + add-ons selector + delivery fees + promo code field + total price. User confirms here.

## Key Changes

### `src/pages/Reservation.tsx`
- Change steps array from 4 to 3: `["Dates", "Véhicule", "Infos"]`
- Step 3 = StepDriverInfo (was step 4)
- Step 4 = new StepSummary (combines old StepAddons + pricing breakdown + promo code + confirm button)
- Step 5 = StepConfirmation (success screen)
- Update stepper rendering and step navigation

### `src/components/reservation/ReservationSidebar.tsx`
- Remove delivery fee line item from sidebar during steps 1-3
- Only show vehicle + dates in sidebar; no delivery fee calculation until step 4

### New: `src/components/reservation/StepSummary.tsx`
- Combines: add-ons selection (from StepAddons), delivery fee display, promo code input (from StepDriverInfo), full price breakdown, and confirm button
- Shows: vehicle total, each selected addon cost, delivery fee, discount, grand total
- Contains the "Confirmer" button that triggers reservation submission

### `src/components/reservation/StepDriverInfo.tsx`
- Remove promo code section (moved to StepSummary)
- Change `onConfirm` to `onNext` — this step now just advances to summary
- Keep all personal info fields

### `src/components/reservation/StepAddons.tsx`
- Will no longer be rendered as a standalone step
- Its addon toggle logic will be incorporated into StepSummary

## Files Changed

1. `src/pages/Reservation.tsx` — reorder steps (3 + summary + confirmation)
2. `src/components/reservation/StepSummary.tsx` — **new** (addons + fees + promo + confirm)
3. `src/components/reservation/StepDriverInfo.tsx` — remove promo, change onConfirm→onNext
4. `src/components/reservation/ReservationSidebar.tsx` — hide delivery fee from sidebar

