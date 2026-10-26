// Shared shapes for content. Safe to import from client components.

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** Small uppercase line above the title, e.g. "Landscape and Interiors" */
  category: string;
  location: string;
  year: string;
  /** Which column the project sits in: matches an id in site.json → strands */
  strand: string;
  /** Path under /public, e.g. /projects/lohtse.jpg */
  image: string;
  alt: string;
  /** Focal point in % — keeps the important part of the photo in frame at every crop */
  focal: { x: number; y: number };
  published: boolean;
};

export type Strand = { id: string; label: string };

export type Site = {
  name: string;
  tagline: string;
  nav: { label: string; href: string }[];
  strands: Strand[];
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
