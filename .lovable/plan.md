
## Mobile Hero Video Fix

### What’s causing the issue
The hero is currently sized by its content, but the YouTube/video background is sized with viewport-based cover math. On tall mobile screens, the content becomes taller than the visible video area, so you get a black strip at the bottom and weak video coverage.

## Implementation plan

### 1. Refactor the hero background sizing
Update `src/pages/Index.tsx` so the media sits inside a dedicated full-section background layer:
- keep a separate absolute media wrapper with `inset-0 overflow-hidden`
- for YouTube, use a true background-video cover pattern centered in the hero
- for uploaded MP4s, keep `object-cover` but make sure it fills the full hero container consistently

### 2. Make the hero height work on mobile
Still in `src/pages/Index.tsx`:
- give the hero a controlled mobile height/min-height instead of letting it stretch too far past the media
- tighten mobile spacing so the text + search card fit better inside the visible hero
- ensure the hero section ends where the media coverage ends, removing the bottom black band

### 3. Add mobile-specific video adjustment controls
Because you asked to resize the video differently for screens, add admin settings for:
- mobile video scale
- desktop video scale
- optional vertical position offset

This gives automatic cover behavior by default, while still letting you fine-tune framing when the subject of the video is too low/high on mobile.

### 4. Expose the controls in admin
Update `src/pages/admin/AdminSettings.tsx` to add:
- mobile zoom slider
- desktop zoom slider
- vertical offset slider
- preview area for hero media positioning

### 5. Store the new settings
Add new fields to `site_settings` and read them through `src/hooks/useSiteSettings.ts`, then apply them in `src/pages/Index.tsx`.

## Files to change
- `supabase/migrations/...` — add hero video mobile/desktop sizing fields
- `src/hooks/useSiteSettings.ts` — include the new settings
- `src/pages/admin/AdminSettings.tsx` — add hero video sizing controls
- `src/pages/Index.tsx` — fix hero media coverage and mobile section height

## Expected result
- no black edges on mobile
- hero ends cleanly where the video coverage ends
- uploaded videos auto-cover correctly
- you can fine-tune zoom/position separately for mobile and desktop when needed
