# aranya — site

Next.js 16 (App Router) · React 19 · plain CSS with design tokens · content in JSON.

## Run it

```bash
npm install
npm run dev
```

- Projects page → http://localhost:3000/projects
- Editor → http://localhost:3000/admin  (only exists while `npm run dev` is running)

## Updating projects

1. `npm run dev`, open `/admin`.
2. Add / edit / delete / reorder projects, drop in images, click the photo to set its focal point.
3. **Save** (or Ctrl/⌘ + S). This writes `content/projects.json`; uploaded images are resized to 2400px max and saved in `public/projects/`.
4. Commit and push. If the repo is connected to Vercel, the live site rebuilds itself in about a minute.

New projects start as **Draft** (hidden) until you switch them to Published.
Deleting a project doesn't delete its image file; clean up `public/projects/` by hand when you want to.

## Where things live

| What | File |
|---|---|
| Colours, type scale, spacing, card ratio | `src/app/globals.css` (`:root` tokens) |
| Project list | `content/projects.json` |
| Tagline, nav, strand names (Wild / Entangled / Rooted), contact, socials | `content/site.json` |
| Card | `src/components/ProjectCard.tsx` + `.module.css` |
| Grid + filter pills | `src/components/ProjectGrid.tsx` + `.module.css` |
| Header / footer / logo | `src/components/SiteHeader.tsx`, `SiteFooter.tsx`, `Wordmark.tsx` |
| Projects page | `src/app/projects/page.tsx` |
| Project page (stub) | `src/app/projects/[slug]/page.tsx` |
| Editor | `src/app/admin/` + `src/app/api/admin/` |
| Reading/writing content | `src/lib/content.ts` (swap this to move to a CMS later) |

**Logo:** put `logo.svg` in `public/brand/` and follow the comment in `src/components/Wordmark.tsx`.

## Grid behaviour

| Width | Layout |
|---|---|
| ≥ 820px | One column per strand; pills are column heads and spotlight a column when clicked |
| 520–819px | 2 columns; pills become a sticky filter bar with "All" |
| < 520px | 1 column; same filter bar |

Cards keep a 3:4 ratio at every width; the focal point keeps the subject in frame.

## Transitions

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
