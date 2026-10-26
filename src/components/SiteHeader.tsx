"use client";

import Link from "next/link";
import { useState } from "react";
import type { Site } from "@/lib/types";
import styles from "./SiteHeader.module.css";

export default function SiteHeader({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);
  const { logo } = site;
  return (
    <header className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo is set in /admin → Site & type. Without one, the slot stays empty. */}
        <Link href="/projects" className={styles.brand} aria-label={site.name}>
          {logo.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt={site.name} style={{ height: logo.headerHeight }} />
          )}
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
            <Link key={item.href + item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
