

# Fix Reservation Page Scroll + Auto-Open Location Dropdown

## Problem
1. When clicking "Réserver" on a vehicle card, the browser keeps the previous page's scroll position — on mobile this lands the user at the footer instead of the top of the reservation form.
2. The user wants the pickup location dropdown to auto-open after 0.3s so they can immediately select a location.

## Root cause
The app has no `ScrollToTop` component. React Router's `BrowserRouter` doesn't reset scroll on navigation by default.

## Plan

### 1. Add a ScrollToTop component (`src/components/ScrollToTop.tsx`)
- Uses `useLocation()` from react-router and a `useEffect` that calls `window.scrollTo(0, 0)` on every pathname change.

### 2. Wire it into `src/App.tsx`
- Place `<ScrollToTop />` inside `<BrowserRouter>` so it runs on every route change. This fixes the scroll issue globally for all pages.

### 3. Auto-open the location dropdown in `src/components/reservation/StepDates.tsx`
- Add a `useEffect` that triggers after 300ms on mount (only when `pickup_location` is empty) to programmatically click the Select trigger, opening the dropdown for the user.
- Use a ref on the `SelectTrigger` element and call `.click()` after the delay.

## Files to change
- **New**: `src/components/ScrollToTop.tsx`
- **Edit**: `src/App.tsx` — add `<ScrollToTop />`
- **Edit**: `src/components/reservation/StepDates.tsx` — add ref + useEffect for auto-open

## Result
- Navigating to `/reservation` always starts at the top of the page
- The location dropdown opens automatically after 0.3s, prompting the user to select immediately

