"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./TournamentWorkspace.module.css";

export { styles as tournamentStyles };

export function TournamentPage({ children }: { children: ReactNode }) {
  return <main className={styles.page}><div className={styles.container}>{children}</div></main>;
}

export function TournamentBackLink() {
  return <Link href="/admin/torneos" className={styles.backLink}>← Volver a competición</Link>;
}

export function TournamentHero({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <p className={styles.heroEyebrow}>{eyebrow}</p>
      <h1 className={styles.heroTitle}>{title}</h1>
      <p className={styles.heroText}>{description}</p>
      {children}
    </header>
  );
}

export function TournamentPanel({ eyebrow, title, description, action, children }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          {eyebrow && <p className={styles.sectionEyebrow}>{eyebrow}</p>}
          <h2 className={styles.panelTitle}>{title}</h2>
          {description && <p className={styles.panelText}>{description}</p>}
        </div>
        {action}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}><span className={styles.label}>{label}</span>{children}</label>;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${styles.select} ${props.className || ""}`} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${styles.input} ${props.className || ""}`} />;
}

export function Tabs<T extends string>({ value, items, onChange }: {
  value: T;
  items: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.tabs}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`${styles.tab} ${value === item.value ? styles.tabActive : ""}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
