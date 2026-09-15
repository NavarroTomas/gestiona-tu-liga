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
  const final = matches.find(
    (match) => match.competicion === competition && String(match.fase || "").toLowerCase() === "final",
  );
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

  const championsMatches = useMemo(
    () => matches.filter((match) => match.competicion === "copa_campeones"),
    [matches],
  );

  const firstTable = useMemo(
    () => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "primera")),
    [matches],
  );
  const secondTable = useMemo(
    () => calculateStandings(matches.filter((match) => match.competicion === "liga" && normalizeDivision(match.division) === "segunda")),
    [matches],
  );

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
    setMessage("");
    try {
      const { error } = await supabase.from("partidos").insert([
        {
          local: participants[0], visitante: participants[3], resultado: null, fecha: "1", temporada,
          division: "copa", competicion: "copa_campeones", fase: "semifinal",
          ronda: "Copa de Campeones · Semifinal 1", estado: "programado",
        },
        {
          local: participants[1], visitante: participants[2], resultado: null, fecha: "1", temporada,
          division: "copa", competicion: "copa_campeones", fase: "semifinal",
          ronda: "Copa de Campeones · Semifinal 2", estado: "programado",
        },
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

  async function createFinal() {
    const semis = championsMatches.filter((match) => match.fase === "semifinal");
    const final = championsMatches.find((match) => match.fase === "final");
    if (final) {
      setMessage("La final ya existe.");
      return;
    }
    const winners = semis.map(winnerOf);
    if (semis.length !== 2 || winners.some((winner) => !winner)) {
      setMessage("Primero tienen que estar cargados los dos resultados de semifinales.");
      return;
    }

    const { error } = await supabase.from("partidos").insert({
      local: winners[0], visitante: winners[1], resultado: null, fecha: "2", temporada,
      division: "copa", competicion: "copa_campeones", fase: "final",
      ronda: "Copa de Campeones · Final", estado: "programado",
    });
    if (error) {
      setMessage("No pude crear la final.");
      return;
    }
    setMessage("Final creada.");
    await load();
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />

        <TournamentHero
          eyebrow="Copa de Campeones"
          title="Elegí quién juega"
          description="Cuatro equipos. Dos semifinales. Una final."
        >
          <div className={styles.toolbar}>
            <Field label="Temporada">
              <Select value={temporada} onChange={(event) => setTemporada(event.target.value)}>
                {seasons.map((season) => <option key={season}>{season}</option>)}
              </Select>
            </Field>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        {!championsMatches.length ? (
          <TournamentPanel
            eyebrow="Participantes"
            title="4 equipos"
            description="Podés usar los sugeridos o elegir cualquier club manualmente."
            action={<button type="button" className={styles.secondary} onClick={() => setParticipants(suggested)}>Usar sugeridos</button>}
          >
            <div className={styles.grid2}>
              {participants.map((value, index) => (
                <Field key={index} label={`Participante ${index + 1}`}>
                  <Select value={value} onChange={(event) => setParticipant(index, event.target.value)}>
                    <option value="">Elegir equipo</option>
                    {teams
                      .filter((team) => team.nombre === value || !used.has(team.nombre))
                      .map((team) => <option key={team.nombre} value={team.nombre}>{team.nombre}</option>)}
                  </Select>
                </Field>
              ))}
            </div>

            <div className={styles.notice}>
              Semifinal 1: <strong>{participants[0] || "Participante 1"}</strong> vs <strong>{participants[3] || "Participante 4"}</strong><br />
              Semifinal 2: <strong>{participants[1] || "Participante 2"}</strong> vs <strong>{participants[2] || "Participante 3"}</strong>
            </div>

            <div className={styles.toolbar}>
              <button className={styles.primary} type="button" onClick={createCup} disabled={!canCreate || loading}>Crear Copa de Campeones</button>
              <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Más opciones</Link>
            </div>
          </TournamentPanel>
        ) : (
          <TournamentPanel
            eyebrow="Copa creada"
            title="Partidos"
            description="Los resultados se cargan desde Centro de partidos."
          >
            <div className={styles.list}>
              {championsMatches.map((match) => (
                <div key={String(match.id)} className={styles.row}>
                  <div>
                    <div className={styles.rowTitle}>{match.local} <span style={{ color: "#245f8e" }}>{match.resultado || "vs"}</span> {match.visitante}</div>
                    <div className={styles.rowMeta}>{match.ronda || match.fase}</div>
                  </div>
                  <div className={styles.actions}>
                    <span className={`${styles.badge} ${isLoadedMatch(match) ? styles.badgeGood : ""}`}>{isLoadedMatch(match) ? "Cargado" : "Pendiente"}</span>
                    <Link href={`/admin/partidos/${match.id}`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.toolbar}>
              {!championsMatches.some((match) => match.fase === "final") && <button className={styles.primary} type="button" onClick={createFinal}>Crear final</button>}
              <Link href="/admin/torneos/acciones-avanzadas" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Más opciones</Link>
            </div>
          </TournamentPanel>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
