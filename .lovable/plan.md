

# Centre Lux Car — Car Rental Platform Plan

## Brand & Color Theme (from logo)

Based on the uploaded logo, the color palette shifts to:

- **Primary Green**: `#00C853` (the vibrant green from the logo)
- **Primary Black**: `#1A1A1A` (deep black from the car silhouette)
- **Dark background/footer**: `rgb(29, 43, 54)` (kept from Sovoy's dark footer)
- **White**: backgrounds, card surfaces
- **Muted Gray**: `#6B7280` for secondary text
- **Accent hover**: darker green `#00A844`
- **Font**: Poppins (matching Sovoy)
- **Border radius**: Asymmetric pill `30px 0px` / `20px 0px` (Sovoy's signature style)

The logo image will be embedded in the navbar and footer.

---

## Architecture Overview

```text
Public Pages                    Admin (auth-protected)
─────────────                   ──────────────────────
/              Homepage         /admin           Dashboard
/fleet         Vehicle grid     /admin/fleet     Manage vehicles
/fleet/:id     Vehicle detail   /admin/addons    Manage add-ons
/reservation   Multi-step flow  /admin/reservations  Manage bookings
```

---

## Database Schema (Supabase / Lovable Cloud)

**Tables:**
- `vehicles` — name, brand, model, year, category, transmission, fuel, seats, doors, luggage, image_url, security_deposit (MAD), is_available
- `vehicle_pricing_tiers` — vehicle_id, min_days, max_days, daily_rate
- `addon_options` — name, description, price_per_day, is_enabled (admin toggle)
- `reservations` — vehicle_id, pickup_date, return_date, pickup_location, return_location, customer info (name, email, phone, license_number, nationality, dob), total_price, deposit_amount, deposit_status (pending/collected/returned), status (pending/confirmed/active/completed/cancelled)
- `reservation_addons` — reservation_id, addon_id
- `profiles` — id (references auth.users), full_name, email
- `user_roles` — user_id, role (admin/user enum)

RLS policies using `has_role()` security definer function for admin access.

---

## Implementation Phases

### Phase 1: Foundation
- Set up design system (CSS variables, Poppins font, green/black palette)
- Copy logo to `src/assets/logo.png`
- Create shared layout: Navbar (logo, nav links) + Footer (dark, contact info)
- Set up Supabase tables and RLS

### Phase 2: Public Fleet Pages
- **Homepage**: Hero with search bar (pickup/return dates + location), featured vehicles section, benefits section
- **Fleet page** (`/fleet`): Grid of vehicle cards with filters (category, transmission), each showing image, name, specs, starting price, "Book Now" CTA
- **Vehicle detail** (`/fleet/:id`): Image, full specs, tiered pricing table, deposit amount, "Reserve Now" CTA

### Phase 3: Multi-Step Reservation Flow
- **Step 1 — Dates & Location**: Pickup/return date-time pickers, location dropdowns, duration summary sidebar
- **Step 2 — Vehicle Selection**: Available vehicles for selected dates, price shown for actual duration tier, select button, running total sidebar
- **Step 3 — Add-ons**: Only admin-enabled add-ons shown as toggleable cards (name, description, price/day). No insurance section. Running total sidebar updates
- **Step 4 — Driver Info & Deposit**: Customer form (name, email, phone, license, nationality, DOB), security deposit notice with amount, terms checkbox, full booking summary sidebar
- **Step 5 — Confirmation**: Confirmation number, full summary, "payment at pickup" notice

### Phase 4: Admin Dashboard
- **Auth**: Supabase email/password login, role-checked routes
- **Dashboard home**: Stats cards (total vehicles, active bookings, pending, upcoming returns), recent reservations list
- **Fleet management**: Table of vehicles, add/edit form with:
  - Basic info + image upload
  - Tiered pricing editor (add/remove duration brackets with daily rates)
  - Security deposit field (MAD)
  - Availability toggle
- **Add-ons management**: CRUD table with name, description, price/day, and **enable/disable toggle** per add-on
- **Reservations management**: Table with status filters, detail view, status workflow buttons (Pending → Confirmed → Active → Completed), deposit status tracking (mark collected/returned)

### Phase 5 (Deferred)
- Payment integration

---

## Key Decisions
- **No insurance section** — removed entirely
- **Add-ons**: Admin can create, edit, delete add-ons and toggle them on/off; only enabled add-ons appear in the reservation flow
- **Security deposit**: Display-only during booking; admin tracks collection/return status
- **Payment**: Deferred; booking confirmation says "payment at pickup"

