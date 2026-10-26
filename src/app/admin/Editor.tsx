"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Project, Site } from "@/lib/types";
import ProjectsTab from "./ProjectsTab";
import ArrangementsTab from "./ArrangementsTab";
import SiteTab from "./SiteTab";
import s from "./editor.module.css";

type Tab = "projects" | "arrangements" | "site";
type Status = { kind: "idle" | "saving" | "saved" | "error"; msg?: string };

const TABS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "arrangements", label: "Arrangements" },
  { id: "site", label: "Site & type" },
];

export default function Editor({ initialProjects, initialSite }: { initialProjects: Project[]; initialSite: Site }) {
  const [projects, setProjects] = useState(initialProjects);
  const [site, setSite] = useState(initialSite);
  const [saved, setSaved] = useState(() => JSON.stringify({ p: initialProjects, s: initialSite }));
  const [tab, setTab] = useState<Tab>("projects");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const dirty = JSON.stringify({ p: projects, s: site }) !== saved;
  const note = (msg: string) => setStatus({ kind: "idle", msg });
  const fail = (msg: string) => setStatus({ kind: "error", msg });

  const save = useCallback(async () => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects, site }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      // take back the cleaned-up version the server wrote
      setProjects(data.projects);
      setSite(data.site);
      setSaved(JSON.stringify({ p: data.projects, s: data.site }));
      setStatus({ kind: "saved", msg: "Saved" });
    } catch (e) {
      fail((e as Error).message);
    }
  }, [projects, site]);

  const revert = () => {
    const o = JSON.parse(saved) as { p: Project[]; s: Site };
    setProjects(o.p);
    setSite(o.s);
    setStatus({ kind: "idle" });
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

  useEffect(() => {
    if (dirty && status.kind === "saved") setStatus({ kind: "idle" });
  }, [dirty, status.kind]);

  const statusText =
    status.kind === "saving"
      ? "Saving…"
      : status.kind === "error"
        ? status.msg
        : dirty
          ? (status.msg ?? "Unsaved changes")
          : (status.msg ?? "All changes saved");

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <div className={s.topLeft}>
          <strong>Editor</strong>
          <nav className={s.tabs} role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className={s.topRight}>
          <span className={s.status} data-kind={dirty && status.kind !== "error" ? "dirty" : status.kind}>
            {statusText}
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

      {tab === "projects" && <ProjectsTab projects={projects} setProjects={setProjects} note={note} fail={fail} />}
      {tab === "arrangements" && (
        <ArrangementsTab projects={projects} setProjects={setProjects} site={site} setSite={setSite} />
      )}
      {tab === "site" && <SiteTab site={site} setSite={setSite} note={note} fail={fail} />}
    </div>
  );
}
