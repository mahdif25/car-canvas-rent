

# Move WhatsApp Icon Above Mobile Sidebar Bar

## Problem
On mobile/tablet, the WhatsApp floating button (`bottom-6 left-6`, ~z-50) overlaps the sticky bottom summary bar from `ReservationSidebar` (also `fixed bottom-0`, z-50). This hides the "Véhicule 0 MAD" text, and when the summary expands, the WhatsApp icon covers the content.

## Fix

### 1. `src/components/WhatsAppPopup.tsx`
- Change the WhatsApp button's bottom position to be higher on mobile/tablet so it sits above the collapsed sidebar bar (~56px tall). Use `bottom-20 lg:bottom-6` instead of `bottom-6`.
- Listen for the sidebar expanded state: since WhatsApp and Sidebar are sibling components, use a CSS-based approach — add a data attribute or CSS variable on the sidebar's expanded state, or simply increase the WhatsApp button bottom position enough to clear both collapsed and expanded states.
- Simpler approach: use a higher default bottom on mobile (`bottom-20`) to clear the collapsed bar. When the sidebar expands (up to 60vh), the WhatsApp button should move further up. We can achieve this by having the ReservationSidebar communicate its height via a CSS custom property on `document.documentElement`, and the WhatsApp button reads it.

**Simplest approach**: The sidebar expanded content has `max-h-[60vh]`. We can:
1. Set WhatsApp button to `bottom-[72px] lg:bottom-6` by default on mobile (clears the ~56px collapsed bar)
2. Export the `mobileExpanded` state from ReservationSidebar or use a global CSS approach

Since these are separate components, the cleanest solution is:
- In `ReservationSidebar`: when `mobileExpanded` changes, set a CSS custom property `--sidebar-height` on `document.body`
- In `WhatsAppPopup`: read that variable and adjust bottom position accordingly

**Even simpler**: Just use a generous fixed bottom offset on mobile/tablet. The collapsed bar is ~56px. Set the WhatsApp button to `bottom-[72px] lg:bottom-6`. When expanded, the sidebar scrolls internally (`max-h-[60vh] overflow-y-auto`), so the bar itself doesn't grow beyond the viewport — the WhatsApp icon at `bottom-[72px]` will stay above it.

### Files to change
- `src/components/WhatsAppPopup.tsx` — change button class from `bottom-6` to `bottom-[72px] lg:bottom-6`

This is a one-line CSS class change.

