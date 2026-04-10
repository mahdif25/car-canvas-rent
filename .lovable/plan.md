

# Fix Visibility: Sidebar Déconnexion & Settings Tabs

## Root Causes

1. **Déconnexion button**: Uses `text-foreground/60` which resolves to dark gray (10% lightness) at 60% opacity — invisible on the dark sidebar (`bg-dark` is also 10% lightness). Needs `text-dark-foreground/60` (white at 60% opacity).

2. **Settings tabs**: The CSS variables `--muted` and `--muted-foreground` are identical (`220 9% 46%`), so inactive tab text is the same color as the tab bar background. The inactive tabs need explicit contrasting text color.

## Changes

### 1. `src/components/admin/AdminLayout.tsx`
- Change Déconnexion button class from `text-foreground/60 hover:text-foreground` to `text-dark-foreground/60 hover:text-dark-foreground` (desktop sidebar, line 181)
- Apply same fix to mobile drawer Déconnexion button

### 2. `src/pages/admin/AdminSettings.tsx`
- Add explicit text color to the `TabsList` so inactive tabs are visible: add `bg-card border border-border` to the TabsList
- Add `text-foreground` to inactive `TabsTrigger` items so they contrast against the background

### 3. `src/index.css`
- Fix `--muted-foreground` to a readable value like `220 9% 30%` so it contrasts against `--muted` (`220 9% 46%`). This fixes the root cause for all muted-foreground usage site-wide.

## Files Changed
1. `src/components/admin/AdminLayout.tsx`
2. `src/pages/admin/AdminSettings.tsx`
3. `src/index.css`

