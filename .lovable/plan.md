

# Enhanced Receipt Design — Sketch & Plan

## Receipt Layout Sketch

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│         [LOGO: Centre Lux Car]                   │
│                                                  │
│         REÇU DE RÉSERVATION                      │
│         N° A3F8B2C1 • 08/04/2026                 │
│                                                  │
│  ─────────────────────────────────────────────── │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  INFORMATIONS CLIENT                        │ │
│  │                                             │ │
│  │  Nom          Mohamed El Amrani             │ │
│  │  Email        m.elamrani@email.com          │ │
│  │  Téléphone    +212 6 12 34 56 78            │ │
│  │  Permis       AB-123456                     │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  DÉTAILS DE LA RÉSERVATION                  │ │
│  │                                             │ │
│  │  Véhicule     Dacia Duster 2024             │ │
│  │  Durée        5 jours                       │ │
│  │  Du           08/04/2026                    │ │
│  │  Au           13/04/2026                    │ │
│  │  Prise en     Aéroport Marrakech            │ │
│  │  charge                                     │ │
│  │  Retour       Gare Marrakech                │ │
│  │  Options      GPS, Siège bébé               │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  TARIFICATION                               │ │
│  │                                             │ │
│  │  Véhicule (5j × 350 MAD)       1,750 MAD   │ │
│  │  Options (5j)                     250 MAD   │ │
│  │  Frais de livraison               100 MAD   │ │
│  │  ─────────────────────────────────────────  │ │
│  │  Caution                        3,000 MAD   │ │
│  │  ═════════════════════════════════════════  │ │
│  │  TOTAL                          2,100 MAD   │ │
│  │                       (green, bold, large)  │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ─────────────────────────────────────────────── │
│                                                  │
│  Statut: ██ Confirmée    Caution: ██ Collectée   │
│                                                  │
│  ─────────────────────────────────────────────── │
│  Merci pour votre confiance !                    │
│  Centre Lux Car • centreluxcar.com               │
│  ─────────────────────────────────────────────── │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Design Matching Website Brand

- **Font**: Poppins (imported via Google Fonts in the receipt HTML)
- **Primary green**: `#00C853` — used for the total amount, status badges, and accent lines
- **Dark**: `#1A1A1A` — body text color
- **Logo**: Embedded as a base64 data URI from `src/assets/logo.png` (loaded at build time)
- **Card-style sections**: Light gray background (`#f8f8f8`) with subtle border radius for Client, Reservation, and Pricing blocks
- **Status badges**: Colored pill badges matching the admin UI (yellow/blue/green/gray/red)
- **Footer**: Company name, website, and a thank-you message
- **Separator lines**: Thin green accent lines between sections

## Technical Approach

### File: `src/pages/admin/AdminReservations.tsx`

Replace the `handlePrint` function's HTML template with the enhanced receipt:

1. **Convert logo to base64** at component level using a canvas trick or import it as a URL and reference it directly in the print window
2. **Poppins font**: Add Google Fonts `@import` in the receipt `<head>`
3. **Structured sections** with card-like containers for Client, Reservation, and Pricing
4. **Status + deposit badges** shown with colored backgrounds
5. **Dates formatted** in `fr-FR` locale (e.g., "08 avril 2026") instead of raw ISO
6. **Duration** shown explicitly ("5 jours")
7. **Addon breakdown** listed individually with per-day pricing
8. **Caution** separated from the subtotal with its own line
9. **Footer** with company branding

No database changes needed. Single file edit to `AdminReservations.tsx`.

