"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import {
  calculateStandings,
  fetchCompetitionConfigs,
  fetchTournamentMatches,
  fetchTournamentSeasons,
  isLoadedMatch,
  normalizeDivision,
  winnerOf,
  type TournamentMatch,
} from "@/lib/adminTournaments";
import {
  Field,
  Select,
  Tabs,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "./TournamentUi";

type View = "participantes" | "cuadro" | "promocion" | "mas";

const COMPETITION = "playoffs";

function MatchRow({ match, emptyLabel = "Por definir" }: { match?: TournamentMatch; emptyLabel?: string }) {
  if (!match) return <div className={styles.empty}>{emptyLabel}</div>;
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.rowTitle}>{match.local} <span className={styles.muted}>vs</span> {match.visitante || "Sin rival"}</div>
        <div className={styles.rowMeta}>{match.ronda || match.fase || "Cruce"} · {match.dia || "Sin día"} {match.hora || ""}</div>
      </div>
      <span className={styles.badge}>{match.resultado || (match.visitante ? "Pendiente" : "Pase directo")}</span>
    </div>
  );
}

export default function PromotionPlayoffsManager() {
  const [view, setView] = useState<View>("participantes");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [slots, setSlots] = useState<string[]>(["", "", "", ""]);
  const [promotionTeam, setPromotionTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTournamentSeasons().then((rows) => {
      setSeasons(rows);
      setSeason(rows[0] || "Temporada 4");
    }).catch(() => {
      setSeasons(["Temporada 4"]);
      setSeason("Temporada 4");
    });
  }, []);

  async function load() {
    if (!season) return;
    setLoading(true);
    setMessage("");
    try {
      const [allMatches, configs] = await Promise.all([
        fetchTournamentMatches({ temporada: season }),
        fetchCompetitionConfigs(season),
      ]);
      setMatches(allMatches);

      const secondTable = calculateStandings(allMatches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda"));
      const firstTable = calculateStandings(allMatches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera"));
      const config = configs.find((item) => item.slug === COMPETITION);
      const from = Math.max(1, Number(config?.reglas?.desde_posicion_segunda ?? 2));
      const count = Math.max(2, Number(config?.reglas?.cantidad_equipos ?? 4));
      const suggested = secondTable.slice(from - 1, from - 1 + count).map((row) => row.equipo);
      setSlots((current) => current.some(Boolean) ? current : [...suggested, ...Array(Math.max(0, 4 - suggested.length)).fill("")].slice(0, 4));
      const promotionPosition = Math.max(1, Number(config?.reglas?.posicion_promocion_primera ?? Math.max(1, firstTable.length - 1)));
      setPromotionTeam((current) => current || firstTable[promotionPosition - 1]?.equipo || "");
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar los playoffs.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    setSlots(["", "", "", ""]);
    setPromotionTeam("");
    load();
  }, [season]);

  const playoffMatches = useMemo(() => matches.filter((match) => match.competicion === COMPETITION), [matches]);
  const semifinals = useMemo(() => playoffMatches.filter((match) => match.fase === "semifinal"), [playoffMatches]);
  const final = useMemo(() => playoffMatches.find((match) => match.fase === "final_ascenso" || match.fase === "final"), [playoffMatches]);
  const promotion = useMemo(() => playoffMatches.find((match) => match.fase === "promocion"), [playoffMatches]);
  const secondTeams = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda")).map((row) => row.equipo), [matches]);
  const firstTeams = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera")).map((row) => row.equipo), [matches]);
  const structureExists = playoffMatches.length > 0;

  function patchSlot(index: number, value: string) {
    setSlots((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  async function createSemifinals() {
    const clean = slots.filter(Boolean);
    if (clean.length !== 4 || new Set(clean).size !== 4) {
      setMessage("Elegí cuatro equipos distintos para las semifinales.");
      return;
    }
    if (playoffMatches.length) {
      setMessage("Los playoffs ya tienen estructura. Para reemplazarla usá Más opciones.");
      return;
    }
    setLoading(true);
    try {
      const payload = [
        { local: clean[0], visitante: clean[3], ronda: "Playoffs · Semifinal 1" },
        { local: clean[1], visitante: clean[2], ronda: "Playoffs · Semifinal 2" },
      ].map((game, index) => ({
        ...game,
        resultado: null,
        fecha: "1",
        temporada: season,
        division: "segunda",
        dia: null,
        hora: null,
        partido_id: null,
        competicion: COMPETITION,
        grupo: null,
        fase: "semifinal",
        estado: "programado",
        ronda: game.ronda || `Playoffs · Semifinal ${index + 1}`,
      }));
      const { error } = await supabase.from("partidos").insert(payload);
      if (error) throw error;
      setMessage("Semifinales creadas.");
      await load();
      setView("cuadro");
    } catch (error: any) {
      setMessage(error?.message || "No pude crear las semifinales.");
    } finally { setLoading(false); }
  }

  async function createFinal() {
    if (final) {
      setMessage("La final de ascenso ya existe.");
      return;
    }
    if (semifinals.length !== 2 || !semifinals.every(isLoadedMatch)) {
      setMessage("Primero tienen que estar cargadas las dos semifinales.");
      return;
    }
    const finalists = semifinals.map(winnerOf).filter(Boolean) as string[];
    if (finalists.length !== 2) {
      setMessage("No pude determinar los dos ganadores. Revisá los resultados de semifinales.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert({
        local: finalists[0], visitante: finalists[1], resultado: null, fecha: "2", temporada: season,
        division: "segunda", dia: null, hora: null, partido_id: null, competicion: COMPETITION,
        grupo: null, fase: "final_ascenso", ronda: "Playoffs · Final de Ascenso", estado: "programado",
      });
      if (error) throw error;
      setMessage("Final de ascenso creada.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la final.");
    } finally { setLoading(false); }
  }

  async function createPromotion() {
    if (promotion) {
      setMessage("La promoción ya existe.");
      return;
    }
    if (!final || !isLoadedMatch(final)) {
      setMessage("Primero tiene que estar cargada la Final de Ascenso.");
      return;
    }
    const challenger = winnerOf(final);
    if (!challenger || !promotionTeam) {
      setMessage("Falta definir el ganador de la final o el equipo de Primera que juega la promoción.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert({
        local: challenger, visitante: promotionTeam, resultado: null, fecha: "3", temporada: season,
        division: "promocion", dia: null, hora: null, partido_id: null, competicion: COMPETITION,
        grupo: null, fase: "promocion", ronda: "Playoffs · Promoción", estado: "programado",
      });
      if (error) throw error;
      setMessage("Partido de promoción creado.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la promoción.");
    } finally { setLoading(false); }
  }

  async function giveDirectPass(match: TournamentMatch, team: string) {
    if (isLoadedMatch(match)) {
      setMessage("Ese partido ya tiene resultado. No corresponde usar pase directo.");
      return;
    }
    if (!window.confirm(`${team} pasará directo y el cruce quedará cancelado. ¿Continuar?`)) return;
    setLoading(true);
    try {
      const otherSemi = semifinals.find((item) => item.id !== match.id);
      const existingFinal = final;
      if (existingFinal) {
        const patch = existingFinal.local ? { visitante: team } : { local: team };
        const { error: finalError } = await supabase.from("partidos").update(patch).eq("id", existingFinal.id);
        if (finalError) throw finalError;
      } else {
        const { error: finalError } = await supabase.from("partidos").insert({
          local: team,
          visitante: otherSemi && isLoadedMatch(otherSemi) ? winnerOf(otherSemi) : null,
          resultado: null,
          fecha: "2",
          temporada: season,
          division: "segunda",
          dia: null,
          hora: null,
          partido_id: null,
          competicion: COMPETITION,
          grupo: null,
          fase: "final_ascenso",
          ronda: "Playoffs · Final de Ascenso",
          estado: "programado",
        });
        if (finalError) throw finalError;
      }
      const { error } = await supabase.from("partidos").update({ estado: "cancelado" }).eq("id", match.id);
      if (error) throw error;
      setMessage(`${team} pasó directo a la Final de Ascenso.`);
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude aplicar el pase directo.");
    } finally { setLoading(false); }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero eyebrow="Playoffs de Ascenso" title={displayLabel(season || "Temporada")} description="Participantes, cuadro y promoción separados para que cada acción tenga un único propósito.">
          <div className={styles.toolbar}><Field label="Torneo"><Select value={season} onChange={(e) => setSeason(e.target.value)}>{seasons.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field></div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Semifinales</div><div className={styles.kpiValue}>{semifinals.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Final</div><div className={styles.kpiValue}>{final ? 1 : 0}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Promoción</div><div className={styles.kpiValue}>{promotion ? 1 : 0}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{playoffMatches.filter(isLoadedMatch).length}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}
        <Tabs value={view} onChange={setView} items={[
          { value: "participantes", label: "1 · Participantes" },
          { value: "cuadro", label: "2 · Cuadro" },
          { value: "promocion", label: "3 · Promoción" },
          { value: "mas", label: "Más opciones" },
        ]} />

        {view === "participantes" && <TournamentPanel eyebrow="Paso 1" title="Quién juega los playoffs" description="Se sugieren los puestos de Segunda según la tabla, pero podés reemplazarlos antes de crear el cuadro." action={<button className={styles.primary} type="button" disabled={loading || structureExists} onClick={createSemifinals}>Crear semifinales</button>}>
          <div className={styles.grid2}>{slots.map((slot, index) => <Field key={index} label={`Lugar ${index + 1}`}><Select value={slot} disabled={structureExists} onChange={(e) => patchSlot(index, e.target.value)}><option value="">Elegir equipo</option>{secondTeams.filter((team) => team === slot || !slots.includes(team)).map((team) => <option key={team} value={team}>{displayLabel(team)}</option>)}</Select></Field>)}</div>
        </TournamentPanel>}

        {view === "cuadro" && <div className={styles.list}>
          <TournamentPanel eyebrow="Paso 2" title="Semifinales" description="Los resultados se cargan únicamente desde Centro de partidos.">
            <div className={styles.grid2}>{semifinals.length ? semifinals.map((match) => <div key={String(match.id)} className={styles.list}><MatchRow match={match} />{!isLoadedMatch(match) && <div className={styles.actions}><button className={styles.secondary} type="button" onClick={() => giveDirectPass(match, match.local)}>Pasa {match.local}</button>{match.visitante && <button className={styles.secondary} type="button" onClick={() => giveDirectPass(match, match.visitante!)}>Pasa {match.visitante}</button>}</div>}</div>) : <div className={styles.empty}>Todavía no creaste las semifinales.</div>}</div>
          </TournamentPanel>
          <TournamentPanel eyebrow="Siguiente fase" title="Final de Ascenso" description="Se crea con los ganadores reales de las semifinales." action={<button className={styles.primary} type="button" disabled={loading || Boolean(final)} onClick={createFinal}>Crear final</button>}><MatchRow match={final} emptyLabel="Esperando semifinales" /></TournamentPanel>
        </div>}

        {view === "promocion" && <TournamentPanel eyebrow="Paso 3" title="Promoción" description="El ganador de la Final de Ascenso enfrenta al equipo definido de Primera." action={<button className={styles.primary} type="button" disabled={loading || Boolean(promotion)} onClick={createPromotion}>Crear promoción</button>}>
          <div className={styles.grid2}>
            <Field label="Equipo de Primera"><Select value={promotionTeam} disabled={Boolean(promotion)} onChange={(e) => setPromotionTeam(e.target.value)}><option value="">Elegir equipo</option>{firstTeams.map((team) => <option key={team} value={team}>{displayLabel(team)}</option>)}</Select></Field>
            <div><p className={styles.label}>Ganador del playoff</p><div className={styles.row}><strong>{winnerOf(final) || "Por definir"}</strong></div></div>
          </div>
          <div style={{ marginTop: 18 }}><MatchRow match={promotion} emptyLabel="La promoción todavía no fue creada" /></div>
        </TournamentPanel>}

        {view === "mas" && <TournamentPanel eyebrow="Excepciones" title="Más opciones" description="Cambios raros y correcciones quedan fuera del flujo principal.">
          <div className={styles.actionGrid}>
            <Link href="/admin/torneos/configuracion" className={styles.actionCard}><div><strong>Reglas de playoffs</strong><p>Cantidad de participantes y posiciones de origen.</p></div><span>Abrir →</span></Link>
            <Link href="/admin/torneos/acciones-avanzadas" className={styles.actionCard}><div><strong>Editar estructura manualmente</strong><p>Cambiar rival, ronda, fase, fecha o crear una excepción.</p></div><span>Abrir →</span></Link>
          </div>
        </TournamentPanel>}
      </TournamentPage>
    </PermissionGuard>
  );
}
