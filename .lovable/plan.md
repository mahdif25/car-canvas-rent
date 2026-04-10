

# Fix: Vehicle Images Rendering on Fleet Page

## Problem
The Tucson (and potentially other vehicles) image gets cropped awkwardly because `object-cover` on an `aspect-video` (16:9) container forces a tight crop. Cars photographed from certain angles or with wider compositions lose important parts.

## Solution
Change the image rendering approach:

**In `src/pages/Fleet.tsx`** (line 109-113):
- Change `object-cover` to `object-contain` so the full car is always visible
- Add a subtle `bg-secondary` background to the image container so the empty space around contained images looks clean (matches the card style)
- Keep `aspect-video` for consistent card heights
- Keep the hover scale effect

```
// Current
<div className="aspect-video overflow-hidden relative">
  <img ... className="w-full h-full object-cover ..." />

// New  
<div className="aspect-video overflow-hidden relative bg-secondary">
  <img ... className="w-full h-full object-contain p-2 ..." />
```

This ensures every car image — regardless of its original dimensions or aspect ratio — renders fully visible within the card. The `bg-secondary` fill prevents white gaps from looking jarring, and the small `p-2` padding gives breathing room.

## File
- `src/pages/Fleet.tsx` — single change on lines 109-114

