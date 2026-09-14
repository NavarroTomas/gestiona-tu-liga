"use client";

import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  AdminMatch,
  ADMIN_MATCH_COMPETITIONS,
  MatchPlayerStat,
  MatchTeamStat,
  commitMatchData,
  fetchAdminMatches,
  fetchMatchBundle,
  matchContextLabel,
  stableAdminMatchId,
  textValue,
  validateMatchStats,
} from "@/lib/adminMatches";
import {
  Field,
  Input,
  MatchCard,
  MatchHeader,
  MatchPage,
  Notice,
  Select,
  Textarea,
  matchStyles as styles,
} from "./MatchWorkspace";

type Bundle = Awaited<ReturnType<typeof fetchMatchBundle>>;

function sourceLabel(source?: string | null) {
  if (source === "txt") return "TXT";
  if (source === "manual") return "Manual";
  if (source === "correction") return "Corrección";
  if (source === "annulment") return "Anulación";
  return "Sin historial";
}

export default function MatchCenter() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState("todas");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [players, setPlayers] = useState<MatchPlayerStat[]>([]);
  const [teams, setTeams] = useState<MatchTeamStat[]>([]);
  const [result, setResult] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMatches() {
    try {
      setLoading(true);
      const rows = await fetchAdminMatches({ temporada, competicion });
      setMatches(rows);
    } catch (error: any) {
      setMessage(error.message || "No se pudieron cargar los partidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMatches(); }, [temporada, competicion]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((match) =>
      `${match.local} ${match.visitante || ""} ${match.resultado || ""} ${matchContextLabel(match)}`
        .toLowerCase()
        .includes(q),
    );
  }, [matches, search]);

  async function openMatch(id: string | number) {
    try {
      setLoading(true);
      setEditing(false);
      setReason("");
      const next = await fetchMatchBundle(id);
      setBundle(next);
      setPlayers(next.playerStats.map((row) => ({ ...row })));
      setTeams(next.teamStats.map((row) => ({ ...row })));
      setResult(next.match.resultado || "");
      setDay(next.match.dia || "");
      setTime(next.match.hora || "");
    } catch (error: any) {
      setMessage(error.message || "No se pudo abrir el partido.");
    } finally {
      setLoading(false);
    }
  }

  function updatePlayer(index: number, patch: Partial<MatchPlayerStat>) {
    setPlayers((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  }

  function setMvp(index: number) {
    setPlayers((current) => current.map((row, i) => ({ ...row, mvp: i === index ? 1 : 0 })));
  }

  async function saveCorrection() {
    if (!bundle) return;
    if (!reason.trim()) {
      setMessage("Toda corrección necesita un motivo para el historial.");
      return;
    }
    const score = result.trim().match(/^(\d+)\s*[-:]\s*(\d+)$/);
    if (!score) {
      setMessage("El resultado debe tener formato 2-1.");
      return;
    }

    const match = bundle.match;
    const partidoId = textValue(match.partido_id) || stableAdminMatchId(match);
    const localGoals = Number(score[1]);
    const visitorGoals = Number(score[2]);
    const nextPlayers = players.map((row) => ({
      ...row,
      partido_id: partidoId,
      temporada: textValue(match.temporada) || "Temporada 4",
      division: textValue(match.division) || textValue(match.fase) || "General",
      fecha: textValue(match.fecha) || "1",
    }));
    const nextTeams = [match.local, match.visitante]
      .filter(Boolean)
      .map((team, index) => {
        const previous = teams.find((row) => row.equipo === team);
        return {
          ...(previous || {}),
          partido_id: partidoId,
          equipo: team as string,
          temporada: textValue(match.temporada) || "Temporada 4",
          division: textValue(match.division) || textValue(match.fase) || "General",
          fecha: textValue(match.fecha) || "1",
          goals: index === 0 ? localGoals : visitorGoals,
        } as MatchTeamStat;
      });

    const validation = validateMatchStats({ match, teamStats: nextTeams, playerStats: nextPlayers });
    if (validation.errors.length) {
      setMessage(validation.errors.join(" "));
      return;
    }
    const warnings = validation.warnings.length ? `\n\nAdvertencias:\n- ${validation.warnings.join("\n- ")}` : "";
    if (!window.confirm(`Guardar corrección de ${match.local} ${localGoals}-${visitorGoals} ${match.visitante}?${warnings}`)) return;

    try {
      setLoading(true);
      const response = await commitMatchData({
        matchRowId: match.id,
        source: "correction",
        reason,
        matchPatch: {
          partido_id: partidoId,
          resultado: `${localGoals}-${visitorGoals}`,
          dia: day,
          hora: time,
          estado: "cargado",
        },
        teamStats: nextTeams,
        playerStats: nextPlayers,
      });
      setMessage(`Corrección guardada. Revisión #${response.revision}. Los acumulados se recalcularon desde el detalle.`);
      setEditing(false);
      await openMatch(match.id);
      await loadMatches();
    } catch (error: any) {
      setMessage(error.message || "No se pudo guardar la corrección.");
    } finally {
      setLoading(false);
    }
  }

  async function annul() {
    if (!bundle) return;
    const match = bundle.match;
    const entered = window.prompt("Motivo de la anulación (obligatorio):", "Corrección administrativa");
    if (!entered?.trim()) return;
    if (!window.confirm(`Anular la carga de ${match.local} vs ${match.visitante}? El partido programado se conserva, pero se eliminan resultado, estadísticas y TXT.`)) return;
    try {
      setLoading(true);
      const response = await commitMatchData({
        matchRowId: match.id,
        source: "annulment",
        reason: entered.trim(),
        matchPatch: { partido_id: null, resultado: null, estado: "programado" },
        teamStats: [],
        playerStats: [],
        clearSegments: true,
      });
      setMessage(`Carga anulada de forma segura. Revisión #${response.revision}.`);
      await openMatch(match.id);
      await loadMatches();
    } catch (error: any) {
      setMessage(error.message || "No se pudo anular la carga.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="matches.edit">
      <MatchPage>
        <MatchHeader
          eyebrow="Control y auditoría"
          title="Centro de partidos"
          description="Revisá partidos cargados, corregí estadísticas granulares y anulá cargas sin editar acumulados ni borrar filas aisladas."
        />

        {message && <Notice danger={message.toLowerCase().includes("no se") || message.toLowerCase().includes("error")}>{message}</Notice>}

        <MatchCard title="Buscar partidos" description="Los filtros se aplican en base de datos; la búsqueda de texto se aplica sobre el conjunto filtrado.">
          <div className={styles.grid3}>
            <Field label="Temporada"><Select value={temporada} onChange={(e) => setTemporada(e.target.value)}><option>Temporada 4</option></Select></Field>
            <Field label="Competición"><Select value={competicion} onChange={(e) => setCompeticion(e.target.value)}><option value="todas">Todas</option>{ADMIN_MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></Field>
            <Field label="Buscar"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Club, resultado, fase..." /></Field>
          </div>
        </MatchCard>

        <MatchCard title={`Partidos (${filtered.length})`} description="Abrí un partido para ver estadísticas, evidencia TXT e historial de revisiones.">
          <div className={styles.matchList}>
            {filtered.length === 0 ? <div className={styles.empty}>No hay partidos con estos filtros.</div> : filtered.map((match) => (
              <div key={match.id} className={styles.matchRow}>
                <div>
                  <div className={styles.matchMeta}>{matchContextLabel(match)} · Fecha {match.fecha || "-"}</div>
                  <div className={styles.matchTitle}>{match.local} {match.resultado || "VS"} {match.visitante}</div>
                  <div className={styles.matchMeta}>{match.dia || "Sin día"} · {match.hora || "Sin hora"} · Estado: {match.estado || (match.resultado ? "cargado" : "programado")}</div>
                </div>
                <button className={styles.secondary} type="button" onClick={() => openMatch(match.id)}>Abrir</button>
              </div>
            ))}
          </div>
        </MatchCard>

        {bundle && (
          <>
            <MatchCard
              title={`${bundle.match.local} ${bundle.match.resultado || "VS"} ${bundle.match.visitante}`}
              description={`${matchContextLabel(bundle.match)} · ${bundle.playerStats.length} estadísticas de jugadores · ${bundle.segments.length} TXT`}
              action={<span className={styles.badge}>{sourceLabel(bundle.revisions[0]?.source)}</span>}
            >
              {!editing ? (
                <div className={styles.actions}>
                  <button className={styles.primary} type="button" onClick={() => setEditing(true)}>Corregir</button>
                  <button className={styles.danger} type="button" onClick={annul} disabled={loading || (!bundle.match.resultado && !bundle.match.partido_id)}>Anular carga</button>
                </div>
              ) : (
                <>
                  <div className={styles.grid3}>
                    <Field label="Resultado"><Input value={result} onChange={(e) => setResult(e.target.value)} placeholder="2-1" /></Field>
                    <Field label="Día"><Input value={day} onChange={(e) => setDay(e.target.value)} /></Field>
                    <Field label="Hora"><Input value={time} onChange={(e) => setTime(e.target.value)} /></Field>
                  </div>

                  <div className={styles.playerList} style={{ marginTop: 18 }}>
                    {players.map((player, index) => (
                      <div key={`${player.playerId}-${player.equipo}-${index}`} className={styles.playerRow}>
                        <div className={styles.statGrid}>
                          <Field label="Jugador"><Input value={player.nombre || ""} disabled /></Field>
                          <Field label="Equipo"><Input value={player.equipo || ""} disabled /></Field>
                          <Field label="Goles"><Input type="number" min={0} value={player.goals || 0} onChange={(e) => updatePlayer(index, { goals: Math.max(0, Number(e.target.value)) })} /></Field>
                          <Field label="Asist."><Input type="number" min={0} value={player.assists || 0} onChange={(e) => updatePlayer(index, { assists: Math.max(0, Number(e.target.value)) })} /></Field>
                          <Field label="Score"><Input type="number" min={0} value={player.score || 0} onChange={(e) => updatePlayer(index, { score: Math.max(0, Number(e.target.value)) })} /></Field>
                          <label className={styles.check}><input type="radio" name="correction-mvp" checked={(player.mvp || 0) > 0} onChange={() => setMvp(index)} /> MVP</label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 18 }}><Field label="Motivo de la corrección"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: gol asignado al jugador incorrecto" /></Field></div>
                  <div className={styles.actions}>
                    <button className={styles.primary} type="button" onClick={saveCorrection} disabled={loading}>Guardar corrección</button>
                    <button className={styles.secondary} type="button" onClick={() => { setEditing(false); openMatch(bundle.match.id); }}>Cancelar</button>
                  </div>
                </>
              )}
            </MatchCard>

            <MatchCard title="Historial" description="Cada carga, corrección o anulación queda registrada con motivo, usuario y número de revisión.">
              <div className={styles.revisionList}>
                {bundle.revisions.length === 0 ? <div className={styles.empty}>Este partido todavía no tiene revisiones del sistema nuevo.</div> : bundle.revisions.map((revision) => (
                  <div key={revision.id} className={styles.revisionRow}>
                    <strong>Revisión #{revision.revision_number} · {sourceLabel(revision.source)}</strong>
                    <div className={styles.matchMeta}>{new Date(revision.created_at).toLocaleString("es-AR")} · {revision.reason || "Sin observación"}</div>
                  </div>
                ))}
              </div>
            </MatchCard>
          </>
        )}
      </MatchPage>
    </PermissionGuard>
  );
}
