

# Vehicle Image Gallery & Custom Slug

## Overview
Two features: (1) support multiple images per vehicle with a gallery on the detail page, and (2) add a `slug` field to vehicles for custom URL paths.

## 1. Database Changes

### New `vehicle_images` table
- `id` (uuid, PK), `vehicle_id` (uuid, NOT NULL), `image_url` (text, NOT NULL), `sort_order` (integer, DEFAULT 0), `created_at` (timestamptz)
- RLS: anyone can SELECT, admins can INSERT/UPDATE/DELETE
- The existing `image_url` on `vehicles` remains as the primary/cover image

### Add `slug` column to `vehicles`
- `slug` (text, UNIQUE, NULLABLE) — admin can set a custom slug like `renault-clio-2026`
- When slug is null, fall back to the vehicle ID in the URL

## 2. Routing (`src/App.tsx`)
- Change route from `/fleet/:id` to `/fleet/:slug` 
- The `slug` param can be either a UUID (backward compat) or a custom slug

## 3. Vehicle Lookup (`src/hooks/useVehicles.ts`)
- Add `useVehicleBySlug(slug)` — first tries to match by `slug` column, then falls back to matching by `id` (for UUID-based URLs)
- Add `useVehicleImages(vehicleId)` — fetches from `vehicle_images` ordered by `sort_order`

## 4. Vehicle Detail Page (`src/pages/VehicleDetail.tsx`)
- Use `useVehicleBySlug` instead of `useVehicle`
- Build gallery from cover image + additional images from `vehicle_images`
- Replace static image with an interactive gallery: main image + thumbnail strip below, clicking a thumbnail switches the main image
- Dot indicators become functional, reflecting actual image count

## 5. Admin Fleet Form (`src/pages/admin/AdminFleet.tsx`)
- Add `slug` field input (text, optional) with auto-generate button from vehicle name
- Add "Images supplémentaires" section: list of URL inputs to add/remove gallery images
- On save, insert/delete rows in `vehicle_images` alongside the vehicle save

## 6. Link Updates
- Update links in `Index.tsx`, `Fleet.tsx`, `StepVehicle.tsx` to use `/fleet/${vehicle.slug || vehicle.id}` so slug-based URLs are used when available

## Files Changed
1. **Migration** — create `vehicle_images` table + add `slug` column to `vehicles`
2. `src/hooks/useVehicles.ts` — add `useVehicleBySlug`, `useVehicleImages`
3. `src/App.tsx` — update route param name
4. `src/pages/VehicleDetail.tsx` — gallery UI + slug-based lookup
5. `src/pages/admin/AdminFleet.tsx` — slug input + gallery image management
6. `src/pages/Index.tsx` — update vehicle links to use slug
7. `src/pages/Fleet.tsx` — update vehicle links to use slug
8. `src/components/reservation/StepVehicle.tsx` — update vehicle links if any

