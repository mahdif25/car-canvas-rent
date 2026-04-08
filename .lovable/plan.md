

# Location-Based Delivery Fees System

## Overview
Create a `locations` table in the database to replace the hardcoded locations array. Each location has a configurable delivery fee (pickup/dropoff) that can be marked as free or paid. The reservation flow shows a "different dropoff?" toggle, and delivery fees appear as a single combined line item in checkout.

## Database Migration

### New table: `locations`
```sql
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  delivery_fee numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT TO public USING (true);
-- Admin CRUD
CREATE POLICY "Admins can insert locations" ON public.locations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update locations" ON public.locations FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete locations" ON public.locations FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
```

### Add delivery_fee column to reservations
```sql
ALTER TABLE public.reservations ADD COLUMN delivery_fee numeric NOT NULL DEFAULT 0;
```

## Frontend Changes

### 1. New hook: `src/hooks/useLocations.ts`
- `useLocations()` — fetches enabled locations from `locations` table
- Export a `Location` type

### 2. Update `src/components/reservation/StepDates.tsx`
- Fetch locations from DB instead of mock data
- Show pickup location dropdown
- Add a checkbox/toggle: "Retour dans un lieu different ?"
- When toggled ON, show a second dropdown for dropoff location
- When toggled OFF, dropoff = pickup (default behavior)
- Reference image layout: pickup location, dates, then optional dropoff

### 3. Update `src/pages/Index.tsx`
- Replace `locations` import from mock-data with `useLocations()` hook

### 4. Update `src/components/reservation/ReservationSidebar.tsx`
- Accept `locations` data as prop (from DB)
- Calculate delivery fee: `pickupFee + dropoffFee` (use 0 if `is_free` is true)
- Show "Frais de livraison" line item (or "Gratuit" if both are free)
- Add delivery fee to total

### 5. Update `src/components/reservation/StepConfirmation.tsx`
- Show delivery fee line in the pricing breakdown
- Accept locations data to compute/display fee

### 6. Update `src/pages/Reservation.tsx`
- Fetch locations via `useLocations()`
- Pass locations to StepDates, ReservationSidebar, StepConfirmation
- Calculate delivery fee in `handleConfirm` and include in `total_price`
- Save `delivery_fee` to the reservation row

### 7. New admin page: `src/pages/admin/AdminLocations.tsx`
- CRUD for locations: name, delivery fee (MAD), free/paid toggle, enabled/disabled
- Table listing all locations with inline edit or modal
- Add/delete locations

### 8. Update `src/App.tsx`
- Add route `/admin/locations` -> `AdminLocations`

### 9. Update `src/components/admin/AdminLayout.tsx`
- Add "Lieux" nav link in sidebar

### 10. Update `src/lib/types.ts`
- Add `delivery_fee` to `ReservationFormData` (not needed — we compute it from selected locations)
- No form field changes needed since locations are selected by name and fees are looked up

## Delivery Fee Calculation Logic
```
pickupFee = location.is_free ? 0 : location.delivery_fee
dropoffFee = (same location as pickup) ? 0 : returnLocation.is_free ? 0 : returnLocation.delivery_fee
totalDeliveryFee = pickupFee + dropoffFee
```

## Files Changed
- **Migration**: new `locations` table + `delivery_fee` column on `reservations`
- `src/hooks/useLocations.ts` (new)
- `src/pages/admin/AdminLocations.tsx` (new)
- `src/components/reservation/StepDates.tsx`
- `src/components/reservation/ReservationSidebar.tsx`
- `src/components/reservation/StepConfirmation.tsx`
- `src/pages/Reservation.tsx`
- `src/pages/Index.tsx`
- `src/App.tsx`
- `src/components/admin/AdminLayout.tsx`

