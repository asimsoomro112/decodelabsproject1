# CourseHub

**The interface layer ("the skin") of the CourseHub series.** A responsive, accessible course-discovery frontend built with pure HTML5, CSS3 and vanilla JavaScript — no frameworks, no build step, no external JS/CSS libraries.

DecodeLabs Full Stack Development Industrial Training Kit · Batch 2026 · **Project 1: Responsive Frontend Interface**

Later projects in the series add a backend API and a database behind this interface. The Join page already anticipates that: *"Saved on this device. A real backend arrives in Project 2."*

## What and why

CourseHub answers one discovery question: **how might we help a busy learner choose the right course in under 30 seconds on a phone?** Every decision — thumb-sized tap targets, level/duration filters in a bottom-reachable drawer, level + hours + outcomes on every card, zero layout shift — traces back to that.

The design language is **liquid glass on a warm palette** (Mocha Mousse, Ethereal Blue, Moonlit Grey) with an "Espresso Night" dark theme: calm, grounded, and readable instead of sterile tech.

## File tree

```
coursehub/
├── index.html          Home — hero, benefits, featured courses, stats, CTA
├── courses.html        Catalog — search / filter / sort / save / details dialog (+ JSON-LD)
├── blueprint.html      Design process — discovery, wireframes, semantics, style, logic, audit
├── audit.html          Live in-page audit — LCP/CLS gauges + DOM checklist
├── join.html           Waitlist form — full validation, saved to localStorage
├── css/
│   └── styles.css      Design system — @layer reset, tokens, base, layout,
│                       components, glass, motion, utilities
├── js/
│   ├── data.js         9 courses — single source of truth
│   ├── app.js          Theme, pointer glow, breakpoint watcher, toasts,
│                       nav condense, count-ups, featured cards, reveals
│   ├── courses.js      Filter/sort/save/dialog (one state object + pure render)
│   ├── join.js         Constraint Validation API + custom messages + summary
│   ├── blueprint.js    Landmark + grayscale toggles
│   └── audit.js        PerformanceObserver LCP/CLS + DOM checks
├── assets/
│   ├── favicon.svg
│   └── og-cover.svg    Source for og:image — convert to assets/og-cover.png (1200×630)
├── README.md
└── .gitignore
```

## How to run

**Option A — double-click:** open `index.html` directly. The site uses classic `<script defer>` (no ES modules) and never `fetch()`es local files, so `file://` works fully.

**Option B — local server (recommended for the full experience):**

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000 (or :8000).

## Deploy

**GitHub Pages**
1. Push this folder to a repo (e.g. `coursehub`).
2. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.
3. Your site is live at `https://<you>.github.io/coursehub/`.

**Vercel (static)**
1. `npx vercel` in this folder, or drag-drop the folder at vercel.com/new.
2. No build command, no output directory — it's static. Done.

Before deploying, convert `assets/og-cover.svg` → `assets/og-cover.png` at exactly 1200×630 (any SVG→PNG tool), since the meta tags reference the PNG.

## Kit standards → where they live

| Kit standard | Implementation |
|---|---|
| Semantic HTML5 landmarks | `header/nav/main/article/footer` + `section/aside/figure` on all 5 pages; one `h1` per page; skip link; `lang="en"` |
| CSS Grid macro / Flexbox micro | `.courses-layout` named areas (`header/sidebar/main/footer`); nav, buttons, chips, card actions in Flexbox |
| Container Queries | `.card-wrap` is the container; cards switch stacked ↔ horizontal at 560px of *their own* width |
| Mobile-first, 768px / 1024px only | Base = single column; exactly two `min-width` breakpoints |
| Fluid type with `clamp()` | h1/h2/lede/section spacing all use `clamp()` |
| Mocha/Ethereal/Moonlit palette | oklch tokens; mocha & ethereal restricted to surfaces/accents |
| Contrast ≥ 4.5:1, ratios reported | Espresso on Moonlit **14.04:1**, Mocha-ink on Moonlit **5.67:1**, Moonlit on Espresso-night **15.90:1**, Ethereal on Espresso-night **11.20:1** (measured, in `blueprint.html`) |
| Max 2 font families / 3 weights | Montserrat 600+700, Open Sans 400+600 — one Google Fonts link |
| Grayscale golden rule | `blueprint.html` has a "Grayscale test" toggle applying `grayscale(1)` to the whole page |
| No frameworks | Zero dependencies; verified with `node --check` and stub-DOM tests |
| WCAG 2.2 AA | Labels on all inputs, 44px+ targets, visible focus, `aria-live` regions, `prefers-reduced-motion/transparency`, `forced-colors` + `prefers-contrast` fallbacks |
| LCP < 2.5s / CLS < 0.1 | Inline SVG thumbnails (no heavy images), `aspect-ratio`/`width+height` everywhere, fallback font metrics (`size-adjust`, `ascent-override`); measured live on `audit.html` |
| View Transitions | `@view-transition { navigation: auto }` + shared `nav-capsule` / `brand-mark`; degrades gracefully |

## Lighthouse results

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| index.html | _run and fill in_ | _run and fill in_ | _run and fill in_ | _run and fill in_ |
| courses.html | _run and fill in_ | _run and fill in_ | _run and fill in_ | _run and fill in_ |

Run from DevTools → Lighthouse → Mobile, on the deployed URL (not `file://`). Targets: Performance 95+, Accessibility 100, Best Practices 100, SEO 100. The `audit.html` page gives you live LCP/CLS numbers in the meantime.

## What I learned

- **Container queries need per-card containers.** Querying the grid measured the whole row and would have flipped narrow cards into a broken horizontal layout. Wrapping each card in its own `.card-wrap` container fixed it — the textbook pattern, learned the hard way during self-review.
- **`view-transition-name` must be unique per snapshot.** Naming all five nav capsules meant the browser captured the invisible first one; only the *active* link's capsule carries the name now.
- **Contrast is a design material, not a checkbox.** Deriving mocha-ink (#7A5648, 5.67:1) from Mocha Mousse kept the warm palette while the raw mocha (3.38:1) stayed decorative — measuring with a script instead of eyeballing it.
- **Real `<dialog>`, real radios, real validation.** The platform already does focus trapping, `aria-pressed` patterns and the Constraint Validation API — the JS is mostly wiring, not reinventing.
- **Test the logic even without a browser.** A 60-line DOM stub let me execute the actual page scripts in Node: 29 assertions on filtering, sorting, saving, dialogs and form validation.
