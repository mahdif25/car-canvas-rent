

# Fleet Plates System — Physical Car Management & Reservation Assignment

## Overview
Create a `fleet_plates` table to represent actual physical cars (each with a plate number) linked to a vehicle type. Admins can assign a specific plate to a reservation before activating it. A reservation cannot be set to "active" without a plate assigned. The plate appears on the receipt only when active.

## Database Changes

**New table: `fleet_plates`**
```sql
CREATE TABLE public.fleet_plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  plate_number text NOT NULL UNIQUE,
  brand text NOT NULL,
  model text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_plates ENABLE ROW LEVEL SECURITY;
-- RLS: admins full access, public read for matching
```

**New column on `reservations`:**
- `assigned_plate_id uuid REFERENCES fleet_plates(id)` (nullable)

**Constraint:** Reservation status cannot be changed to `active` unless `assigned_plate_id` is set. Enforced via a validation trigger + UI guard.

**Validation trigger:**
```sql
CREATE FUNCTION validate_reservation_active() ...
-- BEFORE UPDATE: if NEW.status = 'active' AND NEW.assigned_plate_id IS NULL, raise exception
```

## UI Changes

### 1. New Admin Page: `AdminFleetPlates.tsx`
- Table listing all plates grouped by vehicle type
- Columns: plate number, brand, model, linked vehicle type, status (active/inactive), current reservation (if any)
- Add plate form: select vehicle type, enter plate number (brand/model auto-filled from vehicle)
- Edit/delete plates
- Per-plate reservation history (expandable row showing past reservations assigned to that plate)
- Add to admin sidebar navigation

### 2. `AdminReservations.tsx` — Plate Assignment
- In the expanded reservation detail, add a "Véhicule assigné" dropdown
- Dropdown shows only plates matching the reservation's vehicle_id that are not currently assigned to another active/confirmed reservation in overlapping dates
- When a plate is assigned, save `assigned_plate_id` on the reservation
- Block status change to "Active" if no plate is assigned (disable button + tooltip)
- Show assigned plate number as a badge when set

### 3. Receipt (`printReceipt` function)
- Show the assigned plate number on the receipt only when `status = 'active'` and plate is assigned

### 4. `ManualReservationDialog.tsx`
- Add optional plate assignment dropdown (same filtering logic)

## Files to Create/Modify
- **Migration**: create `fleet_plates` table, add `assigned_plate_id` to reservations, add validation trigger
- **`src/pages/admin/AdminFleetPlates.tsx`** (new): plate CRUD + history
- **`src/pages/admin/AdminReservations.tsx`**: plate assignment dropdown, active status guard
- **`src/components/admin/ManualReservationDialog.tsx`**: optional plate selector
- **`src/components/admin/AdminLayout.tsx`**: add "Parc Auto" nav link
- **`src/App.tsx`**: add route for `/admin/fleet-plates`

