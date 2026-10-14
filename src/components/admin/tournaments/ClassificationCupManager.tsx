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
  fetchTournamentTeams,
  generateRoundRobin,
  isLoadedMatch,
  normalizeDivision,
  type StandingRow,
  type TournamentMatch,
  type TournamentTeam,
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

type View = "grupos" | "clasificados" | "publicacion" | "mas";
type GroupsState = Record<string, string[]>;

const COMPETITION = "copa_clasificatoria";
const CUP_DIVISION = "copa";

function groupNames(count: number) {
  return Array.from({ length: Math.max(1, count) }, (_, index) => String.fromCharCode(65 + index));
}

function emptyGroups(labels: string[], size: number): GroupsState {
  return Object.fromEntries(labels.map((label) => [label, Array(Math.max(2, size)).fill("")])) as GroupsState;
}

function seededPairs(teams: string[]) {
  const clean = teams.filter(Boolean);
  const pairs: Array<[string, string]> = [];
  for (let left = 0, right = clean.length - 1; left < right; left += 1, right -= 1) {
    pairs.push([clean[left], clean[right]]);
  }
  return pairs;
}

function GroupEditor({
  labels,
  groups,
  teams,
  onChange,
}: {
  labels: string[];
  groups: GroupsState;
  teams: TournamentTeam[];
  onChange: (group: string, index: number, value: string) => void;
}) {
  const used = new Set(Object.values(groups).flat().filter(Boolean));

  return (
    <div className={styles.grid2}>
      {labels.map((group) => (
        <TournamentPanel key={group} eyebrow={`Grupo ${group}`} title={`Participantes · ${group}`}>
          <div className={styles.list}>
            {(groups[group] || []).map((current, index) => (
              <Field key={`${group}-${index}`} label={`Lugar ${index + 1}`}>
                <Select value={current} onChange={(event) => onChange(group, index, event.target.value)}>
                  <option value="">Elegir club</option>
                  {teams
                    .filter((team) => team.nombre === current || !used.has(team.nombre))
                    .map((team) => <option key={team.nombre} value={team.nombre}>{displayLabel(team.nombre)}</option>)}
                </Select>
              </Field>
            ))}
          </div>
        </TournamentPanel>
      ))}
    </div>
  );
}

function StandingsTable({ rows, argentinaPlaces, apaPlaces, mixedQualification }: {
  rows: StandingRow[];
  argentinaPlaces: number;
  apaPlaces: number;
  mixedQualification: boolean;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PTS</th><th>DG</th><th>Destino</th></tr></thead>
        <tbody>
          {rows.map((row, index) => {
            const position = index + 1;
            const destination = mixedQualification
              ? position <= 2 ? "Copa Argentina" : position === 3 ? "Comparar terceros" : position <= 5 ? "Copa de la Liga" : "Comparar sextos"
              : position <= argentinaPlaces
              ? "Copa Argentina"
              : position <= argentinaPlaces + apaPlaces
                ? "Copa de la Liga"
                : "Sin clasificación";
            return (
              <tr key={row.equipo}>
                <td>{position}</td><td><strong>{row.equipo}</strong></td><td>{row.pj}</td><td><strong>{row.pts}</strong></td><td>{row.dg > 0 ? "+" : ""}{row.dg}</td><td>{destination}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ClassificationCupManager() {
  const [view, setView] = useState<View>("grupos");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [groups, setGroups] = useState<GroupsState>({});
  const [groupCount, setGroupCount] = useState(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [argentinaPerGroup, setArgentinaPerGroup] = useState(2);
  const [apaPerGroup, setApaPerGroup] = useState(2);
  const [showArgentina, setShowArgentina] = useState(false);
  const [showApa, setShowApa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mixedQualification, setMixedQualification] = useState(false);
  const [balancedPots, setBalancedPots] = useState(false);

  const labels = useMemo(() => groupNames(groupCount), [groupCount]);
  const groupMatches = useMemo(() => matches.filter((match) => match.competicion === COMPETITION && match.fase === "grupos"), [matches]);
  const argentinaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_argentina"), [matches]);
  const apaMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_apa"), [matches]);
  const tables = useMemo(() => Object.fromEntries(labels.map((group) => [group, calculateStandings(groupMatches.filter((match) => match.grupo === group))])) as Record<string, StandingRow[]>, [labels, groupMatches]);
  const expectedGames = teamsPerGroup - 1;
  const groupsComplete = labels.every((group) => (tables[group] || []).length === teamsPerGroup && (tables[group] || []).every((row) => row.pj === expectedGames));

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
      const [teamRows, matchRows, configs, publicState] = await Promise.all([
        fetchTournamentTeams(season),
        fetchTournamentMatches({ temporada: season }),
        fetchCompetitionConfigs(season),
        supabase.from("configuracion_copas").select("copa_apa_activa,copa_argentina_activa").eq("temporada", season).maybeSingle(),
      ]);
      const config = configs.find((item) => item.slug === COMPETITION);
      const nextCount = Math.max(1, Number(config?.reglas?.cantidad_grupos ?? 4));
      const nextSize = Math.max(2, Number(config?.reglas?.equipos_por_grupo ?? 4));
      const nextLabels = groupNames(nextCount);
      const nextGroups = emptyGroups(nextLabels, nextSize);
      const currentGroupMatches = matchRows.filter((match) => match.competicion === COMPETITION && match.fase === "grupos");

      for (const group of nextLabels) {
        const names = Array.from(new Set(currentGroupMatches.filter((match) => match.grupo === group).flatMap((match) => [match.local, match.visitante || ""]).filter(Boolean)));
        nextGroups[group] = [...names.slice(0, nextSize), ...Array(Math.max(0, nextSize - names.length)).fill("")];
      }

      setTeams(teamRows);
      setMatches(matchRows);
      setGroupCount(nextCount);
      setTeamsPerGroup(nextSize);
      setArgentinaPerGroup(Math.max(0, Number(config?.reglas?.clasifican_copa_argentina ?? 2)));
      setApaPerGroup(Math.max(0, Number(config?.reglas?.clasifican_copa_apa ?? 2)));
      setMixedQualification(config?.reglas?.formato_clasificacion === "t5_mejores_terceros_sextos");
      setBalancedPots(Boolean(config?.reglas?.bombos_por_division));
      setGroups(nextGroups);
      setShowArgentina(Boolean(publicState.data?.copa_argentina_activa));
      setShowApa(Boolean(publicState.data?.copa_apa_activa));
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar la clasificación a copas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [season]);

  function updateGroup(group: string, index: number, value: string) {
    setGroups((current) => ({ ...current, [group]: current[group].map((item, itemIndex) => itemIndex === index ? value : item) }));
  }

  async function createGroups() {
    const selected = Object.values(groups).flat().filter(Boolean);
    const expected = groupCount * teamsPerGroup;
    if (selected.length !== expected || new Set(selected).size !== expected) {
      setMessage(`Completá ${expected} clubes únicos antes de generar los grupos.`);
      return;
    }
    if (groupMatches.some(isLoadedMatch)) {
      setMessage("La fase ya tiene resultados. No se puede regenerar desde el flujo normal; usá Más opciones.");
      return;
    }
    if (balancedPots && labels.some((group) => {
      const divisions = groups[group].map((name) => normalizeDivision(teams.find((team) => team.nombre === name)?.division));
      return divisions.filter((value) => value === "primera").length !== 3 || divisions.filter((value) => value === "segunda").length !== 3;
    })) {
      setMessage("Cada grupo debe tener 3 clubes de Primera y 3 de Segunda, según los dos bombos del sorteo.");
      return;
    }
    const games = labels.flatMap((group) => generateRoundRobin(groups[group], false).map((game) => ({ ...game, group })));
    if (!window.confirm(`Se crearán ${games.length} partidos. ¿Continuar?`)) return;

    setLoading(true);
    try {
      if (groupMatches.length) {
        const { error } = await supabase.from("partidos").delete().in("id", groupMatches.map((match) => match.id));
        if (error) throw error;
      }
      const { error } = await supabase.from("partidos").insert(games.map((game) => ({
        local: game.local,
        visitante: game.visitante,
        resultado: null,
        fecha: String(game.fecha),
        temporada: season,
        division: CUP_DIVISION,
        dia: null,
        hora: null,
        partido_id: null,
        competicion: COMPETITION,
        grupo: game.group,
        fase: "grupos",
        ronda: `Grupo ${game.group} · Fecha ${game.fecha}`,
        estado: "programado",
      })));
      if (error) throw error;
      setMessage("Fase de grupos creada correctamente.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear los grupos.");
    } finally { setLoading(false); }
  }

  async function createCupCrosses() {
    if (mixedQualification) {
      setMessage("Antes de generar las copas hay que definir los desempates entre grupos y el armado de los cruces para los mejores terceros y sextos.");
      return;
    }
    if (!groupsComplete) {
      setMessage("Primero tienen que estar completos todos los partidos de grupos.");
      return;
    }
    if (argentinaMatches.length || apaMatches.length) {
      setMessage("Las copas ya tienen cruces. Administralas desde sus páginas dedicadas.");
      return;
    }
    const argentina = labels.flatMap((group) => (tables[group] || []).slice(0, argentinaPerGroup).map((row) => row.equipo));
    const apa = labels.flatMap((group) => (tables[group] || []).slice(argentinaPerGroup, argentinaPerGroup + apaPerGroup).map((row) => row.equipo));
    if (argentina.length % 2 || apa.length % 2) {
      setMessage("La cantidad de clasificados no forma cruces parejos. Ajustá las reglas o usá Más opciones.");
      return;
    }
    const argentinaPairs = seededPairs(argentina);
    const apaPairs = seededPairs(apa);
    const payload = [
      ...argentinaPairs.map(([local, visitante], index) => ({ local, visitante, competicion: "copa_argentina", ronda: `Copa Argentina · Cruce ${index + 1}`, count: argentinaPairs.length })),
      ...apaPairs.map(([local, visitante], index) => ({ local, visitante, competicion: "copa_apa", ronda: `Copa de la Liga · Cruce ${index + 1}`, count: apaPairs.length })),
    ].map((game) => ({
      local: game.local,
      visitante: game.visitante,
      resultado: null,
      fecha: "1",
      temporada: season,
      division: CUP_DIVISION,
      dia: null,
      hora: null,
      partido_id: null,
      competicion: game.competicion,
      grupo: null,
      fase: game.count === 4 ? "cuartos" : game.count === 2 ? "semifinal" : "eliminacion",
      ronda: game.ronda,
      estado: "programado",
    }));
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert(payload);
      if (error) throw error;
      setMessage(`Cruces creados: ${argentinaPairs.length} de Copa Argentina y ${apaPairs.length} de Copa de la Liga.`);
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear los cruces.");
    } finally { setLoading(false); }
  }

  async function savePublication() {
    setLoading(true);
    try {
      const { error } = await supabase.from("configuracion_copas").upsert({
        temporada: season,
        copa_argentina_activa: showArgentina,
        copa_apa_activa: showApa,
        updated_at: new Date().toISOString(),
      }, { onConflict: "temporada" });
      if (error) throw error;
      setMessage("Visibilidad pública actualizada.");
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar la publicación.");
    } finally { setLoading(false); }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero eyebrow="Clasificación a Copas" title={displayLabel(season || "Temporada")} description="Administrá grupos, clasificados y publicación por separado.">
          <div className={styles.toolbar}>
            <Field label="Torneo"><Select value={season} onChange={(e) => setSeason(e.target.value)}>{seasons.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Grupos</div><div className={styles.kpiValue}>{groupCount}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{teams.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos</div><div className={styles.kpiValue}>{groupMatches.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{groupMatches.filter(isLoadedMatch).length}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}
        <Tabs value={view} onChange={setView} items={[
          { value: "grupos", label: "1 · Grupos" },
          { value: "clasificados", label: "2 · Clasificados" },
          { value: "publicacion", label: "3 · Publicación" },
          { value: "mas", label: "Más opciones" },
        ]} />

        {view === "grupos" && <>
          <TournamentPanel eyebrow="Paso 1" title="Armar grupos" description={`${groupCount} grupos de ${teamsPerGroup} clubes.${balancedPots ? " Cada grupo: 3 de Primera y 3 de Segunda. Cargá aquí el resultado del sorteo." : ""}`} action={<button className={styles.primary} disabled={loading} type="button" onClick={createGroups}>{groupMatches.length ? "Regenerar grupos" : "Crear grupos"}</button>}>
            <GroupEditor labels={labels} groups={groups} teams={teams} onChange={updateGroup} />
          </TournamentPanel>
        </>}

        {view === "clasificados" && <div className={styles.list}>
          <TournamentPanel eyebrow="Paso 2" title="Tablas y clasificados" description={groupsComplete ? "La fase está completa. Ya podés crear las copas." : "Se actualiza sola con los resultados cargados en Centro de partidos."} action={<button className={styles.primary} type="button" disabled={loading || !groupsComplete || Boolean(argentinaMatches.length || apaMatches.length)} onClick={createCupCrosses}>Crear cruces de copas</button>}>
            {mixedQualification && <p>Copa Argentina: primeros, segundos y 2 mejores terceros. Copa de la Liga: el tercer tercero, cuartos, quintos y mejor sexto. Los otros 2 sextos quedan eliminados.</p>}
            <div className={styles.grid2}>{labels.map((group) => <div key={group}><p className={styles.sectionEyebrow}>Grupo {group}</p><StandingsTable rows={tables[group] || []} argentinaPlaces={argentinaPerGroup} apaPlaces={apaPerGroup} mixedQualification={mixedQualification} /></div>)}</div>
          </TournamentPanel>
          {(argentinaMatches.length > 0 || apaMatches.length > 0) && <div className={styles.actionGrid}>
            <Link href="/admin/torneos/copa-argentina" className={styles.actionCard}><strong>Copa Argentina</strong><span>Abrir →</span></Link>
            <Link href="/admin/torneos/copa-apa" className={styles.actionCard}><strong>Copa de la Liga</strong><span>Abrir →</span></Link>
          </div>}
        </div>}

        {view === "publicacion" && <TournamentPanel eyebrow="Paso 3" title="Qué se muestra en la web" description="Publicar una copa no modifica sus partidos ni resultados.">
          <div className={styles.grid2}>
            <Field label="Copa Argentina"><Select value={showArgentina ? "si" : "no"} onChange={(e) => setShowArgentina(e.target.value === "si")}><option value="si">Visible</option><option value="no">Oculta</option></Select></Field>
            <Field label="Copa de la Liga"><Select value={showApa ? "si" : "no"} onChange={(e) => setShowApa(e.target.value === "si")}><option value="si">Visible</option><option value="no">Oculta</option></Select></Field>
          </div>
          <div className={styles.actions} style={{ marginTop: 16 }}><button className={styles.primary} type="button" disabled={loading} onClick={savePublication}>Guardar publicación</button></div>
        </TournamentPanel>}

        {view === "mas" && <TournamentPanel eyebrow="Excepciones" title="Más opciones" description="Usalo solamente cuando el formato normal no alcanza.">
          <div className={styles.actionGrid}>
            <Link href="/admin/torneos/configuracion" className={styles.actionCard}><div><strong>Cambiar reglas</strong><p>Grupos, cantidad de equipos y cupos de clasificación.</p></div><span>Abrir →</span></Link>
            <Link href="/admin/torneos/acciones-avanzadas" className={styles.actionCard}><div><strong>Modificar estructura existente</strong><p>Partidos manuales, excepciones y correcciones.</p></div><span>Abrir →</span></Link>
          </div>
        </TournamentPanel>}
      </TournamentPage>
    </PermissionGuard>
  );
}
