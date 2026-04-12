

# Nationality Dropdown, CIN/Passport, License Date & Reservation Report Download

## Overview

Replace the free-text nationality field with a dropdown (Marocaine default), add conditional CIN or Passport number field, add license delivery date and CIN expiration date fields. Show all new fields in admin reservation view. Add a downloadable report for filtered reservations.

## Database Migration

Add 4 new nullable columns to `reservations`:

```sql
ALTER TABLE public.reservations
  ADD COLUMN customer_cin text,
  ADD COLUMN customer_passport text,
  ADD COLUMN customer_license_delivery_date date,
  ADD COLUMN customer_cin_expiry_date date;
```

Add same fields to `additional_drivers`:

```sql
ALTER TABLE public.additional_drivers
  ADD COLUMN cin text,
  ADD COLUMN passport text,
  ADD COLUMN license_delivery_date date,
  ADD COLUMN cin_expiry_date date;
```

## Types Update (`src/lib/types.ts`)

Add to `ReservationFormData`:
- `cin: string`
- `passport: string`
- `license_delivery_date: string`
- `cin_expiry_date: string`

Add same 4 fields to `AdditionalDriver` interface.

## Reservation Form (`StepDriverInfo.tsx`)

1. **Nationality dropdown**: Replace text Input with a `Select` component. Options: `Marocaine` (default, first), then alphabetical list of ~30 common nationalities + "Autre" option.
2. **Conditional ID field**:
   - If nationality === "Marocaine": show "N° CIN *" input + "Date d'expiration CIN" date input
   - Otherwise: show "N° Passeport *" input (no expiry needed)
3. **License delivery date**: Add a date input "Date de délivrance du permis" next to the license number field
4. **Validation**: CIN or Passport required based on nationality. License delivery date optional.
5. Apply same logic to additional driver section.

## Reservation Submission (`Reservation.tsx`)

Pass new fields (`customer_cin`, `customer_passport`, `customer_license_delivery_date`, `customer_cin_expiry_date`) in the insert to `reservations` table. Same for `additional_drivers`.

## Manual Reservation (`ManualReservationDialog.tsx`)

Add the same nationality dropdown, conditional CIN/Passport, license delivery date, and CIN expiry fields to the manual creation form. Pass them in the insert.

## Admin Reservations (`AdminReservations.tsx`)

### Display new fields
In the expanded reservation detail, show:
- CIN or Passport number (based on nationality)
- CIN expiry date (if Moroccan)
- License delivery date
- Make these inline-editable like existing fields

### Download Report Button
Add a "Télécharger" button next to the filters bar. When clicked, generates a printable report (via `window.open` + `print()`) of all currently filtered reservations with columns:
- Reservation ID (8-char)
- Vehicle assigned (plate number or vehicle name)
- Customer name
- Phone
- CIN/Passport
- Pickup location
- Drop-off location
- License number
- License delivery date
- Days rented
- Amount paid
- Caution: "Oui" / "Non" (based on deposit_status)
- Status

## Files to Modify
- **Migration**: new columns on `reservations` and `additional_drivers`
- `src/lib/types.ts`: add new fields
- `src/components/reservation/StepDriverInfo.tsx`: nationality dropdown, conditional CIN/Passport, license delivery date, CIN expiry
- `src/pages/Reservation.tsx`: pass new fields on insert
- `src/components/admin/ManualReservationDialog.tsx`: add new fields
- `src/pages/admin/AdminReservations.tsx`: display new fields + download report button

## Responsive
- Nationality dropdown and conditional fields use the existing 2-column grid on desktop, stacked on mobile
- Report download button inline with filters on desktop, full-width on mobile

