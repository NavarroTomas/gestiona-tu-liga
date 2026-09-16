import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./AwardsWorkspace.module.css";

export default function PremiosLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.scope}>
      <div className={styles.topbar}>
        <Link href="/admin/historia">← Volver a historia</Link>
        <span>Historia · Premios APA</span>
      </div>
      {children}
    </div>
  );
}
