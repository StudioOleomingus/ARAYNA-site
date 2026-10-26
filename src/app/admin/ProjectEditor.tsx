"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { slugify, type Project, type Strand } from "@/lib/types";
import s from "./editor.module.css";

type Status = { kind: "idle" | "saving" | "saved" | "error"; msg?: string };

const newId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export default function ProjectEditor({ initial, strands }: { initial: Project[]; strands: Strand[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [slugTouched, setSlugTouched] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(projects) !== savedJson;
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  // ---------- mutations ----------
  const update = (patch: Partial<Project>) => {
    if (!selected) return;
    setProjects((ps) =>
      ps.map((p) => {
        if (p.id !== selected.id) return p;
        const next = { ...p, ...patch };
        // keep the slug following the title until someone edits the slug by hand
        if (patch.title !== undefined && !slugTouched[p.id]) next.slug = slugify(patch.title);
        return next;
      })
    );
  };

  const add = () => {
    const strand = selected?.strand ?? strands[0]?.id ?? "";
    const p: Project = {
      id: newId(),
      slug: "new-project-" + (projects.length + 1),
      title: "New project",
      category: "",
      location: "",
      year: String(new Date().getFullYear()),
      strand,
      image: "",
      alt: "",
      focal: { x: 50, y: 50 },
      published: false,
    };
    setProjects((ps) => [...ps, p]);
    setSelectedId(p.id);
  };

  const remove = () => {
    if (!selected) return;
    if (!confirmDelete) return setConfirmDelete(true);
    const idx = projects.findIndex((p) => p.id === selected.id);
    const rest = projects.filter((p) => p.id !== selected.id);
    setProjects(rest);
    setSelectedId(rest[Math.min(idx, rest.length - 1)]?.id ?? null);
    setConfirmDelete(false);
  };

  /** Move within its strand: swap with the neighbour of the same strand. */
  const move = (id: string, dir: -1 | 1) => {
    setProjects((ps) => {
      const i = ps.findIndex((p) => p.id === id);
      const strand = ps[i].strand;
      let j = i + dir;
      while (j >= 0 && j < ps.length && ps[j].strand !== strand) j += dir;
      if (j < 0 || j >= ps.length) return ps;
      const next = [...ps];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const duplicate = () => {
    if (!selected) return;
    const copy = { ...selected, id: newId(), slug: selected.slug + "-copy", title: selected.title + " (copy)", published: false };
    const i = projects.findIndex((p) => p.id === selected.id);
    setProjects([...projects.slice(0, i + 1), copy, ...projects.slice(i + 1)]);
    setSelectedId(copy.id);
  };

  // ---------- persistence ----------
  const save = useCallback(async () => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projects),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedJson(JSON.stringify(projects));
      setStatus({ kind: "saved", msg: `Saved ${data.count} projects` });
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
    }
  }, [projects]);

  const revert = () => {
    const orig = JSON.parse(savedJson) as Project[];
    setProjects(orig);
    if (!orig.some((p) => p.id === selectedId)) setSelectedId(orig[0]?.id ?? null);
    setStatus({ kind: "idle" });
  };

  const upload = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", selected.slug);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      update({ image: data.path, focal: { x: 50, y: 50 } });
      setStatus({ kind: "idle", msg: "Image uploaded — remember to save" });
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  // Ctrl/Cmd+S saves; warn before leaving with unsaved changes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, save]);

  useEffect(() => setConfirmDelete(false), [selectedId]);
  useEffect(() => {
    if (dirty && status.kind === "saved") setStatus({ kind: "idle" });
  }, [dirty, status.kind]);

  const grouped = useMemo(
    () => [
      ...strands.map((st) => ({ strand: st, items: projects.filter((p) => p.strand === st.id) })),
      { strand: { id: "__none", label: "No strand" }, items: projects.filter((p) => !strands.some((st) => st.id === p.strand)) },
    ].filter((g) => g.strand.id !== "__none" || g.items.length),
    [projects, strands]
  );

  const setFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    update({
      focal: {
        x: Math.round(((e.clientX - r.left) / r.width) * 100),
        y: Math.round(((e.clientY - r.top) / r.height) * 100),
      },
    });
  };

  return (
    <div className={s.shell}>
      {/* ---------- top bar ---------- */}
      <header className={s.top}>
        <div className={s.topLeft}>
          <strong>Projects editor</strong>
          <span className={s.count}>
            {projects.filter((p) => p.published).length} live · {projects.filter((p) => !p.published).length} draft
          </span>
        </div>
        <div className={s.topRight}>
          <span className={s.status} data-kind={dirty && status.kind !== "error" ? "dirty" : status.kind}>
            {status.kind === "saving"
              ? "Saving…"
              : status.kind === "error"
                ? status.msg
                : dirty
                  ? status.msg ?? "Unsaved changes"
                  : status.msg ?? "All changes saved"}
          </span>
          <Link href="/projects" className={s.ghost} target="_blank">
            View page ↗
          </Link>
          <button className={s.ghost} onClick={revert} disabled={!dirty}>
            Discard
          </button>
          <button className={s.primary} onClick={save} disabled={!dirty || status.kind === "saving"}>
            Save
          </button>
        </div>
      </header>

      <div className={s.body}>
        {/* ---------- list ---------- */}
        <aside className={s.list}>
          <button className={s.add} onClick={add}>
            + New project
          </button>
          {grouped.map(({ strand, items }) => (
            <section key={strand.id} className={s.group}>
              <h2 className={s.groupTitle}>
                {strand.label} <span>{items.length}</span>
              </h2>
              <ol>
                {items.map((p, i) => (
                  <li key={p.id} className={s.row} data-selected={p.id === selectedId}>
                    <button className={s.rowMain} onClick={() => setSelectedId(p.id)}>
                      <span className={s.thumb}>
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" style={{ objectPosition: `${p.focal.x}% ${p.focal.y}%` }} />
                        )}
                      </span>
                      <span className={s.rowText}>
                        <span className={s.rowTitle}>{p.title || "Untitled"}</span>
                        <span className={s.rowMeta}>
                          {!p.published && <em className={s.draft}>Draft</em>}
                          {p.location || "—"}
                        </span>
                      </span>
                    </button>
                    <span className={s.moves}>
                      <button aria-label="Move up" disabled={i === 0} onClick={() => move(p.id, -1)}>
                        ↑
                      </button>
                      <button aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(p.id, 1)}>
                        ↓
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </aside>

        {/* ---------- form ---------- */}
        {selected ? (
          <main className={s.form}>
            <div className={s.formHead}>
              <h1>{selected.title || "Untitled"}</h1>
              <label className={s.switch}>
                <input type="checkbox" checked={selected.published} onChange={(e) => update({ published: e.target.checked })} />
                <span />
                {selected.published ? "Published" : "Draft — hidden from site"}
              </label>
            </div>

            <div className={s.fields}>
              <label className={s.wide}>
                Title
                <input value={selected.title} onChange={(e) => update({ title: e.target.value })} />
              </label>
              <label>
                Category <small>small caps above the title</small>
                <input
                  value={selected.category}
                  placeholder="Landscape and Interiors"
                  onChange={(e) => update({ category: e.target.value })}
                />
              </label>
              <label>
                Location
                <input value={selected.location} placeholder="Juhu, Mumbai" onChange={(e) => update({ location: e.target.value })} />
              </label>
              <label>
                Year
                <input value={selected.year} inputMode="numeric" onChange={(e) => update({ year: e.target.value })} />
              </label>
              <label>
                Slug <small>/projects/{selected.slug || "…"}</small>
                <input
                  value={selected.slug}
                  onChange={(e) => {
                    setSlugTouched((t) => ({ ...t, [selected.id]: true }));
                    update({ slug: slugify(e.target.value) });
                  }}
                />
              </label>
              <fieldset className={`${s.wide} ${s.strands}`}>
                <legend>Strand (column)</legend>
                {strands.map((st) => (
                  <label key={st.id} data-on={selected.strand === st.id}>
                    <input
                      type="radio"
                      name="strand"
                      checked={selected.strand === st.id}
                      onChange={() => update({ strand: st.id })}
                    />
                    {st.label}
                  </label>
                ))}
              </fieldset>
            </div>

            {/* image */}
            <div className={s.imageBlock}>
              <div className={s.imageHead}>
                <span>Thumbnail</span>
                <small>Click the photo to set its focal point — it stays in frame however the image is cropped.</small>
              </div>
              <div
                className={s.drop}
                data-over={dragOver}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) upload(f);
                }}
              >
                {selected.image ? (
                  <div className={s.focalBox} onClick={setFocal}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.image} alt="" draggable={false} />
                    <span className={s.focalDot} style={{ left: `${selected.focal.x}%`, top: `${selected.focal.y}%` }} />
                  </div>
                ) : (
                  <div className={s.dropEmpty}>Drop an image here</div>
                )}
                <div className={s.dropBar}>
                  <button className={s.ghost} onClick={() => fileInput.current?.click()} disabled={uploading}>
                    {uploading ? "Uploading…" : selected.image ? "Replace image" : "Choose image"}
                  </button>
                  <span className={s.path}>{selected.image || "JPG, PNG or WebP · resized to 2400px max"}</span>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <label className={s.altField}>
                Alt text <small>describes the image for screen readers</small>
                <input value={selected.alt} onChange={(e) => update({ alt: e.target.value })} />
              </label>
            </div>

            <div className={s.danger}>
              <button className={s.ghost} onClick={duplicate}>
                Duplicate
              </button>
              <button className={s.delete} data-confirm={confirmDelete} onClick={remove} onBlur={() => setConfirmDelete(false)}>
                {confirmDelete ? "Click again to delete" : "Delete project"}
              </button>
            </div>
          </main>
        ) : (
          <main className={`${s.form} ${s.emptyState}`}>
            <p>No project selected.</p>
            <button className={s.primary} onClick={add}>
              + New project
            </button>
          </main>
        )}

        {/* ---------- live preview ---------- */}
        <aside className={s.preview}>
          <span className={s.previewLabel}>Preview</span>
          {selected && (
            <div className={s.previewCard}>
              <ProjectCard project={selected} asLink={false} />
            </div>
          )}
          <p className={s.hint}>
            Changes are local until you press <b>Save</b> (or Ctrl/⌘ + S). Saving writes <code>content/projects.json</code>.
          </p>
        </aside>
      </div>
    </div>
  );
}
