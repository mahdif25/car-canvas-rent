

# Hero Section: Video Pause Position + Animated Editable Texts

## Overview
Add admin controls to: (1) set a YouTube video start/pause time, (2) customize both hero texts (title + subtitle) with formatting and entrance animations — all from the admin settings panel.

## Database Migration
Add 8 new columns to `site_settings`:

```sql
ALTER TABLE public.site_settings
  ADD COLUMN hero_video_start_time integer NOT NULL DEFAULT 0,
  ADD COLUMN hero_title_text text NOT NULL DEFAULT 'Louez votre voiture',
  ADD COLUMN hero_title_highlight text NOT NULL DEFAULT 'en toute confiance',
  ADD COLUMN hero_subtitle_text text NOT NULL DEFAULT 'Des véhicules de qualité, un service professionnel et des prix compétitifs partout au Maroc.',
  ADD COLUMN hero_title_animation text NOT NULL DEFAULT 'fade-up',
  ADD COLUMN hero_subtitle_animation text NOT NULL DEFAULT 'fade-up',
  ADD COLUMN hero_title_style jsonb NOT NULL DEFAULT '{"fontSize":"5xl","fontWeight":"bold","textAlign":"left"}',
  ADD COLUMN hero_subtitle_style jsonb NOT NULL DEFAULT '{"fontSize":"lg","fontWeight":"normal","textAlign":"left"}';
```

- `hero_video_start_time` — seconds into the YouTube video to start (and freeze point for non-looping)
- `hero_title_text` / `hero_title_highlight` — main title and highlighted span
- `hero_subtitle_text` — subtitle paragraph
- `hero_title_animation` / `hero_subtitle_animation` — animation type: `none`, `fade-up`, `fade-in`, `slide-left`, `slide-right`, `zoom-in`, `typewriter`
- `hero_title_style` / `hero_subtitle_style` — JSON with `fontSize`, `fontWeight`, `textAlign`, `color`

## Code Changes

### 1. `src/hooks/useSiteSettings.ts`
- Add all 8 new fields to the `SiteSettings` interface

### 2. `src/pages/admin/AdminSettings.tsx` — Hero section expansion
Add under the existing "Arrière-plan Hero" card:

**Video controls:**
- Start time input (seconds) — shown only when type is "video"

**Hero Texts card:**
- Title text input + highlight text input
- Subtitle text input
- For each text: dropdowns for font size (`xl` to `7xl`), weight (`normal`/`semibold`/`bold`), alignment (`left`/`center`), and animation selector
- Live preview box showing both texts with chosen formatting and animation

**Animation options:** `none`, `fade-up`, `fade-in`, `slide-left`, `slide-right`, `zoom-in`

### 3. `src/pages/Index.tsx` — Dynamic hero rendering
- Read the new settings fields
- For YouTube: append `&start=N` to the embed URL using `hero_video_start_time`
- Replace hardcoded title/subtitle with `hero_title_text`, `hero_title_highlight`, `hero_subtitle_text`
- Apply dynamic styles from `hero_title_style` / `hero_subtitle_style` (font size, weight, alignment)
- Apply CSS animation classes based on `hero_title_animation` / `hero_subtitle_animation`

### 4. `src/index.css` — Add hero text animations
Add keyframes for: `hero-fade-up`, `hero-fade-in`, `hero-slide-left`, `hero-slide-right`, `hero-zoom-in` with corresponding utility classes

## Files to change
- `site_settings` table (migration — 8 columns)
- `src/hooks/useSiteSettings.ts`
- `src/pages/admin/AdminSettings.tsx`
- `src/pages/Index.tsx`
- `src/index.css`

