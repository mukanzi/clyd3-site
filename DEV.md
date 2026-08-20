# CLYD3 Site - Developer Documentation

> Living technical reference for the CLYD3 personal website.

**Repository:** `mukanzi/clyd3-site`  
**Production domain:** `clyd3.com`  
**Hosting target:** GitHub Pages  
**Current stage:** Homepage V0.2 / foundation build  
**Stack:** HTML5, CSS3, vanilla JavaScript

---

## 1. Project Purpose

CLYD3 is being built as a personal digital home rather than a conventional portfolio site. The long-term intent is to create a lightweight, highly authored digital archive that can hold professional work, technical experiments, photography, notes, essays, and other creative material within one coherent design system.

The site began with a practical constraint: use the existing `clyd3.com` domain with no additional recurring hosting cost. That led to the current static-site architecture using GitHub Pages.

Current positioning:

> An evolving archive of work, experiments, photographs and things worth remembering.

---

## 2. Architecture Overview

```text
clyd3.com
   |
   v
Authoritative DNS
(currently HostGator)
   |
   v
GitHub Pages
   |
   v
mukanzi/clyd3-site
   |
   +-- index.html
   +-- css/style.css
   +-- js/main.js
   +-- assets/
```

The application is intentionally static. There is currently no server-side runtime, framework, package manager, database, authentication layer, or build process.

### Why this architecture

- zero additional hosting cost
- simple GitHub Pages deployment
- minimal performance overhead
- easy debugging
- no framework lock-in
- direct control over markup, CSS, and interaction behaviour
- suitable for the current content model

---

## 3. Repository Structure

Current structure:

```text
clyd3-site/
|
+-- CNAME
+-- README.md
+-- DEV.md
+-- index.html
+-- about.html
+-- projects.html
+-- contact.html
+-- main.js                 # legacy/root placeholder; not the active script
+-- style.css               # legacy/root placeholder; not the active stylesheet
+-- css/
|   +-- style.css           # active stylesheet
+-- js/
|   +-- main.js             # active JavaScript
+-- assets/
```

### Active entry points

- `index.html` - active homepage
- `css/style.css` - active visual system
- `js/main.js` - active interaction layer
- `CNAME` - GitHub Pages custom-domain declaration

The early placeholder pages (`about.html`, `projects.html`, `contact.html`) are not yet part of the mature information architecture and may be replaced, renamed, or removed.

---

## 4. Local Development

Because the site is static, any local HTTP server is sufficient.

### Python

From the repository root:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### VS Code Live Server

1. Open the repository in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Hard refresh

When CSS or JavaScript changes appear cached:

```text
Ctrl + Shift + R
```

---

## 5. Design System

The current visual direction combines:

- editorial minimalism
- digital systems/interface language
- personal archive structure
- subtle contemporary African creative sensibility

The site deliberately avoids a generic developer-portfolio visual pattern.

### Core principles

1. Typography should carry more identity than decorative imagery.
2. Motion should communicate state, depth, hierarchy, or discovery.
3. Teal represents the normal/active system state.
4. Crimson is reserved primarily for interaction, anomaly, or discovery.
5. Whitespace is structural, not empty.
6. The site should feel authored rather than templated.
7. The website itself is part of the creative practice, not only a container for projects.

---

## 6. Design Tokens

The active stylesheet centralizes key values in `:root`.

Current palette:

```css
--paper: #f1efe8;
--ink: #111111;
--soft-ink: #5f5d57;
--line: rgba(17, 17, 17, 0.18);
--line-soft: rgba(17, 17, 17, 0.09);
--teal: #0d7c78;
--crimson: #a63d45;
--white: #ffffff;
```

### Semantic colour roles

| Token | Role |
|---|---|
| `--paper` | page background / editorial surface |
| `--ink` | primary text and structural geometry |
| `--soft-ink` | metadata and secondary text |
| `--teal` | active state, navigation, system signal |
| `--crimson` | interaction, discovery, anomaly |

### Spacing tokens

```css
--gutter: clamp(20px, 4vw, 64px);
--section-pad: clamp(84px, 10vw, 160px);
```

Use the existing variables before introducing new one-off values.

---

## 7. Typography

Three Google Fonts currently define the visual system:

### Inter

Primary sans-serif used for:

- large hero typography
- section headings
- navigation
- cards
- body copy

### Libre Caslon Display

Expressive serif used sparingly to introduce editorial/cultural contrast, most visibly in the hero phrase `& culture.`

### DM Mono

Technical/archival metadata face used for:

- section numbers
- coordinates
- status labels
- navigation numbering
- signal-field labels
- footer metadata

Fonts are currently loaded through a Google Fonts `@import` in `css/style.css`.

---

## 8. Homepage Information Architecture

Current homepage sequence:

```text
001  Digital Home / Hero
002  Index
003  Selected Work
004  About
005  Archive
006  Notes
007  Contact
```

### Primary content pathways

- **Work** - projects, systems, analysis, real-world problem solving
- **Lab** - prototypes, code studies, experiments, unfinished ideas
- **Archive** - photography and visual observations
- **Notes** - essays, frameworks, questions, learning, observations
- **About** - context and philosophy behind the site

Primary navigation currently exposes:

```text
01 Index
02 Work
03 Archive
04 Notes
05 About
```

Contact is intentionally omitted from primary navigation and remains a lower-page utility.

---

## 9. Brand System

### V0.1

The initial brand mark used a circular `C` beside the `CLYD3` wordmark.

### V0.2

The current mark is an orbital C3 system consisting of:

- circular orbit
- central `C3`
- internal diagonal geometry
- small active node

Hover behaviour:

- orbit rotates
- node moves
- node transitions from teal to crimson

The goal is to visually connect the brand mark with the larger C3 signal-field component in the hero.

---

## 10. Hero System

Current headline:

> Building at the intersection of ideas, systems & culture.

The typographic hierarchy intentionally combines:

- large Inter sans-serif
- teal highlight on `ideas`
- Libre Caslon Display italic for `& culture.`

Supporting statement:

> An evolving archive of work, experiments, photographs and things worth remembering.

Hero metadata currently includes:

- `Independent digital archive`
- `Signal / work / memory`
- current year

---

## 11. C3 Signal Field

The hero's right-hand visual is not intended to be a static illustration. It is a small interactive system interface.

### Current elements

- concentric rings
- X/Y axes
- diagonal axes
- conic/radial field texture
- radar sweep
- central C3 core
- six positioned nodes
- SVG connection lines
- live-state label
- pointer coordinates
- technical field labels

### Node depth

Nodes use `data-depth` attributes such as:

```html
<span class="signal-node node-a" data-depth="0.9"></span>
<span class="signal-node node-b" data-depth="1.2"></span>
```

The value controls pointer-parallax intensity.

### Interaction state

On hover, selected nodes transition to crimson. This reinforces crimson's role as an interaction/discovery colour rather than a persistent decorative accent.

---

## 12. JavaScript Behaviour

The active script is `js/main.js`.

It currently has five responsibilities.

### 12.1 Initial reveal

On `DOMContentLoaded`, the `is-loading` class is removed and hero elements are revealed with a staggered delay.

### 12.2 Mobile navigation

`.menu-toggle` controls the `.open` state of the primary navigation and updates `aria-expanded`.

### 12.3 Scroll reveal

An `IntersectionObserver` reveals `.reveal` elements once they enter the viewport and unobserves them after activation.

### 12.4 Signal-field pointer interaction

Pointer coordinates are normalized around the centre of the field:

```text
left  -> negative X
right -> positive X
top   -> negative Y
bottom-> positive Y
```

The normalized values update:

- field translation
- individual node offsets
- visible coordinate label

Each node moves according to its own depth multiplier.

### 12.5 Dynamic year

The footer year is populated from `new Date().getFullYear()`.

---

## 13. Motion and Accessibility

Motion is intended to be subtle and functional.

Current motion includes:

- hero entrance sequence
- scroll reveal
- navigation/link hover movement
- signal radar sweep
- C3 core breathing
- system status pulse
- pointer parallax
- node colour changes

### Reduced motion

The stylesheet includes:

```css
@media (prefers-reduced-motion: reduce)
```

JavaScript also checks:

```js
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

Pointer-based signal motion is disabled when reduced motion is requested.

Future accessibility work should include:

- explicit keyboard focus states
- contrast audit
- full keyboard navigation testing
- image alt-text rules
- semantic review as content pages are added

---

## 14. Responsive Behaviour

Primary breakpoints currently occur around:

```text
1050px
760px
```

### Tablet/intermediate layout

- hero becomes single-column
- C3 field centres below copy
- index cards move from four columns to two
- multi-column content sections collapse

### Mobile layout

- background grid is removed
- desktop status display is hidden
- mobile menu is enabled
- hero becomes vertically stacked
- index becomes one column
- project metadata is reduced
- archive/notes panels stack
- footer is simplified

Use fluid sizing (`clamp()`, grid, flexbox) before adding additional breakpoints.

---

## 15. CSS Organization

`css/style.css` is currently organized conceptually as:

```text
Imports
Root variables
Reset/global styles
Page grid
Shared containers
Header
Brand
Navigation
Hero
Signal field
Hero metadata
Index
Selected work
About statement
Archive / Notes panels
Contact
Footer
Reveal states
Keyframes
Tablet breakpoint
Mobile breakpoint
Reduced motion
```

When adding new components, preserve this section-based organization unless the file becomes large enough to justify splitting into modules.

---

## 16. Deployment

GitHub Pages is the intended production host.

The repository contains:

```text
CNAME -> clyd3.com
```

The intended DNS records are:

```text
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
CNAME  www    mukanzi.github.io
```

### Current DNS status

At the time of this document, HostGator DNS has not yet resolved correctly from public resolvers. Tests against Google DNS, Cloudflare DNS, and the advertised HostGator authoritative nameservers returned `SERVFAIL`, timeout, or refused responses.

DNSSEC is disabled.

Development is continuing locally while HostGator is given time to provision/propagate the zone.

If the issue persists, using Cloudflare's free authoritative DNS remains the preferred fallback while retaining HostGator as registrar.

Do not change GitHub Pages custom-domain configuration while troubleshooting unless there is clear evidence it is incorrect.

---

## 17. Development Workflow

Preferred iteration loop:

```text
Design decision
    -> update HTML/CSS/JS
    -> commit to main
    -> refresh local preview
    -> review render
    -> capture screenshot
    -> critique and refine
```

### Current branch model

Development has so far occurred directly on `main` because the project is still in an early solo-build phase.

As the site becomes more complex, move toward:

```text
main
feature/<name>
fix/<name>
content/<name>
```

with pull requests for larger changes.

---

## 18. Version History

### V0.0 - Placeholder

- basic repository structure
- `Welcome.` / `under construction` homepage
- minimal CSS
- trivial JavaScript

### V0.1 - First complete homepage

Added:

- editorial homepage
- full navigation
- CLYD3 mark
- hero typography
- basic orbital diagram
- index cards
- selected work section
- about statement
- archive/notes previews
- contact/footer
- responsive layout
- reveal animation

### V0.2 - Interactive system identity

Added/refined:

- orbital C3 brand mark
- numbered navigation
- `CLYD3 SYSTEM / ONLINE` status
- hero typography rebalance
- shortened hero supporting statement
- larger and more complex signal field
- six parallax nodes
- radar sweep
- dynamic coordinates
- live-state label
- depth-based pointer motion
- crimson interaction semantics

Suggested future release labels:

```text
v0.5  Core content architecture
v0.9  Pre-launch
v1.0  Public launch
```

---

## 19. Known Technical Debt

### Legacy root files

There are root-level placeholder files (`style.css`, `main.js`) in addition to the active files under `css/` and `js/`. These should be removed once there is no risk of depending on them.

### Placeholder pages

`about.html`, `projects.html`, and `contact.html` are currently effectively placeholders.

### Placeholder links

Selected-work rows currently use `href="#"` and do not yet point to case studies.

### Contact

No contact form or external contact endpoint has been implemented.

### Content publishing

No final publishing workflow exists yet for Notes or Archive content.

### SEO

Only baseline page title and description metadata are present.

### Analytics

No analytics are installed.

### Performance

Formal Lighthouse/Core Web Vitals testing has not yet been completed.

---

## 20. Recommended Next Technical Steps

1. Review V0.2 at desktop, laptop, tablet, and mobile sizes.
2. Refine the lower homepage sections to match the quality of the hero.
3. Remove or consolidate legacy root CSS/JS files.
4. Build the first real Work case study.
5. Define image handling and compression rules for Archive.
6. Decide on a publishing model for Notes.
7. Build the final About structure.
8. Resolve DNS and enable HTTPS.
9. Add favicons and Open Graph metadata.
10. Run accessibility, browser, and Lighthouse audits before V1.0.

---

## 21. Long-Term Information Architecture

```text
CLYD3
|
+-- Index
+-- Work
|   +-- Data & Impact
|   +-- Digital Systems
|   +-- Creative Projects
+-- Lab
|   +-- Code experiments
|   +-- Web experiments
|   +-- Visual studies
+-- Archive
|   +-- Photography
|   +-- Places
|   +-- Collections
+-- Notes
|   +-- Essays
|   +-- Ideas
|   +-- Frameworks
|   +-- Learning
+-- About
    +-- Contact
```

This architecture is directional rather than fixed. The site should remain flexible enough to evolve as the content grows.

---

## 22. Engineering Principles

- Prefer native web platform capabilities before adding dependencies.
- Do not add a framework without a concrete problem that requires it.
- Keep interactions understandable without JavaScript where practical.
- Treat performance as a design constraint.
- Keep colour and motion semantic.
- Avoid third-party scripts unless they provide clear value.
- Preserve reduced-motion behaviour.
- Use reusable CSS variables rather than duplicated hard-coded design values.
- Keep mobile behaviour intentional, not merely compressed desktop layout.
- Maintain CLYD3 as an authored system rather than a template-driven portfolio.

---

## 23. Definition of V1.0

V1.0 should not be declared until:

- `clyd3.com` resolves reliably over HTTPS
- homepage is stable across common screen sizes
- navigation is consistent site-wide
- several real Work entries exist
- Archive has an initial photography collection
- Notes has initial published material
- About is complete
- accessibility has been reviewed
- SEO/social metadata are complete
- browser compatibility is verified
- performance has been measured and optimized
- no placeholder links or under-construction content remain in the primary experience

---

## 24. Maintenance Note

This file is a living document. Update it whenever a change materially affects:

- architecture
- build/deployment workflow
- design tokens
- component behaviour
- information architecture
- domain/DNS setup
- release state

Minor content edits do not require a documentation update unless they change the underlying content model.
