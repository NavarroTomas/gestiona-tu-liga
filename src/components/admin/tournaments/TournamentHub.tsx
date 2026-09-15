"use client";

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
import {
  Field,
  Select,
  TournamentHero,
  TournamentPage,
  tournamentStyles as styles,
} from "./TournamentUi";

type CompetitionSummary = {
  key: string;
  title: string;
  subtitle: string;
  matches: TournamentMatch[];
  manageHref: string;
  configSlug?: string;
};

function statusFor(matches: TournamentMatch[]) {
  if (!matches.length) return { label: "Sin iniciar", tone: "neutral" as const };
  const loaded = matches.filter(isLoadedMatch).length;
  if (loaded === matches.length) return { label: "Finalizada / al día", tone: "good" as const };
  if (loaded > 0) return { label: "En curso", tone: "warn" as const };
  return { label: "Programada", tone: "neutral" as const };
}

function latestNumericRound(matches: TournamentMatch[]) {
  const numbers = matches
    .map((match) => Number(match.fecha))
    .filter((value) => Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
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
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar el estado de la temporada."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [season]);

  const competitions = useMemo<CompetitionSummary[]>(() => {
    const first = matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera");
    const second = matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda");
    const classified = matches.filter((match) => match.competicion === "copa_clasificatoria");
    const argentina = matches.filter((match) => match.competicion === "copa_argentina");
    const apa = matches.filter((match) => match.competicion === "copa_apa");
    const champions = matches.filter((match) => match.competicion === "copa_campeones");
    const playoffs = matches.filter((match) => match.competicion === "playoffs");

    const result: CompetitionSummary[] = [
      { key: "liga_primera", title: "Primera División", subtitle: "Liga · fixture, calendario y tabla", matches: first, manageHref: "/admin/fixture", configSlug: "liga_primera" },
      { key: "liga_segunda", title: "Segunda División", subtitle: "Liga · fixture, calendario y tabla", matches: second, manageHref: "/admin/fixture", configSlug: "liga_segunda" },
      { key: "copa_clasificatoria", title: "Clasificatoria", subtitle: "Grupos y clasificación a copas", matches: classified, manageHref: "/admin/competicion", configSlug: "copa_clasificatoria" },
      { key: "copa_argentina", title: "Copa Argentina", subtitle: "Eliminación directa", matches: argentina, manageHref: "/admin/competicion", configSlug: "copa_argentina" },
      { key: "copa_apa", title: "Copa APA", subtitle: "Eliminación directa", matches: apa, manageHref: "/admin/competicion", configSlug: "copa_apa" },
      { key: "copa_campeones", title: "Copa de Campeones", subtitle: "Campeones de la temporada", matches: champions, manageHref: "/admin/competicion", configSlug: "copa_campeones" },
      { key: "playoffs", title: "Playoffs de ascenso", subtitle: "Ascenso, descenso y promoción", matches: playoffs, manageHref: "/admin/competicion", configSlug: "playoffs" },
    ];

    const configuredKeys = new Set(result.map((item) => item.key));
    for (const config of configs) {
      if (!configuredKeys.has(config.slug)) {
        result.push({
          key: config.slug,
          title: config.nombre,
          subtitle: `Competición ${config.tipo}`,
          matches: matches.filter((match) => match.competicion === config.slug),
          manageHref: "/admin/competicion",
          configSlug: config.slug,
        });
      }
    }

    return result;
  }, [matches, configs]);

  const nextActions = useMemo(() => {
    const actions: Array<{ title: string; detail: string; href: string }> = [];
    const leagueMatches = matches.filter((match) => match.competicion === "liga");
    const unscheduled = leagueMatches.filter((match) => !isLoadedMatch(match) && (!match.dia || !match.hora));
    if (unscheduled.length) {
      actions.push({ title: `Programar ${unscheduled.length} partido${unscheduled.length === 1 ? "" : "s"}`, detail: "Hay partidos de liga todavía sin día u horario.", href: "/admin/fixture" });
    }

    const pendingResults = matches.filter((match) => match.competicion !== "liga" && !isLoadedMatch(match));
    if (pendingResults.length) {
      actions.push({ title: `${pendingResults.length} partido${pendingResults.length === 1 ? "" : "s"} de copa pendientes`, detail: "Cuando se carguen los resultados vas a poder avanzar las fases correspondientes.", href: "/admin/competicion" });
    }

    for (const cup of ["copa_argentina", "copa_apa"]) {
      const cupMatches = matches.filter((match) => match.competicion === cup);
      if (cupMatches.length && cupMatches.every(isLoadedMatch)) {
        actions.push({ title: `Revisar siguiente fase de ${cup === "copa_argentina" ? "Copa Argentina" : "Copa APA"}`, detail: "Todos los partidos creados de esta copa ya tienen resultado.", href: "/admin/competicion" });
      }
    }

    if (!leagueMatches.length) {
      actions.push({ title: "Crear el fixture de liga", detail: "Todavía no hay partidos de liga para esta temporada.", href: "/admin/fixture" });
    }

    if (!actions.length) {
      actions.push({ title: "Temporada al día", detail: "No detecté tareas urgentes. Podés revisar reglas, participantes o calendario.", href: "/admin/torneos/configuracion" });
    }

    return actions.slice(0, 5);
  }, [matches]);

  const loaded = matches.filter(isLoadedMatch).length;
  const pending = matches.length - loaded;

  return (
    <TournamentPage>
      <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>

      <TournamentHero
        eyebrow="Centro de temporada"
        title={season || "Torneos"}
        description="Acá ves qué está pasando, qué falta hacer y entrás directamente a la competición que querés administrar. No necesitás conocer cómo está armado el sistema por dentro."
      >
        <div className={styles.toolbar}>
          <Field label="Temporada">
            <Select value={season} onChange={(event) => setSeason(event.target.value)}>
              {seasons.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
          {canCompetition && (
            <Link href="/admin/torneos/configuracion" className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ⚙ Configurar temporada
            </Link>
          )}
        </div>
        <div className={styles.kpis}>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{teamCount}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos</div><div className={styles.kpiValue}>{matches.length}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{loaded}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Pendientes</div><div className={styles.kpiValue}>{pending}</div></div>
        </div>
      </TournamentHero>

      {message && <div className={styles.notice}>{message}</div>}

      <section className={styles.commandSection}>
        <div className={styles.commandHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Qué falta hacer</p>
            <h2 className={styles.commandTitle}>Próximas acciones</h2>
          </div>
          <span className={styles.badge}>{loading ? "Cargando" : `${nextActions.length} sugerencias`}</span>
        </div>
        <div className={styles.actionGrid}>
          {nextActions.map((action) => (
            <Link key={`${action.title}-${action.href}`} href={action.href} className={styles.actionCard}>
              <div>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </div>
              <span>Ir →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.commandSection}>
        <div className={styles.commandHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Temporada</p>
            <h2 className={styles.commandTitle}>Competiciones</h2>
            <p className={styles.panelText}>Entrá a una competición para trabajarla. La configuración avanzada siempre queda disponible por separado.</p>
          </div>
          {canCompetition && <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>+ Crear competición</Link>}
        </div>

        <div className={styles.competitionList}>
          {competitions.map((competition) => {
            const status = statusFor(competition.matches);
            const round = latestNumericRound(competition.matches);
            const loadedCount = competition.matches.filter(isLoadedMatch).length;
            return (
              <article key={competition.key} className={styles.competitionRow}>
                <div className={styles.competitionMain}>
                  <div>
                    <div className={styles.competitionTitle}>{competition.title}</div>
                    <div className={styles.rowMeta}>{competition.subtitle}</div>
                  </div>
                  <span className={`${styles.badge} ${status.tone === "good" ? styles.badgeGood : status.tone === "warn" ? styles.badgeWarn : ""}`}>{status.label}</span>
                </div>

                <div className={styles.competitionStats}>
                  <span>{competition.matches.length} partidos</span>
                  <span>{loadedCount} cargados</span>
                  {round !== null && <span>Última fecha {round}</span>}
                </div>

                <div className={styles.actions}>
                  {(competition.key.startsWith("liga_") ? canFixture : canCompetition) && (
                    <Link href={competition.manageHref} className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Administrar</Link>
                  )}
                  {canCompetition && (
                    <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Configurar</Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.advancedBar}>
        <div>
          <strong>¿Necesitás hacer algo fuera de lo normal?</strong>
          <p>Las excepciones, reglas, nuevas competiciones y cambios estructurales están en Configuración avanzada.</p>
        </div>
        {canCompetition && <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir opciones avanzadas</Link>}
      </section>
    </TournamentPage>
  );
}
