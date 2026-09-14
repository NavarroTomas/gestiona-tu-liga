"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyAdminPermissions } from "@/lib/adminPermissions";
import { TournamentHero, TournamentPage, TournamentPanel, tournamentStyles as styles } from "./TournamentUi";

export default function TournamentHub() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAdminPermissions()
      .then(setPermissions)
      .catch(() => setPermissions([]))
      .finally(() => setLoading(false));
  }, []);

  const canCompetition = permissions.includes("competitions.manage") || permissions.includes("admin.users.manage");
  const canFixture = permissions.includes("fixtures.manage") || permissions.includes("competitions.manage") || permissions.includes("admin.users.manage");

  return (
    <TournamentPage>
      <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>
      <TournamentHero
        eyebrow="Organización deportiva"
        title="Competición"
        description="Un único lugar para organizar la temporada. Fixture define quién y cuándo juega; Competición define grupos, copas, ascensos y reglas deportivas. Los resultados se gestionan aparte en Centro de partidos."
      />

      <div style={{ marginTop: 22 }}>
        <TournamentPanel
          eyebrow="Dos responsabilidades"
          title="¿Qué querés administrar?"
          description="Separar estructura competitiva de resultados reduce errores y evita que distintas pantallas modifiquen las mismas estadísticas."
        >
          {loading ? (
            <div className={styles.empty}>Cargando permisos...</div>
          ) : (
            <div className={styles.list}>
              {canCompetition && (
                <Link href="/admin/competicion" className={styles.row} style={{ textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div className={styles.sectionEyebrow}>Torneos y copas</div>
                    <div className={styles.rowTitle} style={{ fontSize: 22, marginTop: 4 }}>Competición general</div>
                    <div className={styles.rowMeta}>Grupos, Copa Argentina, Copa APA, Copa de Campeones, Playoffs, sanciones y visibilidad pública.</div>
                  </div>
                  <span className={styles.primary}>Abrir competición →</span>
                </Link>
              )}

              {canFixture && (
                <Link href="/admin/fixture" className={styles.row} style={{ textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div className={styles.sectionEyebrow}>Liga</div>
                    <div className={styles.rowTitle} style={{ fontSize: 22, marginTop: 4 }}>Fixture y programación</div>
                    <div className={styles.rowMeta}>Participantes, generación de cruces, ida/ida-vuelta, fechas, días y horarios.</div>
                  </div>
                  <span className={styles.primary}>Abrir fixture →</span>
                </Link>
              )}

              {!canCompetition && !canFixture && (
                <div className={styles.empty}>Tu usuario no tiene permisos de competición o fixture.</div>
              )}
            </div>
          )}
        </TournamentPanel>
      </div>
    </TournamentPage>
  );
}
