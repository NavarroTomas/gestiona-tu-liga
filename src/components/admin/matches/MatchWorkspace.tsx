import Link from "next/link";
import styles from "./MatchWorkspace.module.css";

export function MatchPage({ children }: { children: React.ReactNode }) {
  return <main className={styles.page}><div className={styles.inner}>{children}</div></main>;
}

export function MatchHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <Link href="/admin/partidos" className={styles.back}>← Volver a Partidos y resultados</Link>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.heroText}>{description}</p>
      </section>
    </>
  );
}

export function MatchCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${styles.input} ${props.className || ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${styles.select} ${props.className || ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${styles.textarea} ${props.className || ""}`} />;
}

export function Notice({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return <div className={danger ? styles.dangerNotice : styles.notice}>{children}</div>;
}

export { styles as matchStyles };
