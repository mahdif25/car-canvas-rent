

# WhatsApp Widget UI Refinements

## Changes to `src/components/WhatsAppPopup.tsx`

### 1. Remove delivery fee prices from location list (Step 3)
Remove the `(+{loc.delivery_fee} MAD)` span from each location button. Show only the location name with the 📍 emoji.

### 2. Replace chat icon with WhatsApp icon
Replace the `MessageCircle` Lucide icon with an inline WhatsApp SVG icon (the official WhatsApp logo shape) for both:
- The floating button (bottom-left)
- The header icon

### 3. WhatsApp-style visual theming
Update the chat panel to match WhatsApp's actual look:
- **Header**: Use WhatsApp's darker teal (`#075E54`) instead of `#25D366`
- **Chat background**: Use WhatsApp's chat wallpaper color (`#ECE5DD` / light mode pattern) instead of plain `bg-background`
- **Bot bubbles**: White background (`#FFFFFF`) with subtle shadow, matching WhatsApp's incoming message style
- **User bubbles**: WhatsApp's outgoing green (`#DCF8C6`) with dark text instead of solid `#25D366` with white text
- **Floating button**: Keep `#25D366` with the WhatsApp SVG icon
- **Send button**: Keep green styling

### Files
- `src/components/WhatsAppPopup.tsx` — all changes in this single file

