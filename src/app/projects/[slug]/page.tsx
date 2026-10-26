// Placeholder project page — exists so cards have somewhere to go and so the
// image morph (grid thumbnail → hero) can be seen working. Build out later.
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getProject, getProjects, getSite } from "@/lib/content";
import SiteHeader from "@/components/SiteHeader";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  return { title: p?.title ?? "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [site, p] = await Promise.all([getSite(), getProject(slug)]);
  if (!p) notFound();
  const strand = site.strands.find((s) => s.id === p.strand);

  return (
    <>
      <SiteHeader site={site} />
      <main className={styles.page}>
        <div className={styles.hero}>
          <ViewTransition name={`project-${p.slug}`}>
            <Image
              src={p.image}
              alt={p.alt || p.title}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: `${p.focal.x}% ${p.focal.y}%` }}
              className={styles.heroImg}
            />
          </ViewTransition>
          <div className={styles.scrim} />
          <div className={`container ${styles.heroText}`}>
            <span className={styles.eyebrow}>{p.category}</span>
            <h1 className={styles.title}>{p.title}</h1>
          </div>
        </div>

        <div className={`container ${styles.meta}`}>
          <dl>
            <div><dt>Location</dt><dd>{p.location}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            {strand && <div><dt>Strand</dt><dd>{strand.label}</dd></div>}
          </dl>
          <p className={styles.todo}>Project story, drawings and gallery will go here.</p>
          <Link href="/projects" className={styles.back}>← All projects</Link>
        </div>
      </main>
    </>
  );
}
