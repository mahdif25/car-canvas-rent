

# Additional Driver, Legal Updates & Input Validation

## Overview
Three changes: (1) allow adding an optional second driver during checkout with full info collection, stored in the database and visible/editable by admin; (2) update legal page with driver responsibility clauses; (3) add email and phone format validation with user-friendly error messages.

## 1. Database: `additional_drivers` table

New migration to create a table storing second driver details per reservation:

```sql
CREATE TABLE public.additional_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  license_number text NOT NULL,
  nationality text,
  dob date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.additional_drivers ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert (public checkout), admins can view/update/delete
CREATE POLICY "Anyone can insert additional drivers" ON public.additional_drivers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view additional drivers" ON public.additional_drivers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update additional drivers" ON public.additional_drivers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete additional drivers" ON public.additional_drivers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view own via reservation" ON public.additional_drivers FOR SELECT TO public USING (true);
```

## 2. Update `src/lib/types.ts`

Add `AdditionalDriver` interface and add `additional_driver` fields to `ReservationFormData`:

```typescript
export interface AdditionalDriver {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  nationality: string;
  dob: string;
}
```

Add to `ReservationFormData`:
- `has_additional_driver: boolean`
- `additional_driver: AdditionalDriver`

## 3. Update `src/components/reservation/StepDriverInfo.tsx`

- Add a toggle/checkbox: "Ajouter un conducteur supplémentaire"
- When enabled, show a second card with the same fields (first name, last name, email, phone, license, nationality, DOB) for the additional driver
- Additional driver requires: first name, last name, phone, license number (email optional)
- **Input validation** (applies to both drivers):
  - **Email**: Validate on blur with regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Show error: "Format invalide. Exemple : nom@domaine.com"
  - **Phone**: Validate on blur with regex supporting local (`06/07 XX XX XX XX`) and international (`+212 6 XX XX XX XX XX`) formats. Show error: "Format invalide. Exemples : 0600000000 ou +212 600000000"
- Show inline red error messages below each field when validation fails
- Clear error on valid input

## 4. Update `src/pages/Reservation.tsx`

- Initialize `has_additional_driver: false` and `additional_driver` with empty fields in form state
- After inserting the reservation, if `has_additional_driver` is true, insert into `additional_drivers` table with the `reservation_id`

## 5. Update `src/pages/admin/AdminReservations.tsx`

- Query `additional_drivers` table alongside reservations
- In the expanded reservation view, show an "Additional Driver" section when one exists, displaying all their details
- Allow inline editing of additional driver fields (same pattern as primary driver: pencil icon, inline input, check/cancel)
- Show a badge or indicator on the row when an additional driver is present

## 6. Update `src/pages/ConditionsGenerales.tsx`

Add two new sections to the `defaultContent`:

- **Section 2bis — Conducteur principal et responsabilité**: "Le conducteur principal (signataire du contrat) est le seul responsable du véhicule pendant toute la durée de la location. En cas de dépassement de la date de restitution convenue, le conducteur principal reste entièrement responsable du véhicule, y compris de tous les frais, dommages et pénalités qui pourraient en découler, jusqu'à la restitution effective du véhicule."

- **Section 2ter — Conducteur supplémentaire**: "Un conducteur supplémentaire peut être déclaré lors de la réservation. Le conducteur supplémentaire doit remplir les mêmes conditions que le conducteur principal (âge, permis valide). Le conducteur principal reste toutefois le seul responsable du véhicule en toutes circonstances."

## Files to Create/Modify

- **Migration**: New `additional_drivers` table
- **Modify**: `src/lib/types.ts` — add types
- **Modify**: `src/components/reservation/StepDriverInfo.tsx` — additional driver form + input validation
- **Modify**: `src/pages/Reservation.tsx` — form state init + DB insert
- **Modify**: `src/pages/admin/AdminReservations.tsx` — query + display + edit additional driver
- **Modify**: `src/pages/ConditionsGenerales.tsx` — add responsibility clauses

