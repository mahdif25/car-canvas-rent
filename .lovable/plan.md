

# Enhanced Hero Video Editing Controls

## Current state
You have three controls: mobile zoom, desktop zoom, and vertical position. These only allow scaling and vertical shifting — no horizontal positioning, no tablet-specific control, and no live preview.

## What we'll add

### New video controls (per device)
- **Horizontal position** (`hero_video_offset_x`, default 50) — shift the video left/right within the frame, so you can center on the subject
- **Tablet zoom** (`hero_video_tablet_scale`, default 1.3) — separate scale for tablet screens
- **Aspect ratio crop mode** — option to choose between "cover" (fill and crop) vs "contain" (fit entire video, may show bars) for edge cases

### Live preview panel
- Device switcher (mobile 375px / tablet 768px / desktop 1200px) rendered as a scaled-down preview box
- Shows the actual hero section (video + overlay + text) updating in real-time as you drag sliders
- Lets you see exactly how the video frames on each device before saving

### Database migration
Add columns to `site_settings`:
- `hero_video_tablet_scale` (numeric, default 1.3)
- `hero_video_offset_x` (integer, default 50)

### File changes

1. **`supabase/migrations/...`** — add the two new columns
2. **`src/hooks/useSiteSettings.ts`** — add `hero_video_tablet_scale` and `hero_video_offset_x` to interface
3. **`src/pages/Index.tsx`**:
   - Add tablet iframe breakpoint (`hidden md:block lg:hidden`) with its own scale
   - Apply horizontal offset via `translateX` for YouTube iframes and `objectPosition` x-axis for MP4
   - Three iframes: mobile / tablet / desktop, each with own scale + shared offsets
4. **`src/pages/admin/AdminSettings.tsx`**:
   - Add device switcher buttons (Mobile / Tablet / Desktop) above a live preview container
   - Preview container renders a miniature hero (video + overlay + sample text) at the selected device width, scaled down to fit the admin panel
   - Group sliders per device: zoom for mobile, tablet, desktop
   - Add horizontal position slider (shared across devices)
   - All sliders update the preview in real-time

### Controls summary
| Control | Range | Default |
|---|---|---|
| Mobile zoom | 1.0–3.0x | 1.5 |
| Tablet zoom | 1.0–3.0x | 1.3 |
| Desktop zoom | 1.0–3.0x | 1.2 |
| Vertical position | 0–100% | 50 (center) |
| Horizontal position | 0–100% | 50 (center) |
| Video start time | 0+ seconds | 0 |

