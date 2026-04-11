

# Complete Admin Mobile Restyle — App-Like Experience

## Overview
Restyle the entire admin dashboard for mobile/tablet to feel like a native app. Replace desktop-centric tables with card-based lists, stack forms vertically, use full-width action buttons, and ensure every page is touch-friendly. No functionality will be removed — only the presentation layer changes.

## Current Problems
- Bottom nav only shows 4 items; "Plus" button for the rest feels hidden
- Tables on Fleet, Addons, Locations, Marketing, Broadcast, Leads overflow horizontally on mobile
- Forms use `grid-cols-3` grids that don't stack well
- Buttons are small and hard to tap
- Reservation expanded details are cramped
- Analytics charts and pie charts are too small on mobile
- Broadcast wizard step indicator is a horizontal text row that wraps badly

## Design Principles
- **Card-first**: Replace all `<table>` elements with stacked cards on mobile (keep tables on desktop via `hidden md:block` / `md:hidden`)
- **Full-width actions**: All primary buttons become `w-full` on mobile
- **Touch targets**: Minimum 44px height for interactive elements
- **Consistent spacing**: `p-4` mobile, `p-6` tablet, `p-8` desktop
- **Bottom nav optimization**: Show 5 items (Dashboard, Fleet, Reservations, Leads, Plus) for better coverage

## Files & Changes

### 1. `src/components/admin/AdminLayout.tsx`
- Update `bottomNavItems` to show 5 most-used items instead of 4
- Increase bottom nav height from `h-16` to `h-[68px]` with larger icons
- Increase `pb-20` to `pb-24` on main content to clear taller nav
- Add safe-area padding for notched devices (`pb-safe`)

### 2. `src/pages/admin/AdminDashboard.tsx`
- Stats grid: `grid-cols-2` on mobile (instead of 1), `md:grid-cols-4`
- Recent reservations: add mobile card view with status badge, client name, date, total stacked vertically
- Hide desktop table on mobile, show card list instead

### 3. `src/pages/admin/AdminFleet.tsx`
- Vehicle list: replace table with mobile cards showing image thumbnail, name, category, availability toggle, edit/delete buttons in a row
- Vehicle form: stack all fields into `grid-cols-1` on mobile, `md:grid-cols-2`, `lg:grid-cols-3`
- Image zoom section: use a single-device tab selector (as previously planned) instead of 3 stacked sliders
- Pricing tiers: stack label and input vertically on mobile
- Gallery grid: `grid-cols-2` on mobile
- Action buttons: full-width on mobile

### 4. `src/pages/admin/AdminAddons.tsx`
- Replace table with mobile card list: each addon as a card with name, description, price, enabled toggle, and edit/delete actions
- Form inputs stack vertically on mobile

### 5. `src/pages/admin/AdminLocations.tsx`
- Replace table with card-based list on mobile
- Add form: stack all fields vertically on mobile instead of inline row
- Edit mode: full card form instead of inline table editing

### 6. `src/pages/admin/AdminMarketing.tsx`
- Replace `<Table>` with expandable cards on mobile
- Each coupon card shows: code, discount, status badge, toggle
- Expand to show usage history
- Create coupon dialog: ensure full-width inputs

### 7. `src/pages/admin/AdminBroadcast.tsx`
- Step indicator: replace horizontal text with a proper step bar (circles + connecting lines)
- Step 1 (Audience): stack filters vertically on mobile; replace leads table with card list showing name, email, status, checkbox
- Step 2 (Content): full-width inputs, coupon mode section stacks vertically
- Step 3 (Review): summary grid becomes stacked on mobile
- Navigation buttons: full-width on mobile

### 8. `src/pages/admin/AdminAnalytics.tsx`
- Overview cards: `grid-cols-1` on very small screens, `grid-cols-3` on tablet+
- Charts: ensure `ResponsiveContainer` has adequate mobile height (200px min)
- Device pie charts: stack vertically on mobile (`grid-cols-1`) instead of 3-column
- Tab bar: horizontally scrollable on mobile

### 9. `src/pages/admin/AdminLeads.tsx`
- Search + filter: stack vertically on mobile
- Replace grid-based list with proper cards: name, email, status badge, step, tap to expand
- Expanded history entries: stack fields vertically

### 10. `src/pages/admin/AdminReservations.tsx`
- Reservation row header: stack client name + vehicle on one line, date + total on second line on mobile
- Expanded section: client info in `grid-cols-1` on mobile
- Editable fields: `grid-cols-1` on mobile
- Addon checkboxes: `grid-cols-1` on mobile
- Action buttons (save, print, status, deposit): full-width stacked on mobile

### 11. `src/pages/admin/AdminSettings.tsx`
- Already uses scrollable tab bar — verify it works well
- No major changes needed, already mobile-adapted

## Implementation Approach
- Use a shared pattern: `<div className="hidden md:block">` for desktop tables and `<div className="md:hidden">` for mobile card views
- This keeps all logic intact, only duplicating the render layer
- Each page will be edited independently — no shared component extraction needed to minimize risk

## Summary
10 admin files will be restyled. Zero functionality changes. All data, mutations, and business logic remain untouched. The result is a consistent, app-like mobile admin experience across every page.

