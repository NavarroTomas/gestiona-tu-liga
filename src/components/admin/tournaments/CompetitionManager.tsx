"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import {
  calculateStandings,
  fetchTournamentMatches,
  fetchTournamentSeasons,
  fetchTournamentTeams,
  isLoadedMatch,
  safeDeleteScheduledMatches,
  winnerOf,
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

type View = "resumen" | "clasificatoria" | "copas" | "ascensos" | "sanciones";
type Sanction = { id: string; temporada: string; equipo: string; puntos_descontados: number; motivo: string; created_at?: string };

const GROUPS = ["A", "B", "C", "D"] as const;
const CUP_DIVISION = "copa";

function createGroupGames(teams: string[], group: string) {
  if (teams.filter(Boolean).length !== 4) throw new Error(`El Grupo ${group} debe tener 4 equipos.`);
  const clean = teams.filter(Boolean);
  return [
    [1, clean[0], clean[1]], [1, clean[2], clean[3]],
    [2, clean[0], clean[2]], [2, clean[1], clean[3]],
    [3, clean[0], clean[3]], [3, clean[1], clean[2]],
  ].map(([fecha, local, visitante]) => ({ fecha: String(fecha), local: String(local), visitante: String(visitante), grupo: group }));
}

function finalWinner(matches: TournamentMatch[], competition: string) {
  const final = matches.find((match) => match.competicion === competition && String(match.fase || "").toLowerCase().includes("final") && !String(match.fase || "").includes("semifinal"));
  return winnerOf(final);
}

export default function CompetitionManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [view, setView] = useState<View>("resumen");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [copaApaActiva, setCopaApaActiva] = useState(false);
  const [copaArgentinaActiva, setCopaArgentinaActiva] = useState(false);
  const [groups, setGroups] = useState<Record<string, string[]>>({ A: ["", "", "", ""], B: ["", "", "", ""], C: ["", "", "", ""], D: ["", "", "", ""] });
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

  async function load() {
    if (!temporada) return;
    setLoading(true);
    setMessage("");
    try {
      const [teamRows, matchRows, sanctionsRes, configRes] = await Promise.all([
        fetchTournamentTeams(temporada),
        fetchTournamentMatches({ temporada }),
        supabase.from("sanciones_equipos").select("*").eq("temporada", temporada).order("created_at", { ascending: false }),
        supabase.from("configuracion_copas").select("*").eq("temporada", temporada).maybeSingle(),
      ]);
      setTeams(teamRows);
      setMatches(matchRows);
      setSanctions((sanctionsRes.data || []) as Sanction[]);
      setCopaApaActiva(Boolean(configRes.data?.copa_apa_activa));
      setCopaArgentinaActiva(Boolean(configRes.data?.copa_argentina_activa));

      const groupMatches = matchRows.filter((match) => match.competicion === "copa_clasificatoria" && match.fase === "grupos");
      if (groupMatches.length) {
        const next: Record<string, string[]> = { A: [], B: [], C: [], D: [] };
        for (const group of GROUPS) {
          const names = Array.from(new Set(groupMatches.filter((match) => match.grupo === group).flatMap((match) => [match.local, match.visitante || ""]).filter(Boolean)));
          next[group] = [...names.slice(0, 4), ...Array(Math.max(0, 4 - names.length)).fill("")];
        }
        setGroups(next);
      } else {
        setGroups({ A: ["", "", "", ""], B: ["", "", "", ""], C: ["", "", "", ""], D: ["", "", "", ""] });
      }
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar la competición.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [temporada]);

  const leagueFirst = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && String(match.division).toLowerCase() === "primera"), sanctions), [matches, sanctions]);
  const leagueSecond = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && String(match.division).toLowerCase() === "segunda"), sanctions), [matches, sanctions]);
  const groupMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_clasificatoria" && match.fase === "grupos"), [matches]);
  const argentinaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_argentina"), [matches]);
  const apaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_apa"), [matches]);
  const championsMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_campeones"), [matches]);
  const playoffMatches = useMemo(() => matches.filter((match) => match.competicion === "playoffs"), [matches]);

  const groupTables = useMemo(() => Object.fromEntries(GROUPS.map((group) => [group, calculateStandings(groupMatches.filter((match) => match.grupo === group))])) as Record<string, StandingRow[]>, [groupMatches]);
  const groupsComplete = GROUPS.every((group) => (groupTables[group] || []).length === 4 && (groupTables[group] || []).every((row) => row.pj === 3));
  const loadedTournamentMatches = matches.filter((match) => match.competicion !== "liga" && isLoadedMatch(match)).length;

  const usedGroupTeams = useMemo(() => new Set(Object.values(groups).flat().filter(Boolean)), [groups]);
  function teamOptions(current: string) {
    return teams.filter((team) => team.nombre === current || !usedGroupTeams.has(team.nombre));
  }

  async function saveVisibility() {
    setLoading(true);
    try {
      const { error } = await supabase.from("configuracion_copas").upsert({
        temporada,
        copa_apa_activa: copaApaActiva,
        copa_argentina_activa: copaArgentinaActiva,
        updated_at: new Date().toISOString(),
      }, { onConflict: "temporada" });
      if (error) throw error;
      setMessage("Visibilidad de copas actualizada.");
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar la configuración.");
    } finally { setLoading(false); }
  }

  async function generateGroups() {
    const all = Object.values(groups).flat().filter(Boolean);
    if (all.length !== 16 || new Set(all).size !== 16) {
      setMessage("Los cuatro grupos deben tener 4 equipos únicos cada uno.");
      return;
    }
    if (groupMatches.some(isLoadedMatch)) {
      setMessage("No se puede regenerar la fase de grupos porque ya tiene partidos cargados.");
      return;
    }
    if (!window.confirm("Generar la fase clasificatoria completa (24 partidos)?")) return;

    setLoading(true);
    try {
      if (groupMatches.length) await safeDeleteScheduledMatches({ temporada, competicion: "copa_clasificatoria" });
      const payload = GROUPS.flatMap((group) => createGroupGames(groups[group], group)).map((game) => ({
        local: game.local,
        visitante: game.visitante,
        resultado: null,
        fecha: game.fecha,
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
      setMessage("Fase clasificatoria generada correctamente.");
      await load();
    } catch (error: any) { setMessage(error?.message || "No pude generar los grupos."); }
    finally { setLoading(false); }
  }

  async function generateQuarterfinals() {
    if (!groupsComplete) {
      setMessage("Primero deben finalizar los cuatro grupos.");
      return;
    }
    if (argentinaMatches.length || apaMatches.length) {
      setMessage("Ya existen partidos de Copa Argentina o Copa APA para esta temporada.");
      return;
    }
    const A = groupTables.A, B = groupTables.B, C = groupTables.C, D = groupTables.D;
    const argentina = [[A[0], B[1]], [B[0], A[1]], [C[0], D[1]], [D[0], C[1]]];
    const apa = [[A[2], B[3]], [B[2], A[3]], [C[2], D[3]], [D[2], C[3]]];
    const payload = [
      ...argentina.map(([local, visitor], index) => ({ local: local.equipo, visitante: visitor.equipo, competicion: "copa_argentina", ronda: `Copa Argentina · Cuartos ${index + 1}` })),
      ...apa.map(([local, visitor], index) => ({ local: local.equipo, visitante: visitor.equipo, competicion: "copa_apa", ronda: `Copa APA · Cuartos ${index + 1}` })),
    ].map((game) => ({ ...game, resultado: null, fecha: "1", temporada, division: CUP_DIVISION, dia: null, hora: null, partido_id: null, grupo: null, fase: "cuartos", estado: "programado" }));

    const { error } = await supabase.from("partidos").insert(payload);
    if (error) { setMessage("No pude generar los cuartos."); return; }
    setMessage("Cuartos generados con clasificados reales.");
    await load();
  }

  async function syncKnockout(competition: "copa_argentina" | "copa_apa") {
    const cup = matches.filter((match) => match.competicion === competition);
    const quarters = cup.filter((match) => match.fase === "cuartos");
    const semis = cup.filter((match) => match.fase === "semifinal");
    const finals = cup.filter((match) => match.fase === "final");

    if (!semis.length) {
      const winners = quarters.map(winnerOf);
      if (quarters.length !== 4 || winners.some((winner) => !winner)) {
        setMessage("Todavía faltan resultados de Cuartos.");
        return;
      }
      const label = competition === "copa_argentina" ? "Copa Argentina" : "Copa APA";
      const { error } = await supabase.from("partidos").insert([
        { local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada, division: CUP_DIVISION, competicion: competition, fase: "semifinal", ronda: `${label} · Semifinal 1`, estado: "programado" },
        { local: winners[2], visitante: winners[3], resultado: null, fecha: "2", temporada, division: CUP_DIVISION, competicion: competition, fase: "semifinal", ronda: `${label} · Semifinal 2`, estado: "programado" },
      ]);
      if (error) { setMessage("No pude crear las semifinales."); return; }
      setMessage("Semifinales creadas automáticamente con los ganadores reales.");
      await load();
      return;
    }

    if (!finals.length) {
      const winners = semis.map(winnerOf);
      if (semis.length !== 2 || winners.some((winner) => !winner)) {
        setMessage("Todavía faltan resultados de Semifinales.");
        return;
      }
      const label = competition === "copa_argentina" ? "Copa Argentina" : "Copa APA";
      const { error } = await supabase.from("partidos").insert({
        local: winners[0], visitante: winners[1], resultado: null, fecha: "3", temporada, division: CUP_DIVISION, competicion: competition, fase: "final", ronda: `${label} · Final`, estado: "programado",
      });
      if (error) { setMessage("No pude crear la final."); return; }
      setMessage("Final creada automáticamente.");
      await load();
      return;
    }

    setMessage("La llave ya está completa hasta la final.");
  }

  async function generateChampionsCup() {
    if (championsMatches.length) { setMessage("La Copa de Campeones ya existe para esta temporada."); return; }
    const firstChampion = leagueFirst[0]?.equipo;
    const secondChampion = leagueSecond[0]?.equipo;
    const argentinaChampion = finalWinner(matches, "copa_argentina");
    const apaChampion = finalWinner(matches, "copa_apa");
    const participants = [firstChampion, secondChampion, argentinaChampion, apaChampion];
    if (participants.some((team) => !team) || new Set(participants).size !== 4) {
      setMessage("Todavía no están definidos los cuatro campeones necesarios.");
      return;
    }
    const { error } = await supabase.from("partidos").insert([
      { local: firstChampion, visitante: apaChampion, resultado: null, fecha: "1", temporada, division: CUP_DIVISION, competicion: "copa_campeones", fase: "semifinal", ronda: "Copa de Campeones · Semifinal 1", estado: "programado" },
      { local: secondChampion, visitante: argentinaChampion, resultado: null, fecha: "1", temporada, division: CUP_DIVISION, competicion: "copa_campeones", fase: "semifinal", ronda: "Copa de Campeones · Semifinal 2", estado: "programado" },
    ]);
    if (error) { setMessage("No pude generar la Copa de Campeones."); return; }
    setMessage("Copa de Campeones iniciada con campeones detectados automáticamente.");
    await load();
  }

  async function syncChampionsCup() {
    const semis = championsMatches.filter((match) => match.fase === "semifinal");
    const final = championsMatches.find((match) => match.fase === "final");
    if (final) { setMessage("La final ya está programada."); return; }
    const winners = semis.map(winnerOf);
    if (semis.length !== 2 || winners.some((winner) => !winner)) { setMessage("Todavía faltan resultados de semifinales."); return; }
    const { error } = await supabase.from("partidos").insert({ local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada, division: CUP_DIVISION, competicion: "copa_campeones", fase: "final", ronda: "Copa de Campeones · Final", estado: "programado" });
    if (error) { setMessage("No pude crear la final."); return; }
    setMessage("Final de Copa de Campeones creada automáticamente.");
    await load();
  }

  async function generatePlayoffs() {
    if (playoffMatches.length) { setMessage("Los Playoffs ya existen para esta temporada."); return; }
    if (leagueSecond.length < 5 || leagueFirst.length < 2) { setMessage("Las tablas de Primera y Segunda todavía no tienen posiciones suficientes."); return; }
    const second = leagueSecond[1]?.equipo, third = leagueSecond[2]?.equipo, fourth = leagueSecond[3]?.equipo, fifth = leagueSecond[4]?.equipo;
    const penultimateFirst = leagueFirst[leagueFirst.length - 2]?.equipo;
    if (!second || !third || !fourth || !fifth || !penultimateFirst) { setMessage("No pude determinar automáticamente los participantes."); return; }
    const { error } = await supabase.from("partidos").insert([
      { local: second, visitante: fifth, resultado: null, fecha: "1", temporada, division: CUP_DIVISION, competicion: "playoffs", fase: "semifinal", ronda: "Playoffs Ascenso · Semifinal 1", estado: "programado" },
      { local: third, visitante: fourth, resultado: null, fecha: "1", temporada, division: CUP_DIVISION, competicion: "playoffs", fase: "semifinal", ronda: "Playoffs Ascenso · Semifinal 2", estado: "programado" },
    ]);
    if (error) { setMessage("No pude generar los Playoffs."); return; }
    setMessage(`Playoffs iniciados automáticamente. La promoción enfrentará al ganador final contra ${penultimateFirst}.`);
    await load();
  }

  async function syncPlayoffs() {
    const semis = playoffMatches.filter((match) => match.fase === "semifinal");
    const final = playoffMatches.find((match) => match.fase === "final_ascenso");
    const promotion = playoffMatches.find((match) => match.fase === "promocion");

    if (!final) {
      const winners = semis.map(winnerOf);
      if (semis.length !== 2 || winners.some((winner) => !winner)) { setMessage("Todavía faltan resultados de semifinales."); return; }
      const { error } = await supabase.from("partidos").insert({ local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada, division: CUP_DIVISION, competicion: "playoffs", fase: "final_ascenso", ronda: "Playoffs Ascenso · Final", estado: "programado" });
      if (error) { setMessage("No pude crear la final de ascenso."); return; }
      setMessage("Final de ascenso creada automáticamente.");
      await load();
      return;
    }

    if (!promotion) {
      const winner = winnerOf(final);
      const penultimateFirst = leagueFirst[leagueFirst.length - 2]?.equipo;
      if (!winner || !penultimateFirst) { setMessage("Todavía no está definido el ganador de la final o el rival de Primera."); return; }
      const { error } = await supabase.from("partidos").insert({ local: winner, visitante: penultimateFirst, resultado: null, fecha: "3", temporada, division: CUP_DIVISION, competicion: "playoffs", fase: "promocion", ronda: "Promoción · Ascenso/Descenso", estado: "programado" });
      if (error) { setMessage("No pude crear la promoción."); return; }
      setMessage("Promoción creada automáticamente.");
      await load();
      return;
    }

    setMessage("Los Playoffs ya están completos hasta la promoción.");
  }

  async function addSanction() {
    if (!sanctionTeam || sanctionPoints <= 0 || !sanctionReason.trim()) { setMessage("Completá club, puntos y motivo."); return; }
    const { error } = await supabase.from("sanciones_equipos").insert({ temporada, equipo: sanctionTeam, puntos_descontados: sanctionPoints, motivo: sanctionReason.trim() });
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
          <div><div className={styles.rowTitle}>{match.local} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante}</div><div className={styles.rowMeta}>{match.ronda || match.fase}</div></div>
          <div className={styles.actions}><span className={`${styles.badge} ${isLoadedMatch(match) ? styles.badgeGood : ""}`}>{isLoadedMatch(match) ? "Cargado" : "Programado"}</span>{isLoadedMatch(match) && <Link href={`/admin/partidos/${match.id}`} className={styles.secondary}>Ver partido</Link>}</div>
        </div>
      ))}
      {!list.length && <div className={styles.empty}>Todavía no hay partidos generados.</div>}
    </div>
  );

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero eyebrow="Torneos, copas y ascensos" title="Competición general" description="Organizá la estructura competitiva sin tocar resultados ni estadísticas. Las fases siguientes se crean únicamente cuando existe un ganador real.">
          <div className={styles.toolbar}>
            <Field label="Temporada"><Select value={temporada} onChange={(e) => setTemporada(e.target.value)}>{seasons.map((season) => <option key={season}>{season}</option>)}</Select></Field>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes activos</div><div className={styles.kpiValue}>{teams.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos de torneo</div><div className={styles.kpiValue}>{matches.filter((m) => m.competicion !== "liga").length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{loadedTournamentMatches}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Sanciones</div><div className={styles.kpiValue}>{sanctions.length}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <Tabs value={view} onChange={setView} items={[
          { value: "resumen", label: "Resumen" },
          { value: "clasificatoria", label: "Clasificatoria" },
          { value: "copas", label: "Copas" },
          { value: "ascensos", label: "Ascensos" },
          { value: "sanciones", label: "Sanciones" },
        ]} />

        {view === "resumen" && (
          <div className={styles.split}>
            <TournamentPanel eyebrow="Estado" title="Temporada competitiva" description="Vista rápida del progreso real de las competiciones.">
              <div className={styles.list}>
                <div className={styles.row}><div><div className={styles.rowTitle}>Clasificatoria</div><div className={styles.rowMeta}>{groupMatches.length} partidos · {groupsComplete ? "grupos completos" : "en progreso"}</div></div><span className={`${styles.badge} ${groupsComplete ? styles.badgeGood : styles.badgeWarn}`}>{groupsComplete ? "Lista" : "Pendiente"}</span></div>
                <div className={styles.row}><div><div className={styles.rowTitle}>Copa Argentina</div><div className={styles.rowMeta}>{argentinaMatches.length} partidos</div></div><span className={styles.badge}>{finalWinner(matches, "copa_argentina") || "Sin campeón"}</span></div>
                <div className={styles.row}><div><div className={styles.rowTitle}>Copa APA</div><div className={styles.rowMeta}>{apaMatches.length} partidos</div></div><span className={styles.badge}>{finalWinner(matches, "copa_apa") || "Sin campeón"}</span></div>
                <div className={styles.row}><div><div className={styles.rowTitle}>Copa de Campeones</div><div className={styles.rowMeta}>{championsMatches.length} partidos</div></div><span className={styles.badge}>{finalWinner(matches, "copa_campeones") || "Pendiente"}</span></div>
                <div className={styles.row}><div><div className={styles.rowTitle}>Playoffs</div><div className={styles.rowMeta}>{playoffMatches.length} partidos</div></div><span className={styles.badge}>{playoffMatches.length ? "En curso" : "Pendiente"}</span></div>
              </div>
            </TournamentPanel>
            <TournamentPanel eyebrow="Publicación" title="Visibilidad de copas" description="Controla qué competiciones aparecen públicamente para esta temporada.">
              <div className={styles.list}>
                <label className={styles.row}><span className={styles.rowTitle}>Copa Argentina</span><input type="checkbox" checked={copaArgentinaActiva} onChange={(e) => setCopaArgentinaActiva(e.target.checked)} /></label>
                <label className={styles.row}><span className={styles.rowTitle}>Copa APA</span><input type="checkbox" checked={copaApaActiva} onChange={(e) => setCopaApaActiva(e.target.checked)} /></label>
              </div>
              <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={saveVisibility} disabled={loading}>Guardar visibilidad</button></div>
            </TournamentPanel>
          </div>
        )}

        {view === "clasificatoria" && (
          <TournamentPanel eyebrow="Fase inicial" title="Grupos clasificatorios" description="Cuatro grupos de cuatro. La tabla usa el motor compartido de standings y los Cuartos se generan sólo cuando todos terminaron.">
            <div className={styles.grid4}>
              {GROUPS.map((group) => (
                <div key={group}>
                  <p className={styles.sectionEyebrow}>Grupo {group}</p>
                  <div className={styles.list} style={{ marginTop: 10 }}>
                    {groups[group].map((value, index) => (
                      <Select key={`${group}-${index}`} value={value} disabled={groupMatches.length > 0} onChange={(e) => setGroups((current) => ({ ...current, [group]: current[group].map((item, i) => i === index ? e.target.value : item) }))}>
                        <option value="">Equipo {index + 1}</option>
                        {teamOptions(value).map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}
                      </Select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={generateGroups} disabled={loading || groupMatches.some(isLoadedMatch)}>{groupMatches.length ? "Regenerar grupos" : "Generar grupos"}</button><button className={styles.secondary} type="button" onClick={generateQuarterfinals} disabled={!groupsComplete || argentinaMatches.length > 0 || apaMatches.length > 0}>Generar Cuartos</button></div>

            <div className={styles.grid4} style={{ marginTop: 24 }}>
              {GROUPS.map((group) => <div key={group} className={styles.tableWrap}><table className={styles.table}><thead><tr><th>#</th><th>Grupo {group}</th><th>PTS</th><th>DG</th></tr></thead><tbody>{groupTables[group].map((row, index) => <tr key={row.equipo}><td>{index + 1}</td><td><strong>{row.equipo}</strong></td><td>{row.pts}</td><td>{row.dg}</td></tr>)}</tbody></table></div>)}
            </div>
          </TournamentPanel>
        )}

        {view === "copas" && (
          <div className={styles.list}>
            <TournamentPanel eyebrow="Eliminación directa" title="Copa Argentina" description="No usa placeholders: cada fase siguiente espera a los ganadores reales." action={<button className={styles.primary} type="button" onClick={() => syncKnockout("copa_argentina")}>Avanzar fase</button>}>{cupList(argentinaMatches)}</TournamentPanel>
            <TournamentPanel eyebrow="Eliminación directa" title="Copa APA" description="Mismo flujo seguro y automático." action={<button className={styles.primary} type="button" onClick={() => syncKnockout("copa_apa")}>Avanzar fase</button>}>{cupList(apaMatches)}</TournamentPanel>
            <TournamentPanel eyebrow="Campeones" title="Copa de Campeones" description="Detecta automáticamente campeón de Primera, Segunda, Copa Argentina y Copa APA.">
              <div className={styles.actions}><button className={styles.primary} type="button" onClick={generateChampionsCup} disabled={championsMatches.length > 0}>Iniciar Copa de Campeones</button><button className={styles.secondary} type="button" onClick={syncChampionsCup} disabled={!championsMatches.length}>Avanzar fase</button></div>
              <div style={{ marginTop: 18 }}>{cupList(championsMatches)}</div>
            </TournamentPanel>
          </div>
        )}

        {view === "ascensos" && (
          <TournamentPanel eyebrow="Primera / Segunda" title="Playoffs de ascenso" description="Los participantes se toman automáticamente de las tablas: 2.º a 5.º de Segunda y anteúltimo de Primera.">
            <div className={styles.actions}><button className={styles.primary} type="button" onClick={generatePlayoffs} disabled={playoffMatches.length > 0}>Iniciar Playoffs</button><button className={styles.secondary} type="button" onClick={syncPlayoffs} disabled={!playoffMatches.length}>Avanzar fase</button></div>
            <div style={{ marginTop: 18 }}>{cupList(playoffMatches)}</div>
          </TournamentPanel>
        )}

        {view === "sanciones" && (
          <TournamentPanel eyebrow="Disciplina" title="Sanciones de puntos" description="Las sanciones impactan en las tablas compartidas y quedan vinculadas a la temporada seleccionada.">
            <div className={styles.grid3}>
              <Field label="Club"><Select value={sanctionTeam} onChange={(e) => setSanctionTeam(e.target.value)}><option value="">Seleccionar club</option>{teams.map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}</Select></Field>
              <Field label="Puntos"><Input type="number" min={1} value={sanctionPoints} onChange={(e) => setSanctionPoints(Math.max(1, Number(e.target.value || 1)))} /></Field>
              <Field label="Motivo"><Input value={sanctionReason} onChange={(e) => setSanctionReason(e.target.value)} /></Field>
            </div>
            <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={addSanction}>Aplicar sanción</button></div>
            <div className={styles.list} style={{ marginTop: 20 }}>
              {sanctions.map((sanction) => <div key={sanction.id} className={styles.row}><div><div className={styles.rowTitle}>{sanction.equipo} · -{sanction.puntos_descontados} pts</div><div className={styles.rowMeta}>{sanction.motivo}</div></div><button className={styles.danger} type="button" onClick={() => removeSanction(sanction.id)}>Eliminar</button></div>)}
              {!sanctions.length && <div className={styles.empty}>No hay sanciones registradas.</div>}
            </div>
          </TournamentPanel>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
