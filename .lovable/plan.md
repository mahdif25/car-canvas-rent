

# Email System, Terms Page, and Reservation Lookup

## Overview
Build a complete transactional email system, a "Conditions Générales" page, a public reservation tracking page, and update the checkout checkbox to combine terms acceptance with newsletter consent.

## Key Clarification: Newsletter Checkbox
The single existing checkbox will cover both terms acceptance AND newsletter/marketing consent. When the user checks it, they agree to terms **and** opt in to receive promotional emails. The label text will be updated to reflect both.

## Changes

### 1. Database Migration
- Add `marketing_consent` boolean (default `true`) to `reservations` table
- Add RLS policy on `reservations` allowing public SELECT when filtered by `id` + `customer_email`
- Add public SELECT RLS on `reservation_addons` for matching reservation lookups

### 2. Scaffold Transactional Email System
- Use `email_domain--scaffold_transactional_email` to set up the send-transactional-email edge function
- Create 3 email templates:
  - **Reservation Confirmation** — full receipt (vehicle, dates, locations, add-ons, pricing, deposit)
  - **Reservation Update** — sent when admin modifies a reservation, updated receipt
  - **Welcome Email** — first-time customer greeting

### 3. Update Checkout Checkbox (`StepDriverInfo.tsx`)
- Change the label to: "J'accepte les **conditions générales de location**, la politique de confidentialité, et je consens à recevoir des offres et promotions par email."
- Make "conditions générales de location" a `<Link>` to `/conditions-generales` (opens in new tab)
- Single checkbox controls both `terms_accepted` (unchanged behavior)

### 4. Update Types (`lib/types.ts`)
- No new field needed — `terms_accepted` already covers both since they share one checkbox

### 5. Conditions Générales Page (`src/pages/ConditionsGenerales.tsx`)
- New route `/conditions-generales`
- Full legal page with sections: conditions de location, conducteur, assurance, caution, carburant, kilométrage, annulation, dommages, confidentialité
- Uses `Layout` wrapper (Navbar + Footer)

### 6. Reservation Tracking Page (`src/pages/TrackReservation.tsx`)
- New route `/suivi-reservation`
- Form: reservation number (8-char code) + email
- Queries reservations table, displays full details (vehicle, dates, locations, add-ons, pricing)
- No auth required — public access with ID + email match

### 7. Email Triggers
- **Reservation.tsx**: After successful booking, call `send-transactional-email` with confirmation template
- **AdminReservations.tsx**: After admin saves edits, call `send-transactional-email` with update template
- Store `marketing_consent: true` when inserting reservation (checkbox is required)

### 8. Footer & Routes
- **Footer.tsx**: Add links to "Conditions Générales" and "Suivi de réservation"
- **App.tsx**: Add routes for `/conditions-generales` and `/suivi-reservation`

## Files Created
1. `src/pages/ConditionsGenerales.tsx`
2. `src/pages/TrackReservation.tsx`
3. `supabase/functions/send-transactional-email/index.ts`

## Files Modified
1. `src/components/reservation/StepDriverInfo.tsx` — updated checkbox label with link + newsletter text
2. `src/pages/Reservation.tsx` — send confirmation email, pass marketing_consent
3. `src/pages/admin/AdminReservations.tsx` — send update email after admin edits
4. `src/components/layout/Footer.tsx` — add links
5. `src/App.tsx` — add 2 new routes

## Execution Order
1. Database migration (add column + RLS policies)
2. Scaffold transactional email infrastructure
3. Create email templates + edge function
4. Create Conditions Générales page
5. Create Reservation Tracking page
6. Update checkout checkbox
7. Wire email triggers in Reservation.tsx and AdminReservations.tsx
8. Update Footer and App routes

