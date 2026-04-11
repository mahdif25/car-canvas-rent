

# Per-Device Video Controls with MP4 Upload

## Current state
- 3 zoom sliders (mobile/tablet/desktop) but only 1 shared X offset and 1 shared Y offset
- MP4 videos use `object-cover` with shared `objectPosition` — no per-device control
- No file upload for MP4 — only URL input

## Plan

### 1. Database migration
Replace the shared `hero_video_offset_x` (int) and `hero_video_offset_y` (int) with per-device columns:
- `hero_video_mobile_offset_x` (int, default 50)
- `hero_video_mobile_offset_y` (int, default 50)
- `hero_video_tablet_offset_x` (int, default 50)
- `hero_video_tablet_offset_y` (int, default 50)
- `hero_video_desktop_offset_x` (int, default 50)
- `hero_video_desktop_offset_y` (int, default 50)

Keep the old columns for backward compat (they'll be ignored in code).

### 2. Add a `hero-videos` storage bucket
Create a public storage bucket so users can upload MP4 files directly instead of pasting URLs.

### 3. Update `src/hooks/useSiteSettings.ts`
Add the 6 new offset fields to the interface.

### 4. Update `src/pages/Index.tsx`
- For YouTube iframes: each breakpoint (mobile/tablet/desktop) uses its own scale + offsetX + offsetY in the `transform` style
- For native `<video>`: render 3 separate `<video>` tags (like iframes) with breakpoint classes, each using `object-cover` + per-device `objectPosition` and `transform: scale()` for zoom control
- This gives native MP4 videos the same per-device zoom and position control as YouTube

### 5. Update `src/pages/admin/AdminSettings.tsx`
- Add an **Upload MP4** button next to the URL input (uploads to `hero-videos` bucket, sets the URL automatically)
- Replace the shared X/Y sliders with per-device controls: when a device tab is selected, show that device's zoom, X position, and Y position sliders together
- The live preview updates to reflect the active device's settings
- Save button includes all 6 new offset fields

### Files to change
- `supabase/migrations/...` — new columns + storage bucket
- `src/hooks/useSiteSettings.ts` — add per-device offset fields
- `src/pages/Index.tsx` — per-device offsets for both YouTube and MP4
- `src/pages/admin/AdminSettings.tsx` — upload button + per-device control panel

### Result
- Each device (mobile/tablet/desktop) has independent zoom, horizontal position, and vertical position
- MP4 files can be uploaded directly from admin
- Native MP4 videos get the same granular control as YouTube embeds
- Live preview reflects changes per device in real-time

