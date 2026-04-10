

# Fix: Sovoy-style hover effect on vehicle cards

## Problem
The current implementation uses `scale-x-0 group-hover:scale-x-100 origin-right` which should work, but there are two issues:
1. The Tailwind `origin-right` class may not correctly interact with `scale-x-0` (Tailwind's transform origin classes affect both X and Y)
2. The real Sovoy site actually uses a `scaleY` bottom-to-top sweep, but the user wants a **right-to-left horizontal** primary color strip

## What to change in `src/pages/Index.tsx`

Replace the current sliding strip approach with a **translateX-based** animation that's more reliable:

**Current** (line ~218):
```
<div className="absolute inset-0 bg-primary origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
```

**New** — use `translate-x-full` (starts off-screen right) and transitions to `translate-x-0` on hover:
```
<div className="absolute inset-0 bg-primary translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
```

This creates a clear sliding motion from right to left behind the car image. The `translate-x-full` positions the colored div 100% to the right (hidden), and on hover it slides to `translate-x-0` (fully visible).

No other files need changes.
