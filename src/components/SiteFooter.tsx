import type { Site } from "@/lib/types";
import styles from "./SiteFooter.module.css";

export default function SiteFooter({ site }: { site: Site }) {
  const year = String(new Date().getFullYear());
  const logo = site.logo.footerSrc || site.logo.src;
  return (
    <footer className={styles.footer} id="contact">
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={site.name} className={styles.logo} style={{ height: site.logo.footerHeight }} />
          )}
          <ul className={styles.social}>
            {site.social.email && (
              <li>
                <a href={site.social.email} aria-label="Email">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
                    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
                  </svg>
                </a>
              </li>
            )}
            {site.social.linkedin && (
              <li>
                <a href={site.social.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <rect x="3.5" y="9" width="3.6" height="11.5" />
                    <circle cx="5.3" cy="5.3" r="2.1" />
                    <path d="M10 9h3.4v1.6c.6-1 1.9-1.9 3.8-1.9 3.4 0 4.3 2.1 4.3 5.1v6.7h-3.6v-6c0-1.5-.3-2.8-2-2.8s-2.3 1.2-2.3 2.8v6H10z" />
                  </svg>
                </a>
              </li>
            )}
            {site.social.instagram && (
              <li>
                <a href={site.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
                  </svg>
                </a>
              </li>
            )}
          </ul>
        </div>

        <address className={styles.contact}>
          <strong>{site.contact.heading}</strong>
          {site.contact.lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </address>
      </div>

      <div className={styles.rule}>
        <small>{site.copyright.replace("{year}", year)}</small>
      </div>
    </footer>
  );
}
