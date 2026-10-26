import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { editorEnabled, getAllProjects, getSite, saveProjects, saveSite } from "@/lib/content";
import { cleanFamily, syncOrders, type FontSetting, type Project, type Site } from "@/lib/types";

const off = () => NextResponse.json({ error: "Editor is only available in development" }, { status: 404 });
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });
const str = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d;
};
const assetPath = (v: unknown, dir: string) => {
  const s = str(v);
  return s === "" || new RegExp(`^/${dir}/[\\w.\\-]+$`).test(s) ? s : "";
};

export async function GET() {
  if (!editorEnabled) return off();
  return NextResponse.json({ projects: await getAllProjects(), site: await getSite() });
}

/** Saves the whole editor state: project list (in default order) + site settings. */
export async function PUT(req: Request) {
  if (!editorEnabled) return off();
  const body = (await req.json()) as { projects: Project[]; site: Site };
  if (!Array.isArray(body.projects) || !body.site) return bad("Expected { projects, site }");

  // ---- projects ----
  const seen = new Set<string>();
  const projects: Project[] = [];
  for (const p of body.projects) {
    const slug = str(p.slug);
    if (!str(p.title)) return bad("Every project needs a title");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return bad(`"${p.title}": slug may only use a–z, 0–9 and dashes`);
    if (seen.has(slug)) return bad(`Two projects share the slug "${slug}"`);
    seen.add(slug);
    projects.push({
      id: str(p.id),
      slug,
      title: str(p.title),
      category: str(p.category),
      location: str(p.location),
      year: str(p.year),
      image: str(p.image),
      alt: str(p.alt),
      focal: { x: num(p.focal?.x, 0, 100, 50), y: num(p.focal?.y, 0, 100, 50) },
      published: Boolean(p.published),
    });
  }

  // ---- site ----
  const s = body.site;
  const font = (f: FontSetting): FontSetting => {
    const source = (["bundled", "google", "upload"] as const).includes(f?.source) ? f.source : "bundled";
    return {
      source,
      family: source === "bundled" ? "Poppins" : cleanFamily(str(f.family)) || "Poppins",
      ...(source === "google" ? { weights: str(f.weights).replace(/[^\d;]/g, "") || "400" } : {}),
      ...(source === "upload" ? { file: assetPath(f.file, "fonts") } : {}),
    };
  };
  const site: Site = {
    name: str(s.name) || "Site",
    pageTitle: str(s.pageTitle),
    tagline: str(s.tagline),
    copyright: str(s.copyright),
    nav: (s.nav ?? []).map((n) => ({ label: str(n.label), href: str(n.href) })).filter((n) => n.label),
    arrangements: syncOrders(
      (s.arrangements ?? []).map((a) => ({ id: str(a.id), label: str(a.label), order: (a.order ?? []).map(String) })),
      projects
    ),
    logo: {
      src: assetPath(s.logo?.src, "brand"),
      footerSrc: assetPath(s.logo?.footerSrc, "brand"),
      headerHeight: num(s.logo?.headerHeight, 12, 96, 40),
      footerHeight: num(s.logo?.footerHeight, 12, 200, 56),
    },
    fonts: {
      body: font(s.fonts?.body),
      heading: { ...font(s.fonts?.heading), weight: num(s.fonts?.heading?.weight, 100, 900, 400) },
    },
    contact: { heading: str(s.contact?.heading), lines: (s.contact?.lines ?? []).map(str).filter(Boolean) },
    social: { email: str(s.social?.email), linkedin: str(s.social?.linkedin), instagram: str(s.social?.instagram) },
  };

  await saveProjects(projects);
  await saveSite(site);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, projects, site });
}
