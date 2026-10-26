import type { Metadata } from "next";
import { getProjects, getSite } from "@/lib/content";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProjectGrid from "@/components/ProjectGrid";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);

  return (
    <>
      <SiteHeader site={site} />
      <main className="container">
        <header className={styles.intro}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.lede}>{site.tagline}</p>
        </header>
        <ProjectGrid projects={projects} strands={site.strands} />
      </main>
      <SiteFooter site={site} />
    </>
  );
}
