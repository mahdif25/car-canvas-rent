

# Per-Device Image Scaling for Vehicle Placements

## Current state
Each vehicle has 5 single scale values: `image_scale_home`, `image_scale_fleet`, `image_scale_detail`, `image_scale_reservation`, `image_scale_sidebar`. These apply uniformly regardless of screen size.

## What changes

### 1. Database migration — add 10 new columns
For each of the 5 placements, add `_mobile` and `_tablet` suffixes (desktop keeps the existing column):

```sql
ALTER TABLE vehicles
  ADD COLUMN image_scale_home_mobile numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_home_tablet numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_fleet_mobile numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_fleet_tablet numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_detail_mobile numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_detail_tablet numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_reservation_mobile numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_reservation_tablet numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_sidebar_mobile numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN image_scale_sidebar_tablet numeric DEFAULT 1.0 NOT NULL;
```

The existing columns (`image_scale_home`, etc.) become the **desktop** values.

### 2. Admin UI — `src/pages/admin/AdminFleet.tsx`
For each placement in the "Zoom par emplacement" section, add a **device tab selector** (Mobile / Tablet / Desktop) with an independent slider and preview for each device. The preview container dimensions will match the device context.

### 3. Frontend rendering — apply responsive scales
In each file that renders vehicle images, replace the single `scale(v.image_scale_X)` with a CSS approach using media-query-driven CSS custom properties or a hook:

- Create a small utility hook `useDeviceScale(vehicle, placement)` that returns the correct scale based on current viewport width (using the existing `useIsMobile` pattern plus a tablet check).
- Apply in: `Index.tsx` (home), `Fleet.tsx`, `VehicleDetail.tsx`, `StepVehicle.tsx` (reservation), `ReservationSidebar.tsx`.

### 4. Form state updates
Update form initialization, reset, and edit in `AdminFleet.tsx` to include all 10 new fields.

## Files to change
- **Migration**: new SQL migration (10 columns)
- **`src/hooks/useDeviceScale.ts`** (new) — returns correct scale for placement + device
- **`src/pages/admin/AdminFleet.tsx`** — add per-device tabs in the zoom section
- **`src/pages/Index.tsx`** — use `useDeviceScale`
- **`src/pages/Fleet.tsx`** — use `useDeviceScale`
- **`src/pages/VehicleDetail.tsx`** — use `useDeviceScale`
- **`src/components/reservation/StepVehicle.tsx`** — use `useDeviceScale`
- **`src/components/reservation/ReservationSidebar.tsx`** — use `useDeviceScale`

