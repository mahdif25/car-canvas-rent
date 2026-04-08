

# Editable Client Fields + Analytics & Leads System

## 1. Editable Client Fields in Admin Reservations

**File: `src/pages/admin/AdminReservations.tsx`**

Add small edit (pencil) icons beside Email, Phone, and Permis in the expanded reservation detail. Clicking the icon toggles an inline Input field. A check icon confirms and saves the update directly to the `reservations` table.

- Add `clientEdits` state tracking which field is being edited per reservation
- Replace static text with conditional Input/text display
- On confirm, call `supabase.from("reservations").update(...)` for the changed field
- Icons: `Pencil` (to enter edit mode), `Check` (to save), `X` (to cancel)

## 2. Analytics System

### Database Migration

Create two new tables:

```sql
-- Page views / visitor tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  event_type text NOT NULL, -- 'page_view', 'reservation_step', 'form_field_capture'
  page_path text,
  referrer text,
  ip_address text,
  country text,
  city text,
  device_type text, -- 'mobile', 'tablet', 'desktop'
  browser text,
  os text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON public.analytics_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Leads: captured partial form data
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  session_id text,
  email text,
  phone text,
  first_name text,
  last_name text,
  license_number text,
  last_reservation_step int DEFAULT 0,
  reservation_completed boolean DEFAULT false,
  reservation_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update leads" ON public.leads FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
```

### Analytics Tracker Hook: `src/hooks/useAnalytics.ts`

A client-side hook that:
- Generates/persists a `visitor_id` in localStorage and a `session_id` per tab (sessionStorage)
- Detects device type, browser, OS from `navigator.userAgent`
- Captures `document.referrer`
- Exposes `trackPageView(path)`, `trackReservationStep(step)`, `trackFieldCapture(fields)`
- Calls an edge function to resolve IP/geolocation server-side

### Edge Function: `supabase/functions/track-analytics/index.ts`

Receives event data from the client, enriches with IP address (from request headers) and basic geo lookup (free IP API or header-based), then inserts into `analytics_events`.

### Reservation Funnel Tracking

**Files: `src/pages/Reservation.tsx`, `src/components/reservation/StepDriverInfo.tsx`**

- On each step change, call `trackReservationStep(stepNumber)` with metadata (vehicle selected, location, etc.)
- In StepDriverInfo, on blur of email/phone/name/license fields, call `trackFieldCapture()` which upserts into `leads` table
- On successful reservation submission, mark the lead as `reservation_completed = true` with the `reservation_id`

### Admin Analytics Page: `src/pages/admin/AdminAnalytics.tsx`

Dashboard with tabs/sections:
- **Overview**: unique visitors, total page views, sessions (today/7d/30d) with trend cards
- **Pages**: table of most visited pages with view counts
- **Devices**: breakdown by device type, browser, OS (pie/bar charts using recharts)
- **Locations**: visitor geography (country/city table)
- **Referrers**: traffic sources table
- **Reservation Funnel**: visual funnel showing drop-off at each step (Step 1 → 2 → 3 → 4 → 5) with percentages
- Date range filter for all sections

### Admin Leads Page: `src/pages/admin/AdminLeads.tsx`

Table showing:
- Name, email, phone, license number
- Last reservation step reached
- Whether they completed a reservation
- Number of reservations (join with `reservations` table by email)
- Status badge: "Lead" (no reservation), "Client" (has reservation), "Abandonné" (started but didn't finish)
- Click to expand: show session details, pages visited, device info
- Search/filter by email, name, status

### Navigation Updates

**File: `src/components/admin/AdminLayout.tsx`**
- Add "Analytics" and "Leads" to nav items with `BarChart3` and `Users` icons

**File: `src/App.tsx`**
- Add routes for `/admin/analytics` and `/admin/leads`

## Files Changed Summary

1. `src/pages/admin/AdminReservations.tsx` — inline edit for email/phone/license
2. Migration — `analytics_events` + `leads` tables with RLS
3. `src/hooks/useAnalytics.ts` — new tracker hook
4. `supabase/functions/track-analytics/index.ts` — edge function for IP enrichment
5. `src/pages/Reservation.tsx` — step tracking calls
6. `src/components/reservation/StepDriverInfo.tsx` — field capture on blur
7. `src/pages/admin/AdminAnalytics.tsx` — new analytics dashboard
8. `src/pages/admin/AdminLeads.tsx` — new leads page
9. `src/components/admin/AdminLayout.tsx` — add nav items
10. `src/App.tsx` — add routes

