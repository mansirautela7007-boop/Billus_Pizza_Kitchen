# Billu's Pizza Kitchen — design audit and tokens

## 1. What the screens used before this pass

Measured from the computed styles on every screen at 1440 × 812 (53 screens, both levels). The full data is in `before/audit.json`.

**Text colours: 22 distinct.** Most used: `rgb(90, 46, 16)` (113), `rgb(255, 243, 214)` (42), `rgb(74, 42, 16)` (33), `rgb(35, 53, 111)` (28), `rgb(255, 255, 255)` (27), `rgb(42, 20, 5)` (23), `rgb(62, 34, 16)` (23), `rgb(255, 246, 230)` (18), `rgb(244, 241, 234)` (17), `rgb(255, 154, 60)` (14)

**Background colours: 23 distinct.** Most used: `rgb(251, 241, 220)` (38), `rgba(20, 10, 0, 0.35)` (38), `rgb(90, 46, 16)` (33), `rgb(255, 241, 194)` (16), `rgb(255, 255, 255)` (16), `rgba(255, 246, 226, 0.82)` (15), `rgb(255, 253, 246)` (13), `rgb(255, 246, 226)` (11), `rgb(127, 196, 232)` (10), `rgb(32, 56, 28)` (6)

**Font sizes: 47 distinct.** Most used: `17px` (38), `24.1182px` (32), `20px` (24), `22.44px` (24), `11.56px` (22), `25.84px` (16), `16.8828px` (16), `44.88px` (16), `13px` (15), `31.28px` (12)

**Corner radii: 27 distinct.** Most used: `50%` (308), `999px` (62), `18px` (36), `10px` (32), `24px` (18), `5px 5px 3px 3px` (11), `9.8736px` (11), `1.122px` (11), `6.16px` (11), `16px 16px 0px 0px` (10)

**Shadows: 32 distinct.** Most used: `rgba(30, 12, 0, 0.45) -12px 0px 34px 0px` (38), `rgb(255, 246, 218) 0px 0px 0px 2px, rgb(233, 165, 58) 0px 0px 0px 4px, rgba(60, ` (32), `rgb(169, 84, 10) 0px 5px 0px 0px, rgba(255, 154, 60, 0.35) 0px 0px 18px 0px` (23), `rgb(255, 216, 115) 0px 0px 7.24941px 0px` (16), `rgba(60, 30, 10, 0.35) 0px 3px 0px 0px` (16), `rgb(169, 101, 10) 0px 5px 0px 0px` (15), `rgba(90, 45, 10, 0.18) 0px 3px 8px 0px` (15), `rgba(255, 255, 255, 0.6) 0px 2px 0px 0px inset, rgba(80, 40, 10, 0.4) 0px 2px 3p` (11), `rgb(255, 255, 255) 0px 0px 0px 3px, rgba(60, 30, 10, 0.25) 0px 2px 5px 0px` (11), `rgb(255, 208, 138) 0px 0px 0px 0.8976px inset, rgba(255, 255, 255, 0.85) 0px 2.6` (11)

**Buttons:** `q`, `pcPause`, `pcNext`, `pcBack`, `done`, `bgmBtn`, `[object`, `bowl`, `tutNext`, `r3pause`, `slot`, `pie`, `stack`, `side`, `fin`, `r3reset`

**Typefaces:** Baloo 2 (headings, numbers, buttons) and Nunito (some body text). Kalam was loaded on Level 1 but not used.

**Buttons in use:**
- three plank styles (green, orange, parchment) drawn from images;
- a gradient pill ("tutNext");
- five kinds of round wooden button (pause, back, next, music, QA), all slightly different sizes (40–60 px);
- plain bowls, stacks and cards with their own hover rules.

### Problems the audit showed
- **Colours:** 22 text colours and 23 background colours for what is really one palette (wood, cream, tomato, basil, cheese).
- **Font sizes:** 47, most of them fractional (24.1182px, 22.44px, 11.56px) because each patch scaled its own text.
- **Radii and shadows:** 27 corner radii and 32 shadows.
- **Error colour:** "try again" used a harsh red (`#E53935`) and a sawtooth buzzer sound.
- **Speech banners:** drawn as a painted picture whose borders took up most of the box on narrow screens.
- **Phone portrait:** not supported at all ("Please turn your screen sideways").

## 2. The token set

All tokens live in `assets/ui/tokens.css`. Components read them in `assets/ui/design.css`, and `assets/ui/design.js` adds a few small behaviours. Both game pages load all three: tokens in `<head>`, components last.

### Colour

| Role | Token | Value | Use |
|---|---|---|---|
| Wood (primary surface) | `--surface-wood` | `#7A4A22` | pills, VS badge, order header |
| Dark wood / outline | `--outline` | `#3B2210` | every card and pill outline |
| Tomato (action / accent) | `--accent` | `#D94A2E` | fractions in speech, read-aloud button, story dot |
| Basil (success) | `--success` | `#3B8C34` | CHECK, NEXT, SERVE, correct counters, "Served" pill |
| Cheese (highlight / selected) | `--highlight` | `#FFC83D` | selected bowl ring, highlighted numerator / denominator, earned star |
| Cream (cards) | `--surface-card` | `#FFF4DC` | speech banners, order card, pills, end cards |
| Text | `--text` | `#3A2210` | 13.6 : 1 on cream (needs 4.5) |
| Secondary text | `--text-soft` | `#5C3A1E` | 9.2 : 1 on cream |
| Error (soft coral) | `--error` / `--error-glow` | `#D9634F` / `#F28C78` | wrong slices / plates, banner rim on "try again" |
| Focus ring | `--focus` | `#1A3FAA` | keyboard focus everywhere |

Contrast notes:
- Tomato digits on cream (3.9 : 1) and cream text on basil buttons (4.1 : 1) are only used for large, bold text (24 px or more), where the requirement is 3 : 1.
- Body and speech text is always `--text` on cream.

### Type

- **Typefaces:** `--font-display` is Baloo 2 (headings, numbers, buttons); `--font-body` is Nunito (speech and body text).
- **Scale:** `--fs-1` to `--fs-5` are 16 / 20 / 24 / 32 / 48 px.
- **Speech banners:**
  - 24 px on desktop, never under 22 real px;
  - 20 px on phones, never under 18 real px.
  - The page is scaled to fit the screen, so the minimum is held in real screen pixels: `max(token, 22px / zoom)`.

### Space, radii, shadows, motion

- **Spacing:** `--sp-1` to `--sp-6` follow the 8 px grid (8 to 48).
- **Safe areas:** `--safe-*` are at least 24 px and respect `env(safe-area-inset-*)`.
- **Radii:** `--r-sm` 12, `--r-card` 20, `--r-pill` 999.
- **Shadows:** `--sh-1/2/3`, plus button-thickness shadows and two glows (`--glow-select` cheese, `--glow-error` coral).
- **Motion:** one curve, `--ease` = `cubic-bezier(.3,.7,.3,1)`, and three durations: `--t-fast` 150 ms, `--t-med` 250 ms, `--t-slow` 400 ms. These collapse to 1 ms under `prefers-reduced-motion`.
- **Sizes:** `--tap` 48 px minimum target, `--icon-btn` 56 px, `--btn-h` 64 px.

## 3. Shared components (assets/ui/design.css)

1. **Speech banner** (game, lesson, story): cream card, dark-wood outline, round speaker avatar, read-aloud button, Nunito text. It turns basil on praise and coral on "try again".
2. **Stacked fraction** (numerator / bar / denominator): one look for the order card, lesson cards, Level 2 tags, Final cards and Served / Left pills.
   - `.lit`, `.fn` / `.fd`, `.r3hi` and `.r3glow` highlight one number.
   - `.r3lo` dims the other.
3. **Pills:** labels (1 whole, Numerator, Denominator, Served, Left, Smallest, Greatest) and counters ("Topped: X of N", "Slices: X of N").
4. **Primary button:** the green wooden plank. Hover lifts 2 px; pressed moves down 3 px with a smaller shadow; disabled is grey at 55%; focus shows the blue ring. Minimum 64 px tall.
5. **Round icon button:** the wooden circle for pause, back, next, music and QA. Same four states, at least 56 px and never under 48 real px.
6. **Cards:** order card, end cards and pause menu: cream, 20 px radius, outline, `--sh-3`.

### Limits
The older CSS (about 900 KB of layered patches in `index.html` and `level2.html`) was not rewritten line by line. The token layer loads last and overrides every component listed above, so what you see comes from tokens. Old literals still sit unused underneath, and a few minor elements keep their own values: the QA panel, illustration-internal SVG colours and confetti colours. After this pass the screens use 2 typefaces and the 5-step type scale for all UI text. See `after/audit.json` for the measured values.
