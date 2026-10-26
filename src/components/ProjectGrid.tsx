"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { arrange, type Arrangement, type Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

/**
 * The pills (Wild / Entangled / Rooted) each re-order every project into a
 * curated arrangement. Pressing the active pill again returns to the default order.
 *
 * Cards glide from their old slot to the new one (FLIP: measure First, apply
 * the change, measure Last, Invert with a transform, Play it back to zero).
 * The cascade starts at the top-left so the grid "re-deals" in reading order.
 */
const DURATION = 750;
const STAGGER = 28;
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

export default function ProjectGrid({ projects, arrangements }: { projects: Project[]; arrangements: Arrangement[] }) {
  const [active, setActive] = useState<string | null>(null);
  const nodes = useRef(new Map<string, HTMLLIElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);

  const ordered = useMemo(
    () => arrange(projects, arrangements.find((a) => a.id === active)?.order),
    [projects, arrangements, active]
  );

  const choose = (id: string) => {
    // First: remember where every card is before the change
    const rects = new Map<string, DOMRect>();
    nodes.current.forEach((el, key) => rects.set(key, el.getBoundingClientRect()));
    before.current = rects;
    setActive((cur) => (cur === id ? null : id));
  };

  useLayoutEffect(() => {
    const first = before.current;
    before.current = null;
    if (!first) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ordered.forEach((p, i) => {
      const el = nodes.current.get(p.id);
      const a = first.get(p.id);
      if (!el || !a) return;
      // Last
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      // Invert + Play
      el.getAnimations().forEach((anim) => anim.cancel());
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)`, zIndex: 2 },
          { transform: `translate(${dx * 0.08}px, ${dy * 0.08}px) scale(0.985)`, offset: 0.7, zIndex: 2 },
          { transform: "none", zIndex: 2 },
        ],
        { duration: DURATION, delay: i * STAGGER, easing: EASE, fill: "backwards" }
      );
    });
  }, [ordered]);

  return (
    <section className={styles.wrap} data-active={active ?? "none"}>
      <div className={styles.pills} role="group" aria-label="Arrange projects">
        {arrangements.map((a) => (
          <button key={a.id} className={styles.pill} aria-pressed={active === a.id} onClick={() => choose(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      <ul className={styles.grid} aria-live="polite">
        {ordered.map((p, i) => (
          <li
            key={p.id}
            className={styles.item}
            ref={(el) => {
              if (el) nodes.current.set(p.id, el);
              else nodes.current.delete(p.id);
            }}
          >
            <ProjectCard project={p} priority={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
