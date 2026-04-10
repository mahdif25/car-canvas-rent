

# Fix Sidebar Bottom Visibility & Settings Tabs Visibility

## Issues
1. **Déconnexion button not visible**: The sidebar bottom section is cut off. The sidebar needs `overflow-hidden` on the aside and the nav section should scroll independently so the bottom pinned section (Paramètres + Déconnexion) always stays visible.
2. **Settings tabs not visible**: The `TabsList` with `flex-wrap` on a `bg-muted` background blends into the page. The tabs need proper width and visible styling.

## Changes

### 1. `src/components/admin/AdminLayout.tsx`
- Add `overflow-hidden` to the desktop `<aside>` so the flex column doesn't overflow
- Add `overflow-y-auto` to the `<nav>` section so main nav items scroll if needed
- Ensure the bottom div with Paramètres + Déconnexion has `shrink-0` so it's always pinned at the bottom

### 2. `src/pages/admin/AdminSettings.tsx`
- Change `TabsList` to use `w-full` and `grid grid-cols-5` (or similar) instead of `flex-wrap` so all tab triggers are clearly visible with proper sizing
- Alternatively, make the TabsList `w-full flex` with proper spacing so tabs don't collapse into invisibility on the muted background

## Files Changed
1. `src/components/admin/AdminLayout.tsx` — fix sidebar overflow for bottom section visibility
2. `src/pages/admin/AdminSettings.tsx` — fix TabsList to be fully visible

