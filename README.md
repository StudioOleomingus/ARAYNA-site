# aranya — site

Next.js 16 (App Router) · React 19 · plain CSS with design tokens · content in JSON.

## Run it

```bash
npm install
npm run dev
```

- Projects page → http://localhost:3000/projects
- Editor → http://localhost:3000/admin  (only exists while `npm run dev` is running)

## Editing content — `/admin` (three tabs)

**Projects** — add, edit, duplicate, delete; drop in images and click the photo to set its focal point.
New projects start as **Draft** (hidden) until switched to Published. The list order is the default order.

**Arrangements** — each pill on the projects page (Wild / Entangled / Rooted) re-deals every project
into its own order. Pick an arrangement and drag tiles (or use ← →). "Default" is the order before any
pill is pressed. New projects are appended to the end of every arrangement.

**Site & type** — logo (header, optional separate footer logo, heights), fonts (bundled Poppins,
any Google Font by name, or an uploaded .woff2/.ttf/.otf), page title, tagline, pill labels, navigation,
footer address, social links, copyright.

Press **Save** (or Ctrl/⌘ + S) — this writes `content/projects.json` and `content/site.json`.
Uploads land in `public/projects/`, `public/brand/` and `public/fonts/` straight away.
Then commit and push; Vercel rebuilds the live site in about a minute.

Removing a project or logo doesn't delete its file; tidy those folders by hand when you want to.

## Where things live

| What | File |
|---|---|
| Colours, type scale, spacing, card ratio | `src/app/globals.css` (`:root` tokens) |
| Project list | `content/projects.json` |
| Logo, fonts, page text, nav, arrangements (pill labels + orders), contact, socials | `content/site.json` |
| Card | `src/components/ProjectCard.tsx` + `.module.css` |
| Grid, pills, re-arrange animation | `src/components/ProjectGrid.tsx` + `.module.css` |
| Header / footer | `src/components/SiteHeader.tsx`, `SiteFooter.tsx` |
| Font settings → CSS | `src/lib/fonts.ts` |
| Projects page | `src/app/projects/page.tsx` |
| Project page (stub) | `src/app/projects/[slug]/page.tsx` |
| Editor | `src/app/admin/` (Editor, ProjectsTab, ArrangementsTab, SiteTab) + `src/app/api/admin/` |
| Reading/writing content | `src/lib/content.ts` (swap this to move to a CMS later) |

## Grid behaviour

| Width | Layout |
|---|---|
| ≥ 820px | 3 columns, a pill centred over each |
| 520–819px | 2 columns, sticky pill bar |
| < 520px | 1 column, sticky pill bar |

The order always reads left→right, top→bottom, so an arrangement keeps its sequence at every width.
Cards keep a 3:4 ratio; the focal point keeps the subject in frame.

Pressing a pill re-orders the cards and each one glides to its new slot (FLIP animation, staggered in
reading order). Pressing the active pill again returns to the default order. Timing: `DURATION`, `STAGGER`
and `EASE` at the top of `ProjectGrid.tsx`. The pressed-pill style is `.pill[aria-pressed="true"]` in
`ProjectGrid.module.css`.

## Page transitions

Card images and the project-page hero share a `<ViewTransition name="project-{slug}">`, so the thumbnail
morphs into the hero on navigation. Timing lives in `globals.css` (`::view-transition-group`).

## Deploying

1. Push this folder to a GitHub repo.
2. Import it at vercel.com → "New Project". No settings needed.
3. Every push to `main` deploys; every other branch gets its own preview URL.

## Later

- **Editing on the live site / by non-technical people:** swap the local editor for a git-based CMS
  (Keystatic or TinaCMS) so edits commit to GitHub from the browser. Only `src/lib/content.ts` needs to change.
- **Intro page:** replaces the redirect in `src/app/page.tsx`.
- **Heavier motion** (scroll-linked, WebGL, drag): add Motion or GSAP alongside the view transitions.
