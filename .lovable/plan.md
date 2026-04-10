

# Fix Hero Video Background

## Problem
The video URL stored is `https://youtu.be/qdkX33buWTQ` — a YouTube share link. The HTML `<video>` tag cannot play YouTube URLs. It only accepts direct video file URLs (`.mp4`, `.webm`).

## Two Options

### Option A: Support YouTube embeds (recommended)
Detect YouTube URLs and render an `<iframe>` embed instead of a `<video>` tag. This lets you paste any YouTube link in admin settings.

### Option B: Use a direct MP4 file
Upload an `.mp4` file to your backend storage and use that direct URL instead. This gives better performance (no YouTube branding, faster load) but requires hosting the file.

## Plan — Implement both: YouTube detection + direct video support

### `src/pages/Index.tsx`
- Add a helper function to detect YouTube URLs and extract the video ID
- When `hero_bg_type === "video"` and URL is YouTube: render an `<iframe>` with `youtube.com/embed/{id}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&playlist={id}` and pointer-events-none
- When `hero_bg_type === "video"` and URL is a direct file: keep the existing `<video>` tag

### `src/pages/admin/AdminSettings.tsx` (optional improvement)
- Add a hint text under the video URL input: "Paste a YouTube link or a direct .mp4 URL"

## Recommendation for video content
For a car rental hero, I recommend:
- A **cinematic aerial shot of a car driving on a scenic Moroccan road** (coastal highway, Atlas mountains, or city boulevard)
- Search YouTube for royalty-free stock footage like "luxury car driving Morocco" or "car rental cinematic"
- Alternatively, use a **direct MP4 from a free stock site** like Pexels or Pixabay (search "car driving aerial") — these give you a direct `.mp4` URL that works without the YouTube embed complexity

## Files to change
- `src/pages/Index.tsx` — add YouTube URL detection and iframe rendering

