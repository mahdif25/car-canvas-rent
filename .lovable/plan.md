

# Mobile Optimization for Finance Dashboard

## Problems Identified
1. **Tabs overlapping**: 4 tab triggers ("Crédits", "Rapport par véhicule", "Résumé agence", "Simulateur") wrap/overlap on 390px screens
2. **Summary table too wide**: 6 columns (Immat, Véhicule, Crédit/mois, Dépenses, Revenus, Bénéfice) force horizontal scroll
3. **Credits table too wide**: 8 columns requiring scroll
4. **Per-vehicle report**: date pickers and filters not well stacked
5. **Reservation breakdown table**: dates get cramped

## Changes — File: `src/pages/admin/AdminFinances.tsx`

### 1. Scrollable Tabs
- Add `overflow-x-auto` to `TabsList` and make it a single horizontal scroll row with `flex-nowrap w-full` so tabs don't wrap or overlap

### 2. Summary Tab — Card Layout on Mobile
- Import `useIsMobile` hook
- On mobile: replace the 6-column summary `<Table>` with a stacked card list where each vehicle is a card showing plate number, vehicle name, and a 2x2 grid of values (Crédit/mois, Dépenses, Revenus, Bénéfice net)
- On desktop: keep existing table
- Date pickers already stack on mobile (using `flex-col sm:flex-row`), just ensure download button is full-width

### 3. Credits Tab — Card Layout on Mobile
- On mobile: replace the 8-column loans table with cards showing key info (Véhicule, Banque, Mensualité, Restant, delete button)
- On desktop: keep existing table

### 4. Per-Vehicle Report Tab
- Ensure vehicle selector is full-width on mobile
- KPI cards already use `grid-cols-2` which works
- Charts already use `grid-cols-1 lg:grid-cols-2` which works
- Reservation breakdown table: on mobile, show as cards (ID, dates, days, amount)

### 5. Simulator Tab
- Already uses `grid-cols-1 sm:grid-cols-3` — works fine

## Scope
- 1 file modified: `AdminFinances.tsx`
- No database changes
- Desktop layout unchanged

