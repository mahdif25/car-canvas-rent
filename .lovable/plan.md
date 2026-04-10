

# Delivery Fee Fix, Insurance Label, and Vehicle Feature Icons

## Overview
Three changes: (1) fix delivery fee to always charge for both pickup and dropoff locations even when same, (2) add "Assurance tous risques incluse" label, and (3) add structured feature toggles (climatisation, GPS, Bluetooth, etc.) with icons across all pages.

## 1. Delivery Fee: Always Charge Both Locations

**`src/hooks/useLocations.ts`** — update `getDeliveryFee`:
- Remove the condition `dropoff.name !== pickup?.name` that skips dropoff fee when same location
- Always sum pickup fee + dropoff fee regardless of whether they match

## 2. Insurance "Tous Risques" Included

**`src/components/reservation/StepSummary.tsx`** — add an insurance info line in the price breakdown section showing "Assurance tous risques incluse" with a Shield icon (not a separate charge, just an informational label).

**`src/pages/VehicleDetail.tsx`** — add a badge/line below specs: "Assurance tous risques incluse".

**Vehicle cards** on Index.tsx and Fleet.tsx — add a small Shield icon badge showing insurance is included.

## 3. Structured Vehicle Features with Icons

### Database Migration
Add boolean columns to `vehicles` table for key features:
- `has_climatisation` boolean DEFAULT true
- `has_gps` boolean DEFAULT false  
- `has_bluetooth` boolean DEFAULT false
- `has_usb` boolean DEFAULT false
- `has_camera` boolean DEFAULT false

### Admin Fleet Form (`src/pages/admin/AdminFleet.tsx`)
Add a "Caractéristiques" section with toggle switches for each structured feature (Climatisation, GPS, Bluetooth, USB, Caméra de recul). Keep the existing free-text features input for custom entries.

### Shared Feature Icon Helper
Create `src/lib/vehicle-features.ts` — exports a list of structured features with their icon name, label, and DB column key. Also exports a helper component/function to render feature icons for a vehicle.

### Display Feature Icons Everywhere

**`src/pages/Index.tsx`** — vehicle cards: add a row of small feature icons (Snowflake for clima, etc.) below the transmission/fuel/seats row.

**`src/pages/Fleet.tsx`** — same icon row in vehicle cards.

**`src/pages/VehicleDetail.tsx`** — add feature icons to the specs grid.

**`src/components/reservation/StepVehicle.tsx`** — show feature icons on each vehicle card in the selection list.

**`src/components/reservation/StepSummary.tsx`** — show selected vehicle's feature icons in the vehicle summary card.

## Files Changed

1. **Migration** — add `has_climatisation`, `has_gps`, `has_bluetooth`, `has_usb`, `has_camera` to `vehicles`
2. `src/hooks/useLocations.ts` — fix `getDeliveryFee` to always charge both locations
3. `src/lib/vehicle-features.ts` — **new** shared feature definitions + icon mapping
4. `src/pages/admin/AdminFleet.tsx` — add feature toggle switches in form
5. `src/pages/Index.tsx` — add feature icons + insurance badge to vehicle cards
6. `src/pages/Fleet.tsx` — add feature icons + insurance badge to vehicle cards
7. `src/pages/VehicleDetail.tsx` — add feature icons to specs + insurance label
8. `src/components/reservation/StepVehicle.tsx` — add feature icons to vehicle cards
9. `src/components/reservation/StepSummary.tsx` — add insurance label + feature icons

