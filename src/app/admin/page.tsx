import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { editorEnabled, getAllProjects, getSite } from "@/lib/content";
import Editor from "./Editor";

export const metadata: Metadata = { title: "Editor", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // The editor writes to files on disk, so it only exists under `npm run dev`.
  if (!editorEnabled) notFound();
  const [site, projects] = await Promise.all([getSite(), getAllProjects()]);
  return <Editor initialProjects={projects} initialSite={site} />;
}
