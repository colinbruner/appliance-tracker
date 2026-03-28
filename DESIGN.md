# Design System — HomeBase

## Product Context
- **What this is:** A home management platform that tracks the lifecycle of everything in your home, from appliances to roofing, with photo documentation and maintenance logs.
- **Who it's for:** Homeowners who want to stay on top of maintenance, plan big purchases, and document their home's condition over time.
- **Space/industry:** Home management, home maintenance tracking. Peers: Centriq, HomeZada, Apple Home.
- **Project type:** Web app (SvelteKit SPA with Supabase backend).

## Aesthetic Direction
- **Direction:** Warm Utility
- **Decoration level:** Intentional (subtle warmth through background tinting, gentle shadows, photo-forward surfaces)
- **Mood:** Like a well-organized notebook for your home. Calm, warm, personal. The app should feel like it was made by someone who cares about their house, not by a SaaS company. Things 3 spaciousness meets domestic earth tones.
- **Reference sites:** Apple Home, Things 3, Notion personal workspace

### Anti-Slop Rules
- No purple/violet gradients
- No 3-column feature grid with icons in colored circles
- No centered-everything with uniform spacing
- No uniform bubbly border-radius on all elements
- No gradient buttons as the primary CTA
- No generic stock-photo-style hero sections
- No "Built for X" / "Designed for Y" marketing copy

### Creative Risks (deliberate departures from category norms)
1. **Serif display font (Instrument Serif):** No competitor uses serif type. Gives instant personality and warmth. The app doesn't look AI-generated.
2. **Sage green primary instead of blue:** Every home management app is blue. Green is warm, natural, and immediately differentiating.
3. **Warm neutral palette (no cold slate):** Dark mode feels like a warm evening, not a coding terminal. Light mode feels like paper, not a spreadsheet.

## Typography
- **Display/Hero:** Instrument Serif — warm, distinctive serif with personality. Used for page titles, card headings, stat values, and the hero. This is what makes the app feel like a home, not enterprise software.
- **Body:** DM Sans — clean, slightly rounded sans-serif. Warm and readable. Used for all body text, labels, descriptions, navigation.
- **UI/Labels:** DM Sans (same as body, weight 500 for labels)
- **Data/Tables:** DM Sans with `font-variant-numeric: tabular-nums` — aligned numbers for prices, dates, lifespans.
- **Code:** JetBrains Mono (if ever needed)
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  ```
- **Scale:**
  | Level | Size | Weight | Font | Usage |
  |-------|------|--------|------|-------|
  | Hero | 48-64px (clamp) | 400 | Instrument Serif | Main page title |
  | H1 | 32px | 400 | Instrument Serif | Section titles |
  | H2 | 26px | 400 | Instrument Serif | Item detail name |
  | H3 | 20px | 400 | Instrument Serif | Card titles |
  | Body | 15-16px | 400 | DM Sans | Paragraphs, descriptions |
  | Body Small | 14px | 400 | DM Sans | Secondary text, metadata |
  | Label | 13px | 500 | DM Sans | Form labels, card subtitles |
  | Caption | 12px | 500 | DM Sans | Stat labels, timestamps |
  | Overline | 11px | 600 | DM Sans | Section labels (uppercase, 0.08em tracking) |

## Color

### Approach
Restrained + warm. Sage green primary. Warm neutrals for backgrounds and text. Earth-toned category colors. Color is meaningful, not decorative.

### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#FAF8F5` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--surface-2` | `#F5F2ED` | Subtle backgrounds, hover states |
| `--surface-input` | `#FAF8F5` | Input field backgrounds |
| `--border` | `#E8E2D9` | Card borders, dividers |
| `--border-dim` | `#F0EDE8` | Subtle separators (log entries) |
| `--text-1` | `#2D2A26` | Primary text (warm near-black) |
| `--text-2` | `#6B6560` | Secondary text, descriptions |
| `--text-3` | `#9C9590` | Muted text, placeholders, timestamps |
| `--primary` | `#5A7C65` | Sage green. Buttons, links, active states |
| `--primary-hover` | `#4A6B55` | Button hover, link hover |
| `--primary-subtle` | `rgba(90,124,101,0.08)` | Active chip background, focus ring |
| `--primary-border` | `rgba(90,124,101,0.25)` | Active chip border, focus ring |

### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#1C1A17` | Page background (warm dark) |
| `--surface` | `#2A2722` | Cards, modals |
| `--surface-2` | `#34312C` | Hover states, elevated areas |
| `--surface-input` | `#2A2722` | Input backgrounds |
| `--border` | `#3D3A36` | Card borders, dividers |
| `--border-dim` | `#2A2722` | Subtle separators |
| `--text-1` | `#F0EDE8` | Primary text (warm off-white) |
| `--text-2` | `#9C9590` | Secondary text |
| `--text-3` | `#6B6560` | Muted text |
| `--primary` | `#7DA08A` | Lighter sage for dark backgrounds |
| `--primary-hover` | `#8DB09A` | Hover state |
| `--primary-subtle` | `rgba(125,160,138,0.12)` | Active backgrounds |
| `--primary-border` | `rgba(125,160,138,0.3)` | Active borders |

### Shadows
| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | `0 1px 3px rgba(45,42,38,0.06)` | `0 1px 3px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 12px rgba(45,42,38,0.08)` | `0 4px 12px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 16px 40px rgba(45,42,38,0.12)` | `0 16px 40px rgba(0,0,0,0.5)` |

### Category Colors
Each category has a warm, earthy tone that evokes its domain.

| Category | Hex | Rationale |
|----------|-----|-----------|
| Appliances | `#C4915C` | Warm amber/honey. Everyday kitchen items. |
| Structure & Exterior | `#A67B5B` | Terracotta/clay. Earthen materials, built things. |
| Home Systems | `#5A8C84` | Muted teal. Infrastructure, flow, working systems. |
| Projects | `#8B7396` | Dusty plum. Creative work, transformation. |

CSS variables: `--cat-appliances`, `--cat-structure`, `--cat-systems`, `--cat-projects`

Category color usage:
- Card icon background: `rgba({color}, 0.12)`
- Filter chip (active): text color = category color, background = `rgba({color}, 0.08)`
- Timeline bars: solid category color
- Category badges: same pattern as status pills

### Status Colors
| Status | Hex | Meaning |
|--------|-----|---------|
| Good | `#5A7C65` | 3+ years remaining (same as primary) |
| Warning | `#C4915C` | 1-3 years remaining (warm amber) |
| Critical | `#C4735C` | < 1 year remaining (muted orange) |
| Overdue | `#B85C5C` | Past expected EOL (muted warm red) |

CSS variables: `--status-good`, `--status-warning`, `--status-critical`, `--status-overdue`

Status pill pattern:
- Light mode: background `rgba({color}, 0.12)`, text = darkened color
- Dark mode: background `rgba({color}, 0.15)`, text = lightened color

### Semantic Colors
| Purpose | Hex | Usage |
|---------|-----|-------|
| Success | `#5A7C65` | Save confirmations, positive feedback |
| Info | `#5A8C84` | Informational alerts, tips |
| Warning | `#C4915C` | Attention needed, approaching thresholds |
| Error | `#B85C5C` | Upload failures, validation errors |

CSS variables: `--semantic-success`, `--semantic-info`, `--semantic-warning`, `--semantic-error`

## Spacing
- **Base unit:** 4px
- **Density:** Spacious (Things 3 influence, generous whitespace)
- **Scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `2xs` | 2px | Tight gaps (icon-to-text in pills) |
| `xs` | 4px | Chip gaps, inline spacing |
| `sm` | 8px | Small gaps, swatch grid gaps |
| `md` | 16px | Standard gap, card body margin, form group |
| `lg` | 24px | Card padding, section padding, component gaps |
| `xl` | 32px | Section spacing, large gaps |
| `2xl` | 48px | Major section dividers |
| `3xl` | 64px | Page-level section spacing |

## Layout
- **Approach:** Grid-disciplined. Predictable card grids, clear hierarchy. Content is the star.
- **Grid:**
  - Desktop (>= 1024px): 3-column card grid with sidebar filter
  - Tablet (640-1023px): 2-column card grid with sidebar filter
  - Mobile (< 640px): Single-column cards, chip bar filter
- **Max content width:** 1100px
- **Border radius:**

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements (form inputs, status dots) |
| `--radius-md` | 8px | Buttons, chips, icon containers |
| `--radius-lg` | 12px | Cards (secondary), alerts, stat cards |
| `--radius-xl` | 16px | Primary cards, modals, detail containers |
| `--radius-full` | 9999px | Pills, avatar circles, theme toggle |

## Motion
- **Approach:** Intentional. Smooth transitions that aid comprehension and satisfaction. Project completion and item saves should feel good. Not flashy, not absent.
- **Easing:**
  - Enter: `ease-out` (elements arrive and settle)
  - Exit: `ease-in` (elements accelerate away)
  - Move: `ease-in-out` (position changes)
- **Duration:**
  - Micro: 50-100ms (button hover, focus ring)
  - Short: 150-250ms (status pill change, card hover lift, chip toggle)
  - Medium: 250-400ms (page transitions, modal open/close, theme toggle)
  - Long: 400-700ms (project completion celebration, onboarding steps)
- **Reduced motion:** Respect `prefers-reduced-motion`. Disable all non-essential animations. Keep essential state changes instant (0ms duration with no transform).

## CSS Variable Reference

```css
:root {
  /* Fonts */
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Light mode colors */
  --bg: #FAF8F5;
  --surface: #FFFFFF;
  --surface-2: #F5F2ED;
  --surface-input: #FAF8F5;
  --border: #E8E2D9;
  --border-dim: #F0EDE8;
  --text-1: #2D2A26;
  --text-2: #6B6560;
  --text-3: #9C9590;
  --primary: #5A7C65;
  --primary-hover: #4A6B55;
  --primary-subtle: rgba(90,124,101,0.08);
  --primary-border: rgba(90,124,101,0.25);

  /* Category */
  --cat-appliances: #C4915C;
  --cat-structure: #A67B5B;
  --cat-systems: #5A8C84;
  --cat-projects: #8B7396;

  /* Status */
  --status-good: #5A7C65;
  --status-warning: #C4915C;
  --status-critical: #C4735C;
  --status-overdue: #B85C5C;

  /* Semantic */
  --semantic-success: #5A7C65;
  --semantic-info: #5A8C84;
  --semantic-warning: #C4915C;
  --semantic-error: #B85C5C;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(45,42,38,0.06);
  --shadow-md: 0 4px 12px rgba(45,42,38,0.08);
  --shadow-lg: 0 16px 40px rgba(45,42,38,0.12);

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

[data-theme="dark"] {
  --bg: #1C1A17;
  --surface: #2A2722;
  --surface-2: #34312C;
  --surface-input: #2A2722;
  --border: #3D3A36;
  --border-dim: #2A2722;
  --text-1: #F0EDE8;
  --text-2: #9C9590;
  --text-3: #6B6560;
  --primary: #7DA08A;
  --primary-hover: #8DB09A;
  --primary-subtle: rgba(125,160,138,0.12);
  --primary-border: rgba(125,160,138,0.3);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 16px 40px rgba(0,0,0,0.5);
}
```

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Initial design system created | Created by /design-consultation based on /plan-design-review v2.0.0 roadmap. Warm Utility direction. Competitive research showed all home management apps use cold blue and look like enterprise SaaS. This system differentiates with warm earth tones, serif display type, and sage green primary. |
| 2026-03-27 | Instrument Serif for display | Creative risk. No competitor uses serif. Gives instant personality and warmth. |
| 2026-03-27 | Sage green primary (#5A7C65) | Every home management app is blue. Green is warm, natural, immediately differentiating. |
| 2026-03-27 | Warm neutrals (not cold slate) | Current app uses slate-900 (cold). New palette uses warm off-whites (#FAF8F5) and warm darks (#1C1A17). |
| 2026-03-27 | Earth-toned category colors | Appliances (amber), Structure (terracotta), Systems (teal), Projects (plum). Each evokes its domain. |
