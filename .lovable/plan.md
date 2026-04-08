

# Fix Tab Text Visibility in Analytics

## Problem
The `TabsList` uses `bg-muted` and `text-muted-foreground` CSS variables, but in the current theme both resolve to the same gray color (`220 9% 46%`), making inactive tab text invisible against the background.

## Solution

**File: `src/pages/admin/AdminAnalytics.tsx`** (line 185)

Override the `TabsList` className to use visible colors:
- Change `TabsList` to use `bg-secondary text-foreground` instead of the default muted colors
- This gives a light gray background (`#f5f5f5`) with dark text (`#1a1a1a`), ensuring full readability
- Active tab styling remains white with shadow (already correct via `data-[state=active]:bg-background`)

Single line change — no other files affected.

