// Turns the font settings in site.json into CSS. Used by the site layout and
// by the editor's live preview, so both always agree.
import { cleanFamily, type FontSetting, type Site } from "./types";

const FALLBACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function family(f: FontSetting) {
  if (f.source === "bundled") return "Poppins";
  return cleanFamily(f.family) || "Poppins";
}

/** Google Fonts stylesheet URL, or null if this setting doesn't need one. */
export function googleHref(f: FontSetting): string | null {
  if (f.source !== "google") return null;
  const fam = cleanFamily(f.family);
  if (!fam) return null;
  const weights = (f.weights || "400")
    .split(/[;,\s]+/)
    .filter((w) => /^\d{3}$/.test(w))
    .sort()
    .join(";");
  return `https://fonts.googleapis.com/css2?family=${fam.replace(/ /g, "+")}${weights ? `:wght@${weights}` : ""}&display=swap`;
}

function fontFace(f: FontSetting) {
  if (f.source !== "upload" || !f.file || !/^\/fonts\/[\w.\-]+$/.test(f.file)) return "";
  const ext = f.file.split(".").pop()!.toLowerCase();
  const format = { woff2: "woff2", woff: "woff", ttf: "truetype", otf: "opentype" }[ext] ?? "woff2";
  return `@font-face{font-family:"${family(f)}";src:url("${f.file}") format("${format}");font-weight:100 900;font-style:normal;font-display:swap;}`;
}

/**
 * CSS that sets --font / --font-display / --fw-display.
 * `scope` lets the editor apply it to a preview box instead of the whole page.
 */
export function fontCss(fonts: Site["fonts"], scope = ":root") {
  const body = family(fonts.body);
  const heading = family(fonts.heading);
  const weight = Math.min(900, Math.max(100, Math.round((fonts.heading.weight || 400) / 100) * 100));
  return [
    fontFace(fonts.body),
    fonts.heading.file !== fonts.body.file ? fontFace(fonts.heading) : "",
    `${scope}{--font:"${body}",${FALLBACK};--font-display:"${heading}",var(--font);--fw-display:${weight};}`,
  ].join("");
}

export function fontLinks(fonts: Site["fonts"]) {
  return [...new Set([googleHref(fonts.body), googleHref(fonts.heading)].filter(Boolean) as string[])];
}
