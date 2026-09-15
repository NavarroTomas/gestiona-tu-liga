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
  normalizeDivision,
  winnerOf,
  type TournamentMatch,
  type TournamentTeam,
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

function finalWinner(matches: TournamentMatch[], competition: string) {
  const final = matches.find((match) => match.competicion === competition && String(match.fase || "").toLowerCase() === "final");
  return winnerOf(final);
}

export default function ChampionsCupManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [participants, setParticipants] = useState<string[]>(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournamentSeasons().then((rows) => {
      setSeasons(rows);
      setTemporada(rows[0] || "Temporada 4");
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
      const [teamRows, matchRows] = await Promise.all([
        fetchTournamentTeams(temporada),
        fetchTournamentMatches({ temporada }),
      ]);
      setTeams(teamRows);
      setMatches(matchRows);
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar la Copa de Campeones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [temporada]);

  const championsMatches = useMemo(() => matches.filter((match) => match.competicion === "copa_campeones"), [matches]);
  const semis = useMemo(() => championsMatches.filter((match) => match.fase === "semifinal"), [championsMatches]);
  const final = useMemo(() => championsMatches.find((match) => match.fase === "final"), [championsMatches]);

  const firstTable = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera")), [matches]);
  const secondTable = useMemo(() => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda")), [matches]);

  const suggested = useMemo(() => [
    firstTable[0]?.equipo || "",
    secondTable[0]?.equipo || "",
    finalWinner(matches, "copa_argentina") || "",
    finalWinner(matches, "copa_apa") || "",
  ], [firstTable, secondTable, matches]);

  useEffect(() => {
    if (championsMatches.length) return;
    setParticipants((current) => current.some(Boolean) ? current : suggested);
  }, [suggested.join("|"), championsMatches.length]);

  const used = new Set(participants.filter(Boolean));
  const canCreate = participants.every(Boolean) && new Set(participants).size === 4 && !championsMatches.length;

  function setParticipant(index: number, value: string) {
    setParticipants((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  async function createCup() {
    if (!canCreate) {
      setMessage("Elegí cuatro equipos distintos.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert([
        { local: participants[0], visitante: participants[3], resultado: null, fecha: "1", temporada, division: "copa", competicion: "copa_campeones", fase: "semifinal", ronda: "Copa de Campeones · Semifinal 1", estado: "programado" },
        { local: participants[1], visitante: participants[2], resultado: null, fecha: "1", temporada, division: "copa", competicion: "copa_campeones", fase: "semifinal", ronda: "Copa de Campeones · Semifinal 2", estado: "programado" },
      ]);
      if (error) throw error;
      setMessage("Copa de Campeones creada.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la Copa de Campeones.");
    } finally {
      setLoading(false);
    }
  }

  async function passDirect(source: TournamentMatch, team: string) {
    if (!team || isLoadedMatch(source)) return;
    setLoading(true);
    setMessage("");
    try {
      if (final) {
        if (final.local === team || final.visitante === team) {
          setMessage(`${team} ya está en la final.`);
          return;
        }
        if (final.visitante) {
          setMessage("La final ya tiene los dos lugares ocupados. Usá Más opciones si querés reemplazar un finalista.");
          return;
        }
        const { error } = await supabase.from("partidos").update({ visitante: team }).eq("id", final.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partidos").insert({
          local: team,
          visitante: null,
          resultado: null,
          fecha: "2",
          temporada,
          division: "copa",
          competicion: "copa_campeones",
          fase: "final",
          ronda: "Copa de Campeones · Final",
          estado: "programado",
        });
        if (error) throw error;
      }

      const { error: cancelError } = await supabase.from("partidos").update({ estado: "cancelado" }).eq("id", source.id);
      if (cancelError) throw cancelError;
      setMessage(`${team} pasó directamente a la final.`);
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude aplicar el pase directo.");
    } finally {
      setLoading(false);
    }
  }

  async function createOrCompleteFinal() {
    setLoading(true);
    setMessage("");
    try {
      const winners = semis.map((match) => winnerOf(match)).filter(Boolean) as string[];
      if (!final) {
        if (winners.length !== 2) {
          setMessage("Faltan resultados o un pase directo en alguna semifinal.");
          return;
        }
        const { error } = await supabase.from("partidos").insert({
          local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada,
          division: "copa", competicion: "copa_campeones", fase: "final", ronda: "Copa de Campeones · Final", estado: "programado",
        });
        if (error) throw error;
        setMessage("Final creada.");
        await load();
        return;
      }

      if (final.visitante) {
        setMessage("La final ya está completa.");
        return;
      }

      const otherFinalist = winners.find((team) => team !== final.local);
      if (!otherFinalist) {
        setMessage("Todavía falta definir el otro finalista.");
        return;
      }

      const { error } = await supabase.from("partidos").update({ visitante: otherFinalist }).eq("id", final.id);
      if (error) throw error;
      setMessage("Final completada.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude completar la final.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero eyebrow="Copa de Campeones" title="Copa de Campeones" description="Elegí los equipos y resolvé excepciones sin inventar resultados.">
          <div className={styles.toolbar}>
            <Field label="Temporada">
              <Select value={temporada} onChange={(event) => setTemporada(event.target.value)}>
                {seasons.map((season) => <option key={season}>{season}</option>)}
              </Select>
            </Field>
            <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Más opciones</Link>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        {!championsMatches.length ? (
          <TournamentPanel eyebrow="Participantes" title="Elegí 4 equipos" description="Usá los sugeridos o cambiá cualquiera.">
            <div className={styles.toolbar}><button type="button" className={styles.secondary} onClick={() => setParticipants(suggested)}>Usar sugeridos</button></div>
            <div className={styles.grid2}>
              {participants.map((value, index) => (
                <Field key={index} label={`Participante ${index + 1}`}>
                  <Select value={value} onChange={(event) => setParticipant(index, event.target.value)}>
                    <option value="">Elegir equipo</option>
                    {teams.filter((team) => team.nombre === value || !used.has(team.nombre)).map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}
                  </Select>
                </Field>
              ))}
            </div>
            <div className={styles.notice}>
              Semifinal 1: <strong>{participants[0] || "Por definir"}</strong> vs <strong>{participants[3] || "Por definir"}</strong><br />
              Semifinal 2: <strong>{participants[1] || "Por definir"}</strong> vs <strong>{participants[2] || "Por definir"}</strong>
            </div>
            <div className={styles.toolbar}><button className={styles.primary} type="button" onClick={createCup} disabled={!canCreate || loading}>Crear Copa de Campeones</button></div>
          </TournamentPanel>
        ) : (
          <TournamentPanel eyebrow="Llave" title="Partidos" description="Usá Más opciones solo cuando pase algo excepcional.">
            <div className={styles.list}>
              {championsMatches.map((match) => (
                <div key={String(match.id)} className={styles.row}>
                  <div>
                    <div className={styles.rowTitle}>{match.local || "Por definir"} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante || "Por definir"}</div>
                    <div className={styles.rowMeta}>{match.estado === "cancelado" ? "Pase directo" : match.ronda || match.fase}</div>
                  </div>
                  <div className={styles.actions}>
                    {isLoadedMatch(match) && <Link href={`/admin/partidos/${match.id}`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link>}
                    {match.fase === "semifinal" && !isLoadedMatch(match) && match.estado !== "cancelado" && (
                      <details>
                        <summary className={styles.secondary} style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", listStyle: "none" }}>Más opciones</summary>
                        <div className={styles.actions} style={{ marginTop: 8 }}>
                          {match.local && <button className={styles.secondary} type="button" onClick={() => passDirect(match, match.local)}>Pasar {match.local} a la final</button>}
                          {match.visitante && <button className={styles.secondary} type="button" onClick={() => passDirect(match, match.visitante!)}>Pasar {match.visitante} a la final</button>}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.toolbar}>
              {!winnerOf(final) && <button className={styles.primary} type="button" onClick={createOrCompleteFinal} disabled={loading}>{final ? "Completar final" : "Crear final"}</button>}
            </div>
          </TournamentPanel>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
