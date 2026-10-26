import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/lib/types";
import styles from "./ProjectCard.module.css";

type Props = {
  project: Project;
  /** Above-the-fold cards load eagerly */
  priority?: boolean;
  /** In the editor preview the card isn't a link */
  asLink?: boolean;
};

export default function ProjectCard({ project, priority, asLink = true }: Props) {
  const p = project;
  const body = (
    <>
      <div className={styles.media}>
        {/* The name ties this image to the hero on the project page, so it morphs between them */}
        <ViewTransition name={`project-${p.slug}`}>
          {p.image ? (
            <Image
              src={p.image}
              alt={p.alt || p.title}
              fill
              priority={priority}
              sizes="(min-width: 1180px) 360px, (min-width: 820px) 31vw, (min-width: 520px) 48vw, 100vw"
              style={{ objectPosition: `${p.focal?.x ?? 50}% ${p.focal?.y ?? 50}%` }}
              className={styles.img}
            />
          ) : (
            <div className={styles.empty}>No image</div>
          )}
        </ViewTransition>
        <div className={styles.scrim} />
        <div className={styles.overlay}>
          {p.category && <span className={styles.eyebrow}>{p.category}</span>}
          <h3 className={styles.title}>{p.title || "Untitled"}</h3>
        </div>
      </div>
      <div className={styles.caption}>
        <span className={styles.location}>{p.location}</span>
        <span className={styles.year}>{p.year}</span>
      </div>
    </>
  );

  return asLink ? (
    <Link href={`/projects/${p.slug}`} className={styles.card}>
      {body}
    </Link>
  ) : (
    <div className={styles.card}>{body}</div>
  );
}
