"use client";

import { useState } from "react";
import { arrange, type Project, type Site } from "@/lib/types";
import { moveItem } from "./shared";
import s from "./editor.module.css";

type Props = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  site: Site;
  setSite: React.Dispatch<React.SetStateAction<Site>>;
};

const DEFAULT = "__default";

/**
 * Each pill on the projects page lays out every project in its own order.
 * Drag tiles to reorder (or use the arrows). The grid reads left→right, top→bottom,
 * exactly as the desktop page does.
 */
export default function ArrangementsTab({ projects, setProjects, site, setSite }: Props) {
  const [current, setCurrent] = useState<string>(site.arrangements[0]?.id ?? DEFAULT);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const arrangement = site.arrangements.find((a) => a.id === current);
  const list = arrangement ? arrange(projects, arrangement.order) : projects;

  const commit = (next: Project[]) => {
    if (!arrangement) return setProjects(next); // default order = order of the project list
    setSite((st) => ({
      ...st,
      arrangements: st.arrangements.map((a) => (a.id === current ? { ...a, order: next.map((p) => p.id) } : a)),
    }));
  };
  const move = (from: number, to: number) => commit(moveItem(list, from, to));

  const copyFrom = (sourceId: string) => {
    const src = site.arrangements.find((a) => a.id === sourceId);
    commit(src ? arrange(projects, src.order) : projects);
  };

  const label = arrangement?.label ?? "Default";

  return (
    <div className={s.arrBody}>
      <div className={s.arrHead}>
        <div className={s.segment} role="tablist" aria-label="Arrangement">
          <button role="tab" aria-selected={current === DEFAULT} onClick={() => setCurrent(DEFAULT)}>
            Default
          </button>
          {site.arrangements.map((a) => (
            <button key={a.id} role="tab" aria-selected={current === a.id} onClick={() => setCurrent(a.id)}>
              {a.label}
            </button>
          ))}
        </div>
        <p className={s.arrNote}>
          {arrangement ? (
            <>
              What visitors see after pressing <b>{label}</b>. Drag tiles to reorder.
            </>
          ) : (
            <>
              What visitors see before pressing any pill (and after pressing the active one again). This is also the
              order of the list in the Projects tab.
            </>
          )}
        </p>
        <label className={s.copyFrom}>
          Copy order from
          <select value="" onChange={(e) => e.target.value && copyFrom(e.target.value)}>
            <option value="">…</option>
            {current !== DEFAULT && <option value={DEFAULT}>Default</option>}
            {site.arrangements
              .filter((a) => a.id !== current)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
          </select>
        </label>
      </div>

      <ol className={s.arrGrid}>
        {list.map((p, i) => (
          <li
            key={p.id}
            className={s.tile}
            draggable
            data-draft={!p.published}
            data-dragging={dragFrom === i}
            data-over={dragOver === i && dragFrom !== i}
            onDragStart={(e) => {
              setDragFrom(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOver !== i) setDragOver(i);
            }}
            onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
          >
            <span className={s.tileImg}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" draggable={false} style={{ objectPosition: `${p.focal.x}% ${p.focal.y}%` }} />
              )}
              <span className={s.tileNum}>{i + 1}</span>
              {!p.published && <em className={s.draft}>Draft</em>}
            </span>
            <span className={s.tileText}>
              <span className={s.rowTitle}>{p.title}</span>
              <span className={s.rowMeta}>{p.location}</span>
            </span>
            <span className={s.tileMoves}>
              <button aria-label={`Move ${p.title} earlier`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                ←
              </button>
              <button aria-label={`Move ${p.title} later`} disabled={i === list.length - 1} onClick={() => move(i, i + 1)}>
                →
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p className={s.hint}>
        Drafts keep their place here but are skipped on the site. Pill labels are edited in <b>Site &amp; type</b>.
      </p>
    </div>
  );
}
