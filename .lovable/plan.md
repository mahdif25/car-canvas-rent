

# Fix Mobile Preview Height

## Problem
The preview height is calculated as `device.height * 0.55` for all devices (line 210), producing a 375×367 preview for mobile. The actual hero section uses `min-h-[85vh]` on mobile (375×567) — so the preview is far too short and looks like a "story" crop.

## Fix — single line change in `src/pages/admin/AdminSettings.tsx`

**Line 210**: Replace the fixed `0.55` multiplier with a per-device ratio matching the actual hero CSS:

```typescript
// Before
const previewH = (device.height * 0.55) * scaleFactor;

// After  
const heroRatio = previewDevice === "mobile" ? 0.85 : 0.70;
const previewH = (device.height * heroRatio) * scaleFactor;
```

- Mobile: 375 × (667 × 0.85) = 375 × 567 — matches `min-h-[85vh]`
- Tablet: 768 × (1024 × 0.70) = 768 × 717 — matches `min-h-[70vh]`
- Desktop: 1280 × (800 × 0.70) = 1280 × 560 — matches `min-h-[70vh]`

This is a one-line change. No other files affected.

