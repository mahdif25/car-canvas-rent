

# Editable Footer, Legal Pages & Privacy Policy from Admin

## Overview
Store all footer content, Conditions Générales, Privacy Policy, and Caution Policy as editable fields in the database, manageable from the Admin Settings panel. Add two new public pages (Privacy Policy, Caution Policy) and a new "Contenu" tab in admin settings.

## Database Migration

Add columns to `site_settings`:

```sql
-- Footer fields
ALTER TABLE public.site_settings
  ADD COLUMN footer_description text NOT NULL DEFAULT 'Location de voitures de qualité au Maroc. Service professionnel et véhicules bien entretenus.',
  ADD COLUMN footer_phone text NOT NULL DEFAULT '+212 6 00 00 00 00',
  ADD COLUMN footer_email text NOT NULL DEFAULT 'contact@centreluxcar.ma',
  ADD COLUMN footer_address text NOT NULL DEFAULT 'Casablanca, Maroc',
  ADD COLUMN footer_copyright text NOT NULL DEFAULT 'Centre Lux Car. Tous droits réservés.',
  ADD COLUMN conditions_generales_html text NOT NULL DEFAULT '',
  ADD COLUMN privacy_policy_html text NOT NULL DEFAULT '',
  ADD COLUMN caution_policy_html text NOT NULL DEFAULT '';
```

## Code Changes

### 1. Update `SiteSettings` interface (`src/hooks/useSiteSettings.ts`)
Add all 8 new fields to the interface.

### 2. New Admin "Contenu" tab (`src/pages/admin/AdminSettings.tsx`)
Add a 6th tab called "Contenu" (with a FileText icon) containing:
- **Footer section**: inputs for description, phone, email, address, copyright text
- **Conditions Générales section**: a large textarea for the HTML/markdown content
- **Politique de Confidentialité section**: a large textarea
- **Politique de Caution section**: a large textarea
- Each section has its own Save button

### 3. Update Footer (`src/components/layout/Footer.tsx`)
Replace hardcoded text with values from `settings`:
- `settings.footer_description` for the brand description
- `settings.footer_phone`, `settings.footer_email`, `settings.footer_address` for contact info
- `settings.footer_copyright` for bottom bar
- Add links to `/politique-confidentialite` and `/politique-caution` in the quick links

### 4. Update Conditions Générales page (`src/pages/ConditionsGenerales.tsx`)
Fetch `settings.conditions_generales_html` from the database and render it with `dangerouslySetInnerHTML`. Fall back to current hardcoded content if empty.

### 5. New Privacy Policy page (`src/pages/PrivacyPolicy.tsx`)
New page at `/politique-confidentialite` that renders `settings.privacy_policy_html`. Same layout as Conditions Générales.

### 6. New Caution Policy page (`src/pages/CautionPolicy.tsx`)
New page at `/politique-caution` that renders `settings.caution_policy_html`. Explains how the security deposit works.

### 7. Register routes (`src/App.tsx`)
Add routes for `/politique-confidentialite` and `/politique-caution`.

## Files
- `site_settings` table (migration)
- `src/hooks/useSiteSettings.ts`
- `src/pages/admin/AdminSettings.tsx`
- `src/components/layout/Footer.tsx`
- `src/pages/ConditionsGenerales.tsx`
- `src/pages/PrivacyPolicy.tsx` (new)
- `src/pages/CautionPolicy.tsx` (new)
- `src/App.tsx`

