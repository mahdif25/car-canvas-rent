

# Mobile-Friendly Admin Settings Page

## Problem
The settings page uses a 6-column tab grid (`grid-cols-6`) that crams all tab labels into a tiny row on mobile — text gets truncated and is hard to tap. Inside tabs, multi-column grids (e.g. `grid-cols-2`, `grid-cols-3` for text formatting) also squeeze on small screens.

## Plan

### 1. Replace the tab bar with a scrollable horizontal strip on mobile
In `src/pages/admin/AdminSettings.tsx`:
- Change `TabsList` from `grid grid-cols-6` to a horizontally scrollable row on mobile: `flex overflow-x-auto` with `whitespace-nowrap` on each trigger
- On desktop (md+), keep the current grid layout: `md:grid md:grid-cols-6`
- Show only the icon on mobile triggers (hide label text below `md`), show icon + label on desktop
- This makes tabs easy to tap and scroll on small screens

### 2. Make inner form grids responsive
Throughout the file:
- Change `grid-cols-2` → `grid-cols-1 md:grid-cols-2` for hero text fields, footer fields, etc.
- Change `grid-cols-3` → `grid-cols-1 sm:grid-cols-3` for text formatting controls (size/weight/alignment)
- Reduce card padding on mobile: `p-4 md:p-6`

### 3. Improve card section spacing on mobile
- Tighten `space-y-6` to `space-y-4` on mobile for denser layout
- Make save buttons full-width on mobile: `w-full md:w-auto`

## File to change
- `src/pages/admin/AdminSettings.tsx`

## Result
- Tabs are scrollable and tappable on mobile with icon-only display
- Form fields stack vertically instead of cramming side-by-side
- Save buttons are easy to reach on mobile
- Desktop layout remains unchanged

