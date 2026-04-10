

# Admin Settings Page & Dynamic Hero Background

## Overview
Create a centralized Settings page in the admin dashboard and a `site_settings` database table to store all configurable options. The homepage hero will dynamically render based on the saved background setting (solid color, image, or video).

## 1. Database: `site_settings` table

A single-row key-value style table to store all site configuration:

```sql
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Hero background
  hero_bg_type TEXT NOT NULL DEFAULT 'color',  -- 'color' | 'image' | 'video'
  hero_bg_value TEXT DEFAULT '',               -- hex color, image URL, or video URL
  hero_overlay_opacity NUMERIC DEFAULT 0.6,
  -- Tracking pixels
  facebook_pixel_id TEXT DEFAULT '',
  tiktok_pixel_id TEXT DEFAULT '',
  google_analytics_id TEXT DEFAULT '',
  google_tag_manager_id TEXT DEFAULT '',
  -- Notification / WhatsApp
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT DEFAULT '',
  whatsapp_message TEXT DEFAULT '',
  -- Email settings
  notification_email TEXT DEFAULT '',
  send_reservation_emails BOOLEAN DEFAULT true,
  -- Reviews
  google_reviews_url TEXT DEFAULT '',
  show_reviews_section BOOLEAN DEFAULT true,
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

RLS: SELECT for anyone, UPDATE/INSERT for admins only.

## 2. New hook: `useSiteSettings`

- `src/hooks/useSiteSettings.ts`
- Fetches the single row from `site_settings` with react-query
- Provides a mutation to update settings
- Used by both the public site (hero, WhatsApp popup, tracking) and the admin settings page

## 3. Admin Settings Page: `src/pages/admin/AdminSettings.tsx`

Tabbed interface with sections:
- **Apparence** — Hero background type selector (color/image/video), preview, upload/URL input, overlay opacity slider
- **Tracking** — Facebook Pixel ID, TikTok Pixel ID, Google Analytics ID, GTM ID inputs
- **Emails** — Notification email, toggle for reservation confirmation emails
- **WhatsApp** — Enable/disable toggle, phone number, default message
- **Avis (Reviews)** — Google Reviews URL, show/hide reviews section toggle

Each section saves independently with a "Sauvegarder" button.

## 4. Admin Layout Update

- Add "Paramètres" nav item with Settings icon pointing to `/admin/settings`
- Add route in `App.tsx`

## 5. Homepage Hero Update (`src/pages/Index.tsx`)

- Fetch `useSiteSettings()` 
- Render hero background based on `hero_bg_type`:
  - `color`: current solid dark background (default)
  - `image`: `<img>` as absolute-positioned cover with overlay
  - `video`: `<video autoPlay muted loop>` as background with overlay
- Overlay opacity controlled by `hero_overlay_opacity`

## 6. Tracking Script Injection

- Create `src/components/TrackingScripts.tsx` that reads settings and injects Facebook/TikTok/Google scripts into the `<head>` via `useEffect` + `document.createElement`
- Render in `App.tsx` or `Layout.tsx`

## 7. WhatsApp Popup

- Create `src/components/WhatsAppPopup.tsx` — floating button (bottom-right) linking to `wa.me/{number}?text={message}`
- Only renders when `whatsapp_enabled` is true
- Include in `Layout.tsx`

## Files Changed
1. **Migration** — create `site_settings` table with seed row
2. `src/hooks/useSiteSettings.ts` — new hook
3. `src/pages/admin/AdminSettings.tsx` — new settings page
4. `src/components/admin/AdminLayout.tsx` — add settings nav item
5. `src/App.tsx` — add settings route
6. `src/pages/Index.tsx` — dynamic hero background
7. `src/components/TrackingScripts.tsx` — pixel/analytics injection
8. `src/components/WhatsAppPopup.tsx` — floating WhatsApp button
9. `src/components/layout/Layout.tsx` — include WhatsApp popup + tracking scripts

