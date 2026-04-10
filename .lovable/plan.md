

# Add Image Flip & Zoom Controls for Vehicles

## Overview
Add two new columns to the `vehicles` table — `image_flipped` (boolean) and `image_scale` (numeric, default 1.0) — and expose them as controls in the admin panel. All vehicle image renders across the site will apply the corresponding CSS transforms.

## Database Migration

```sql
ALTER TABLE public.vehicles
  ADD COLUMN image_flipped boolean NOT NULL DEFAULT false,
  ADD COLUMN image_scale numeric NOT NULL DEFAULT 1.0;
```

## Code Changes

### 1. Admin Panel (`src/pages/admin/AdminFleet.tsx`)
Next to the main image upload, add:
- **"Inverser l'image"** — a Switch toggle for horizontal flip
- **"Zoom de l'image"** — a Slider (range 0.5 to 2.0, step 0.05) to control scale
- Show a live preview of the image with both transforms applied

### 2. All image render locations — apply conditional CSS transform
Each vehicle `<img>` tag gets:
```tsx
style={{
  transform: `${v.image_flipped ? 'scaleX(-1)' : ''} scale(${v.image_scale ?? 1})`.trim() || 'none'
}}
```

Files to update:
- `src/pages/Index.tsx` — homepage vehicle cards
- `src/pages/Fleet.tsx` — fleet page cards
- `src/pages/VehicleDetail.tsx` — detail page main image
- `src/components/reservation/StepVehicle.tsx` — vehicle selection list
- `src/components/reservation/ReservationSidebar.tsx` — sidebar thumbnail

### Files
- `vehicles` table (migration — 2 new columns)
- `src/pages/admin/AdminFleet.tsx`
- `src/pages/Index.tsx`
- `src/pages/Fleet.tsx`
- `src/pages/VehicleDetail.tsx`
- `src/components/reservation/StepVehicle.tsx`
- `src/components/reservation/ReservationSidebar.tsx`

