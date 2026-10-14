"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import {
  fetchTournamentMatches,
  fetchTournamentSeasons,
  isLoadedMatch,
  winnerOf,
  type TournamentMatch,
} from "@/lib/adminTournaments";
import {
  Field,
  Select,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "./TournamentUi";

type Props = {
  title: string;
  competition: "copa_argentina" | "copa_apa";
};

const PHASE_ORDER = ["eliminacion", "octavos", "cuartos", "semifinal", "final"];

function labelPhase(phase: string) {
  if (phase === "octavos") return "Octavos";
  if (phase === "cuartos") return "Cuartos";
  if (phase === "semifinal") return "Semifinales";
  if (phase === "final") return "Final";
  return "Eliminación";
}

function nextPhaseFor(phase: string, sourceCount: number) {
  if (phase === "semifinal") return "final";
  if (phase === "cuartos") return "semifinal";
  if (phase === "octavos") return "cuartos";
  if (phase === "eliminacion") {
    if (sourceCount <= 2) return "final";
    if (sourceCount <= 4) return "semifinal";
    if (sourceCount <= 8) return "cuartos";
    return "eliminacion";
  }
  return "final";
}

function sortRound(a: TournamentMatch, b: TournamentMatch) {
  return String(a.ronda || a.id).localeCompare(String(b.ronda || b.id), undefined, { numeric: true });
}

export default function KnockoutCupManager({ title, competition }: Props) {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournamentSeasons()
      .then((rows) => {
        setSeasons(rows);
        setTemporada(rows[0] || "Temporada 4");
      })
      .catch(() => {
        setSeasons(["Temporada 4"]);
        setTemporada("Temporada 4");
      });
  }, []);

  async function load() {
    if (!temporada) return;
    setLoading(true);
    setMessage("");
    try {
      const rows = await fetchTournamentMatches({ temporada, competicion: competition });
      setMatches(rows);
    } catch (error: any) {
      setMessage(error?.message || `No pude cargar ${title}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [temporada, competition]);

  const phases = useMemo(() => {
    const grouped = new Map<string, TournamentMatch[]>();
    for (const match of matches) {
      const phase = String(match.fase || "eliminacion").toLowerCase();
      if (!grouped.has(phase)) grouped.set(phase, []);
      grouped.get(phase)!.push(match);
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => PHASE_ORDER.indexOf(a) - PHASE_ORDER.indexOf(b))
      .map(([phase, rows]) => [phase, [...rows].sort(sortRound)] as const);
  }, [matches]);

  const final = matches.find((match) => String(match.fase).toLowerCase() === "final");
  const champion = winnerOf(final);

  async function placeInNextRound(source: TournamentMatch, team: string) {
    if (!team || isLoadedMatch(source)) return;
    const phase = String(source.fase || "eliminacion").toLowerCase();
    if (phase === "final") return;

    setLoading(true);
    setMessage("");
    try {
      const sourcePhase = matches.filter((match) => String(match.fase || "eliminacion").toLowerCase() === phase).sort(sortRound);
      const sourceIndex = sourcePhase.findIndex((match) => String(match.id) === String(source.id));
      if (sourceIndex < 0) return;

      const nextPhase = nextPhaseFor(phase, sourcePhase.length);
      const targetIndex = Math.floor(sourceIndex / 2);
      const targetRows = matches.filter((match) => String(match.fase || "").toLowerCase() === nextPhase).sort(sortRound);
      const target = targetRows[targetIndex];

      if (target) {
        if (target.local === team || target.visitante === team) {
          setMessage(`${team} ya está en la siguiente ronda.`);
          return;
        }
        const patch = !target.local ? { local: team } : !target.visitante ? { visitante: team } : null;
        if (!patch) {
          setMessage("Ese cruce ya tiene dos equipos. Podés modificarlo desde Más opciones.");
          return;
        }
        const { error } = await supabase.from("partidos").update(patch).eq("id", target.id);
        if (error) throw error;
      } else {
        const nextFecha = String(Math.max(...matches.map((match) => Number(match.fecha) || 0), 0) + 1);
        const roundName = nextPhase === "final" ? `${title} · Final` : `${title} · ${labelPhase(nextPhase)} ${targetIndex + 1}`;
        const { error } = await supabase.from("partidos").insert({
          local: team,
          visitante: null,
          resultado: null,
          fecha: nextFecha,
          temporada,
          division: "copa",
          competicion: competition,
          fase: nextPhase,
          ronda: roundName,
          estado: "programado",
        });
        if (error) throw error;
      }

      const { error: sourceError } = await supabase.from("partidos").update({ estado: "cancelado" }).eq("id", source.id);
      if (sourceError) throw sourceError;
      setMessage(`${team} pasó directamente a ${labelPhase(nextPhase).toLowerCase()}.`);
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude aplicar el pase directo.");
    } finally {
      setLoading(false);
    }
  }

  async function advanceAvailableWinners() {
    const active = [...phases].reverse().find(([phase, rows]) => phase !== "final" && rows.length > 0);
    if (!active) {
      setMessage("Todavía no hay una ronda lista para avanzar.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const [phase, sourceRows] = active;
      const nextPhase = nextPhaseFor(phase, sourceRows.length);
      const targetRows = matches.filter((match) => String(match.fase || "").toLowerCase() === nextPhase).sort(sortRound);
      let changed = false;

      for (let index = 0; index < sourceRows.length; index += 1) {
        const winner = winnerOf(sourceRows[index]);
        if (!winner) continue;
        const targetIndex = Math.floor(index / 2);
        const target = targetRows[targetIndex];

        if (target) {
          if (target.local === winner || target.visitante === winner) continue;
          const patch = !target.local ? { local: winner } : !target.visitante ? { visitante: winner } : null;
          if (patch) {
            const { error } = await supabase.from("partidos").update(patch).eq("id", target.id);
            if (error) throw error;
            changed = true;
          }
        } else {
          const nextFecha = String(Math.max(...matches.map((match) => Number(match.fecha) || 0), 0) + 1);
          const roundName = nextPhase === "final" ? `${title} · Final` : `${title} · ${labelPhase(nextPhase)} ${targetIndex + 1}`;
          const { error } = await supabase.from("partidos").insert({
            local: winner,
            visitante: null,
            resultado: null,
            fecha: nextFecha,
            temporada,
            division: "copa",
            competicion: competition,
            fase: nextPhase,
            ronda: roundName,
            estado: "programado",
          });
          if (error) throw error;
          changed = true;
        }
      }

      setMessage(changed ? "Siguiente ronda actualizada." : "No hay nuevos ganadores para agregar todavía.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude actualizar la siguiente ronda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero eyebrow={title} title={title} description="Cruces, pases directos y próxima ronda en una sola pantalla.">
          <div className={styles.toolbar}>
            <Field label="Torneo">
              <Select value={temporada} onChange={(event) => setTemporada(event.target.value)}>
                {seasons.map((season) => <option key={season} value={season}>{displayLabel(season)}</option>)}
              </Select>
            </Field>
            <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Más opciones</Link>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <TournamentPanel
          eyebrow={champion ? "Finalizada" : "Llave"}
          title={champion ? `Campeón: ${champion}` : "Partidos"}
          description={matches.length ? "Solo abrí Más opciones cuando necesites resolver una excepción." : "Todavía no hay cruces creados para esta copa."}
          action={matches.length && !champion ? <button className={styles.primary} type="button" onClick={advanceAvailableWinners} disabled={loading}>Actualizar siguiente ronda</button> : undefined}
        >
          <div className={styles.list}>
            {phases.map(([phase, rows]) => (
              <div key={phase}>
                <p className={styles.sectionEyebrow}>{labelPhase(phase)}</p>
                <div className={styles.list} style={{ marginTop: 8 }}>
                  {rows.map((match) => (
                    <div key={String(match.id)} className={styles.row}>
                      <div>
                        <div className={styles.rowTitle}>{match.local || "Por definir"} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante || "Por definir"}</div>
                        <div className={styles.rowMeta}>{match.estado === "cancelado" ? "Pase directo" : match.ronda || labelPhase(phase)}</div>
                      </div>
                      <div className={styles.actions}>
                        {isLoadedMatch(match) && <Link href={`/admin/partidos/${match.id}`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link>}
                        {!isLoadedMatch(match) && phase !== "final" && match.estado !== "cancelado" && (
                          <details>
                            <summary className={styles.secondary} style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", listStyle: "none" }}>Más opciones</summary>
                            <div className={styles.actions} style={{ marginTop: 8 }}>
                              {match.local && <button className={styles.secondary} type="button" onClick={() => placeInNextRound(match, match.local)}>Pasar {match.local}</button>}
                              {match.visitante && <button className={styles.secondary} type="button" onClick={() => placeInNextRound(match, match.visitante!)}>Pasar {match.visitante}</button>}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!matches.length && <div className={styles.empty}>Creá los cruces desde Grupos o desde Más opciones.</div>}
          </div>
        </TournamentPanel>
      </TournamentPage>
    </PermissionGuard>
  );
}
