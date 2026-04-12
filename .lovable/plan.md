

# Sticky Sidebar Footer & Plate Number in Report

## Problem 1 — Sidebar Settings/Logout scrolling away
The desktop sidebar uses `overflow-hidden` on the `<aside>` and `overflow-y-auto` on the `<nav>`, but when the nav items overflow, the bottom section (Settings + Logout) can get pushed out of view. The fix is to ensure the sidebar uses `h-screen sticky top-0` so it stays fixed to the viewport, and the nav section scrolls independently while the bottom section stays pinned.

## Problem 2 — Missing plate number (immatriculation) in downloaded report
The report currently shows "Assigné" or "—" for the plate column. It needs to show the actual `plate_number` from the available plates data.

## Changes

### File: `src/components/admin/AdminLayout.tsx`
**Desktop sidebar** (line ~156): Change `<aside>` from `overflow-hidden` to `sticky top-0 h-screen` so it never scrolls with the page. The inner `<nav>` already has `overflow-y-auto` and `flex-1` so it will scroll independently while the bottom div stays pinned.

### File: `src/pages/admin/AdminReservations.tsx`
**Report download** (line ~380): Replace `const plate = r.assigned_plate_id ? "Assigné" : "—"` with a lookup that finds the actual plate number from the available plates data. Add an "Immatriculation" column to the report table header and row, showing the plate number next to the vehicle name.

## Scope
- 2 files modified
- No database changes
- Responsive: sidebar fix is desktop-only (mobile uses bottom nav already)

