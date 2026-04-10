

# Homepage: Sovoy-Style Car Cards + Section Reorder + Reviews

## Overview
Three changes to `src/pages/Index.tsx`:
1. **Reorder sections**: Hero → Reviews (new) → Featured Cars → Benefits ("Pourquoi choisir...")
2. **Add a Reviews section** with static Trustpilot-style review cards (similar to Sovoy's layout)
3. **Restyle vehicle cards** to match Sovoy's featured car template with hover effects

## Section Order (after changes)
```text
Hero + Search Bar
Reviews (new section)
Nos véhicules populaires (restyled)
Pourquoi choisir Centre Lux Car ?
```

## 1. Restyle Featured Vehicle Cards — Sovoy-inspired

Replace the current card layout with a structure matching the reference:
- **Top**: Category label in primary green (e.g., "SUV"), bold vehicle name, "ou véhicule similaire..." subtitle in muted text
- **Middle**: Car image centered on a light gray (`bg-secondary`) background, no aspect-ratio crop — let the image breathe
- **Bottom**: Feature icons in a 2-row grid (fuel, transmission, doors, seats, luggage, A/C) using small icons + text, then a "Réserver" outlined button in primary green
- **Hover effect**: Left border accent (4px primary green), slight translateY(-4px) lift, shadow increase — matching Sovoy's card hover behavior
- Remove the heart icon, star rating badge, and the current price/feature pills
- Keep the starting price display but move it next to the "Réserver" button

## 2. Add Reviews Section

Add a new section between Hero and Featured Cars with:
- Title: "Ce que disent nos clients" with primary accent
- 4 review cards in a horizontal grid (responsive: 1 col mobile, 2 col tablet, 4 col desktop)
- Each card: review text (truncated), 5 green stars (using ★ characters styled in primary), reviewer name in bold, "il y a X mois" in muted text
- Subtitle below: "Noté 5.00 / 5 basé sur X avis"
- Static data for now (hardcoded array of 4 reviews)

## 3. Move Benefits Section Below Cars

Simply swap the JSX order: Benefits section moves after Featured Vehicles section.

## Files
- `src/pages/Index.tsx` — reorder sections, add reviews, restyle car cards

