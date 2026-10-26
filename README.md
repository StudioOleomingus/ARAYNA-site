
// Next.js 16 · React 19 · plain CSS · content in JSON.

// To run:

```bash
npm install
npm run dev
```

- Projects / Menu page : http://localhost:3000/projects
- CRUD : http://localhost:3000/admin  (only exists while `npm run dev` is running)

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


Oct 26.
