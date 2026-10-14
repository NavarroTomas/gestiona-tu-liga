"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMyAdminPermissions } from "@/lib/adminPermissions";
import {
  fetchCompetitionConfigs,
  fetchTournamentMatches,
  fetchTournamentSeasons,
  fetchTournamentTeams,
  isLoadedMatch,
  normalizeDivision,
  type CompetitionConfig,
  type TournamentMatch,
} from "@/lib/adminTournaments";
import { Field, Select, TournamentHero, TournamentPage, tournamentStyles as styles } from "./TournamentUi";

type CompetitionSummary = {
  key: string;
  title: string;
  subtitle: string;
  matches: TournamentMatch[];
  href: string;
};

function statusFor(matches: TournamentMatch[]) {
  if (!matches.length) return "Sin iniciar";
  const loaded = matches.filter(isLoadedMatch).length;
  if (loaded === matches.length) return "Al día";
  if (loaded > 0) return "En curso";
  return "Programada";
}

export default function TournamentHub() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [configs, setConfigs] = useState<CompetitionConfig[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const canCompetition = permissions.includes("competitions.manage") || permissions.includes("admin.users.manage");
  const canFixture = permissions.includes("fixtures.manage") || canCompetition;

  useEffect(() => {
    Promise.all([getMyAdminPermissions(), fetchTournamentSeasons()])
      .then(([permissionRows, seasonRows]) => {
        setPermissions(permissionRows);
        setSeasons(seasonRows);
        setSeason(seasonRows[0] || "Temporada 4");
      })
      .catch(() => {
        setPermissions([]);
        setSeasons(["Temporada 4"]);
        setSeason("Temporada 4");
      });
  }, []);

  useEffect(() => {
    if (!season) return;
    let active = true;
    setLoading(true);
    setMessage("");
    Promise.all([
      fetchTournamentMatches({ temporada: season }),
      fetchCompetitionConfigs(season),
      fetchTournamentTeams(season),
    ])
      .then(([matchRows, configRows, teams]) => {
        if (!active) return;
        setMatches(matchRows);
        setConfigs(configRows);
        setTeamCount(teams.length);
      })
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar el torneo."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [season]);

  const competitions = useMemo<CompetitionSummary[]>(() => {
    const base: CompetitionSummary[] = [
      {
        key: "liga_primera",
        title: "Primera División",
        subtitle: "Liga, fechas y tabla",
        matches: matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera"),
        href: "/admin/fixture",
      },
      {
        key: "liga_segunda",
        title: "Segunda División",
        subtitle: "Liga, fechas y tabla",
        matches: matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda"),
        href: "/admin/fixture",
      },
      {
        key: "copa_clasificatoria",
        title: "Clasificación a Copas",
        subtitle: "Grupos, clasificados y publicación",
        matches: matches.filter((match) => match.competicion === "copa_clasificatoria"),
        href: "/admin/torneos/clasificacion-copas",
      },
      {
        key: "copa_argentina",
        title: "Copa Argentina",
        subtitle: "Cruces y pases directos",
        matches: matches.filter((match) => match.competicion === "copa_argentina"),
        href: "/admin/torneos/copa-argentina",
      },
      {
        key: "copa_apa",
        title: "Copa de la Liga",
        subtitle: "Cruces y pases directos",
        matches: matches.filter((match) => match.competicion === "copa_apa"),
        href: "/admin/torneos/copa-apa",
      },
      {
        key: "copa_campeones",
        title: "Copa de Campeones",
        subtitle: "Participantes, cruces y excepciones",
        matches: matches.filter((match) => match.competicion === "copa_campeones"),
        href: "/admin/torneos/copa-campeones",
      },
      {
        key: "playoffs",
        title: "Playoffs de Ascenso",
        subtitle: "Semifinales, final y promoción",
        matches: matches.filter((match) => match.competicion === "playoffs"),
        href: "/admin/torneos/playoffs-ascenso",
      },
    ];

    const known = new Set(base.map((item) => item.key));
    for (const config of configs) {
      if (!known.has(config.slug)) {
        base.push({
          key: config.slug,
          title: config.nombre,
          subtitle: "Competición personalizada",
          matches: matches.filter((match) => match.competicion === config.slug),
          href: "/admin/competicion",
        });
      }
    }
    return base;
  }, [matches, configs]);

  const nextActions = useMemo(() => {
    const actions: Array<{ title: string; href: string }> = [];
    const league = matches.filter((match) => match.competicion === "liga");
    const withoutSchedule = league.filter((match) => !isLoadedMatch(match) && (!match.dia || !match.hora));
    if (withoutSchedule.length) actions.push({ title: `Programar ${withoutSchedule.length} partidos`, href: "/admin/fixture" });

    const qualification = matches.filter((match) => match.competicion === "copa_clasificatoria");
    if (qualification.length && qualification.some((match) => isLoadedMatch(match))) {
      actions.push({ title: "Revisar clasificación a copas", href: "/admin/torneos/clasificacion-copas" });
    }

    const playoffs = matches.filter((match) => match.competicion === "playoffs");
    if (playoffs.length) {
      actions.push({ title: "Revisar playoffs de ascenso", href: "/admin/torneos/playoffs-ascenso" });
    }

    for (const [key, title, href] of [
      ["copa_argentina", "Copa Argentina", "/admin/torneos/copa-argentina"],
      ["copa_apa", "Copa de la Liga", "/admin/torneos/copa-apa"],
      ["copa_campeones", "Copa de Campeones", "/admin/torneos/copa-campeones"],
    ] as const) {
      const rows = matches.filter((match) => match.competicion === key);
      if (rows.length && rows.some((match) => isLoadedMatch(match))) actions.push({ title: `Revisar ${title}`, href });
    }

    if (!actions.length) actions.push({ title: "Revisar configuración de torneo", href: "/admin/torneos/configuracion" });
    return actions.slice(0, 4);
  }, [matches]);

  const loaded = matches.filter(isLoadedMatch).length;

  return (
    <TournamentPage>
      <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>

      <TournamentHero eyebrow="Torneos" title={displayLabel(season || "Temporada")} description="Cada competición tiene su propio espacio. Entrá solamente a lo que querés modificar.">
        <div className={styles.toolbar}>
          <Field label="Torneo">
            <Select value={season} onChange={(event) => setSeason(event.target.value)}>
              {seasons.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}
            </Select>
          </Field>
          {canCompetition && <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Configurar torneo</Link>}
        </div>
        <div className={styles.kpis}>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{teamCount}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos</div><div className={styles.kpiValue}>{matches.length}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{loaded}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Pendientes</div><div className={styles.kpiValue}>{matches.length - loaded}</div></div>
        </div>
      </TournamentHero>

      {message && <div className={styles.notice}>{message}</div>}

      <section className={styles.commandSection}>
        <div className={styles.commandHeader}>
          <div><p className={styles.sectionEyebrow}>Ahora</p><h2 className={styles.commandTitle}>Qué requiere atención</h2></div>
          {loading && <span className={styles.badge}>Cargando</span>}
        </div>
        <div className={styles.actionGrid}>
          {nextActions.map((action) => <Link key={action.title} href={action.href} className={styles.actionCard}><strong>{action.title}</strong><span>Ir →</span></Link>)}
        </div>
      </section>

      <section className={styles.commandSection}>
        <div className={styles.commandHeader}>
          <div><p className={styles.sectionEyebrow}>Torneo</p><h2 className={styles.commandTitle}>Competiciones</h2></div>
        </div>
        <div className={styles.competitionList}>
          {competitions.map((competition) => {
            const allowed = competition.key.startsWith("liga_") ? canFixture : canCompetition;
            return (
              <article key={competition.key} className={styles.competitionRow}>
                <div className={styles.competitionMain}>
                  <div><div className={styles.competitionTitle}>{competition.title}</div><div className={styles.rowMeta}>{competition.subtitle}</div></div>
                  <span className={styles.badge}>{statusFor(competition.matches)}</span>
                </div>
                <div className={styles.competitionStats}><span>{competition.matches.length} partidos</span><span>{competition.matches.filter(isLoadedMatch).length} cargados</span></div>
                {allowed && <div className={styles.actions}><Link href={competition.href} className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link></div>}
              </article>
            );
          })}
        </div>
      </section>

      {canCompetition && (
        <section className={styles.advancedBar}>
          <div><strong>Más opciones</strong><p>Excepciones, partidos manuales y cambios poco comunes quedan separados del flujo normal.</p></div>
          <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link>
        </section>
      )}
    </TournamentPage>
  );
}
