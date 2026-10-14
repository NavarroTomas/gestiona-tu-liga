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
  groupMatchesByRound,
  isLoadedMatch,
  normalizeDivision,
  safeDeleteScheduledMatches,
  type CompetitionConfig,
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

type View = "resumen" | "partidos" | "programacion" | "tabla" | "avanzado";
type SetupStep = "clubes" | "formato" | "preview";

function prettyDivision(value: string) {
  if (!value) return "División";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FixtureManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [division, setDivision] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [configs, setConfigs] = useState<CompetitionConfig[]>([]);
  const [doubleRound, setDoubleRound] = useState(false);
  const [view, setView] = useState<View>("resumen");
  const [setupStep, setSetupStep] = useState<SetupStep>("clubes");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkRound, setBulkRound] = useState("");
  const [bulkDay, setBulkDay] = useState("");
  const [bulkTime, setBulkTime] = useState("");

  useEffect(() => {
    fetchTournamentSeasons()
      .then((rows) => {
        setSeasons(rows);
        setTemporada((current) => current || rows[0] || "Temporada 4");
      })
      .catch(() => {
        setSeasons(["Temporada 4"]);
        setTemporada("Temporada 4");
      });
  }, []);

  useEffect(() => {
    if (!temporada) return;
    let active = true;
    setLoading(true);
    setMessage("");

    Promise.all([
      fetchTournamentTeams(temporada),
      fetchCompetitionConfigs(temporada).catch(() => [] as CompetitionConfig[]),
    ])
      .then(([rows, configRows]) => {
        if (!active) return;
        setTeams(rows);
        setConfigs(configRows);
        const divisionRows = Array.from(new Set(rows.map((row) => normalizeDivision(row.division)).filter(Boolean))).sort();
        setDivision((current) => current && divisionRows.includes(current) ? current : divisionRows[0] || "primera");
      })
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar los clubes del torneo."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [temporada]);

  const leagueConfig = useMemo(() => {
    const slug = `liga_${normalizeDivision(division)}`;
    return configs.find((item) => item.slug === slug)
      || configs.find((item) => item.tipo === "liga" && item.nombre.toLowerCase().includes(normalizeDivision(division)))
      || null;
  }, [configs, division]);

  useEffect(() => {
    if (!matches.length && leagueConfig) setDoubleRound(Boolean(leagueConfig.reglas?.ida_vuelta));
  }, [leagueConfig?.id, matches.length]);

  useEffect(() => {
    if (!temporada || !division) return;
    let active = true;
    setLoading(true);
    setMessage("");

    Promise.all([
      fetchTournamentMatches({ temporada, competicion: "liga", division }),
      fetchTournamentTeams(temporada),
    ])
      .then(([matchRows, teamRows]) => {
        if (!active) return;
        setMatches(matchRows);
        const divisionTeams = teamRows.filter((row) => normalizeDivision(row.division) === division);
        setSelectedTeams(divisionTeams.map((row) => row.nombre));
        setView(matchRows.length ? "resumen" : "resumen");
        setSetupStep("clubes");
      })
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar la liga."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [temporada, division]);

  const divisions = useMemo(
    () => Array.from(new Set(teams.map((row) => normalizeDivision(row.division)).filter(Boolean))).sort(),
    [teams],
  );

  const divisionTeams = useMemo(
    () => teams.filter((row) => normalizeDivision(row.division) === division),
    [teams, division],
  );

  const preview = useMemo(() => generateRoundRobin(selectedTeams, doubleRound), [selectedTeams, doubleRound]);
  const previewRounds = useMemo(() => {
    const map = new Map<number, typeof preview>();
    for (const game of preview) map.set(game.fecha, [...(map.get(game.fecha) || []), game]);
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [preview]);

  const rounds = useMemo(() => groupMatchesByRound(matches), [matches]);
  const standings = useMemo(() => calculateStandings(matches, [], {
    winPoints: Number(leagueConfig?.reglas?.puntos_victoria ?? 3),
    drawPoints: Number(leagueConfig?.reglas?.puntos_empate ?? 1),
    lossPoints: Number(leagueConfig?.reglas?.puntos_derrota ?? 0),
    tieBreakers: leagueConfig?.reglas?.desempates,
  }), [matches, leagueConfig]);

  const loadedCount = useMemo(() => matches.filter(isLoadedMatch).length, [matches]);
  const pendingCount = matches.length - loadedCount;
  const unscheduledCount = useMemo(() => matches.filter((match) => !isLoadedMatch(match) && (!match.dia || !match.hora)).length, [matches]);
  const completedRounds = useMemo(() => rounds.filter(([, games]) => games.length > 0 && games.every(isLoadedMatch)).length, [rounds]);

  function toggleTeam(name: string) {
    if (matches.length) return;
    setSelectedTeams((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  async function reloadMatches() {
    const rows = await fetchTournamentMatches({ temporada, competicion: "liga", division });
    setMatches(rows);
  }

  async function createFixture() {
    if (selectedTeams.length < 2) {
      setMessage("Elegí al menos dos clubes para crear la liga.");
      return;
    }
    if (!preview.length) {
      setMessage("No hay partidos para crear con esta configuración.");
      return;
    }
    if (matches.some(isLoadedMatch)) {
      setMessage("No se puede reemplazar esta liga porque ya tiene partidos cargados.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (matches.length) await safeDeleteScheduledMatches({ temporada, competicion: "liga", division });

      const payload = preview.map((game) => ({
        local: game.local,
        visitante: game.visitante,
        resultado: null,
        fecha: String(game.fecha),
        temporada,
        division,
        dia: null,
        hora: null,
        partido_id: null,
        competicion: "liga",
        fase: "liga",
        ronda: `Fecha ${game.fecha}`,
        grupo: null,
        estado: "programado",
      }));

      const { error } = await supabase.from("partidos").insert(payload);
      if (error) throw error;
      await reloadMatches();
      setMessage(`Liga creada correctamente con ${payload.length} partidos.`);
      setView("resumen");
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la liga.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFixture() {
    if (!matches.length) return;
    if (matches.some(isLoadedMatch)) {
      setMessage("Esta liga ya tiene partidos cargados. No se puede eliminar completa desde acá.");
      return;
    }
    if (!window.confirm(`Eliminar todos los partidos programados de ${prettyDivision(division)}?`)) return;

    setLoading(true);
    try {
      await safeDeleteScheduledMatches({ temporada, competicion: "liga", division });
      await reloadMatches();
      setMessage("Liga eliminada. Ahora podés volver a configurarla desde cero.");
      setSetupStep("clubes");
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar la liga.");
    } finally {
      setLoading(false);
    }
  }

  async function updateSchedule(matchId: string | number, patch: { fecha?: string; dia?: string; hora?: string }) {
    const match = matches.find((item) => String(item.id) === String(matchId));
    if (!match) return;
    const next = { ...match, ...patch };

    const collision = matches.some((item) =>
      String(item.id) !== String(matchId)
      && String(item.fecha || "") === String(next.fecha || "")
      && [item.local, item.visitante].some((team) => team && [next.local, next.visitante].includes(team)),
    );

    if (collision) {
      setMessage("Ese cambio haría que un club tenga dos partidos en la misma fecha.");
      return;
    }

    const { error } = await supabase.from("partidos").update({
      fecha: String(next.fecha || ""),
      dia: next.dia || null,
      hora: next.hora || null,
      ronda: `Fecha ${next.fecha || ""}`,
    }).eq("id", matchId);

    if (error) {
      setMessage("No pude guardar la reprogramación.");
      return;
    }

    setMatches((current) => current.map((item) => String(item.id) === String(matchId) ? next : item));
  }

  async function applyBulkSchedule() {
    if (!bulkRound) {
      setMessage("Elegí una fecha para programar.");
      return;
    }
    const targets = matches.filter((match) => String(match.fecha) === bulkRound);
    if (!targets.length) return;

    setLoading(true);
    try {
      const ids = targets.map((match) => match.id);
      const { error } = await supabase.from("partidos").update({
        dia: bulkDay || null,
        hora: bulkTime || null,
      }).in("id", ids);
      if (error) throw error;

      setMatches((current) => current.map((match) => ids.includes(match.id) ? { ...match, dia: bulkDay, hora: bulkTime } : match));
      setMessage(`Fecha ${bulkRound} programada para ${targets.length} partidos.`);
    } catch (error: any) {
      setMessage(error?.message || "No pude programar la fecha completa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="fixtures.manage">
      <TournamentPage>
        <TournamentBackLink />

        <TournamentHero
          eyebrow="Liga"
          title={prettyDivision(division) || "Fixture"}
          description={matches.length
            ? "La liga ya está creada. Desde acá podés revisar partidos, programar fechas, ver la tabla y resolver excepciones."
            : "Creá la liga paso a paso. Elegís clubes, formato y revisás una vista previa antes de guardar nada."}
        >
          <div className={styles.toolbar}>
            <Field label="Torneo">
              <Select value={temporada} onChange={(e) => setTemporada(e.target.value)} disabled={!seasons.length}>
                {seasons.map((season) => <option key={season} value={season}>{displayLabel(season)}</option>)}
              </Select>
            </Field>
            <Field label="División">
              <Select value={division} onChange={(e) => setDivision(e.target.value)} disabled={!divisions.length}>
                {divisions.map((item) => <option key={item} value={item}>{displayLabel(prettyDivision(item))}</option>)}
              </Select>
            </Field>
            <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Cambiar reglas
            </Link>
          </div>

          {matches.length > 0 && (
            <div className={styles.kpis}>
              <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{selectedTeams.length}</div></div>
              <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos</div><div className={styles.kpiValue}>{matches.length}</div></div>
              <div className={styles.kpi}><div className={styles.kpiLabel}>Jugados</div><div className={styles.kpiValue}>{loadedCount}</div></div>
              <div className={styles.kpi}><div className={styles.kpiLabel}>Sin horario</div><div className={styles.kpiValue}>{unscheduledCount}</div></div>
            </div>
          )}
        </TournamentHero>

        {message && <div className={`${styles.notice} ${message.toLowerCase().includes("no se puede") ? styles.noticeDanger : ""}`}>{message}</div>}

        {!matches.length ? (
          <div style={{ marginTop: 22 }}>
            <TournamentPanel
              eyebrow="Crear liga"
              title={setupStep === "clubes" ? "1. Elegí los clubes" : setupStep === "formato" ? "2. Elegí el formato" : "3. Revisá antes de crear"}
              description={setupStep === "clubes"
                ? "Marcá quiénes participan. Esto no crea partidos todavía."
                : setupStep === "formato"
                  ? "Definí si juegan una sola vuelta o ida y vuelta. Los puntos y desempates se pueden cambiar aparte."
                  : "Esta es la estructura que se va a crear. Si algo no te gusta, volvés atrás y lo cambiás."}
            >
              {setupStep === "clubes" && (
                <>
                  <div className={styles.grid4}>
                    {divisionTeams.map((team) => {
                      const active = selectedTeams.includes(team.nombre);
                      return (
                        <button key={team.nombre} type="button" className={active ? styles.primary : styles.secondary} onClick={() => toggleTeam(team.nombre)}>
                          {active ? "✓ " : ""}{team.nombre}
                        </button>
                      );
                    })}
                  </div>
                  {!divisionTeams.length && <div className={styles.empty}>No hay clubes activos en esta división.</div>}
                  <div className={styles.toolbar}>
                    <span className={styles.badge}>{selectedTeams.length} clubes elegidos</span>
                    <button className={styles.primary} type="button" disabled={selectedTeams.length < 2} onClick={() => setSetupStep("formato")}>Continuar →</button>
                  </div>
                </>
              )}

              {setupStep === "formato" && (
                <>
                  <div className={styles.grid2}>
                    <button type="button" className={!doubleRound ? styles.primary : styles.secondary} onClick={() => setDoubleRound(false)}>
                      Una vuelta
                    </button>
                    <button type="button" className={doubleRound ? styles.primary : styles.secondary} onClick={() => setDoubleRound(true)}>
                      Ida y vuelta
                    </button>
                  </div>
                  <div className={styles.notice}>
                    Con {selectedTeams.length} clubes se crearán <strong>{preview.length} partidos</strong> en <strong>{previewRounds.length} fechas</strong>.
                    {leagueConfig && <> Puntuación: victoria {leagueConfig.reglas?.puntos_victoria ?? 3}, empate {leagueConfig.reglas?.puntos_empate ?? 1}, derrota {leagueConfig.reglas?.puntos_derrota ?? 0}.</>}
                  </div>
                  <div className={styles.toolbar}>
                    <button className={styles.secondary} type="button" onClick={() => setSetupStep("clubes")}>← Volver</button>
                    <button className={styles.primary} type="button" onClick={() => setSetupStep("preview")}>Ver vista previa →</button>
                  </div>
                </>
              )}

              {setupStep === "preview" && (
                <>
                  <div className={styles.list}>
                    {previewRounds.slice(0, 4).map(([round, games]) => (
                      <div key={round}>
                        <p className={styles.sectionEyebrow}>Fecha {round}</p>
                        <div className={styles.list} style={{ marginTop: 8 }}>
                          {games.map((game, index) => (
                            <div key={`${round}-${index}`} className={styles.row}>
                              <strong>{game.local} vs {game.visitante}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {previewRounds.length > 4 && <div className={styles.empty}>Vista resumida: faltan {previewRounds.length - 4} fechas más.</div>}
                  </div>
                  <div className={styles.toolbar}>
                    <button className={styles.secondary} type="button" onClick={() => setSetupStep("formato")}>← Cambiar formato</button>
                    <button className={styles.primary} type="button" disabled={loading} onClick={createFixture}>Crear liga</button>
                  </div>
                </>
              )}
            </TournamentPanel>
          </div>
        ) : (
          <>
            <Tabs value={view} onChange={setView} items={[
              { value: "resumen", label: "Resumen" },
              { value: "partidos", label: `Partidos (${matches.length})` },
              { value: "programacion", label: "Programar fechas" },
              { value: "tabla", label: "Tabla" },
              { value: "avanzado", label: "Opciones avanzadas" },
            ]} />

            {view === "resumen" && (
              <div className={styles.split}>
                <TournamentPanel eyebrow="Estado" title="Cómo va la liga" description="Resumen de la situación actual sin mezclar configuración técnica.">
                  <div className={styles.list}>
                    <div className={styles.row}><div><div className={styles.rowTitle}>Formato</div><div className={styles.rowMeta}>{doubleRound ? "Ida y vuelta" : "Una vuelta"}</div></div><span className={styles.badge}>{rounds.length} fechas</span></div>
                    <div className={styles.row}><div><div className={styles.rowTitle}>Progreso</div><div className={styles.rowMeta}>{loadedCount} jugados · {pendingCount} pendientes</div></div><span className={styles.badge}>{completedRounds}/{rounds.length} fechas completas</span></div>
                    <div className={styles.row}><div><div className={styles.rowTitle}>Programación</div><div className={styles.rowMeta}>{unscheduledCount ? `${unscheduledCount} partidos todavía sin día u horario` : "Todos los partidos pendientes tienen programación"}</div></div><span className={`${styles.badge} ${unscheduledCount ? styles.badgeWarn : styles.badgeGood}`}>{unscheduledCount ? "Revisar" : "Al día"}</span></div>
                  </div>
                </TournamentPanel>

                <TournamentPanel eyebrow="Qué hacer ahora" title="Acciones rápidas" description="Solo mostramos lo que normalmente necesitás durante el torneo.">
                  <div className={styles.list}>
                    {unscheduledCount > 0 && <button className={styles.primary} type="button" onClick={() => setView("programacion")}>Programar partidos sin horario</button>}
                    <button className={styles.secondary} type="button" onClick={() => setView("partidos")}>Ver todos los partidos</button>
                    <button className={styles.secondary} type="button" onClick={() => setView("tabla")}>Ver tabla</button>
                    <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Resolver una excepción</Link>
                  </div>
                </TournamentPanel>
              </div>
            )}

            {view === "partidos" && (
              <TournamentPanel eyebrow="Fixture" title="Partidos por fecha" description="Los resultados son solo lectura acá. Para corregir un resultado entrá al Centro de partidos.">
                <div className={styles.list}>
                  {rounds.map(([round, games]) => (
                    <div key={round}>
                      <p className={styles.sectionEyebrow}>Fecha {round}</p>
                      <div className={styles.list} style={{ marginTop: 8 }}>
                        {games.map((match) => (
                          <div key={String(match.id)} className={styles.row}>
                            <div>
                              <div className={styles.rowTitle}>{match.local} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante}</div>
                              <div className={styles.rowMeta}>{match.dia || "Día sin definir"} · {match.hora || "Hora sin definir"}</div>
                            </div>
                            <div className={styles.actions}>
                              <span className={`${styles.badge} ${isLoadedMatch(match) ? styles.badgeGood : ""}`}>{isLoadedMatch(match) ? "Jugado" : "Pendiente"}</span>
                              {isLoadedMatch(match) && <Link className={styles.secondary} href={`/admin/partidos/${match.id}`}>Ver partido</Link>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TournamentPanel>
            )}

            {view === "programacion" && (
              <TournamentPanel eyebrow="Calendario" title="Programar días y horarios" description="Podés programar una fecha completa y después ajustar partidos puntuales.">
                <div className={styles.grid3}>
                  <Field label="Fecha">
                    <Select value={bulkRound} onChange={(e) => setBulkRound(e.target.value)}>
                      <option value="">Elegir fecha</option>
                      {rounds.map(([round]) => <option key={round} value={round}>Fecha {round}</option>)}
                    </Select>
                  </Field>
                  <Field label="Día"><Input value={bulkDay} onChange={(e) => setBulkDay(e.target.value)} placeholder="Ej: Domingo 20/09" /></Field>
                  <Field label="Hora"><Input type="time" value={bulkTime} onChange={(e) => setBulkTime(e.target.value)} /></Field>
                </div>
                <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={applyBulkSchedule} disabled={loading || !bulkRound}>Programar toda la fecha</button></div>

                <div className={styles.list} style={{ marginTop: 22 }}>
                  {matches.map((match) => (
                    <div key={String(match.id)} className={styles.row}>
                      <div style={{ flex: 1 }}>
                        <div className={styles.rowTitle}>Fecha {match.fecha} · {match.local} vs {match.visitante}</div>
                        <div className={styles.grid3} style={{ marginTop: 10 }}>
                          <Field label="Fecha"><Input value={String(match.fecha || "")} onChange={(e) => updateSchedule(match.id, { fecha: e.target.value })} /></Field>
                          <Field label="Día"><Input value={match.dia || ""} onChange={(e) => updateSchedule(match.id, { dia: e.target.value })} placeholder="Ej: Domingo 20/09" /></Field>
                          <Field label="Hora"><Input type="time" value={match.hora || ""} onChange={(e) => updateSchedule(match.id, { hora: e.target.value })} /></Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TournamentPanel>
            )}

            {view === "tabla" && (
              <TournamentPanel eyebrow="Posiciones" title={`Tabla de ${prettyDivision(division)}`} description="La tabla usa los puntos y desempates configurados para esta liga.">
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>#</th><th>Club</th><th>PTS</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>DG</th></tr></thead>
                    <tbody>{standings.map((row, index) => <tr key={row.equipo}><td>{index + 1}</td><td><strong>{row.equipo}</strong></td><td>{row.pts}</td><td>{row.pj}</td><td>{row.pg}</td><td>{row.pe}</td><td>{row.pp}</td><td>{row.dg}</td></tr>)}</tbody>
                  </table>
                </div>
              </TournamentPanel>
            )}

            {view === "avanzado" && (
              <div className={styles.list}>
                <TournamentPanel eyebrow="Reglas" title="Cambiar formato y puntuación" description="Para cambios estructurales de la competición usá el editor de torneo y reglas.">
                  <div className={styles.actions}>
                    <Link href="/admin/torneos/configuracion" className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir configuración</Link>
                  </div>
                </TournamentPanel>
                <TournamentPanel eyebrow="Excepciones" title="Cambios manuales" description="Crear un partido excepcional, moverlo de fecha, cambiar participantes o corregir estructura.">
                  <div className={styles.actions}>
                    <Link href="/admin/torneos/acciones-avanzadas" className={styles.primary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir acciones avanzadas</Link>
                  </div>
                </TournamentPanel>
                <TournamentPanel eyebrow="Zona de riesgo" title="Eliminar esta liga" description={loadedCount ? "No se puede borrar completa porque ya tiene partidos cargados." : "Elimina todos los partidos programados de esta división. Después podés crearla de nuevo con otra estructura."}>
                  <button className={styles.danger} type="button" disabled={loading || loadedCount > 0} onClick={deleteFixture}>Eliminar liga completa</button>
                </TournamentPanel>
              </div>
            )}
          </>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
