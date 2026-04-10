

# Per-Placement Image Zoom with Real-Size Previews

## Overview
Replace the single `image_scale` with five placement-specific zoom columns. In the admin panel, show five sliders each with a preview box that matches the real dimensions and styling of that placement on the site.

## Database Migration

```sql
ALTER TABLE public.vehicles
  ADD COLUMN image_scale_home numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_fleet numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_detail numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_reservation numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN image_scale_sidebar numeric NOT NULL DEFAULT 1.0;

UPDATE public.vehicles SET
  image_scale_home = image_scale,
  image_scale_fleet = image_scale,
  image_scale_detail = image_scale,
  image_scale_reservation = image_scale,
  image_scale_sidebar = image_scale;

ALTER TABLE public.vehicles DROP COLUMN image_scale;
```

## Code Changes

### 1. Admin Panel (`src/pages/admin/AdminFleet.tsx`)
Replace the single zoom slider with a **"Zoom par emplacement"** section containing five entries. Each entry has:
- A label (e.g. "Accueil", "Flotte", "Détail véhicule", "Réservation", "Barre latérale")
- A slider (0.5–2.0, step 0.05)
- A **live preview box** sized to match the real placement dimensions:

| Placement | Preview dimensions | Aspect / style |
|---|---|---|
| Accueil (Home) | ~320×180px | aspect-video, object-contain, bg-secondary |
| Flotte (Fleet) | ~320×180px | aspect-video, object-contain, bg-secondary |
| Détail véhicule | ~400×225px | aspect-video, object-cover |
| Réservation | ~280×160px | object-contain, bg-secondary |
| Barre latérale | ~200×130px | object-contain, rounded |

Each preview applies `image_flipped` + the placement-specific scale so the admin sees exactly how the car will appear in each context.

### 2. Update image renders to use placement-specific columns
- `src/pages/Index.tsx` → `image_scale_home`
- `src/pages/Fleet.tsx` → `image_scale_fleet`
- `src/pages/VehicleDetail.tsx` → `image_scale_detail`
- `src/components/reservation/StepVehicle.tsx` → `image_scale_reservation`
- `src/components/reservation/ReservationSidebar.tsx` → `image_scale_sidebar`

### Files
- `vehicles` table (migration — add 5 columns, drop 1)
- `src/pages/admin/AdminFleet.tsx`
- `src/pages/Index.tsx`
- `src/pages/Fleet.tsx`
- `src/pages/VehicleDetail.tsx`
- `src/components/reservation/StepVehicle.tsx`
- `src/components/reservation/ReservationSidebar.tsx`

