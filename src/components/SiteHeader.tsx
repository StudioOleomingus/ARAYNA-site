"use client";

import Link from "next/link";
import { useState } from "react";
import type { Site } from "@/lib/types";
import Wordmark from "./Wordmark";
import styles from "./SiteHeader.module.css";

export default function SiteHeader({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <Link href="/projects" className={styles.brand}>
          <Wordmark name={site.name} />
        </Link>

        <button
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">Menu</span>
          <span className={styles.burger} data-open={open} />
        </button>

        <nav id="site-nav" className={styles.nav} data-open={open}>
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
