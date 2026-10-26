import styles from "./Wordmark.module.css";

// Text stand-in for the logo. To use the real mark, drop logo.svg into
// public/brand/ and replace the <span> with:
//   <img src="/brand/logo.svg" alt={name} className={styles.img} />
export default function Wordmark({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span className={`${styles.mark} ${styles[size]}`} aria-label={name}>
      <span className={styles.glyph} aria-hidden="true" />
      <span className={styles.text}>{name}</span>
    </span>
  );
}
