// Server-only: reads and writes the JSON content files.
// This is the one place to change if content moves to a CMS or database later —
// pages only call getProjects() / getSite().
import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Project, Site } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PROJECTS_FILE = path.join(CONTENT_DIR, "projects.json");
const SITE_FILE = path.join(CONTENT_DIR, "site.json");

export async function getSite(): Promise<Site> {
  return JSON.parse(await fs.readFile(SITE_FILE, "utf8"));
}

export async function getAllProjects(): Promise<Project[]> {
  return JSON.parse(await fs.readFile(PROJECTS_FILE, "utf8"));
}

export async function getProjects(): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.published);
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export async function saveProjects(projects: Project[]) {
  const tmp = PROJECTS_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(projects, null, 2) + "\n", "utf8");
  await fs.rename(tmp, PROJECTS_FILE);
}

/** The editor and its API only exist while running `npm run dev`. */
export const editorEnabled = process.env.NODE_ENV === "development";
