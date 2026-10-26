import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { editorEnabled, getAllProjects, saveProjects } from "@/lib/content";
import type { Project } from "@/lib/types";

const off = () => NextResponse.json({ error: "Editor is only available in development" }, { status: 404 });

export async function GET() {
  if (!editorEnabled) return off();
  return NextResponse.json(await getAllProjects());
}

/** Replaces the whole list — covers create, edit, delete and reorder in one call. */
export async function PUT(req: Request) {
  if (!editorEnabled) return off();
  const body = (await req.json()) as Project[];
  if (!Array.isArray(body)) return NextResponse.json({ error: "Expected a list of projects" }, { status: 400 });

  const seen = new Set<string>();
  const clean: Project[] = [];
  for (const p of body) {
    const slug = String(p.slug ?? "").trim();
    if (!p.title?.trim()) return NextResponse.json({ error: "Every project needs a title" }, { status: 400 });
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      return NextResponse.json({ error: `"${p.title}": slug may only use a–z, 0–9 and dashes` }, { status: 400 });
    if (seen.has(slug)) return NextResponse.json({ error: `Two projects share the slug "${slug}"` }, { status: 400 });
    seen.add(slug);
    clean.push({
      id: String(p.id),
      slug,
      title: p.title.trim(),
      category: String(p.category ?? "").trim(),
      location: String(p.location ?? "").trim(),
      year: String(p.year ?? "").trim(),
      strand: String(p.strand ?? ""),
      image: String(p.image ?? ""),
      alt: String(p.alt ?? "").trim(),
      focal: {
        x: Math.min(100, Math.max(0, Math.round(Number(p.focal?.x ?? 50)))),
        y: Math.min(100, Math.max(0, Math.round(Number(p.focal?.y ?? 50)))),
      },
      published: Boolean(p.published),
    });
  }

  await saveProjects(clean);
  revalidatePath("/projects", "layout");
  return NextResponse.json({ ok: true, count: clean.length });
}
