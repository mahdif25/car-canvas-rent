

# Fix Charts Display on Mobile — Per-Vehicle Report

## Problem
The charts in the "Rapport par véhicule" tab overflow horizontally on mobile (390px). This is because `ChartContainer` applies `aspect-video` (16:9 ratio) by default, which forces the container wider than the screen width. Combined with the fixed `h-[250px]`, the charts don't fit.

## Solution — File: `src/pages/admin/AdminFinances.tsx`

For all 4 chart `ChartContainer` instances (lines ~662, 677, 699, 717):
- Change className from `h-[250px]` to `h-[200px] w-full aspect-auto` on mobile
- Use a responsive class: `className="h-[200px] sm:h-[250px] w-full aspect-auto"`

The `aspect-auto` overrides the default `aspect-video` from ChartContainer, allowing the charts to respect the parent width. The slightly reduced height on mobile (200px) ensures the chart fits comfortably.

Additionally, add `overflow-hidden` to each chart `Card` to prevent any bleed.

## Scope
- 1 file: `AdminFinances.tsx`
- 4 ChartContainer className updates
- Desktop layout unchanged

