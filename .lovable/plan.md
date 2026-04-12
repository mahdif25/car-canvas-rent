

# Fleet Vehicle Management Dashboard — Expenses, Analytics & Availability

## Overview
Transform the Parc Auto page into a comprehensive vehicle management dashboard. Each physical car (by plate) gets its own detail view with expense tracking, revenue analytics, and real-time availability status showing current renter details and days remaining.

## Database Changes

**New table: `fleet_expenses`**
- `id` uuid PK
- `plate_id` uuid FK → fleet_plates(id) ON DELETE CASCADE
- `category` text — one of: 'cleaning', 'oil_change', 'repair', 'part_replacement', 'other'
- `description` text (nullable)
- `amount` numeric NOT NULL
- `expense_date` date NOT NULL DEFAULT CURRENT_DATE
- `created_at` timestamptz DEFAULT now()

RLS: admin ALL, no public access.

## UI Redesign — AdminFleetPlates.tsx

### Main List View (replaces current grouped accordion)
- Grid/list of all plates, each card showing:
  - Vehicle image (pulled from `vehicles.image_url` or default color variant)
  - Plate number, brand/model
  - Availability badge: "Disponible" (green) or "En location — X jours restants" (orange/red)
  - Quick stats row: total reservations count, total revenue earned, total expenses
  - Click to expand/open detail panel

### Per-Plate Detail Panel (expanded or dialog)
Two tabs/sections:

**1. Dépenses (Expenses)**
- Table listing all expenses: date, category, description, amount
- Category filter chips (Nettoyage, Vidange, Réparation, Pièce, Autre)
- "Ajouter une dépense" inline form: category select, amount, date, description
- Total expenses summary at top
- Edit/delete each expense row

**2. Disponibilité & Réservation en cours**
- If currently reserved (status = active/confirmed):
  - Customer name, phone, email
  - Pickup date, return date
  - Days remaining until return (calculated from `return_date - today`)
  - Reservation status badge
- If available: "Disponible" with next upcoming reservation (if any)
- Reservation history list (already exists, keep it)

### Analytics Summary Per Plate
Computed client-side from reservations data:
- **Nombre de réservations**: count of all reservations assigned to this plate
- **Revenus totaux**: sum of `total_price` from completed/active reservations for this plate
- **Dépenses totales**: sum from `fleet_expenses` for this plate
- **Bénéfice net**: revenue - expenses
- Days remaining for current reservation (if active)

## Data Fetching
- Extend the reservations query to include `total_price`, `customer_phone`, `customer_email`
- New query for `fleet_expenses` grouped by plate
- Vehicle images already available from `useVehicles()`

## Files to Create/Modify
- **Migration**: create `fleet_expenses` table with RLS
- **`src/pages/admin/AdminFleetPlates.tsx`**: full redesign with card grid, detail panel, expense CRUD, analytics stats, availability section
- No new routes needed — everything stays on `/admin/fleet-plates`

## Responsive
- Cards: 1 column on mobile, 2 on tablet, 3 on desktop
- Detail panel: full-width on mobile, side panel or dialog on desktop
- Expense table scrolls horizontally on mobile

