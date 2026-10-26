import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { editorEnabled } from "@/lib/content";
import { slugify } from "@/lib/types";

const MAX_EDGE = 2400; // big enough for a full-bleed hero later, small enough for git

export async function POST(req: Request) {
  if (!editorEnabled) return NextResponse.json({ error: "Not available" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const base = slugify(String(form.get("slug") || "project")) || "project";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "That file isn't an image" }, { status: 400 });

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const { data, info } = await sharp(input)
      .rotate() // respect camera orientation
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    const name = `${base}-${Date.now().toString(36)}.jpg`;
    const dir = path.join(process.cwd(), "public", "projects");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), data);

    return NextResponse.json({ path: `/projects/${name}`, width: info.width, height: info.height });
  } catch {
    return NextResponse.json({ error: "Couldn't read that image (try JPG, PNG or WebP)" }, { status: 400 });
  }
}
