

# Fix Vehicle Images to Fill Card Area Edge-to-Edge

## Problem
With `object-contain` and `p-2` padding, smaller car images (like Siat) appear much smaller than wider ones (like Tucson) because the browser preserves the aspect ratio and adds empty space. The padding makes it worse.

## Solution
Remove the `p-2` padding from all vehicle image containers so the image stretches to fill the full area. Keep `object-contain` so no part of the car gets cropped — but the image will now use the maximum available space.

## Changes

### 1. Index.tsx (line 219) — Homepage cards
Remove `p-2` from the image class:
```tsx
className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
```

### 2. Fleet.tsx (line 113) — Fleet page cards
Remove `p-2`:
```tsx
className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
```

### 3. ReservationSidebar.tsx (line 31) — Reservation sidebar
Already has no padding — no change needed.

## Result
Car PNGs will stretch edge-to-edge within their containers while still showing the full vehicle (no cropping). Both small and large car images will fill the same visual space consistently.

