

# Update Admin Sidebar Nav Items

## Changes

### `src/components/admin/AdminLayout.tsx`

1. **Rename "Options" to "Add-ons"** and change its icon from `Settings` to `Puzzle` (from lucide-react) — a more fitting icon for add-ons/extras.

2. **Move "Paramètres" out of the main `navItems` array** and render it separately at the bottom of the sidebar, just above the "Déconnexion" button. This applies to:
   - Desktop sidebar: render Paramètres link in the bottom `border-t` section, above the logout button
   - Mobile drawer: same placement — bottom section before logout
   - Mobile bottom nav: no change needed (Paramètres is already not in `bottomNavItems`)

### Icon import update
- Add `Puzzle` import from `lucide-react`
- Remove one of the duplicate `Settings` imports (keep one for Paramètres)

### Summary of nav structure after change

**Main nav list:**
- Dashboard, Flotte, **Add-ons** (Puzzle icon), Réservations, Lieux, Marketing, Analytics, Leads

**Bottom section (above logout):**
- Paramètres (Settings icon)
- Déconnexion

## Files Changed
1. `src/components/admin/AdminLayout.tsx`

