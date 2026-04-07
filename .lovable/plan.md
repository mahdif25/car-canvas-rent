

# Connect Public Pages to Real Database

## Overview
Replace all mock data imports with live queries to the database using the Supabase client. The database already has tables for `vehicles`, `vehicle_pricing_tiers`, `addon_options`, and `reservations` with proper RLS policies (public SELECT on vehicles, pricing, and addons).

## Files to Change

### 1. Create `src/hooks/useVehicles.ts` — shared data hooks
New file with React Query (or `useEffect`-based) hooks:
- `useVehicles()` — fetches all vehicles from `vehicles` table
- `useVehicle(id)` — fetches single vehicle by ID
- `usePricingTiers(vehicleId?)` — fetches pricing tiers (optionally filtered)
- `useAddons()` — fetches enabled addons from `addon_options`
- `getDailyRateFromTiers(tiers, days)` — pure function to compute rate from fetched tiers
- `getStartingPriceFromTiers(tiers)` — pure function for min price

### 2. Update `src/pages/Fleet.tsx`
- Replace `mockVehicles` / `getStartingPrice` with `useVehicles()` and `usePricingTiers()`
- Add loading skeleton while data loads
- Categories derived from fetched data

### 3. Update `src/pages/VehicleDetail.tsx`
- Replace `mockVehicles` / `mockPricingTiers` with `useVehicle(id)` and `usePricingTiers(id)`
- Add loading state

### 4. Update `src/pages/Index.tsx`
- Replace `mockVehicles.slice(0,3)` with `useVehicles()` (take first 3)
- Keep `locations` array as-is (no locations table exists)

### 5. Update `src/components/reservation/StepVehicle.tsx`
- Replace `mockVehicles` / `getDailyRate` with hooks
- Pass vehicles + pricing data via props or use hooks directly

### 6. Update `src/components/reservation/StepAddons.tsx`
- Replace `mockAddons` with `useAddons()`

### 7. Update `src/components/reservation/ReservationSidebar.tsx`
- Replace `mockVehicles` / `mockAddons` lookups with data passed as props or fetched via hooks

### 8. Update `src/components/reservation/StepDriverInfo.tsx`
- Replace `mockVehicles.find()` with data from props or hook

### 9. Update `src/components/reservation/StepConfirmation.tsx`
- Replace mock lookups with real data from props or hooks

### 10. Update `src/pages/Reservation.tsx`
- Fetch vehicles, pricing tiers, and addons at the top level
- Pass them down to child step components as props (avoids redundant fetches)
- On confirmation, INSERT the reservation into the `reservations` table + `reservation_addons`
- Use the returned row ID as the confirmation ID

### 11. Keep `src/lib/mock-data.ts`
- Keep `locations` array export (no DB table for this)
- Remove or leave other exports (they'll be unused)

## Key Technical Details
- All public tables have `SELECT` with `USING (true)` for `public` role — no auth needed for reads
- Reservation INSERT is also open (`WITH CHECK (true)`) — guests can create reservations without login
- The `reservation_addons` INSERT is also open
- Vehicle IDs in the DB are UUIDs, not "1", "2" etc. — the reservation form's `vehicle_id` field already uses string type so this is compatible
- Loading states should show skeletons/spinners to avoid layout shift

