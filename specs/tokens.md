# Design Tokens: Brazilian Haven Beauty

**Feature**: `platform-mvp-v1`  
**Date**: 2026-04-17  
**Status**: Draft for implementation

---

## Purpose

Translate the approved visual system into implementation-ready tokens that can be mapped into:

- CSS custom properties
- Tailwind theme values
- component styles
- future email and marketing surfaces

This file is the technical token companion to:

- [design.md](design.md)
- [components.md](components.md)

---

## Token Principles

- Tokens should be semantic first, not overly tied to one page.
- Neutral surfaces should do most of the visual work.
- Accent colors must remain restrained.
- Text contrast and booking clarity are higher priority than decorative expression.
- Tokens should support both marketing pages and functional booking UI without creating two different brands.

---

## Color Tokens

### Core Backgrounds

- `color.bg.canvas`: `#F1F1F1`
- `color.bg.warm`: `#EFE2D0`
- `color.bg.soft`: `#EAE2DC`
- `color.bg.elevated`: `#FFFFFF`

### Text

- `color.text.primary`: `#202020`
- `color.text.secondary`: `#5F5A55`
- `color.text.inverse`: `#F7F3EE`

### Brand

- `color.brand.primary`: `#143323`
- `color.brand.primary-hover`: `#1B4330`
- `color.brand.support`: `#967553`
- `color.brand.neutral`: `#B4A886`

### Accent

- `color.accent.soft`: `#A3D0A7`
- `color.accent.warm`: `#FC99A1`

### Borders

- `color.border.soft`: `rgba(32, 32, 32, 0.08)`
- `color.border.default`: `rgba(32, 32, 32, 0.12)`
- `color.border.strong`: `rgba(32, 32, 32, 0.2)`

### States

- `color.state.success`: `#3E7A56`
- `color.state.warning`: `#B48946`
- `color.state.error`: `#A55353`
- `color.state.info`: `#40657A`

### Overlay and Shadow Tints

- `color.overlay.soft-dark`: `rgba(20, 28, 24, 0.18)`
- `color.overlay.medium-dark`: `rgba(20, 28, 24, 0.32)`
- `color.shadow.forest`: `rgba(20, 51, 35, 0.08)`
- `color.shadow.neutral`: `rgba(32, 32, 32, 0.08)`

---

## Typography Tokens

### Font Families

- `font.family.display`: `"Cormorant Garamond", Georgia, serif`
- `font.family.body`: `"Manrope", "Segoe UI", Arial, sans-serif`
- `font.family.mono`: `"JetBrains Mono", "SFMono-Regular", Consolas, monospace`

### Font Sizes

- `font.size.hero`: `clamp(3.5rem, 8vw, 6.5rem)`
- `font.size.h1`: `clamp(2.75rem, 6vw, 4.5rem)`
- `font.size.h2`: `clamp(2rem, 4vw, 3rem)`
- `font.size.h3`: `1.5rem`
- `font.size.h4`: `1.25rem`
- `font.size.body-lg`: `1.125rem`
- `font.size.body`: `1rem`
- `font.size.small`: `0.875rem`
- `font.size.micro`: `0.75rem`

### Font Weights

- `font.weight.regular`: `400`
- `font.weight.medium`: `500`
- `font.weight.semibold`: `600`
- `font.weight.bold`: `700`

### Line Heights

- `font.line.tight`: `0.95`
- `font.line.heading`: `1.05`
- `font.line.body`: `1.55`
- `font.line.relaxed`: `1.7`

### Letter Spacing

- `font.tracking.display`: `-0.03em`
- `font.tracking.heading`: `-0.015em`
- `font.tracking.body`: `0`
- `font.tracking.eyebrow`: `0.08em`

---

## Spacing Tokens

Use an 8px-based rhythm with room for premium whitespace.

- `space.1`: `4px`
- `space.2`: `8px`
- `space.3`: `12px`
- `space.4`: `16px`
- `space.5`: `20px`
- `space.6`: `24px`
- `space.7`: `32px`
- `space.8`: `40px`
- `space.9`: `48px`
- `space.10`: `56px`
- `space.11`: `72px`
- `space.12`: `96px`
- `space.13`: `120px`

### Recommended Usage

- card inner padding: `space.6` to `space.7`
- hero padding: `space.8` to `space.10`
- desktop section gap: `space.12`
- tablet section gap: `space.11`
- mobile section gap: `space.9`

---

## Radius Tokens

- `radius.none`: `0`
- `radius.sm`: `12px`
- `radius.md`: `18px`
- `radius.lg`: `24px`
- `radius.xl`: `28px`
- `radius.pill`: `999px`

### Recommended Usage

- buttons and form controls: `radius.md`
- cards: `radius.lg`
- major hero and section panels: `radius.xl`
- chips, badges, nav pills: `radius.pill`

---

## Shadow Tokens

- `shadow.none`: `none`
- `shadow.card`: `0 10px 24px rgba(32, 32, 32, 0.08)`
- `shadow.panel`: `0 16px 40px rgba(20, 51, 35, 0.08)`
- `shadow.button`: `0 12px 24px rgba(20, 51, 35, 0.18)`
- `shadow.focus`: `0 0 0 3px rgba(20, 51, 35, 0.16)`

### Rules

- Use shadows to create calm depth, not dramatic floating effects.
- Avoid stacking multiple aggressive shadow layers.
- Primary CTA and major panels may use stronger depth than regular cards.

---

## Border Tokens

- `border.width.hairline`: `1px`
- `border.width.strong`: `2px`
- `border.color.soft`: `rgba(32, 32, 32, 0.08)`
- `border.color.default`: `rgba(32, 32, 32, 0.12)`
- `border.color.inverse`: `rgba(255, 255, 255, 0.28)`

---

## Layout Tokens

### Widths

- `layout.container.max`: `1200px`
- `layout.container.wide`: `1280px`
- `layout.content.readable`: `72ch`
- `layout.sidebar.info`: `320px`

### Grids

- `layout.grid.desktop.columns`: `12`
- `layout.grid.tablet.columns`: `6`
- `layout.grid.mobile.columns`: `4`
- `layout.grid.gap`: `24px`

### Section Rhythm

- `layout.section.desktop`: `96px`
- `layout.section.tablet`: `72px`
- `layout.section.mobile`: `48px`

---

## Motion Tokens

### Durations

- `motion.duration.fast`: `150ms`
- `motion.duration.base`: `220ms`
- `motion.duration.slow`: `320ms`
- `motion.duration.reveal`: `450ms`

### Easings

- `motion.ease.standard`: `ease`
- `motion.ease.enter`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `motion.ease.exit`: `cubic-bezier(0.7, 0, 0.84, 0)`

### Rules

- use `transform` and `opacity` for transitions
- avoid animating layout dimensions where possible
- respect `prefers-reduced-motion`
- hover transitions should remain subtle and premium

---

## Component Token Mapping

### Site Header

- background: `color.bg.elevated` with transparency treatment
- text: `color.text.primary`
- border: `border.color.inverse` or `border.color.soft`
- radius: `radius.pill`
- shadow: `shadow.panel`

### Primary Button

- background: `color.brand.primary`
- text: `color.text.inverse`
- radius: `radius.pill`
- shadow: `shadow.button`

### Secondary Button

- background: `color.bg.elevated`
- text: `color.text.primary`
- border: `border.color.default`
- radius: `radius.pill`

### Hero Panel

- background: `color.bg.warm` or layered warm neutral treatment
- text: `color.text.primary`
- radius: `radius.xl`
- shadow: `shadow.panel`

### Card

- background: `color.bg.elevated` or `color.bg.soft`
- text: `color.text.primary`
- border: `border.color.soft`
- radius: `radius.lg`
- shadow: `shadow.card`

### Pricing Module

- background: `color.bg.elevated`
- heading/text: `color.text.primary`
- tier highlight: `color.brand.primary`
- support accents: `color.brand.support`

### FAQ Item

- background: `color.bg.elevated`
- text: `color.text.primary`
- border: `border.color.soft`
- radius: `radius.md`

---

## Accessibility Rules

- `color.text.primary` on all light backgrounds must pass AA for body copy
- accent colors must never carry meaning alone
- focus states should use `shadow.focus` or equivalent visible outline
- text sizes below `font.size.small` should be used sparingly
- buttons and controls must still meet `44x44px` minimum touch targets

---

## Tailwind Mapping Guidance

Recommended first-pass theme mapping:

- `backgroundColor`
  - `canvas`
  - `warm`
  - `soft`
  - `elevated`
- `textColor`
  - `primary`
  - `secondary`
  - `inverse`
- `colors.brand`
  - `primary`
  - `support`
  - `neutral`
- `colors.accent`
  - `soft`
  - `warm`
- `borderRadius`
  - `sm`
  - `md`
  - `lg`
  - `xl`
  - `pill`
- `boxShadow`
  - `card`
  - `panel`
  - `button`
  - `focus`
- `fontFamily`
  - `display`
  - `body`
  - `mono`

---

## CSS Variable Mapping Example

```css
:root {
  --color-bg-canvas: #f1f1f1;
  --color-bg-warm: #efe2d0;
  --color-bg-soft: #eae2dc;
  --color-surface: #ffffff;
  --color-text-primary: #202020;
  --color-text-secondary: #5f5a55;
  --color-text-inverse: #f7f3ee;
  --color-brand-primary: #143323;
  --color-brand-support: #967553;
  --color-brand-neutral: #b4a886;
  --color-accent-soft: #a3d0a7;
  --color-accent-warm: #fc99a1;
  --radius-card: 24px;
  --radius-panel: 28px;
  --radius-control: 18px;
  --shadow-card: 0 10px 24px rgba(32, 32, 32, 0.08);
  --shadow-panel: 0 16px 40px rgba(20, 51, 35, 0.08);
}
```

---

## Anti-Patterns

- adding many extra brand colors outside the approved palette
- using coral or sage as dominant full-page backgrounds
- replacing semantic tokens with page-specific hardcoded hex values
- introducing multiple competing shadow systems
- defaulting back to generic framework colors during implementation

---

## Next Step

After token approval, the next implementation move should be:

1. scaffold the frontend project structure
2. encode these tokens in CSS variables and Tailwind config
3. build the public component library
4. implement Home first using approved components only
