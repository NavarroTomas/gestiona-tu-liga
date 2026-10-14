"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { fetchSeasonRecords } from "@/lib/adminTournaments";
import {
  AdminMatch,
  ADMIN_MATCH_COMPETITIONS,
  MatchPlayerStat,
  buildTeamStatsFromPlayers,
  calculateApaRating,
  commitMatchData,
  fetchAdminMatches,
  fetchMatchRoster,
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

type PlayerDraft = {
  key: string;
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  keyPasses: number;
  tackles: number;
  keyTackles: number;
  interceptions: number;
  keyInterceptions: number;
  possessionsLost: number;
  gKSaves: number;
  gKCatches: number;
  score: number;
  overallRating: number;
  mvp: boolean;
};

function emptyPlayer(team = ""): PlayerDraft {
  return {
    key: crypto.randomUUID(),
    nombre: "",
    playerId: "",
    equipo: team,
    posicion: "",
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    keyPasses: 0,
    tackles: 0,
    keyTackles: 0,
    interceptions: 0,
    keyInterceptions: 0,
    possessionsLost: 0,
    gKSaves: 0,
    gKCatches: 0,
    score: 0,
    overallRating: 0,
    mvp: false,
  };
}

export default function MatchManualEditor() {
  const [temporadas, setTemporadas] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState("liga");
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [matchId, setMatchId] = useState("");
  const [players, setPlayers] = useState<PlayerDraft[]>([]);
  const [goalsLocal, setGoalsLocal] = useState(0);
  const [goalsVisitor, setGoalsVisitor] = useState(0);
  const [reason, setReason] = useState("Carga manual por ausencia de TXT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const match = useMemo(
    () => matches.find((item) => String(item.id) === matchId) || null,
    [matches, matchId],
  );

  useEffect(() => {
    fetchSeasonRecords()
      .then((rows) => {
        const names = rows.map((row) => row.nombre);
        setTemporadas(names);
        setTemporada(rows.find((row) => row.activa)?.nombre || names[0] || "Temporada 4");
      })
      .catch(() => setTemporadas(["Temporada 4"]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminMatches({ temporada, competicion })
      .then((rows) => {
        if (!active) return;
        setMatches(rows);
        setMatchId((current) =>
          rows.some((row) => String(row.id) === current)
            ? current
            : String(rows[0]?.id || ""),
        );
      })
      .catch((error) => setMessage(error.message || "No se pudieron cargar los partidos."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [temporada, competicion]);

  useEffect(() => {
    setPlayers([]);
    setGoalsLocal(0);
    setGoalsVisitor(0);
    setMessage("");
    if (!match?.resultado) return;
    const score = match.resultado.match(/^(\d+)\s*[-:]\s*(\d+)$/);
    if (score) {
      setGoalsLocal(Number(score[1]));
      setGoalsVisitor(Number(score[2]));
    }
  }, [matchId]);

  async function loadRoster() {
    if (!match) return;
    try {
      setLoading(true);
      const roster = await fetchMatchRoster(match);
      setPlayers(
        roster.map((row) => ({
          ...emptyPlayer(row.equipo || ""),
          nombre: row.jugador,
          playerId: row.playerid || "",
          posicion: row.posicion || "",
        })),
      );
      setMessage(`Plantillas cargadas: ${roster.length} jugadores. Eliminá los que no participaron.`);
    } catch (error: any) {
      setMessage(error.message || "No pude cargar las plantillas.");
    } finally {
      setLoading(false);
    }
  }

  function updatePlayer(key: string, patch: Partial<PlayerDraft>) {
    setPlayers((current) =>
      current.map((player) => player.key === key ? { ...player, ...patch } : player),
    );
  }

  function setMvp(key: string) {
    setPlayers((current) => current.map((player) => ({ ...player, mvp: player.key === key })));
  }

  async function save() {
    if (!match || !match.visitante) {
      setMessage("Elegí un partido programado antes de guardar.");
      return;
    }
    if (!reason.trim()) {
      setMessage("Indicá el motivo de la carga manual.");
      return;
    }

    const partidoId = stableAdminMatchId(match);
    const division = textValue(match.division) || textValue(match.fase) || "General";
    const fecha = textValue(match.fecha) || "1";
    const validPlayers = players.filter((player) => player.nombre.trim() && player.equipo.trim());
    const playerStats: MatchPlayerStat[] = validPlayers.map((player) => {
      const base: MatchPlayerStat = {
        partido_id: partidoId,
        nombre: player.nombre.trim(),
        playerId: player.playerId.trim(),
        posicion: player.posicion.trim(),
        equipo: player.equipo,
        temporada,
        division,
        fecha,
        goals: player.goals,
        assists: player.assists,
        shots: player.shots,
        shotsOnTarget: player.shotsOnTarget,
        passes: player.passes,
        keyPasses: player.keyPasses,
        tackles: player.tackles,
        keyTackles: player.keyTackles,
        interceptions: player.interceptions,
        keyInterceptions: player.keyInterceptions,
        possessionsLost: player.possessionsLost,
        gKSaves: player.gKSaves,
        gKCatches: player.gKCatches,
        score: player.score,
        overallRating: player.overallRating,
        mvp: player.mvp ? 1 : 0,
      };
      return { ...base, rating_apa: calculateApaRating(base) };
    });

    const teamStats = [
      buildTeamStatsFromPlayers({
        players: playerStats,
        team: match.local,
        goals: goalsLocal,
        partidoId,
        temporada,
        division,
        fecha,
      }),
      buildTeamStatsFromPlayers({
        players: playerStats,
        team: match.visitante,
        goals: goalsVisitor,
        partidoId,
        temporada,
        division,
        fecha,
      }),
    ];

    const validation = validateMatchStats({ match, teamStats, playerStats });
    if (validation.errors.length > 0) {
      setMessage(validation.errors.join(" "));
      return;
    }

    const warningText = validation.warnings.length ? `\n\nAdvertencias:\n- ${validation.warnings.join("\n- ")}` : "";
    if (!window.confirm(`Guardar ${match.local} ${goalsLocal}-${goalsVisitor} ${match.visitante}?${warningText}`)) return;

    try {
      setLoading(true);
      setMessage("");
      const result = await commitMatchData({
        matchRowId: match.id,
        source: "manual",
        reason,
        matchPatch: {
          partido_id: partidoId,
          resultado: `${goalsLocal}-${goalsVisitor}`,
          temporada,
          division: match.division,
          competicion: match.competicion,
          grupo: match.grupo,
          fase: match.fase,
          ronda: match.ronda,
          estado: "cargado",
        },
        teamStats,
        playerStats,
      });
      setMessage(`Partido guardado de forma transaccional. Revisión #${result.revision}.`);
    } catch (error: any) {
      setMessage(error.message || "No se pudo guardar el partido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="matches.upload_manual">
      <MatchPage>
        <MatchHeader
          eyebrow="Carga excepcional"
          title="Carga manual"
          description="Usá este flujo cuando no exista un TXT válido. Parte siempre de un partido programado y utiliza el mismo motor transaccional que las correcciones."
        />

        {message && <Notice danger={message.toLowerCase().includes("error") || message.toLowerCase().includes("no se")}>{message}</Notice>}

        <MatchCard title="1. Elegí el partido" description="Ya no se escriben clubes ni IDs a mano: se reutiliza el fixture oficial.">
          <div className={styles.grid3}>
            <Field label="Torneo"><Select value={temporada} onChange={(e) => setTemporada(e.target.value)}>{(temporadas.length ? temporadas : [temporada]).map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field>
            <Field label="Competición"><Select value={competicion} onChange={(e) => setCompeticion(e.target.value)}>{ADMIN_MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{displayLabel(item.label)}</option>)}</Select></Field>
            <Field label="Partido"><Select value={matchId} onChange={(e) => setMatchId(e.target.value)} disabled={loading}>{matches.length === 0 && <option value="">Sin partidos</option>}{matches.map((item) => <option key={item.id} value={String(item.id)}>F{item.fecha || "-"} · {item.local} vs {item.visitante}</option>)}</Select></Field>
          </div>
          {match && <p className={styles.muted} style={{ marginTop: 12 }}>{matchContextLabel(match)}</p>}
        </MatchCard>

        {match && match.visitante && (
          <>
            <MatchCard title="2. Resultado" description="El marcador del partido es la referencia para validar los goles individuales.">
              <div className={styles.grid3}>
                <Field label={match.local}><Input type="number" min={0} value={goalsLocal} onChange={(e) => setGoalsLocal(Math.max(0, Number(e.target.value)))} /></Field>
                <Field label={match.visitante}><Input type="number" min={0} value={goalsVisitor} onChange={(e) => setGoalsVisitor(Math.max(0, Number(e.target.value)))} /></Field>
                <Field label="Motivo"><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
              </div>
            </MatchCard>

            <MatchCard
              title="3. Jugadores"
              description="Podés cargar las plantillas actuales y eliminar quienes no participaron, o agregar jugadores manualmente."
              action={<button className={styles.secondary} type="button" onClick={loadRoster} disabled={loading}>Cargar plantillas</button>}
            >
              <div className={styles.actions}>
                <button className={styles.secondary} type="button" onClick={() => setPlayers((current) => [...current, emptyPlayer(match.local)])}>+ {match.local}</button>
                <button className={styles.secondary} type="button" onClick={() => setPlayers((current) => [...current, emptyPlayer(match.visitante || "")])}>+ {match.visitante}</button>
              </div>

              <div className={styles.playerList} style={{ marginTop: 16 }}>
                {players.length === 0 ? <div className={styles.empty}>Todavía no cargaste jugadores. Las estadísticas individuales son opcionales, pero el resultado siempre queda registrado.</div> : players.map((player) => (
                  <div key={player.key} className={styles.playerRow}>
                    <div className={styles.statGrid}>
                      <Field label="Jugador"><Input value={player.nombre} onChange={(e) => updatePlayer(player.key, { nombre: e.target.value })} /></Field>
                      <Field label="Player ID"><Input value={player.playerId} onChange={(e) => updatePlayer(player.key, { playerId: e.target.value })} /></Field>
                      <Field label="Equipo"><Select value={player.equipo} onChange={(e) => updatePlayer(player.key, { equipo: e.target.value })}><option value={match.local}>{displayLabel(match.local)}</option><option value={match.visitante || ""}>{displayLabel(match.visitante)}</option></Select></Field>
                      <Field label="Goles"><Input type="number" min={0} value={player.goals} onChange={(e) => updatePlayer(player.key, { goals: Math.max(0, Number(e.target.value)) })} /></Field>
                      <Field label="Asist."><Input type="number" min={0} value={player.assists} onChange={(e) => updatePlayer(player.key, { assists: Math.max(0, Number(e.target.value)) })} /></Field>
                      <Field label="Score"><Input type="number" min={0} value={player.score} onChange={(e) => updatePlayer(player.key, { score: Math.max(0, Number(e.target.value)) })} /></Field>
                      <label className={styles.check}><input type="radio" name="mvp" checked={player.mvp} onChange={() => setMvp(player.key)} /> MVP</label>
                      <button className={styles.ghost} type="button" onClick={() => setPlayers((current) => current.filter((item) => item.key !== player.key))}>Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </MatchCard>

            <MatchCard title="4. Confirmar" description="El guardado es atómico: si una parte falla, no queda un partido a medias.">
              <Field label="Observación / motivo de auditoría"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
              <div className={styles.actions}><button className={styles.primary} type="button" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar partido"}</button></div>
            </MatchCard>
          </>
        )}
      </MatchPage>
    </PermissionGuard>
  );
}
