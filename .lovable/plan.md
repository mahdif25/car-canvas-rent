

# Per-Color Image Adjustments

## Problem
Currently, color variant images have no individual flip/zoom controls. The primary image has flip + 15 scale sliders (5 placements x 3 devices), but color images are displayed raw.

## Database Changes

**Migration**: Add 16 columns to `vehicle_colors`:
- `image_flipped` (boolean, default false)
- 15 scale columns matching the vehicle pattern: `image_scale_home`, `image_scale_home_mobile`, `image_scale_home_tablet`, `image_scale_fleet`, `image_scale_fleet_mobile`, `image_scale_fleet_tablet`, `image_scale_detail`, `image_scale_detail_mobile`, `image_scale_detail_tablet`, `image_scale_reservation`, `image_scale_reservation_mobile`, `image_scale_reservation_tablet`, `image_scale_sidebar`, `image_scale_sidebar_mobile`, `image_scale_sidebar_tablet` — all `numeric NOT NULL DEFAULT 1.0`

## Admin UI (`AdminFleet.tsx`)

- Under each color variant row, add a collapsible "Ajustements image" section (same pattern as the primary image controls)
- Contains: flip toggle + 5 placement panels with 3 device sliders each + live preview per placement
- Each color stores its own scale/flip values in `colorVariants` state
- On save, these values are persisted to `vehicle_colors`

## Public Display Updates

Update all places that render color-specific images to use the color's own scale/flip values instead of the vehicle's:

- **`src/pages/Index.tsx`** — homepage cards: use color's scale values when a color is active
- **`src/pages/Fleet.tsx`** — fleet cards: same
- **`src/components/reservation/StepVehicle.tsx`** — reservation vehicle list
- **`src/components/reservation/ReservationSidebar.tsx`** — sidebar thumbnail
- **`src/hooks/useVehicleColors.ts`** — extend the `VehicleColor` interface with the 16 new fields
- **`src/hooks/useDeviceScale.ts`** — add a helper `getScaleForColorOnDevice(color, placement, deviceType)` that reads from the color object, falling back to 1.0

## Files to Modify
- **Migration**: add 16 columns to `vehicle_colors`
- **`src/hooks/useVehicleColors.ts`**: extend interface
- **`src/hooks/useDeviceScale.ts`**: add color-aware scale helper
- **`src/pages/admin/AdminFleet.tsx`**: add per-color adjustment UI (collapsible)
- **`src/pages/Index.tsx`**: use color scale/flip
- **`src/pages/Fleet.tsx`**: use color scale/flip
- **`src/components/reservation/StepVehicle.tsx`**: use color scale/flip
- **`src/components/reservation/ReservationSidebar.tsx`**: use color scale/flip

