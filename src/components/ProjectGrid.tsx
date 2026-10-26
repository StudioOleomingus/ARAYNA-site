"use client";

import { useMemo, useState } from "react";
import type { Project, Strand } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

/**
 * One list of cards, two layouts:
 *  - Desktop (≥ 820px): one column per strand, pills sit on top as column heads.
 *    Clicking a pill spotlights that column.
 *  - Tablet / phone: pills become a sticky filter bar (with "All"), and the cards
 *    flow into a 2- or 1-column grid.
 *
 * Cards are interleaved across strands (row by row, as the desktop reads), so the
 * "All" view on a phone keeps the same rhythm as the desktop grid.
 */
export default function ProjectGrid({ projects, strands }: { projects: Project[]; strands: Strand[] }) {
  const [active, setActive] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const lanes = strands.map((s) => projects.filter((p) => p.strand === s.id));
    const orphans = projects.filter((p) => !strands.some((s) => s.id === p.strand));
    const out: Project[] = [];
    const depth = Math.max(0, ...lanes.map((l) => l.length));
    for (let row = 0; row < depth; row++) for (const lane of lanes) if (lane[row]) out.push(lane[row]);
    return [...out, ...orphans];
  }, [projects, strands]);

  const colOf = (id: string) => Math.max(0, strands.findIndex((s) => s.id === id)) + 1;
  const toggle = (id: string | null) => setActive((cur) => (cur === id ? null : id));

  return (
    <section
      className={styles.wrap}
      style={{ "--cols": strands.length } as React.CSSProperties}
      data-active={active ?? "all"}
    >
      <div className={styles.pills} role="toolbar" aria-label="Filter projects">
        <button className={`${styles.pill} ${styles.allPill}`} aria-pressed={active === null} onClick={() => setActive(null)}>
          All
        </button>
        {strands.map((s) => (
          <button
            key={s.id}
            className={styles.pill}
            aria-pressed={active === s.id}
            onClick={() => toggle(s.id)}
            style={{ "--col": colOf(s.id) } as React.CSSProperties}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ul className={styles.grid}>
        {ordered.map((p, i) => (
          <li
            key={p.id}
            className={styles.item}
            data-strand={p.strand}
            data-dim={active !== null && active !== p.strand}
            style={{ "--col": colOf(p.strand) } as React.CSSProperties}
          >
            <ProjectCard project={p} priority={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
