"use client";

import { useEffect, useRef, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { slugify, type Project } from "@/lib/types";
import { moveItem, uploadFile } from "./shared";
import s from "./editor.module.css";

const newId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

type Props = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  note: (m: string) => void;
  fail: (m: string) => void;
};

export default function ProjectsTab({ projects, setProjects, note, fail }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(projects[0]?.id ?? null);

  // come back to the same project after switching tabs
  useEffect(() => {
    try {
      const last = sessionStorage.getItem("editor:selected");
      if (last && projects.some((p) => p.id === last)) setSelectedId(last);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [slugTouched, setSlugTouched] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    setConfirmDelete(false);
    try {
      if (selectedId) sessionStorage.setItem("editor:selected", selectedId);
    } catch {}
  }, [selectedId]);

  const update = (patch: Partial<Project>) => {
    if (!selected) return;
    setProjects((ps) =>
      ps.map((p) => {
        if (p.id !== selected.id) return p;
        const next = { ...p, ...patch };
        // the slug follows the title until it's edited by hand
        if (patch.title !== undefined && !slugTouched[p.id]) next.slug = slugify(patch.title);
        return next;
      })
    );
  };

  const add = () => {
    const p: Project = {
      id: newId(),
      slug: "new-project-" + (projects.length + 1),
      title: "New project",
      category: "",
      location: "",
      year: String(new Date().getFullYear()),
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
  };

  const duplicate = () => {
    if (!selected) return;
    const copy = { ...selected, id: newId(), slug: selected.slug + "-copy", title: selected.title + " (copy)", published: false };
    const i = projects.findIndex((p) => p.id === selected.id);
    setProjects([...projects.slice(0, i + 1), copy, ...projects.slice(i + 1)]);
    setSelectedId(copy.id);
  };

  const upload = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    try {
      const { path } = await uploadFile(file, "project", selected.slug);
      update({ image: path, focal: { x: 50, y: 50 } });
      note("Image uploaded — remember to save");
    } catch (e) {
      fail((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const setFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    update({
      focal: {
        x: Math.round(((e.clientX - r.left) / r.width) * 100),
        y: Math.round(((e.clientY - r.top) / r.height) * 100),
      },
    });
  };

  const live = projects.filter((p) => p.published).length;

  return (
    <div className={s.body}>
      {/* ---------- list ---------- */}
      <aside className={s.list}>
        <button className={s.add} onClick={add}>
          + New project
        </button>
        <h2 className={s.groupTitle}>
          Default order <span>{live} live · {projects.length - live} draft</span>
        </h2>
        <ol className={s.rows}>
          {projects.map((p, i) => (
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
                <button aria-label="Move up" disabled={i === 0} onClick={() => setProjects((ps) => moveItem(ps, i, i - 1))}>
                  ↑
                </button>
                <button
                  aria-label="Move down"
                  disabled={i === projects.length - 1}
                  onClick={() => setProjects((ps) => moveItem(ps, i, i + 1))}
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
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
          </div>

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
          New projects are added to the end of every arrangement — place them in the <b>Arrangements</b> tab. Nothing is
          written until you press <b>Save</b> (or Ctrl/⌘ + S).
        </p>
      </aside>
    </div>
  );
}
