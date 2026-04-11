
# Fix Bottom Nav Tab Visibility on Mobile

## Problem
Inactive bottom nav items use `text-foreground/60` which is dark grey (based on `--foreground: 0 0% 10%`). On the dark background (`bg-dark`), these are nearly invisible. Only the active tab (green `text-primary`) is visible.

## Fix — `src/components/admin/AdminLayout.tsx`

Change the inactive color class from `text-foreground/60` to `text-dark-foreground/60` in two places:

1. **Line 132** — inactive nav links: `text-foreground/60` → `text-dark-foreground/60`
2. **Line 141** — "Plus" button: `text-foreground/60` → `text-dark-foreground/60`

This makes inactive tabs white at 60% opacity, clearly visible against the dark background.

One file, two class name changes.
