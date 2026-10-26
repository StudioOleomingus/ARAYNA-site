import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { editorEnabled } from "@/lib/content";
import { slugify } from "@/lib/types";

/**
 * kind=project → resized JPG in public/projects/
 * kind=logo    → SVG kept as-is, PNG/WebP kept transparent, in public/brand/
 * kind=font    → woff2/woff/ttf/otf copied to public/fonts/
 */
const MAX_EDGE = 2400;
const stamp = () => Date.now().toString(36);
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

async function put(dir: string, name: string, data: Buffer | string) {
  const abs = path.join(process.cwd(), "public", dir);
  await fs.mkdir(abs, { recursive: true });
  await fs.writeFile(path.join(abs, name), data);
  return `/${dir}/${name}`;
}

export async function POST(req: Request) {
  if (!editorEnabled) return NextResponse.json({ error: "Not available" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "project");
  const base = slugify(String(form.get("slug") || kind)) || kind;
  if (!(file instanceof File)) return bad("No file received");
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const input = Buffer.from(await file.arrayBuffer());

  try {
    if (kind === "font") {
      if (!["woff2", "woff", "ttf", "otf"].includes(ext)) return bad("Fonts must be .woff2, .woff, .ttf or .otf");
      const family = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/[^A-Za-z0-9 ]/g, "").trim();
      const p = await put("fonts", `${slugify(family) || "font"}-${stamp()}.${ext}`, input);
      return NextResponse.json({ path: p, family });
    }

    if (kind === "logo") {
      if (ext === "svg" || file.type === "image/svg+xml") {
        let svg = input.toString("utf8");
        if (!/<svg[\s>]/i.test(svg)) return bad("That SVG couldn't be read");
        // strip anything executable
        svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*(".*?"|'.*?')/gi, "");
        return NextResponse.json({ path: await put("brand", `${base}-${stamp()}.svg`, svg) });
      }
      if (!file.type.startsWith("image/")) return bad("Logos must be SVG, PNG or WebP");
      const out = await sharp(input).resize({ height: 600, width: 2400, fit: "inside", withoutEnlargement: true }).png().toBuffer();
      return NextResponse.json({ path: await put("brand", `${base}-${stamp()}.png`, out) });
    }

    if (!file.type.startsWith("image/")) return bad("That file isn't an image");
    const { data, info } = await sharp(input)
      .rotate() // respect camera orientation
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    const p = await put("projects", `${base}-${stamp()}.jpg`, data);
    return NextResponse.json({ path: p, width: info.width, height: info.height });
  } catch {
    return bad("Couldn't read that file");
  }
}
