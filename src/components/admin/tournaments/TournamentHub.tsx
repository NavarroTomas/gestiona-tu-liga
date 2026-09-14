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
        eyebrow="Centro de temporada"
        title="Competición"
        description="Organizá la temporada, el fixture y las reglas desde el panel. Los resultados oficiales siguen separados en Centro de partidos para evitar inconsistencias."
      >
        {canCompetition && (
          <div className={styles.toolbar}>
            <Link href="/admin/torneos/configuracion" className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Editar temporadas y reglas
            </Link>
          </div>
        )}
      </TournamentHero>

      <div style={{ marginTop: 22 }}>
        <TournamentPanel
          eyebrow="Operación diaria"
          title="¿Qué necesitás hacer?"
          description="Usá Fixture para estructura y horarios; Competición para copas, clasificación, ascensos y sanciones. La configuración general queda disponible arriba cuando quieras cambiar reglas."
        >
          {loading ? (
            <div className={styles.empty}>Cargando permisos...</div>
          ) : (
            <div className={styles.list}>
              {canFixture && (
                <Link href="/admin/fixture" className={styles.row} style={{ textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div className={styles.sectionEyebrow}>Liga y calendario</div>
                    <div className={styles.rowTitle} style={{ fontSize: 22, marginTop: 4 }}>Fixture y programación</div>
                    <div className={styles.rowMeta}>Participantes, cruces, fechas, días, horarios, ida o ida/vuelta y reprogramaciones.</div>
                  </div>
                  <span className={styles.primary}>Abrir fixture →</span>
                </Link>
              )}

              {canCompetition && (
                <Link href="/admin/competicion" className={styles.row} style={{ textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div className={styles.sectionEyebrow}>Copas y reglas deportivas</div>
                    <div className={styles.rowTitle} style={{ fontSize: 22, marginTop: 4 }}>Competición general</div>
                    <div className={styles.rowMeta}>Grupos, Copa Argentina, Copa APA, Copa de Campeones, Playoffs, sanciones y avance de fases.</div>
                  </div>
                  <span className={styles.primary}>Abrir competición →</span>
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
