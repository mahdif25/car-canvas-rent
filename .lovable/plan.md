

# Fix Email Builder Scroll & Move Coupon Mode Above Preview

## Problems
1. The blocks section uses `ScrollArea` with `max-h-[50vh]` which prevents scrolling to newly added blocks
2. "Mode coupon" section is below the email builder — user wants it above the preview
3. The block list area needs to grow freely and let the whole page scroll

## Changes

### 1. `src/components/admin/EmailBuilder.tsx`
- **Remove `ScrollArea` wrapper** around the blocks list (lines 463-472). Replace with a plain `div` so blocks grow naturally and the page scrolls
- Remove `scrollViewportRef` and the auto-scroll `useEffect` (no longer needed — the page scrolls naturally)
- Remove `ScrollArea` import

### 2. `src/pages/admin/AdminBroadcast.tsx`
- **Move the "Mode coupon" section** (lines 383-454) from below the `<EmailBuilder>` to above it, between the subject input and the "Contenu de l'email" label
- This places coupon config above the preview on desktop (side-by-side layout) and above the editor/preview toggle on mobile

## Result
- Blocks grow freely, page scrolls naturally — no more hidden blocks
- Coupon mode is configured before seeing the email content/preview
- No functionality changes

