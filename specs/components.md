# Public Component Specification: Brazilian Haven Beauty

**Feature**: `platform-mvp-v1`  
**Date**: 2026-04-17  
**Status**: Draft for implementation

---

## Purpose

Define the reusable public-facing component system for Brazilian Haven Beauty so implementation stays consistent with:

- [design.md](design.md)
- [spec.md](spec.md)
- the reference site and page set:
  - `https://red-badger-285858.hostingersite.com`
  - `https://red-badger-285858.hostingersite.com/about`
  - `https://red-badger-285858.hostingersite.com/services`
  - `https://red-badger-285858.hostingersite.com/prices`
  - `https://red-badger-285858.hostingersite.com/contact`

This document is the implementation bridge between visual direction and actual page code.

---

## System Rules

- Public pages must feel like one coherent site, not five separate page designs.
- Components must preserve the reference site’s premium minimal structure, spacing, and pacing.
- Components must be adapted to Brazilian Haven Beauty’s real features, especially bilingual content, transparent pricing, and booking CTAs.
- Components should be reusable first, page-specific second.
- Every component must work on mobile without losing hierarchy or becoming cramped.

---

## Global Tokens

These should become the base design tokens used by all public components.

### Color Tokens

- `bg.base`: `#F1F1F1`
- `bg.warm`: `#EFE2D0`
- `bg.soft`: `#EAE2DC`
- `surface.default`: `#FFFFFF`
- `text.primary`: `#202020`
- `text.muted`: `#5F5A55`
- `brand.primary`: `#143323`
- `brand.support`: `#967553`
- `brand.neutral`: `#B4A886`
- `accent.soft`: `#A3D0A7`
- `accent.warm`: `#FC99A1`

### Radius Tokens

- `radius.card`: `24px`
- `radius.panel`: `28px`
- `radius.control`: `18px`
- `radius.pill`: `999px`

### Shadow Tokens

- `shadow.soft`: soft ambient depth for large sections
- `shadow.card`: lighter depth for cards
- `shadow.button`: reserved for primary CTA emphasis only

### Layout Tokens

- `container.max`: `1200px`
- `content.readable`: `72ch`
- `section.gap.desktop`: `96px`
- `section.gap.tablet`: `72px`
- `section.gap.mobile`: `48px`
- `grid.desktop`: `12`
- `grid.tablet`: `6`
- `grid.mobile`: `4`

---

## Component Inventory

The first implementation pass should use these components:

1. Site Header
2. Hero Section
3. Trust Bar
4. Editorial Split Section
5. Service Category Grid
6. Service Card
7. Pricing Matrix Section
8. Staff Spotlight Block
9. Testimonial Block
10. FAQ Block
11. Contact Information Block
12. CTA Banner
13. Site Footer

---

## 1. Site Header

### Purpose

Provide persistent navigation, language toggle, and a visible booking CTA.

### Used On

- Home
- About
- Services
- Prices
- Contact
- Brazilian Wax landing page

### Structure

- logo mark or wordmark
- primary navigation links
- language toggle
- primary `Book Now` CTA

### Visual Rules

- floating header, not flush to the viewport edge
- warm translucent surface with soft border and subtle blur
- rounded full-width pill shape on desktop
- stronger opacity on scroll

### Interaction Rules

- current page must be visibly active
- `Book Now` remains the dominant action
- language toggle must be visible in the main header area

### Responsive Rules

- collapse cleanly on tablet/mobile
- primary CTA must remain visible even when nav compresses

### Reference Alignment

- closely follow the reference site’s calm, floating, premium navigation feel

---

## 2. Hero Section

### Purpose

Establish immediate page identity and direct users into the next action.

### Used On

- Home
- About
- Services
- Prices
- Contact
- Brazilian Wax landing page

### Base Structure

- eyebrow label
- H1 headline
- support paragraph
- primary CTA
- optional secondary CTA
- visual area or image composition

### Variants

- `HeroEditorial`
  - used for Home and About
  - text + layered image composition
- `HeroFunctional`
  - used for Services, Prices, Contact
  - simpler text-first presentation with supporting media
- `HeroConversion`
  - used for Brazilian Wax
  - tighter structure, immediate price and reassurance cues

### Visual Rules

- serif-led headline
- clean text width
- soft background layering, never loud gradients
- premium imagery, never busy collage layouts

### Responsive Rules

- mobile should stack text above image
- CTAs must remain above the fold where possible

### Reference Alignment

- should preserve the reference site’s hero rhythm and visual confidence

---

## 3. Trust Bar

### Purpose

Quickly reduce friction by surfacing reputation, location, and core confidence signals.

### Used On

- Home
- Brazilian Wax landing page
- optionally Services

### Structure

- 3 to 4 compact trust items
- each item includes metric or short label plus support line

### Content Examples

- rating or review confidence
- location / local trust
- hygienic care / comfort standards
- transparent pricing

### Visual Rules

- compact cards or chips
- soft neutral background
- should read quickly without dominating the page

---

## 4. Editorial Split Section

### Purpose

Support storytelling with a balanced image-and-copy layout.

### Used On

- About
- Home
- Contact

### Structure

- text column
- visual column
- optional quote or supporting stat

### Variants

- `TextLeftMediaRight`
- `MediaLeftTextRight`

### Visual Rules

- maintain generous whitespace
- avoid dense bullet-heavy blocks
- imagery should feel human, warm, and intimate

### Reference Alignment

- should mirror the reference site’s premium editorial pacing

---

## 5. Service Category Grid

### Purpose

Organize service browsing in a way that feels elegant and easy to scan.

### Used On

- Services page
- optionally Home teaser section

### Structure

- section heading
- optional category filter
- grid of service groups or featured service cards

### Visual Rules

- modular card layout
- no cramped table-first presentation
- category structure must feel curated, not raw-database-like

### Responsive Rules

- 3-column desktop
- 2-column tablet
- 1-column mobile

---

## 6. Service Card

### Purpose

Represent a service with enough clarity for a user to evaluate and act.

### Used On

- Services
- Home
- Brazilian Wax landing page

### Required Content

- service name
- short descriptor
- duration
- starting price
- staff-tier preview or tier chips
- CTA

### Optional Content

- popularity badge
- package tie-in
- membership note
- comfort or first-time indicator

### Visual Rules

- rounded card with warm neutral fill
- highly legible price treatment
- tier controls must be visible, not hidden in dropdown-only UI

### Interaction Rules

- tier switching must update visible pricing immediately
- card CTA should route to booking or deeper service detail

### Reference Alignment

- cards should feel elevated and editorial, but clearer and more data-aware than the reference where needed

---

## 7. Pricing Matrix Section

### Purpose

Deliver radical pricing transparency in a structured, premium-feeling way.

### Used On

- Prices page
- selected service detail areas
- Brazilian Wax landing page

### Structure

- section intro
- optional local navigation or category jump links
- grouped service pricing rows or cards
- visible staff-tier differentiation

### Required Rules

- service category must be obvious
- staff tier must be obvious
- duration and price must live together
- no hidden pricing logic

### Visual Rules

- can use rows, cards, or grouped panels
- must stay spacious and premium
- should not devolve into ugly spreadsheet styling

### Responsive Rules

- mobile may collapse rows into cards
- hierarchy must remain clear after stacking

### Reference Alignment

- keep the reference page’s calm clarity, but improve it with explicit tier-based price communication

---

## 8. Staff Spotlight Block

### Purpose

Build trust in the people behind the services.

### Used On

- Home
- About
- Services

### Structure

- section intro
- 1 featured staff member or 2 to 4 concise profile cards

### Required Content

- name
- specialties
- tier
- short trust statement
- optional starting service price or booking CTA

### Visual Rules

- portrait-led
- calm premium card treatment
- no social-card clutter

---

## 9. Testimonial Block

### Purpose

Provide social proof without overwhelming the page.

### Used On

- Home
- About
- Brazilian Wax landing page

### Structure

- one featured testimonial
- 2 to 3 supporting testimonials or short quote cards

### Visual Rules

- no giant carousel dependency
- quote styling should feel editorial
- author information should be understated but real

### Content Rules

- keep testimonials concise and believable
- avoid overproduced or exaggerated testimonial formatting

---

## 10. FAQ Block

### Purpose

Answer objections and reduce booking hesitation.

### Used On

- Prices
- Services
- Contact
- Brazilian Wax landing page

### Structure

- section heading
- accordion list of frequently asked questions

### Visual Rules

- clean accordion rows
- calm animation
- should integrate visually with the site, not look like default library UI

### Content Rules

- prioritize first-time client concerns
- include pricing, policies, prep, and comfort questions where relevant

---

## 11. Contact Information Block

### Purpose

Present salon contact details in a premium, uncluttered layout.

### Used On

- Contact page

### Required Content

- address
- hours
- phone
- email
- map or map embed area
- parking or arrival notes if available

### Visual Rules

- split layout preferred
- one side should hold structured contact information
- the other side should hold map or warm supporting image
- `Book Now` remains available but not visually aggressive

### Reference Alignment

- should follow the reference contact page’s calm, premium minimalism

---

## 12. CTA Banner

### Purpose

Close sections and pages with one clear next action.

### Used On

- Home
- About
- Services
- Prices
- Contact
- Brazilian Wax landing page

### Structure

- concise heading
- one short support line
- primary CTA
- optional secondary CTA

### Visual Rules

- stronger contrast than surrounding sections
- may use deep green as dominant treatment
- should feel premium, not pushy

### Rules

- one primary action only
- avoid cluttered multi-button decision fatigue

---

## 13. Site Footer

### Purpose

Provide closure, navigation, and business legitimacy.

### Structure

- logo or brand name
- page links
- contact summary
- legal and social links if used

### Visual Rules

- consistent with the neutral palette
- understated, not dense
- must still feel premium and intentional

---

## Page Assembly Rules

### Home

Recommended assembly:

1. Site Header
2. HeroEditorial
3. Trust Bar
4. Service Category Grid
5. Staff Spotlight Block
6. Testimonial Block
7. CTA Banner
8. Site Footer

### About

Recommended assembly:

1. Site Header
2. HeroEditorial
3. Editorial Split Section
4. Staff Spotlight Block or philosophy section
5. Testimonial Block
6. CTA Banner
7. Site Footer

### Services

Recommended assembly:

1. Site Header
2. HeroFunctional
3. Service Category Grid
4. Service Card groups
5. FAQ Block
6. CTA Banner
7. Site Footer

### Prices

Recommended assembly:

1. Site Header
2. HeroFunctional
3. Pricing Matrix Section
4. FAQ Block
5. CTA Banner
6. Site Footer

### Contact

Recommended assembly:

1. Site Header
2. HeroFunctional
3. Contact Information Block
4. FAQ Block or reassurance block
5. CTA Banner
6. Site Footer

### Brazilian Wax Landing Page

Recommended assembly:

1. Site Header
2. HeroConversion
3. Trust Bar
4. Service Card or pricing module
5. Reassurance / editorial split
6. FAQ Block
7. CTA Banner
8. Site Footer

---

## Consistency Requirements

- The same header, footer, CTA logic, and card language must appear across all public pages.
- Card spacing, radius, shadows, and text hierarchy must not drift between pages.
- Pricing display rules must remain consistent between Services, Prices, and conversion pages.
- Bilingual layout should not introduce visual imbalance or oversized UI chrome.
- Every page must visibly align with the reference site’s premium minimalism.

---

## Anti-Patterns

- default library-looking accordions, cards, or navbars
- inconsistent CTA styles between pages
- overuse of accent colors as large surfaces
- too many component variants too early
- building page-specific one-off sections when a reusable component would work
- copying the reference loosely and then drifting into unrelated SaaS styling

---

## Next Implementation Step

After this component specification, the next work item should be:

1. map these components into actual design tokens and naming conventions
2. scaffold the frontend structure
3. build Home first using only approved components
4. reuse the same components across About, Services, Prices, and Contact
