

# Replace Vehicle Category Text with Icons

## Overview
Create a shared category icon mapping utility and replace all text-only category labels with icon + label combos across the Fleet page, Homepage, VehicleDetail, StepVehicle, WhatsAppPopup, and AdminFleet.

## Icon Mapping
Using Lucide icons that visually represent each category:

| Category | Icon | Rationale |
|----------|------|-----------|
| SUV | `Truck` | Rugged/tall vehicle silhouette |
| Sedan | `Car` | Classic car shape |
| Compact | `CircleDot` | Small/compact feel |
| Luxury | `Crown` | Premium/luxury |
| Minivan | `Bus` | Multi-passenger vehicle |

## Changes

### 1. New file: `src/lib/vehicle-categories.ts`
Shared utility mapping category strings to Lucide icons and labels. Exports:
- `CATEGORY_ICON_MAP` — maps category name → `{ icon: LucideIcon, label: string }`
- `CategoryIcon` component — renders icon + optional label, accepts size prop

### 2. Update `src/pages/Fleet.tsx`
- Filter chips: replace text-only buttons with icon + text chips
- Card category badge: replace `{v.category}` text with `CategoryIcon`

### 3. Update `src/pages/Index.tsx`
- Card category badge (line ~300): replace `{v.category}` with `CategoryIcon`

### 4. Update `src/pages/VehicleDetail.tsx`
- Category badge (line ~122): replace text with `CategoryIcon`

### 5. Update `src/components/reservation/StepVehicle.tsx`
- Category badge (line ~97): replace text with `CategoryIcon`

### 6. Update `src/components/WhatsAppPopup.tsx`
- Category text (line ~183): replace with `CategoryIcon`

### 7. Update `src/pages/admin/AdminFleet.tsx`
- Vehicle table category column (line ~758): replace text with `CategoryIcon`
- Mobile vehicle list (line ~787): replace text with icon

## Responsive
Icons render at consistent small sizes (12–14px) matching existing text sizes. No layout breakage on mobile/tablet.

## Files Modified
- `src/lib/vehicle-categories.ts` (new)
- `src/pages/Fleet.tsx`
- `src/pages/Index.tsx`
- `src/pages/VehicleDetail.tsx`
- `src/components/reservation/StepVehicle.tsx`
- `src/components/WhatsAppPopup.tsx`
- `src/pages/admin/AdminFleet.tsx`

