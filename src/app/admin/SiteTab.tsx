"use client";

import { useRef, useState } from "react";
import { fontCss, fontLinks } from "@/lib/fonts";
import type { FontSetting, FontSource, Site } from "@/lib/types";
import { uploadFile } from "./shared";
import s from "./editor.module.css";

type Props = {
  site: Site;
  setSite: React.Dispatch<React.SetStateAction<Site>>;
  note: (m: string) => void;
  fail: (m: string) => void;
};

export default function SiteTab({ site, setSite, note, fail }: Props) {
  const patch = (p: Partial<Site>) => setSite((st) => ({ ...st, ...p }));
  const patchLogo = (p: Partial<Site["logo"]>) => setSite((st) => ({ ...st, logo: { ...st.logo, ...p } }));

  return (
    <div className={s.siteBody}>
      <nav className={s.siteToc}>
        <a href="#logo">Logo</a>
        <a href="#type">Typography</a>
        <a href="#text">Text</a>
      </nav>

      <div className={s.siteMain}>
        {/* ================= LOGO ================= */}
        <section id="logo" className={s.panel}>
          <h2>Logo</h2>
          <p className={s.panelNote}>SVG is best (stays sharp at any size). PNG or WebP with a transparent background also work.</p>

          <LogoSlot
            label="Header"
            bg="var(--c-forest)"
            src={site.logo.src}
            height={site.logo.headerHeight}
            max={96}
            onUpload={(path) => patchLogo({ src: path })}
            onRemove={() => patchLogo({ src: "" })}
            onHeight={(h) => patchLogo({ headerHeight: h })}
            note={note}
            fail={fail}
          />

          <LogoSlot
            label="Footer"
            bg="var(--c-night)"
            src={site.logo.footerSrc || site.logo.src}
            inherited={!site.logo.footerSrc && !!site.logo.src}
            height={site.logo.footerHeight}
            max={200}
            uploadLabel={site.logo.footerSrc ? "Replace" : "Use a different logo"}
            removeLabel={site.logo.footerSrc ? "Use header logo" : undefined}
            onUpload={(path) => patchLogo({ footerSrc: path })}
            onRemove={() => patchLogo({ footerSrc: "" })}
            onHeight={(h) => patchLogo({ footerHeight: h })}
            note={note}
            fail={fail}
          />
        </section>

        {/* ================= TYPE ================= */}
        <section id="type" className={s.panel}>
          <h2>Typography</h2>
          <p className={s.panelNote}>
            Body text is used for navigation, captions and paragraphs. Headings cover the page title, card titles and
            project titles.
          </p>
          <div className={s.fontGrid}>
            <FontPicker
              label="Body"
              value={site.fonts.body}
              onChange={(f) => setSite((st) => ({ ...st, fonts: { ...st.fonts, body: f } }))}
              note={note}
              fail={fail}
            />
            <div>
              <FontPicker
                label="Headings"
                value={site.fonts.heading}
                onChange={(f) => setSite((st) => ({ ...st, fonts: { ...st.fonts, heading: { ...st.fonts.heading, ...f } } }))}
                note={note}
                fail={fail}
              />
              <label className={s.inline}>
                Heading weight
                <select
                  value={site.fonts.heading.weight}
                  onChange={(e) =>
                    setSite((st) => ({ ...st, fonts: { ...st.fonts, heading: { ...st.fonts.heading, weight: +e.target.value } } }))
                  }
                >
                  {[200, 300, 400, 500, 600, 700, 800].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <FontPreview site={site} />
        </section>

        {/* ================= TEXT ================= */}
        <section id="text" className={s.panel}>
          <h2>Text</h2>
          <div className={s.fields}>
            <label>
              Site name <small>browser tab title</small>
              <input value={site.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label>
              Page title
              <input value={site.pageTitle} onChange={(e) => patch({ pageTitle: e.target.value })} />
            </label>
            <label className={s.wide}>
              Tagline
              <textarea rows={2} value={site.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
            </label>
          </div>

          <h3>Arrangement pills</h3>
          <div className={s.fields3}>
            {site.arrangements.map((a, i) => (
              <label key={a.id}>
                Pill {i + 1}
                <input
                  value={a.label}
                  onChange={(e) =>
                    patch({ arrangements: site.arrangements.map((x) => (x.id === a.id ? { ...x, label: e.target.value } : x)) })
                  }
                />
              </label>
            ))}
          </div>

          <h3>Navigation</h3>
          <div className={s.navRows}>
            {site.nav.map((n, i) => (
              <div key={i} className={s.navRow}>
                <input
                  aria-label="Label"
                  placeholder="Label"
                  value={n.label}
                  onChange={(e) => patch({ nav: site.nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                />
                <input
                  aria-label="Link"
                  placeholder="/page or #section or https://…"
                  value={n.href}
                  onChange={(e) => patch({ nav: site.nav.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })}
                />
                <button aria-label="Remove" className={s.iconBtn} onClick={() => patch({ nav: site.nav.filter((_, j) => j !== i) })}>
                  ×
                </button>
              </div>
            ))}
            <button className={s.addSmall} onClick={() => patch({ nav: [...site.nav, { label: "", href: "" }] })}>
              + Add link
            </button>
          </div>

          <h3>Footer</h3>
          <div className={s.fields}>
            <label>
              Contact heading
              <input
                value={site.contact.heading}
                onChange={(e) => patch({ contact: { ...site.contact, heading: e.target.value } })}
              />
            </label>
            <label>
              Copyright <small>{"{year}"} becomes the current year</small>
              <input value={site.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
            </label>
            <label className={s.wide}>
              Address <small>one line per row</small>
              <textarea
                rows={5}
                value={site.contact.lines.join("\n")}
                onChange={(e) => patch({ contact: { ...site.contact, lines: e.target.value.split("\n") } })}
              />
            </label>
            <label>
              Email <small>mailto:you@studio.com</small>
              <input value={site.social.email ?? ""} onChange={(e) => patch({ social: { ...site.social, email: e.target.value } })} />
            </label>
            <label>
              LinkedIn
              <input
                value={site.social.linkedin ?? ""}
                onChange={(e) => patch({ social: { ...site.social, linkedin: e.target.value } })}
              />
            </label>
            <label>
              Instagram
              <input
                value={site.social.instagram ?? ""}
                onChange={(e) => patch({ social: { ...site.social, instagram: e.target.value } })}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function LogoSlot(props: {
  label: string;
  bg: string;
  src: string;
  inherited?: boolean;
  uploadLabel?: string;
  removeLabel?: string;
  height: number;
  max: number;
  onUpload: (path: string) => void;
  onRemove: () => void;
  onHeight: (h: number) => void;
  note: (m: string) => void;
  fail: (m: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (f: File) => {
    setBusy(true);
    try {
      props.onUpload((await uploadFile(f, "logo", "logo-" + props.label.toLowerCase())).path);
      props.note("Logo uploaded — remember to save");
    } catch (e) {
      props.fail((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={s.logoSlot}>
      <div className={s.logoStage} style={{ background: props.bg }}>
        {props.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.src} alt="" style={{ height: props.height }} />
        ) : (
          <span className={s.logoEmpty}>No logo — the {props.label.toLowerCase()} shows none</span>
        )}
        <span className={s.logoTag}>
          {props.label}
          {props.inherited && " · same as header"}
        </span>
      </div>
      <div className={s.logoControls}>
        <button className={s.ghostDark} onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : (props.uploadLabel ?? (props.src ? "Replace" : "Upload logo"))}
        </button>
        {props.src && (props.removeLabel || !props.uploadLabel) && (
          <button className={s.ghostDark} onClick={props.onRemove}>
            {props.removeLabel ?? "Remove"}
          </button>
        )}
        <label className={s.range}>
          Height
          <input type="range" min={12} max={props.max} value={props.height} onChange={(e) => props.onHeight(+e.target.value)} />
          <output>{props.height}px</output>
        </label>
      </div>
      <input
        ref={input}
        type="file"
        accept=".svg,image/svg+xml,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function FontPicker(props: {
  label: string;
  value: FontSetting;
  onChange: (f: FontSetting) => void;
  note: (m: string) => void;
  fail: (m: string) => void;
}) {
  const { value: v, onChange } = props;
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const setSource = (source: FontSource) => {
    if (source === "bundled") onChange({ source, family: "Poppins" });
    if (source === "google") onChange({ source, family: v.source === "google" ? v.family : "", weights: v.weights || "300;400;500;600" });
    if (source === "upload") onChange({ source, family: v.source === "upload" ? v.family : "", file: v.file || "" });
  };
  const pick = async (f: File) => {
    setBusy(true);
    try {
      const r = await uploadFile(f, "font");
      onChange({ source: "upload", family: r.family || "Custom", file: r.path });
      props.note("Font uploaded — remember to save");
    } catch (e) {
      props.fail((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset className={s.fontPicker}>
      <legend>{props.label}</legend>
      <div className={s.segmentSmall}>
        {(
          [
            ["bundled", "Poppins"],
            ["google", "Google Fonts"],
            ["upload", "Upload file"],
          ] as const
        ).map(([id, text]) => (
          <button key={id} aria-pressed={v.source === id} onClick={() => setSource(id)}>
            {text}
          </button>
        ))}
      </div>

      {v.source === "bundled" && <p className={s.panelNote}>Built in — loads with the site, no outside requests.</p>}

      {v.source === "google" && (
        <div className={s.fieldsTight}>
          <label>
            Family name <small>exactly as on fonts.google.com</small>
            <input value={v.family} placeholder="e.g. DM Sans" onChange={(e) => onChange({ ...v, family: e.target.value })} />
          </label>
          <label>
            Weights <small>separated by ;</small>
            <input value={v.weights ?? ""} placeholder="300;400;500;600" onChange={(e) => onChange({ ...v, weights: e.target.value })} />
          </label>
        </div>
      )}

      {v.source === "upload" && (
        <div className={s.fieldsTight}>
          <div className={s.dropBar}>
            <button className={s.ghostDark} onClick={() => input.current?.click()} disabled={busy}>
              {busy ? "Uploading…" : v.file ? "Replace file" : "Choose font file"}
            </button>
            <span className={s.path}>{v.file || ".woff2 preferred · .woff .ttf .otf"}</span>
          </div>
          <label>
            Family name <small>any name — used internally</small>
            <input value={v.family} onChange={(e) => onChange({ ...v, family: e.target.value })} />
          </label>
          <input
            ref={input}
            type="file"
            accept=".woff2,.woff,.ttf,.otf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </fieldset>
  );
}

function FontPreview({ site }: { site: Site }) {
  const [failed, setFailed] = useState<string[]>([]);
  const links = fontLinks(site.fonts);
  return (
    <div className={s.fontPreviewWrap}>
      {links.map((href) => (
        <link
          key={href}
          rel="stylesheet"
          href={href}
          onError={() => setFailed((f) => (f.includes(href) ? f : [...f, href]))}
          onLoad={() => setFailed((f) => f.filter((x) => x !== href))}
        />
      ))}
      <style>{fontCss(site.fonts, ".font-preview-scope")}</style>
      <div className={`font-preview-scope ${s.fontPreview}`}>
        <span className={s.fpTitle}>{site.pageTitle || "Projects"}</span>
        <span className={s.fpBody}>{site.tagline}</span>
        <span className={s.fpCard}>
          <em>Landscape and Interiors</em>
          <b>Edge-Samira’s Garden</b>
        </span>
        <span className={s.fpCaption}>
          Tardeo, Mumbai <small>2024</small>
        </span>
      </div>
      {failed.length > 0 && (
        <p className={s.warn}>
          Google Fonts couldn’t load that family or one of its weights. Check the spelling and that each weight exists.
        </p>
      )}
    </div>
  );
}
