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
  generateRoundRobin,
  groupMatchesByRound,
  isLoadedMatch,
  normalizeDivision,
  safeDeleteScheduledMatches,
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

type View = "participantes" | "fixture" | "calendario";

export default function FixtureManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [division, setDivision] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [doubleRound, setDoubleRound] = useState(false);
  const [view, setView] = useState<View>("participantes");
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

    fetchTournamentTeams(temporada)
      .then((rows) => {
        if (!active) return;
        setTeams(rows);
        const divisions = Array.from(new Set(rows.map((row) => normalizeDivision(row.division)).filter(Boolean))).sort();
        setDivision((current) => current && divisions.includes(current) ? current : divisions[0] || "primera");
      })
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar los clubes de la temporada."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [temporada]);

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
      })
      .catch((error: any) => active && setMessage(error?.message || "No pude cargar el fixture."))
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

  const rounds = useMemo(() => groupMatchesByRound(matches), [matches]);
  const standings = useMemo(() => calculateStandings(matches), [matches]);
  const loadedCount = useMemo(() => matches.filter(isLoadedMatch).length, [matches]);
  const pendingCount = matches.length - loadedCount;

  function toggleTeam(name: string) {
    if (matches.length > 0) return;
    setSelectedTeams((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  async function reloadMatches() {
    const rows = await fetchTournamentMatches({ temporada, competicion: "liga", division });
    setMatches(rows);
  }

  async function generateFixture() {
    if (selectedTeams.length < 2) {
      setMessage("Seleccioná al menos dos clubes.");
      return;
    }

    if (matches.some(isLoadedMatch)) {
      setMessage("No se puede regenerar: hay partidos ya cargados. Corregilos o anulalos desde Centro de partidos.");
      return;
    }

    const preview = generateRoundRobin(selectedTeams, doubleRound);
    if (!window.confirm(`Se van a generar ${preview.length} partidos para ${temporada} · ${division}. ¿Continuar?`)) return;

    setLoading(true);
    setMessage("");
    try {
      if (matches.length) {
        await safeDeleteScheduledMatches({ temporada, competicion: "liga", division });
      }

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
      setMessage(`Fixture generado correctamente: ${payload.length} partidos.`);
      await reloadMatches();
      setView("fixture");
    } catch (error: any) {
      setMessage(error?.message || "No pude generar el fixture.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFixture() {
    if (!matches.length) return;
    if (matches.some(isLoadedMatch)) {
      setMessage("No se puede eliminar el fixture porque ya existen partidos cargados.");
      return;
    }
    if (!window.confirm(`Eliminar los ${matches.length} partidos programados de ${temporada} · ${division}?`)) return;

    setLoading(true);
    try {
      await safeDeleteScheduledMatches({ temporada, competicion: "liga", division });
      setMessage("Fixture eliminado.");
      await reloadMatches();
      setView("participantes");
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar el fixture.");
    } finally {
      setLoading(false);
    }
  }

  async function updateSchedule(matchId: string | number, patch: { fecha?: string; dia?: string; hora?: string }) {
    const match = matches.find((item) => String(item.id) === String(matchId));
    if (!match) return;
    const next = { ...match, ...patch };

    const collision = matches.some((item) =>
      String(item.id) !== String(matchId) &&
      String(item.fecha || "") === String(next.fecha || "") &&
      [item.local, item.visitante].some((team) => team && [next.local, next.visitante].includes(team)),
    );
    if (collision) {
      setMessage("Ese cambio provoca que un club tenga dos partidos en la misma fecha.");
      return;
    }

    const { error } = await supabase.from("partidos").update({
      fecha: String(next.fecha || ""),
      dia: next.dia || null,
      hora: next.hora || null,
      ronda: `Fecha ${next.fecha || ""}`,
    }).eq("id", matchId);

    if (error) {
      setMessage("No pude actualizar la programación.");
      return;
    }
    setMatches((current) => current.map((item) => String(item.id) === String(matchId) ? next : item));
  }

  async function applyBulkSchedule() {
    if (!bulkRound) {
      setMessage("Elegí una fecha para aplicar la programación.");
      return;
    }
    const targets = matches.filter((match) => String(match.fecha) === bulkRound);
    if (!targets.length) return;
    setLoading(true);
    try {
      const ids = targets.map((match) => match.id);
      const { error } = await supabase.from("partidos").update({ dia: bulkDay || null, hora: bulkTime || null }).in("id", ids);
      if (error) throw error;
      setMatches((current) => current.map((match) => ids.includes(match.id) ? { ...match, dia: bulkDay, hora: bulkTime } : match));
      setMessage(`Programación aplicada a ${targets.length} partidos de la Fecha ${bulkRound}.`);
    } catch (error: any) {
      setMessage(error?.message || "No pude aplicar la programación masiva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="fixtures.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Liga · estructura y calendario"
          title="Fixture y programación"
          description="Definí participantes, generá el calendario y programá fechas. Los resultados oficiales se administran únicamente desde Centro de partidos."
        >
          <div className={styles.toolbar}>
            <Field label="Temporada">
              <Select value={temporada} onChange={(e) => setTemporada(e.target.value)} disabled={!seasons.length}>
                {seasons.map((season) => <option key={season}>{season}</option>)}
              </Select>
            </Field>
            <Field label="División">
              <Select value={division} onChange={(e) => setDivision(e.target.value)} disabled={!divisions.length}>
                {divisions.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}
              </Select>
            </Field>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{selectedTeams.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Partidos</div><div className={styles.kpiValue}>{matches.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Cargados</div><div className={styles.kpiValue}>{loadedCount}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Pendientes</div><div className={styles.kpiValue}>{pendingCount}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={`${styles.notice} ${message.toLowerCase().includes("no se puede") ? styles.noticeDanger : ""}`}>{message}</div>}

        <Tabs value={view} onChange={setView} items={[
          { value: "participantes", label: "Participantes" },
          { value: "fixture", label: `Fixture (${matches.length})` },
          { value: "calendario", label: "Calendario" },
        ]} />

        {view === "participantes" && (
          <TournamentPanel
            eyebrow="Paso 1"
            title="Participantes de la liga"
            description={matches.length ? "El fixture ya existe. Para cambiar participantes primero debe eliminarse, siempre que no haya partidos cargados." : "Seleccioná los clubes que formarán parte de esta división."}
            action={<span className={styles.badge}>{selectedTeams.length} seleccionados</span>}
          >
            <div className={styles.grid4}>
              {divisionTeams.map((team) => {
                const active = selectedTeams.includes(team.nombre);
                return (
                  <button
                    key={team.nombre}
                    type="button"
                    className={active ? styles.primary : styles.secondary}
                    disabled={matches.length > 0}
                    onClick={() => toggleTeam(team.nombre)}
                  >
                    {active ? "✓ " : ""}{team.nombre}
                  </button>
                );
              })}
            </div>
            {!divisionTeams.length && <div className={styles.empty}>No hay clubes activos para esta división y temporada.</div>}
            <div className={styles.toolbar}>
              <label className={styles.rowMeta}><input type="checkbox" checked={doubleRound} onChange={(e) => setDoubleRound(e.target.checked)} disabled={matches.length > 0} /> Ida y vuelta</label>
              <button className={styles.primary} type="button" disabled={loading || selectedTeams.length < 2} onClick={generateFixture}>{matches.length ? "Regenerar fixture" : "Generar fixture"}</button>
              {matches.length > 0 && <button className={styles.danger} type="button" disabled={loading || loadedCount > 0} onClick={deleteFixture}>Eliminar fixture</button>}
            </div>
          </TournamentPanel>
        )}

        {view === "fixture" && (
          <div className={styles.split}>
            <TournamentPanel eyebrow="Calendario" title="Partidos por fecha" description="La estructura del torneo se edita acá; el resultado queda en modo lectura.">
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
                            <span className={`${styles.badge} ${isLoadedMatch(match) ? styles.badgeGood : ""}`}>{isLoadedMatch(match) ? "Cargado" : "Programado"}</span>
                            {isLoadedMatch(match) && <Link className={styles.secondary} href={`/admin/partidos/${match.id}`}>Ver partido</Link>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!matches.length && <div className={styles.empty}>Todavía no hay fixture generado.</div>}
              </div>
            </TournamentPanel>

            <TournamentPanel eyebrow="Tabla" title="Vista de posiciones" description="Usa el mismo motor de standings compartido por Torneos.">
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Club</th><th>PTS</th><th>PJ</th><th>DG</th></tr></thead>
                  <tbody>{standings.map((row, index) => <tr key={row.equipo}><td>{index + 1}</td><td><strong>{row.equipo}</strong></td><td>{row.pts}</td><td>{row.pj}</td><td>{row.dg}</td></tr>)}</tbody>
                </table>
              </div>
            </TournamentPanel>
          </div>
        )}

        {view === "calendario" && (
          <TournamentPanel eyebrow="Programación" title="Días y horarios" description="Podés programar una fecha completa de una vez y después ajustar partidos puntuales.">
            <div className={styles.grid3}>
              <Field label="Fecha">
                <Select value={bulkRound} onChange={(e) => setBulkRound(e.target.value)}><option value="">Seleccionar</option>{rounds.map(([round]) => <option key={round} value={round}>Fecha {round}</option>)}</Select>
              </Field>
              <Field label="Día"><Input value={bulkDay} onChange={(e) => setBulkDay(e.target.value)} placeholder="Ej: Domingo 20/09" /></Field>
              <Field label="Hora"><Input value={bulkTime} onChange={(e) => setBulkTime(e.target.value)} placeholder="Ej: 21:00" /></Field>
            </div>
            <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={applyBulkSchedule} disabled={loading || !bulkRound}>Aplicar a toda la fecha</button></div>

            <div className={styles.list} style={{ marginTop: 22 }}>
              {matches.map((match) => (
                <div key={String(match.id)} className={styles.row}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.rowTitle}>F{match.fecha} · {match.local} vs {match.visitante}</div>
                    <div className={styles.grid3} style={{ marginTop: 10 }}>
                      <Field label="Fecha"><Input value={String(match.fecha || "")} onChange={(e) => updateSchedule(match.id, { fecha: e.target.value })} /></Field>
                      <Field label="Día"><Input value={match.dia || ""} onChange={(e) => updateSchedule(match.id, { dia: e.target.value })} /></Field>
                      <Field label="Hora"><Input value={match.hora || ""} onChange={(e) => updateSchedule(match.id, { hora: e.target.value })} /></Field>
                    </div>
                  </div>
                </div>
              ))}
              {!matches.length && <div className={styles.empty}>Generá el fixture antes de programar fechas.</div>}
            </div>
          </TournamentPanel>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
