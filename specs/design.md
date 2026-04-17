# Design System: Brazilian Haven Beauty

**Feature**: `platform-mvp-v1`  
**Date**: 2026-04-17  
**Status**: Draft for implementation

---

## Purpose

Define the visual system and page layout direction for Brazilian Haven Beauty before implementation of the public-facing experience, especially Home, About, and Brazilian Wax. This document satisfies Constitution Principle VI and should be treated as the source of truth for UI tone, layout, motion, and component styling.

---

## Inputs

- Product and UX requirements from [spec.md](spec.md) and [plan.md](plan.md)
- Brand constraint from [constitution.md](constitution.md): premium Brazilian-inspired wellness identity
- Layout reference provided by the user: `https://red-badger-285858.hostingersite.com`
- `ui-ux-pro-max` skill guidance from `.claude/skills/ui-ux-pro-max/SKILL.md`
- Live market signals reviewed on April 17, 2026:
  - Webflow’s 2025 design trend roundup emphasizes layered light/shadow, restrained glow, dimensional interfaces, and sophisticated scroll storytelling
  - Behance’s Brazilian Haven Beauty branding case describes a refined identity built around earthy tones, deep greens, soft rosy accents, and botanical cues

## Primary Reference Pages

These reference pages are the primary schematic guide for the public-facing experience. For the pages listed below, implementation should follow the referenced page's structural language, visual pacing, section hierarchy, and overall compositional feel.

- Home reference: `https://red-badger-285858.hostingersite.com`
- About reference: `https://red-badger-285858.hostingersite.com/about`
- Services reference: `https://red-badger-285858.hostingersite.com/services`
- Prices reference: `https://red-badger-285858.hostingersite.com/prices`
- Contact reference: `https://red-badger-285858.hostingersite.com/contact`

Interpretation rule:

- These pages are not just loose inspiration.
- They are the target layout language for Brazilian Haven Beauty's public pages.
- We should adapt content, pricing logic, bilingual structure, and booking functionality to our product requirements without drifting away from the reference site's composition and tone.

## Design Intent

The experience should feel like a premium boutique wellness brand, not a generic booking SaaS and not a soft-pink spa cliché. The public site should combine:

- editorial elegance
- warm Brazilian naturalism
- high booking clarity
- modern conversion discipline

The result should feel calm, tactile, and upscale, while still making pricing, booking, and staff selection obvious within seconds.

---

## Experience Principles

- Put booking confidence before decoration. The interface should answer: what is this service, who performs it, how much does it cost, and how do I book it.
- Use warmth instead of glamour overload. Favor sun-washed neutrals, terracotta, deep botanical green, and brass-like highlights over loud luxury black-and-gold stereotypes.
- Build depth with light, shadow, texture, and spacing. Do not rely on heavy glassmorphism or neon effects.
- Keep motion purposeful. Motion should guide attention, reveal hierarchy, and improve perceived polish, never block the booking path.
- Use real humanity. Staff photos, salon environment photography, and treatment detail imagery should feel authentic and intimate.
- Maintain bilingual elegance. English and Portuguese content must feel native in spacing and tone, not squeezed into fixed layouts.

---

## Recommended Visual Direction

### Primary Style

Use a hybrid of:

- `Nature Distilled` for warmth, materiality, and premium wellness tone
- `Editorial Grid / Magazine` for composition, typography, and high-end storytelling
- `Bento Grid` selectively for scannable service, membership, and trust blocks

### Trend Adoption

Adopt these current patterns:

- floating header with soft shadow and translucent cream background
- shadow or window-light overlays in hero and lifestyle sections
- modular bento-style information blocks for services, memberships, and benefits
- subtle glow only on premium CTAs or highlighted cards
- scroll-triggered reveals with restrained stagger
- real photography over decorative stock collage

Do not adopt:

- cyber or sci-fi visual language
- heavy dark mode as the primary public brand
- excessive blur, chrome, or jelly effects
- loud gradients that overpower text and photography

---

## Color System

### Core Palette

- `--color-bg`: `#F7F1EA`
- `--color-surface`: `#FFF9F4`
- `--color-surface-alt`: `#EFE3D6`
- `--color-text`: `#2B211D`
- `--color-text-muted`: `#6C5B53`
- `--color-line`: `#D8C6B8`
- `--color-primary`: `#1F4D3A`
- `--color-primary-strong`: `#17392B`
- `--color-accent`: `#B86E5A`
- `--color-accent-soft`: `#D9A89A`
- `--color-highlight`: `#C8A46B`
- `--color-success`: `#3F7A5A`
- `--color-danger`: `#A44B3F`

### Usage Rules

- Use cream and soft sand as the dominant canvas.
- Use deep green for trust, premium structure, navigation accents, and major section anchors.
- Use terracotta for primary CTA emphasis and active states.
- Use muted rosy sand for soft fills, testimonial highlights, and supportive cards.
- Use brushed-gold highlights sparingly for premium cues, never as a dominant fill.
- Reserve pure white for elevated cards and form surfaces only.

### Gradients

- Hero background: cream to blush-warm radial wash
- Highlight cards: cream to warm-sand linear fade
- Do not use saturated rainbow or tech-style aurora gradients

---

## Typography

### Font Pairing

- Headings: `Cormorant Garamond`
- Body/UI: `Manrope`
- Optional accent text only: `Caveat` or a similar handwritten script for tiny signature moments, never for navigation or long copy

### Why

- `Cormorant Garamond` gives the site editorial luxury without feeling old-fashioned.
- `Manrope` keeps the interface modern, clean, and readable for booking flows, pricing, and dashboards.
- Both support the premium-but-usable balance better than a generic `Inter`-led system.

### Scale

- Hero display: `clamp(3.5rem, 8vw, 6.5rem)`
- H1: `clamp(2.75rem, 6vw, 4.5rem)`
- H2: `clamp(2rem, 4vw, 3rem)`
- H3: `1.5rem`
- Body large: `1.125rem`
- Body: `1rem`
- Small/meta: `0.875rem`

### Typographic Rules

- Tighten heading tracking slightly for editorial polish.
- Keep body copy within `65–75ch`.
- Use sentence case, not all caps, except for tiny eyebrow labels.
- Use stronger contrast on text than typical beauty sites; readability is a trust feature.

---

## Layout System

### Grid

- Desktop container: `max-width: 1280px`
- Standard content width: `1180px`
- Reading width: `72ch`
- Grid: 12-column desktop, 6-column tablet, 4-column mobile
- Section spacing: `96px` desktop, `72px` tablet, `48px` mobile

### Spatial Language

- Cards: `20px` to `28px` radius
- Buttons and inputs: `16px` to `20px` radius
- Soft elevation only: layered shadow, not hard neumorphic depth
- Use asymmetry in hero and about sections, but keep transactional pages more structured

### Background Treatment

- Off-cream page background with subtle grain overlay
- Occasional botanical silhouette or sunlight-shadow overlay in hero and About
- No flat white-page monotony

---

## Core Components

### Header

- Floating top navigation with rounded container
- Logo left, primary nav center/right, `Book Now` CTA always visible
- Language toggle integrated into the header, not hidden in utility chrome
- Header becomes slightly more opaque on scroll

### Buttons

- Primary: deep terracotta fill, dark text or cream text depending on contrast
- Secondary: cream surface with dark text and green border
- Tertiary: text link with animated underline
- Hover: color/shadow shift only, no jumpy scale effects

### Cards

- Use white or warm-cream cards on neutral background
- Border should be visible and warm, not gray-blue SaaS default
- Feature cards may use soft bento sizing for hierarchy

### Forms

- High-legibility inputs with cream or white fill
- Clear label above input
- Error states use text + icon + border, not color alone
- Date/time selectors should feel premium but clinical in clarity

### Staff Cards

- Portrait-led
- Show specialties, tier, short trust cue, and starting price
- Add one clear booking action
- Avoid social-card clutter

### Pricing Modules

- Per-tier pricing must be visually obvious
- Use segmented controls or staff tier chips, not hidden dropdowns
- Duration, price, and what’s included should sit together

### Testimonial Blocks

- Use authentic client quotes with name and optional service context
- Avoid giant carousel-only testimonial sections
- Prefer a mixed layout: 1 featured quote + smaller supporting quotes

---

## Motion

### Motion Rules

- Micro-interactions: `150ms–250ms`
- Section reveals: `300ms–500ms`
- Use `opacity` and `transform`, not width/height animation
- Respect `prefers-reduced-motion`

### Motion Applications

- Hero image and content stagger on first load
- Service and membership cards reveal in small stagger groups
- Sticky CTA or booking summary fades in, not slides aggressively
- FAQ accordions use smooth height and opacity transitions

### Avoid

- infinite decorative animation
- parallax that interferes with mobile readability
- long cinematic animations before content appears

---

## Imagery Direction

- Use real salon photography whenever possible
- Prioritize warm daylight, skin tone accuracy, soft shadows, and clean treatment environments
- Include close-up texture shots: wax tools, linens, botanical details, hands, and treatment surfaces
- Avoid cold stock-spa imagery with pebbles, bamboo, or generic orchids
- Photo editing should feel matte and slightly filmic, not hyper-saturated

---

## Public Page Blueprints

### Home

Primary schematic reference: `https://red-badger-285858.hostingersite.com`

Section order:

1. Floating header
2. Editorial hero with split composition
3. Quick trust bar with rating, location, and booking confidence cues
4. Signature services bento grid
5. Staff spotlight strip
6. Memberships and package teaser
7. Why clients trust Brazilian Haven Beauty
8. Testimonials
9. Final CTA footer

Hero layout:

- Left: strong editorial headline, subcopy, primary and secondary CTA
- Right: layered salon/lifestyle image composition with soft light overlay
- Keep first-booking action visible above the fold
- Overall direction should closely follow the reference homepage's rhythm, image-to-text balance, and premium section pacing

### About

Primary schematic reference: `https://red-badger-285858.hostingersite.com/about`

Section order:

1. Founder or brand story intro
2. Brazilian-inspired philosophy and care principles
3. Expertise, hygiene, and comfort standards
4. Team culture or salon ritual section
5. Final invitation CTA

About should feel more editorial than transactional, but still end in a booking path.
The page should closely mirror the reference About page's storytelling cadence, spacious composition, and image-led credibility.

### Services

Primary schematic reference: `https://red-badger-285858.hostingersite.com/services`

- Use category filtering with large scannable cards
- Every service card should expose duration and starting price
- Staff-tier pricing preview should be available without forcing a full booking flow
- Use a clean grid, not a cramped long table as the first view
- The page should preserve the reference Services page's section composition and browsing feel while adapting the data model to live services and per-staff pricing

### Prices

Primary schematic reference: `https://red-badger-285858.hostingersite.com/prices`

- Make this the radical-transparency page
- Organize by service category, then staff tier
- Use anchored sections and sticky local navigation on desktop
- Highlight package savings and membership value without hiding base prices
- The page should follow the reference Prices page's clarity and pacing, but our implementation must make tier-based pricing even more explicit

### Booking

- 4-step wizard only: service, staff, time, payment
- Sticky progress indicator
- Sticky mobile summary bar
- Preserve context between steps so users never lose the selected price or staff
- Reduce all decorative motion here; clarity wins

### Contact

Primary schematic reference: `https://red-badger-285858.hostingersite.com/contact`

- Include location, hours, phone, email, embedded map, and parking or arrival notes
- Split layout with contact details on one side and a warm salon image or map on the other
- `Book Now` must remain primary, contact is supportive
- The page should follow the reference Contact page's calm layout and premium minimalism rather than turning into a utilitarian info dump

### Brazilian Wax Landing Page

This page should be the highest-converting public page.

Section order:

1. Direct response hero with clear Brazilian Wax headline
2. Price-from module with staff tier selector
3. What to expect before, during, and after
4. Why Brazilian Haven Beauty is different
5. Before/after comfort and care reassurance
6. FAQs
7. Sticky CTA and repeated inline booking CTA

Rules:

- Keep this page tighter and more conversion-focused than Home
- Use social proof and reassurance near the top
- Show duration, pricing logic, and first-time guidance early
- Keep CTAs visible every 1 to 2 sections

---

## Admin Dashboard Direction

The admin interface should share brand DNA but not mimic the editorial public site.

- Use `Manrope` throughout admin
- Reduce decorative textures
- Increase neutral surfaces and data density
- Keep accent colors aligned with brand tokens
- Dashboard should feel premium, not lifestyle-heavy

Recommended admin style:

- Swiss-modern structure
- soft bento widget layout for KPIs
- clean side navigation
- strong contrast tables and calendars

---

## Accessibility and Performance Rules

- Minimum contrast: WCAG AA, with AAA preferred for key body text
- Minimum touch target: `44x44px`
- Do not rely on color alone for status
- Preserve heading hierarchy on every page
- Reserve image space to avoid layout shift
- Keep decorative effects lightweight and CSS-first
- Prioritize fast mobile rendering over heavy hero effects

---

## Implementation Notes

- Define all colors, shadows, radii, spacing, and typography as CSS variables
- Map those tokens into Tailwind theme extensions
- Use `shadcn/ui` primitives, but reskin them heavily to avoid default SaaS feel
- Build reusable section shells for hero, bento grid, testimonial rail, and CTA footer
- Use one motion system consistently across the app

---

## Anti-Patterns

- default purple-on-white SaaS styling
- overuse of pink as the entire brand identity
- generic spa stock photos and cliché wellness props
- giant blocks of centered text with no hierarchy
- hidden pricing behind modals or multi-click drilldowns
- heavy carousels for core content
- dark-mode-first public pages
- tech-brand glass panels that fight readability

---

## Approval Criteria

This design system is considered implemented correctly when:

- the site feels premium, warm, and unmistakably beauty-and-wellness focused
- the public pages clearly reflect Brazilian Haven Beauty rather than a generic salon template
- pricing and booking logic remain immediately understandable
- Home, About, and Brazilian Wax feel brand-led and intentional
- Services, Prices, and Booking remain operationally clear and conversion-strong
- the interface looks current for 2026 without chasing disposable trend aesthetics

---

## External References

- Reference layout provided by user: https://red-badger-285858.hostingersite.com
- Webflow Blog, “6 web design trends to watch in 2025”: https://webflow.com/blog/web-design-trends-2025
- Behance, “Brazilian Haven Beauty”: https://www.behance.net/gallery/227967463/Brazilian-Haven-Beauty
