

# Homepage: Dynamic Reviews, Sovoy Hover Effect, Admin Reviews Management

## 1. Database — Create `reviews` table

New migration to create a `reviews` table:
```sql
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  time_label text NOT NULL DEFAULT 'il y a 1 mois',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read for enabled reviews
CREATE POLICY "Anyone can read enabled reviews"
  ON public.reviews FOR SELECT
  USING (is_enabled = true);

-- Admin full access (authenticated users)
CREATE POLICY "Authenticated users can manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed with the 4 existing hardcoded reviews
INSERT INTO public.reviews (name, text, rating, time_label, sort_order) VALUES
  ('Youssef B.', 'Service excellent, voiture propre et bien entretenue. Je recommande vivement Centre Lux Car pour vos locations.', 5, 'il y a 2 mois', 1),
  ('Sarah M.', 'Très professionnel, prix compétitifs et livraison à l''heure. Une expérience de location sans stress.', 5, 'il y a 1 mois', 2),
  ('Ahmed K.', 'J''ai loué plusieurs fois chez eux, toujours satisfait. Le personnel est aimable et les véhicules sont en parfait état.', 5, 'il y a 3 mois', 3),
  ('Fatima Z.', 'Rapport qualité-prix imbattable. La réservation en ligne est simple et rapide. Je reviendrai sans hésiter.', 5, 'il y a 2 semaines', 4);
```

## 2. Reviews section on homepage — compact + carousel

**`src/pages/Index.tsx`**:
- Remove hardcoded `REVIEWS` array
- Fetch reviews from database using a new `useReviews` hook
- Make the review cards **more compact**: reduce padding (`p-4` instead of `p-6`), smaller text, tighter spacing
- Add left/right navigation arrows to scroll/paginate between reviews (show 4 at a time on desktop, swipeable)
- Respect `show_reviews_section` from site settings

**`src/hooks/useReviews.ts`** (new file):
- Query `reviews` table, `is_enabled = true`, ordered by `sort_order`

## 3. Sovoy-style hover effect on vehicle cards

The key Sovoy effect: on hover, a **primary-colored strip slides from right to left behind the car image**. Implementation:

- In the car image container (`middle-wrap`), add a `::before` pseudo-element (or an absolutely positioned div) with `bg-primary`, initially positioned off-screen to the right (`translate-x-full`)
- On group hover, transition it to `translate-x-0` with a smooth 400ms ease — creating the sliding color strip effect behind the car
- Remove the current `hover:border-l-4 hover:border-l-primary` left border effect
- Keep the slight lift (`hover:-translate-y-1`) and shadow increase
- The "Réserver" button fills with primary color on hover (already implemented)

CSS approach using Tailwind + inline styles in JSX:
```
<div className="relative overflow-hidden bg-secondary rounded-xl ...">
  {/* Sliding color strip */}
  <div className="absolute inset-0 bg-primary translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
  {/* Car image on top */}
  <img className="relative z-10 ..." />
</div>
```

## 4. Admin Reviews Management — Avis tab

**`src/pages/admin/AdminSettings.tsx`** — expand the "Avis" tab:
- List all reviews (enabled and disabled) in editable cards
- Each review card shows: name, text, rating (1-5 stars), time label, enabled/disabled toggle
- Edit button opens inline editing for name, text, rating, time label
- Delete button with confirmation
- "Ajouter un avis" button to create a new review
- Keep the existing Google Reviews URL and show_reviews_section toggle at the top

## Files
- **Migration**: new `reviews` table with seed data
- `src/hooks/useReviews.ts` — new hook to fetch/mutate reviews
- `src/pages/Index.tsx` — compact carousel reviews + Sovoy hover effect on cards
- `src/pages/admin/AdminSettings.tsx` — full CRUD for reviews in Avis tab

