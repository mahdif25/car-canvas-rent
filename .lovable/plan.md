

# Adjustable Logo Size from Admin Settings

## Overview
Add a "Logo Size" slider to the admin Appearance settings so you can control how big the logo appears across all pages — homepage, fleet, reservation sidebar, admin panel, and confirmation/receipt.

## Database Change
Add a `logo_height` integer column to the `site_settings` table (default `48`, in pixels). This maps to the current `h-12` (48px).

```sql
ALTER TABLE public.site_settings ADD COLUMN logo_height integer NOT NULL DEFAULT 48;
```

## Code Changes

### 1. Update SiteSettings type (`src/hooks/useSiteSettings.ts`)
Add `logo_height: number` to the `SiteSettings` interface.

### 2. Add Logo Size slider to Admin Settings (`src/pages/admin/AdminSettings.tsx`)
In the Appearance tab, add a "Taille du logo" slider (range 32–80px) with a live preview of the logo. Include `logo_height` in the save call alongside the other appearance fields.

### 3. Update Navbar (`src/components/layout/Navbar.tsx`)
- Import `useSiteSettings`
- Apply `style={{ height: settings?.logo_height || 48 }}` on the logo `<img>` instead of the fixed `h-12` class

### 4. Update Footer (`src/components/layout/Footer.tsx`)
- Import `useSiteSettings`
- Apply dynamic height (default 56px / `h-14` equivalent) — use `settings?.logo_height ? settings.logo_height + 8 : 56` for a slightly larger footer logo, or same value

### 5. Update AdminLayout (`src/components/admin/AdminLayout.tsx`)
- Import `useSiteSettings`
- Apply dynamic height on all 3 logo instances (mobile header, drawer, desktop sidebar)

### 6. Update AdminLogin (`src/pages/admin/AdminLogin.tsx`)
- Import `useSiteSettings`
- Apply dynamic height on the login page logo

### Files
- `site_settings` table (migration)
- `src/hooks/useSiteSettings.ts`
- `src/pages/admin/AdminSettings.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/admin/AdminLayout.tsx`
- `src/pages/admin/AdminLogin.tsx`

