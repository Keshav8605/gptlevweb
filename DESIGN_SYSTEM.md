# Design System — Romantic Gifting Experience

## 1. Visual Philosophy
A tender, warm, editorial light-pink aesthetic blending the tactile nostalgia of a luxury scrapbook with the sleek polish of a modern digital experience. Every pixel is crafted with love, soft gradients, warm parchment undertones, and subtle micro-animations that make the couple's digital haven feel alive and intimate.

## 2. Color Tokens
- `--bg-main: #FFF8FB` — Primary luminous background with subtle rose undertones.
- `--bg-surface: #FFF0F6` — Clean, elevated surface card background.
- `--bg-blush: #FADCE8` — Soft warm blush accent.
- `--pink-primary: #E98BB4` — Primary brand pink for active accents, key icons, and highlights.
- `--pink-strong: #D96D9C` — Deepened romantic pink for interactive states, badges, and titles.
- `--pink-deep: #C4558A` — High-contrast deep rose for prominent titles and buttons.
- `--pale-rose: #FCE7EF` — Subtle tinted container background.
- `--warm-cream: #FFF9F0` — Warm paper accent tone.
- `--lavender: #EDE5FA` / `--lavender-soft: #F5F0FC` — Soft complementary lavender tint.
- `--text-primary: #49323F` — Rich plum/espresso text tone ensuring WCAG AA/AAA contrast (minimum 7:1) against light rose surfaces.
- `--text-secondary: #806A78` — Softened supportive text (contrast ratio > 4.5:1).
- `--text-muted: #A8939F` — Subtle labels and metadata.
- `--border-subtle: #F0DDE6` — Delicate borders.
- `--border-medium: #E8C8D8` — Focused card borders.

## 3. Typography Hierarchy
- **Romantic Display Serif:** `Cormorant Garamond`, Georgia, serif (Weight 500/600/700). Used for major headlines, milestone moments, and emotional storytelling.
- **Modern Interface Sans:** `DM Sans`, system-ui, sans-serif (Weight 400/500/700). Used for readable body copy, interactive buttons, form inputs, and metadata.
- **Intimate Script:** `Dancing Script`, cursive (Weight 500/600). Used sparingly for handwritten signatures, romantic subheadings, and notes.

## 4. Elevation & Glassmorphism
- Subtle pink shadow: `0 4px 20px rgba(233, 139, 180, 0.12)`
- Deep interactive shadow: `0 12px 36px rgba(233, 139, 180, 0.25)`
- Frosted glass: `backdrop-filter: blur(12px); background: rgba(255, 248, 251, 0.75); border: 1px solid rgba(240, 221, 230, 0.5)`
- Pink glass: `backdrop-filter: blur(16px); background: rgba(250, 220, 232, 0.3); border: 1px solid rgba(233, 139, 180, 0.2)`

## 5. Animation Principles
- Smooth entrances: Spring transitions (`stiffness: 300, damping: 25`) or gentle eases (`duration: 0.6s–0.8s`).
- Restrained micro-interactions: Floating particles with gentle slow cycles (12s–20s), subtle hover tilts (1°–2°), and heart burst particles on meaningful accomplishments.
- Accessibility: `@media (prefers-reduced-motion: reduce)` automatically scales animations down to instant transitions (0.01ms).

## 6. Accessibility & Responsive Standards
- **Focus Rings**: Universal `:focus-visible` ring using `--pink-strong` with a 2px offset for keyboard navigation clarity.
- **Touch Targets**: Minimum 44x44px touch targets on mobile viewports for all primary navigation buttons, toggles, and modal controls.
- **Responsive Layouts**: Designed mobile-first, adapting gracefully from 375px (iPhone SE) to 1536px+ desktop monitors with zero horizontal overflow.
- **Color Contrast**: Critical text strictly complies with WCAG AA/AAA guidelines, avoiding pale text on pale backgrounds.
