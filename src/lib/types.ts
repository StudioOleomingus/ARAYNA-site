// Shared shapes for content. Safe to import from client components.

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** Small uppercase line above the title, e.g. "Landscape and Interiors" */
  category: string;
  location: string;
  year: string;
  /** Path under /public, e.g. /projects/lohtse.jpg */
  image: string;
  alt: string;
  /** Focal point in % — keeps the important part of the photo in frame at every crop */
  focal: { x: number; y: number };
  published: boolean;
};

/** A pill on the projects page and the order of project ids it lays out. */
export type Arrangement = { id: string; label: string; order: string[] };

export type FontSource = "bundled" | "google" | "upload";
export type FontSetting = {
  source: FontSource;
  /** CSS family name. For "bundled" this is always Poppins. */
  family: string;
  /** Google only: weights to request, e.g. "300;400;500;600" */
  weights?: string;
  /** Upload only: path under /public, e.g. /fonts/my-font.woff2 */
  file?: string;
};

export type Site = {
  name: string;
  pageTitle: string;
  tagline: string;
  copyright: string;
  nav: { label: string; href: string }[];
  arrangements: Arrangement[];
  logo: {
    src: string;
    footerSrc: string; // empty = use the header logo
    headerHeight: number; // px
    footerHeight: number; // px
  };
  fonts: {
    body: FontSetting;
    heading: FontSetting & { weight: number };
  };
  contact: { heading: string; lines: string[] };
  social: { email?: string; linkedin?: string; instagram?: string };
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lay projects out in an arrangement's order. Anything the order doesn't
 * mention (e.g. a project added later) follows in the default order.
 */
export function arrange<T extends { id: string }>(items: T[], order?: string[]): T[] {
  if (!order) return items;
  const byId = new Map(items.map((p) => [p.id, p]));
  const placed = order.map((id) => byId.get(id)).filter(Boolean) as T[];
  const seen = new Set(placed.map((p) => p.id));
  return [...placed, ...items.filter((p) => !seen.has(p.id))];
}

/** Keep every arrangement's order in step with the project list. */
export function syncOrders(arrangements: Arrangement[], projects: { id: string }[]): Arrangement[] {
  return arrangements.map((a) => ({ ...a, order: arrange(projects, a.order).map((p) => p.id) }));
}

/** Only safe characters reach generated CSS. */
export const cleanFamily = (s: string) => s.replace(/[^A-Za-z0-9 \-]/g, "").trim();
