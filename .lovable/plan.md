

# Fix Hero Video Background for All Screen Sizes

## Problem
The YouTube iframe uses `scale(1.2)` which is insufficient on mobile (16:9 video in a tall/narrow viewport leaves black bars on sides). Direct MP4 videos use `object-cover` which works fine, but the iframe approach cannot use `object-cover` since iframes don't support it.

## Solution
Replace the fixed `scale(1.2)` with a CSS technique that forces the iframe to always cover the container regardless of aspect ratio — the same approach used by professional video backgrounds.

### `src/pages/Index.tsx`
- Replace the YouTube iframe's inline `style={{ transform: "scale(1.2)" }}` with a responsive cover technique:
  - Use `min-w-[100%] min-h-[100%]` with `w-[177.78vh] h-[56.25vw]` (16:9 ratio math) to ensure the video always exceeds the container in both dimensions
  - Center it with `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
  - This mimics `object-cover` behavior for iframes — on tall screens (mobile) the video stretches wider and crops sides; on wide screens it stretches taller and crops top/bottom
- Keep the direct `<video>` tag unchanged (it already uses `object-cover` correctly)

### Single file change
- `src/pages/Index.tsx` — update iframe className and remove the inline transform style

