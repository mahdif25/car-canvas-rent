

# Device-Specific Preview Switcher for Admin Fleet Image Editor

## Overview
Replace the current single-preview approach with an interactive device switcher per placement. Each placement card will show a tabbed preview (Desktop / Tablet / Mobile) that updates in real-time as you adjust the corresponding device's scale slider — showing exactly how the image will render on that device on the live site.

## Current State
- Each placement (Accueil, Flotte, Détail, etc.) shows 3 sliders (Desktop, Tablet, Mobile) but only **one preview using the desktop scale**
- No way to visually verify tablet/mobile rendering

## Changes

### `src/pages/admin/AdminFleet.tsx`

1. **Add a per-placement device tab state** — track which device preview is active for each placement using a local state object (e.g. `previewDevice: Record<string, "desktop"|"tablet"|"mobile">`)

2. **Replace the single static preview with a tabbed preview panel** per placement:
   - Three tab buttons (Desktop / Tablet / Mobile) with device icons, styled as compact toggle tabs
   - Switching tabs changes the preview to use that device's scale value and shows a container sized to approximate that device's real dimensions:
     - **Desktop**: current preview sizes (e.g. 320×180 for fleet)
     - **Tablet**: ~75% of desktop width
     - **Mobile**: ~50% of desktop width
   - The active device's slider is visually highlighted

3. **Preview renders with the selected device's scale** — instead of always using `form[placement.base]`, use the key matching the selected device tab (`placement.base`, `placement.base + "_tablet"`, or `placement.base + "_mobile"`)

4. **Show device dimensions label** — small text under the preview indicating which device is being previewed (e.g. "Aperçu Mobile")

5. **Apply to color variant previews too** — the same device-switcher pattern applies to color variant scale controls if they exist in the form

## Visual Layout (per placement card)

```text
┌─────────────────────────────────┐
│ Flotte                          │
│                                 │
│ [🖥 Desktop] [📱 Tablet] [📱 Mobile] │
│                                 │
│  Desktop slider ──────── 1.20x  │
│  Tablet slider  ──────── 0.95x  │
│  Mobile slider  ──────── 1.10x  │
│                                 │
│ ┌─────────────────────────┐     │
│ │                         │     │
│ │   [car image preview]   │     │
│ │   scaled at 1.10x       │     │
│ │   (Mobile selected)     │     │
│ └─────────────────────────┘     │
│  Aperçu Mobile                  │
└─────────────────────────────────┘
```

## Files Modified
- `src/pages/admin/AdminFleet.tsx` — add device tab state, tabbed preview per placement with device-specific scale and container sizing

