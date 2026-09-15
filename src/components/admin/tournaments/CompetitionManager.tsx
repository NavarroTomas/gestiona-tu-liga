"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import {
  calculateStandings,
  fetchCompetitionConfigs,
  fetchTournamentMatches,
  fetchTournamentSeasons,
  fetchTournamentTeams,
  generateRoundRobin,
  isLoadedMatch,
  normalizeDivision,
  winnerOf,
  type CompetitionConfig,
  type StandingRow,
  type TournamentMatch,
  type TournamentTeam,
} from "@/lib/adminTournaments";
import {
  Field,
  Input,
  Select,
  Tabs,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "./TournamentUi";

type View = "inicio" | "clasificatoria" | "copas" | "ascensos" | "sanciones";
type Sanction = { id: string; temporada: string; equipo: string; puntos_descontados: number; motivo: string };

const CUP_DIVISION = "copa";

function finalWinner(matches: TournamentMatch[], competition: string) {
  const final = matches.find((match) =>
    match.competicion === competition &&
    String(match.fase || "").toLowerCase() === "final",
  );
  return winnerOf(final);
}

function groupNames(count: number) {
  return Array.from({ length: Math.max(1, count) }, (_, index) => String.fromCharCode(65 + index));
}

function emptyGroups(names: string[], size: number) {
  return Object.fromEntries(names.map((name) => [name, Array(Math.max(2, size)).fill("")])) as Record<string, string[]>;
}

function seededPairs(teams: string[]) {
  const clean = teams.filter(Boolean);
  const pairs: Array<[string, string]> = [];
  for (let left = 0, right = clean.length - 1; left < right; left += 1, right -= 1) {
    pairs.push([clean[left], clean[right]]);
  }
  return pairs;
}

function nextKnockoutAction(list: TournamentMatch[]) {
  if (!list.length) return "Esperando creación de cruces";
  if (finalWinner(list, String(list[0]?.competicion || ""))) return "Copa finalizada";
  const final = list.find((match) => match.fase === "final");
  if (final) return isLoadedMatch(final) ? "Copa finalizada" : "Esperando resultado de la final";
  const semis = list.filter((match) => match.fase === "semifinal");
  if (semis.length) return semis.every(isLoadedMatch) ? "Crear final" : "Esperando semifinales";
  const quarters = list.filter((match) => match.fase === "cuartos");
  if (quarters.length) return quarters.every(isLoadedMatch) ? "Crear semifinales" : "Esperando cuartos";
  return "Revisar competición";
}

export default function CompetitionManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [view, setView] = useState<View>("inicio");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [configs, setConfigs] = useState<CompetitionConfig[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [showApaPublic, setShowApaPublic] = useState(false);
  const [showArgentinaPublic, setShowArgentinaPublic] = useState(false);
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sanctionTeam, setSanctionTeam] = useState("");
  const [sanctionPoints, setSanctionPoints] = useState(1);
  const [sanctionReason, setSanctionReason] = useState("No presentación (W.O.)");

  useEffect(() => {
    fetchTournamentSeasons().then((rows) => {
      setSeasons(rows);
      setTemporada((current) => current || rows[0] || "Temporada 4");
    }).catch(() => {
      setSeasons(["Temporada 4"]);
      setTemporada("Temporada 4");
    });
  }, []);

  const groupConfig = useMemo(
    () => configs.find((config) => config.slug === "copa_clasificatoria"),
    [configs],
  );
  const playoffConfig = useMemo(
    () => configs.find((config) => config.slug === "playoffs"),
    [configs],
  );

  const groupCount = Math.max(1, Number(groupConfig?.reglas?.cantidad_grupos ?? 4));
  const teamsPerGroup = Math.max(2, Number(groupConfig?.reglas?.equipos_por_grupo ?? 4));
  const argentinaPerGroup = Math.max(0, Number(groupConfig?.reglas?.clasifican_copa_argentina ?? 2));
  const apaPerGroup = Math.max(0, Number(groupConfig?.reglas?.clasifican_copa_apa ?? 2));
  const groupLabels = useMemo(() => groupNames(groupCount), [groupCount]);

  async function load() {
    if (!temporada) return;
    setLoading(true);
    setMessage("");
    try {
      const [teamRows, matchRows, configRows, sanctionsRes, publicRes] = await Promise.all([
        fetchTournamentTeams(temporada),
        fetchTournamentMatches({ temporada }),
        fetchCompetitionConfigs(temporada),
        supabase.from("sanciones_equipos").select("*").eq("temporada", temporada).order("created_at", { ascending: false }),
        supabase.from("configuracion_copas").select("*").eq("temporada", temporada).maybeSingle(),
      ]);

      setTeams(teamRows);
      setMatches(matchRows);
      setConfigs(configRows);
      setSanctions((sanctionsRes.data || []) as Sanction[]);
      setShowApaPublic(Boolean(publicRes.data?.copa_apa_activa));
      setShowArgentinaPublic(Boolean(publicRes.data?.copa_argentina_activa));

      const config = configRows.find((item) => item.slug === "copa_clasificatoria");
      const nextGroupCount = Math.max(1, Number(config?.reglas?.cantidad_grupos ?? 4));
      const nextGroupSize = Math.max(2, Number(config?.reglas?.equipos_por_grupo ?? 4));
      const labels = groupNames(nextGroupCount);
      const groupMatches = matchRows.filter((match) => match.competicion === "copa_clasificatoria" && match.fase === "grupos");
      const next = emptyGroups(labels, nextGroupSize);

      for (const group of labels) {
        const names = Array.from(new Set(
          groupMatches
            .filter((match) => match.grupo === group)
            .flatMap((match) => [match.local, match.visitante || ""])
            .filter(Boolean),
        ));
        next[group] = [...names.slice(0, nextGroupSize), ...Array(Math.max(0, nextGroupSize - names.length)).fill("")];
      }
      setGroups(next);
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar la competición.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [temporada]);

  const leagueFirst = useMemo(() => calculateStandings(
    matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera"), sanctions,
  ), [matches, sanctions]);
  const leagueSecond = useMemo(() => calculateStandings(
    matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda"), sanctions,
  ), [matches, sanctions]);
  const groupMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_clasificatoria" && match.fase === "grupos"), [matches]);
  const argentinaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_argentina"), [matches]);
  const apaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_apa"), [matches]);
  const championsMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_campeones"), [matches]);
  const playoffMatches = useMemo(() => matches.filter((match) => match.competicion === "playoffs"), [matches]);

  const groupTables = useMemo(() => Object.fromEntries(
    groupLabels.map((group) => [group, calculateStandings(groupMatches.filter((match) => match.grupo === group))]),
  ) as Record<string, StandingRow[]>, [groupLabels, groupMatches]);

  const expectedGamesPerTeam = teamsPerGroup - 1;
  const groupsComplete = groupLabels.every((group) =>
    (groupTables[group] || []).length === teamsPerGroup &&
    (groupTables[group] || []).every((row) => row.pj === expectedGamesPerTeam),
  );

  const usedGroupTeams = useMemo(() => new Set(Object.values(groups).flat().filter(Boolean)), [groups]);
  const loadedTournamentMatches = matches.filter((match) => match.competicion !== "liga" && isLoadedMatch(match)).length;

  function teamOptions(current: string) {
    return teams.filter((team) => team.nombre === current || !usedGroupTeams.has(team.nombre));
  }

  async function savePublicState() {
    setLoading(true);
    try {
      const { error } = await supabase.from("configuracion_copas").upsert({
        temporada,
        copa_apa_activa: showApaPublic,
        copa_argentina_activa: showArgentinaPublic,
        updated_at: new Date().toISOString(),
      }, { onConflict: "temporada" });
      if (error) throw error;
      setMessage("Publicación actualizada. Esto no elimina ni modifica los partidos de las copas.");
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar el estado público.");
    } finally {
      setLoading(false);
    }
  }

  async function createOrRebuildGroups() {
    const all = Object.values(groups).flat().filter(Boolean);
    const expected = groupCount * teamsPerGroup;
    if (all.length !== expected || new Set(all).size !== expected) {
      setMessage(`Necesitás ${expected} equipos únicos: ${groupCount} grupos de ${teamsPerGroup}.`);
      return;
    }
    if (groupMatches.some(isLoadedMatch)) {
      setMessage("Esta fase ya tiene resultados. Para cambiarla usá Acciones avanzadas o anulá primero los partidos afectados.");
      return;
    }

    const games = groupLabels.flatMap((group) =>
      generateRoundRobin(groups[group], false).map((game) => ({ ...game, grupo: group })),
    );
    if (!window.confirm(`Se crearán ${games.length} partidos de grupos. ¿Continuar?`)) return;

    setLoading(true);
    try {
      if (groupMatches.length) {
        const ids = groupMatches.map((match) => match.id);
        const { error: deleteError } = await supabase.from("partidos").delete().in("id", ids);
        if (deleteError) throw deleteError;
      }
      const payload = games.map((game) => ({
        local: game.local,
        visitante: game.visitante,
        resultado: null,
        fecha: String(game.fecha),
        temporada,
        division: CUP_DIVISION,
        dia: null,
        hora: null,
        partido_id: null,
        competicion: "copa_clasificatoria",
        grupo: game.grupo,
        fase: "grupos",
        ronda: `Grupo ${game.grupo} · Fecha ${game.fecha}`,
        estado: "programado",
      }));
      const { error } = await supabase.from("partidos").insert(payload);
      if (error) throw error;
      setMessage(`Fase creada correctamente: ${groupCount} grupos, ${payload.length} partidos.`);
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la fase de grupos.");
    } finally {
      setLoading(false);
    }
  }

  async function createCupCrosses() {
    if (!groupsComplete) {
      setMessage("Todavía faltan partidos de grupos. Cuando todos estén cargados vas a poder crear los cruces.");
      return;
    }
    if (argentinaMatches.length || apaMatches.length) {
      setMessage("Ya existen cruces de Copa Argentina o Copa APA. Podés modificarlos desde Acciones avanzadas.");
      return;
    }

    const argentinaQualifiers = groupLabels.flatMap((group) =>
      (groupTables[group] || []).slice(0, argentinaPerGroup).map((row) => row.equipo),
    );
    const apaQualifiers = groupLabels.flatMap((group) =>
      (groupTables[group] || []).slice(argentinaPerGroup, argentinaPerGroup + apaPerGroup).map((row) => row.equipo),
    );

    if (argentinaQualifiers.length % 2 !== 0 || apaQualifiers.length % 2 !== 0) {
      setMessage("La cantidad de clasificados no permite generar cruces automáticos parejos. Ajustá las reglas o armá los cruces manualmente en Acciones avanzadas.");
      return;
    }

    const argentinaPairs = seededPairs(argentinaQualifiers);
    const apaPairs = seededPairs(apaQualifiers);
    const payload = [
      ...argentinaPairs.map(([local, visitante], index) => ({ local, visitante, competicion: "copa_argentina", ronda: `Copa Argentina · Cruce ${index + 1}` })),
      ...apaPairs.map(([local, visitante], index) => ({ local, visitante, competicion: "copa_apa", ronda: `Copa APA · Cruce ${index + 1}` })),
    ].map((game) => ({
      ...game,
      resultado: null,
      fecha: "1",
      temporada,
      division: CUP_DIVISION,
      dia: null,
      hora: null,
      partido_id: null,
      grupo: null,
      fase: argentinaPairs.length === 4 || apaPairs.length === 4 ? "cuartos" : "eliminacion",
      estado: "programado",
    }));

    if (!payload.length) {
      setMessage("No hay clasificados configurados para crear copas.");
      return;
    }

    const { error } = await supabase.from("partidos").insert(payload);
    if (error) {
      setMessage("No pude crear los cruces.");
      return;
    }
    setMessage(`Cruces creados: ${argentinaPairs.length} de Copa Argentina y ${apaPairs.length} de Copa APA.`);
    await load();
  }

  async function createNextKnockoutRound(competition: "copa_argentina" | "copa_apa") {
    const cup = matches.filter((match) => match.competicion === competition);
    const label = competition === "copa_argentina" ? "Copa Argentina" : "Copa APA";
    if (!cup.length) {
      setMessage(`${label} todavía no tiene cruces.`);
      return;
    }
    if (finalWinner(matches, competition)) {
      setMessage(`${label} ya tiene campeón.`);
      return;
    }

    const currentPhase = cup.some((match) => match.fase === "semifinal")
      ? cup.filter((match) => match.fase === "semifinal")
      : cup.filter((match) => match.fase === "cuartos" || match.fase === "eliminacion");
    const existingFinal = cup.find((match) => match.fase === "final");
    if (existingFinal) {
      setMessage("La final ya existe. Cargá su resultado desde Centro de partidos.");
      return;
    }

    const winners = currentPhase.map(winnerOf);
    if (!currentPhase.length || winners.some((winner) => !winner)) {
      setMessage("Todavía faltan resultados en la fase actual.");
      return;
    }
    if (winners.length % 2 !== 0) {
      setMessage("La fase terminó con una cantidad impar de ganadores. Usá Acciones avanzadas para resolver la excepción.");
      return;
    }

    const pairs = seededPairs(winners as string[]);
    const nextPhase = pairs.length === 1 ? "final" : pairs.length === 2 ? "semifinal" : "eliminacion";
    const nextFecha = String(Math.max(...cup.map((match) => Number(match.fecha) || 0), 0) + 1);
    const { error } = await supabase.from("partidos").insert(
      pairs.map(([local, visitante], index) => ({
        local,
        visitante,
        resultado: null,
        fecha: nextFecha,
        temporada,
        division: CUP_DIVISION,
        competicion: competition,
        fase: nextPhase,
        ronda: nextPhase === "final" ? `${label} · Final` : `${label} · ${nextPhase === "semifinal" ? "Semifinal" : "Cruce"} ${index + 1}`,
        estado: "programado",
      })),
    );
    if (error) {
      setMessage("No pude crear la siguiente fase.");
      return;
    }
    setMessage(nextPhase === "final" ? "Final creada con los ganadores reales." : "Siguiente fase creada con los ganadores reales.");
    await load();
  }

  async function generateChampionsCup() {
    if (championsMatches.length) {
      setMessage("La Copa de Campeones ya existe.");
      return;
    }
    const participants = [
      leagueFirst[0]?.equipo,
      leagueSecond[0]?.equipo,
      finalWinner(matches, "copa_argentina"),
      finalWinner(matches, "copa_apa"),
    ].filter(Boolean) as string[];
    if (participants.length !== 4 || new Set(participants).size !== 4) {
      setMessage("Todavía faltan campeones. Podés esperar a que se definan o crear los cruces manualmente en Acciones avanzadas.");
      return;
    }
    const pairs = seededPairs(participants);
    const { error } = await supabase.from("partidos").insert(pairs.map(([local, visitante], index) => ({
      local, visitante, resultado: null, fecha: "1", temporada, division: CUP_DIVISION,
      competicion: "copa_campeones", fase: "semifinal", ronda: `Copa de Campeones · Semifinal ${index + 1}`, estado: "programado",
    })));
    if (error) { setMessage("No pude iniciar la Copa de Campeones."); return; }
    setMessage("Copa de Campeones creada con los cuatro campeones detectados.");
    await load();
  }

  async function continueChampionsCup() {
    const semis = championsMatches.filter((match) => match.fase === "semifinal");
    const final = championsMatches.find((match) => match.fase === "final");
    if (final) { setMessage("La final ya existe."); return; }
    const winners = semis.map(winnerOf);
    if (semis.length !== 2 || winners.some((winner) => !winner)) {
      setMessage("Faltan resultados de semifinales.");
      return;
    }
    const { error } = await supabase.from("partidos").insert({
      local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada,
      division: CUP_DIVISION, competicion: "copa_campeones", fase: "final", ronda: "Copa de Campeones · Final", estado: "programado",
    });
    if (error) { setMessage("No pude crear la final."); return; }
    setMessage("Final creada.");
    await load();
  }

  async function generatePlayoffs() {
    if (playoffMatches.length) { setMessage("Los Playoffs ya existen."); return; }
    const positions = Array.isArray(playoffConfig?.reglas?.segunda_posiciones)
      ? playoffConfig?.reglas?.segunda_posiciones.map(Number)
      : [2, 3, 4, 5];
    const selected = positions.map((position: number) => leagueSecond[position - 1]?.equipo).filter(Boolean) as string[];
    if (selected.length < 2 || selected.length % 2 !== 0) {
      setMessage("La configuración actual de Playoffs no permite generar cruces automáticos. Ajustala o usá Acciones avanzadas.");
      return;
    }
    const pairs = seededPairs(selected);
    const { error } = await supabase.from("partidos").insert(pairs.map(([local, visitante], index) => ({
      local, visitante, resultado: null, fecha: "1", temporada, division: CUP_DIVISION,
      competicion: "playoffs", fase: "semifinal", ronda: `Playoffs Ascenso · Cruce ${index + 1}`, estado: "programado",
    })));
    if (error) { setMessage("No pude crear los Playoffs."); return; }
    setMessage(`Playoffs creados con ${selected.length} participantes.`);
    await load();
  }

  async function continuePlayoffs() {
    const semis = playoffMatches.filter((match) => match.fase === "semifinal");
    const final = playoffMatches.find((match) => match.fase === "final_ascenso");
    const promotion = playoffMatches.find((match) => match.fase === "promocion");
    if (!final) {
      const winners = semis.map(winnerOf);
      if (!semis.length || winners.some((winner) => !winner)) { setMessage("Faltan resultados de los cruces actuales."); return; }
      const pairs = seededPairs(winners as string[]);
      if (pairs.length !== 1) { setMessage("La estructura requiere otra ronda. Resolvela desde Acciones avanzadas."); return; }
      const { error } = await supabase.from("partidos").insert({
        local: pairs[0][0], visitante: pairs[0][1], resultado: null, fecha: "2", temporada,
        division: CUP_DIVISION, competicion: "playoffs", fase: "final_ascenso", ronda: "Playoffs Ascenso · Final", estado: "programado",
      });
      if (error) { setMessage("No pude crear la final de ascenso."); return; }
      setMessage("Final de ascenso creada.");
      await load();
      return;
    }
    if (!promotion) {
      const winner = winnerOf(final);
      const fromBottom = Math.max(1, Number(playoffConfig?.reglas?.primera_promocion_desde_abajo ?? 2));
      const firstOpponent = leagueFirst[leagueFirst.length - fromBottom]?.equipo;
      if (!winner || !firstOpponent) { setMessage("Todavía falta definir el ganador o el rival de Primera."); return; }
      const { error } = await supabase.from("partidos").insert({
        local: winner, visitante: firstOpponent, resultado: null, fecha: "3", temporada,
        division: CUP_DIVISION, competicion: "playoffs", fase: "promocion", ronda: "Promoción · Ascenso/Descenso", estado: "programado",
      });
      if (error) { setMessage("No pude crear la promoción."); return; }
      setMessage("Promoción creada.");
      await load();
      return;
    }
    setMessage("Los Playoffs ya llegaron a la promoción.");
  }

  async function addSanction() {
    if (!sanctionTeam || sanctionPoints <= 0 || !sanctionReason.trim()) {
      setMessage("Completá club, puntos y motivo.");
      return;
    }
    const { error } = await supabase.from("sanciones_equipos").insert({
      temporada, equipo: sanctionTeam, puntos_descontados: sanctionPoints, motivo: sanctionReason.trim(),
    });
    if (error) { setMessage("No pude registrar la sanción."); return; }
    setSanctionTeam("");
    setMessage("Sanción registrada.");
    await load();
  }

  async function removeSanction(id: string) {
    if (!window.confirm("¿Eliminar esta sanción?")) return;
    const { error } = await supabase.from("sanciones_equipos").delete().eq("id", id);
    if (error) { setMessage("No pude eliminar la sanción."); return; }
    setMessage("Sanción eliminada.");
    await load();
  }

  const cupList = (list: TournamentMatch[]) => (
    <div className={styles.list}>
      {list.map((match) => (
        <div key={String(match.id)} className={styles.row}>
          <div>
            <div className={styles.rowTitle}>{match.local} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante}</div>
            <div className={styles.rowMeta}>{match.ronda || match.fase} · {match.dia || "sin día"} · {match.hora || "sin hora"}</div>
          </div>
          <div className={styles.actions}>
            <span className={`${styles.badge} ${isLoadedMatch(match) ? styles.badgeGood : ""}`}>{isLoadedMatch(match) ? "Resultado cargado" : "Pendiente"}</span>
            {isLoadedMatch(match) && <Link href={`/admin/partidos/${match.id}`} className={styles.secondary}>Ver partido</Link>}
          </div>
        </div>
      ))}
      {!list.length && <div className={styles.empty}>Todavía no hay partidos.</div>}
    </div>
  );

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Gestión guiada"
          title="Competiciones"
          description="Elegí qué querés administrar. El panel te indica qué está listo, qué falta y qué acción conviene hacer después. Las excepciones quedan disponibles sin tocar código."
        >
          <div className={styles.toolbar}>
            <Field label="Temporada"><Select value={temporada} onChange={(event) => setTemporada(event.target.value)}>{seasons.map((season) => <option key={season}>{season}</option>)}</Select></Field>
            <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Configurar reglas</Link>
            <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Acciones avanzadas</Link>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{teams.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos de copas</div><div className={styles.kpiValue}>{matches.filter((match) => match.competicion !== "liga").length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Con resultado</div><div className={styles.kpiValue}>{loadedTournamentMatches}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Sanciones</div><div className={styles.kpiValue}>{sanctions.length}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <Tabs value={view} onChange={setView} items={[
          { value: "inicio", label: "Qué falta hacer" },
          { value: "clasificatoria", label: "Grupos" },
          { value: "copas", label: "Copas" },
          { value: "ascensos", label: "Ascensos" },
          { value: "sanciones", label: "Sanciones" },
        ]} />

        {view === "inicio" && (
          <div className={styles.split}>
            <TournamentPanel eyebrow="Estado" title="Qué está pasando" description="Entrá al bloque que necesite atención; no hace falta seguir un orden técnico.">
              <div className={styles.list}>
                <button type="button" className={styles.row} onClick={() => setView("clasificatoria")}>
                  <div><div className={styles.rowTitle}>Fase de grupos</div><div className={styles.rowMeta}>{groupCount} grupos de {teamsPerGroup} · {groupMatches.length} partidos creados</div></div>
                  <span className={`${styles.badge} ${groupsComplete ? styles.badgeGood : styles.badgeWarn}`}>{groupsComplete ? "Lista para crear copas" : groupMatches.length ? "En curso" : "Sin crear"}</span>
                </button>
                <button type="button" className={styles.row} onClick={() => setView("copas")}>
                  <div><div className={styles.rowTitle}>Copa Argentina</div><div className={styles.rowMeta}>{nextKnockoutAction(argentinaMatches)}</div></div>
                  <span className={styles.badge}>{finalWinner(matches, "copa_argentina") || `${argentinaMatches.length} partidos`}</span>
                </button>
                <button type="button" className={styles.row} onClick={() => setView("copas")}>
                  <div><div className={styles.rowTitle}>Copa APA</div><div className={styles.rowMeta}>{nextKnockoutAction(apaMatches)}</div></div>
                  <span className={styles.badge}>{finalWinner(matches, "copa_apa") || `${apaMatches.length} partidos`}</span>
                </button>
                <button type="button" className={styles.row} onClick={() => setView("ascensos")}>
                  <div><div className={styles.rowTitle}>Playoffs de ascenso</div><div className={styles.rowMeta}>{playoffMatches.length ? "Estructura creada" : "Todavía no iniciados"}</div></div>
                  <span className={styles.badge}>{playoffMatches.length ? "Administrar" : "Pendiente"}</span>
                </button>
              </div>
            </TournamentPanel>

            <TournamentPanel eyebrow="Web pública" title="Qué mostrar a los usuarios" description="Ocultar una copa solamente la saca de la web pública. No borra partidos, resultados ni configuración.">
              <div className={styles.list}>
                <Field label="Mostrar Copa Argentina en la web">
                  <Select value={showArgentinaPublic ? "si" : "no"} onChange={(event) => setShowArgentinaPublic(event.target.value === "si")}>
                    <option value="si">Sí, mostrarla</option><option value="no">No, mantenerla oculta</option>
                  </Select>
                </Field>
                <Field label="Mostrar Copa APA en la web">
                  <Select value={showApaPublic ? "si" : "no"} onChange={(event) => setShowApaPublic(event.target.value === "si")}>
                    <option value="si">Sí, mostrarla</option><option value="no">No, mantenerla oculta</option>
                  </Select>
                </Field>
                <button className={styles.primary} type="button" onClick={savePublicState} disabled={loading}>Guardar publicación</button>
              </div>
            </TournamentPanel>
          </div>
        )}

        {view === "clasificatoria" && (
          <TournamentPanel
            eyebrow="Paso guiado"
            title="Armar la fase de grupos"
            description={`La configuración actual pide ${groupCount} grupos de ${teamsPerGroup} equipos. Podés cambiar estas cantidades desde Configurar reglas.`}
            action={<Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Cambiar formato</Link>}
          >
            <div className={groupCount <= 4 ? styles.grid4 : styles.grid3}>
              {groupLabels.map((group) => (
                <div key={group}>
                  <p className={styles.sectionEyebrow}>Grupo {group}</p>
                  <div className={styles.list} style={{ marginTop: 10 }}>
                    {(groups[group] || Array(teamsPerGroup).fill("")).map((value, index) => (
                      <Select key={`${group}-${index}`} value={value} disabled={groupMatches.some(isLoadedMatch)} onChange={(event) => setGroups((current) => ({ ...current, [group]: (current[group] || []).map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))}>
                        <option value="">Elegir equipo {index + 1}</option>
                        {teamOptions(value).map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}
                      </Select>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.notice}>
              Se crearán {groupLabels.length * (teamsPerGroup * (teamsPerGroup - 1) / 2)} partidos. Cada equipo jugará {expectedGamesPerTeam} partidos dentro de su grupo.
            </div>

            <div className={styles.toolbar}>
              <button className={styles.primary} type="button" onClick={createOrRebuildGroups} disabled={loading || groupMatches.some(isLoadedMatch)}>{groupMatches.length ? "Actualizar fase de grupos" : "Crear fase de grupos"}</button>
              {groupsComplete && !argentinaMatches.length && !apaMatches.length && <button className={styles.primary} type="button" onClick={createCupCrosses}>Crear cruces de las copas</button>}
              <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Resolver una excepción</Link>
            </div>

            {groupMatches.length > 0 && (
              <div className={styles.grid4} style={{ marginTop: 24 }}>
                {groupLabels.map((group) => (
                  <div key={group} className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>#</th><th>Grupo {group}</th><th>PTS</th><th>DG</th></tr></thead>
                      <tbody>{(groupTables[group] || []).map((row, index) => <tr key={row.equipo}><td>{index + 1}</td><td><strong>{row.equipo}</strong></td><td>{row.pts}</td><td>{row.dg}</td></tr>)}</tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </TournamentPanel>
        )}

        {view === "copas" && (
          <div className={styles.list}>
            <TournamentPanel eyebrow="Eliminación directa" title="Copa Argentina" description={nextKnockoutAction(argentinaMatches)} action={<div className={styles.actions}><button className={styles.primary} type="button" disabled={!argentinaMatches.length || Boolean(finalWinner(matches, "copa_argentina"))} onClick={() => createNextKnockoutRound("copa_argentina")}>{nextKnockoutAction(argentinaMatches)}</button><Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Editar manualmente</Link></div>}>{cupList(argentinaMatches)}</TournamentPanel>

            <TournamentPanel eyebrow="Eliminación directa" title="Copa APA" description={nextKnockoutAction(apaMatches)} action={<div className={styles.actions}><button className={styles.primary} type="button" disabled={!apaMatches.length || Boolean(finalWinner(matches, "copa_apa"))} onClick={() => createNextKnockoutRound("copa_apa")}>{nextKnockoutAction(apaMatches)}</button><Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Editar manualmente</Link></div>}>{cupList(apaMatches)}</TournamentPanel>

            <TournamentPanel eyebrow="Campeones" title="Copa de Campeones" description="Por defecto usa campeón de Primera, Segunda, Copa Argentina y Copa APA. Si querés otros participantes podés cambiarlos manualmente.">
              <div className={styles.actions}>
                {!championsMatches.length ? <button className={styles.primary} type="button" onClick={generateChampionsCup}>Crear con campeones detectados</button> : <button className={styles.primary} type="button" onClick={continueChampionsCup}>Crear siguiente partido</button>}
                <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Elegir participantes manualmente</Link>
              </div>
              <div style={{ marginTop: 18 }}>{cupList(championsMatches)}</div>
            </TournamentPanel>
          </div>
        )}

        {view === "ascensos" && (
          <TournamentPanel eyebrow="Ascenso y promoción" title="Playoffs" description="Las posiciones participantes salen de las reglas configuradas. Podés cambiar esas posiciones o resolver cualquier excepción manualmente.">
            <div className={styles.notice}>
              Segunda: {Array.isArray(playoffConfig?.reglas?.segunda_posiciones) ? playoffConfig?.reglas?.segunda_posiciones.join("°, ") + "°" : "2°, 3°, 4° y 5°"} · Promoción contra el {Number(playoffConfig?.reglas?.primera_promocion_desde_abajo ?? 2)}° desde abajo de Primera.
            </div>
            <div className={styles.actions} style={{ marginTop: 16 }}>
              {!playoffMatches.length ? <button className={styles.primary} type="button" onClick={generatePlayoffs}>Crear Playoffs con estas reglas</button> : <button className={styles.primary} type="button" onClick={continuePlayoffs}>Crear siguiente instancia</button>}
              <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Cambiar reglas</Link>
              <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Elegir participantes manualmente</Link>
            </div>
            <div style={{ marginTop: 18 }}>{cupList(playoffMatches)}</div>
          </TournamentPanel>
        )}

        {view === "sanciones" && (
          <TournamentPanel eyebrow="Disciplina" title="Descontar puntos" description="Elegí club, cantidad y motivo. El descuento impacta en las tablas de esta temporada.">
            <div className={styles.grid3}>
              <Field label="Club"><Select value={sanctionTeam} onChange={(event) => setSanctionTeam(event.target.value)}><option value="">Seleccionar club</option>{teams.map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}</Select></Field>
              <Field label="Puntos a descontar"><Input type="number" min={1} value={sanctionPoints} onChange={(event) => setSanctionPoints(Math.max(1, Number(event.target.value || 1)))} /></Field>
              <Field label="Motivo"><Input value={sanctionReason} onChange={(event) => setSanctionReason(event.target.value)} /></Field>
            </div>
            <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={addSanction}>Aplicar descuento</button></div>
            <div className={styles.list} style={{ marginTop: 20 }}>
              {sanctions.map((sanction) => <div key={sanction.id} className={styles.row}><div><div className={styles.rowTitle}>{sanction.equipo} · -{sanction.puntos_descontados} pts</div><div className={styles.rowMeta}>{sanction.motivo}</div></div><button className={styles.danger} type="button" onClick={() => removeSanction(sanction.id)}>Eliminar sanción</button></div>)}
              {!sanctions.length && <div className={styles.empty}>No hay sanciones registradas.</div>}
            </div>
          </TournamentPanel>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
