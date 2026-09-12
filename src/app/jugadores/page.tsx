"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import { supabase } from "@/lib/supabase";

type RankingTab = "general" | "goles" | "asistencias" | "mvps" | "rating";
type RankingMode = "temporada" | "historico";

type RankingJugadorRow = {
  temporada?: string | null;
  division?: string | null;
  playerId?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  posicion?: string | null;
  partidos_jugados?: number | string | null;
  goals?: number | string | null;
  assists?: number | string | null;
  mvp?: number | string | null;
  rating_apa_promedio?: number | string | null;
  score_total?: number | string | null;
};

type Jugador = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  partidos: number;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  ratingTotal: number;
  avatarUrl?: string | null;
};

type ClubInfo = {
  nombre: string;
  slug?: string | null;
  logo_url?: string | null;
};

const selectStyle = {
  backgroundColor: "#ffffff",
  color: "#102f55",
  borderColor: "#c9e3f1",
} as const;

function normalizeText(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeDivision(value?: string | null) {
  const normalized = normalizeText(value);
  if (normalized.includes("primera")) return "primera";
  if (normalized.includes("segunda")) return "segunda";
  return normalized;
}

function seasonNumber(value: string) {
  return Number(value.match(/(\d+)/)?.[1] || 0);
}

function PlayerAvatar({ player, size = "md" }: { player: Jugador; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-24 w-24 sm:h-28 sm:w-28",
  };

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d3e6f1] bg-[#edf5f9] ${sizes[size]}`}>
      {player.avatarUrl ? (
        <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%] fill-[#9fb0bc]" aria-hidden="true">
          <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.7 0-8.5 2.4-8.5 5.4 0 .9.7 1.6 1.6 1.6h13.8c.9 0 1.6-.7 1.6-1.6 0-3-3.8-5.4-8.5-5.4Z" />
        </svg>
      )}
    </span>
  );
}

function MetricIcon({ type }: { type: RankingTab }) {
  if (type === "goles") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="8" /><path d="m12 8 3 2-1 4h-4l-1-4 3-2Zm-7 2 4 .5M15 10.5l4-1M8 16l2-2m4 0 2 2" />
      </svg>
    );
  }
  if (type === "asistencias") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 12h13m-4-4 4 4-4 4" /><path d="M4 7v10" />
      </svg>
    );
  }
  if (type === "mvps") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }
  if (type === "rating") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 19V9m7 10V4m7 15v-7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 4h10v4c0 3-2.2 5-5 5s-5-2-5-5V4Z" /><path d="M9 13v3h6v-3M7 20h10M7 6H4v1c0 2 1.2 3 3 3m10-4h3v1c0 2-1.2 3-3 3" />
    </svg>
  );
}

export default function JugadoresPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [modo, setModo] = useState<RankingMode>("temporada");
  const [clubFilter, setClubFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState<RankingTab>("general");
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [temporadas, setTemporadas] = useState<string[]>(["Temporada 4"]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      const { data } = await supabase.from("v_ranking_jugadores").select("temporada");
      if (cancelled) return;
      const values = Array.from(new Set((data || []).map((row: any) => String(row.temporada || "")).filter(Boolean)))
        .sort((a, b) => seasonNumber(a) - seasonNumber(b));
      if (values.length) {
        setTemporadas(values);
        if (!values.includes(temporada)) setTemporada(values[values.length - 1]);
      }
    }
    loadSeasons();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      setLoading(true);
      setErrorMsg(null);

      let rankingQuery = supabase
        .from("v_ranking_jugadores")
        .select("temporada,division,playerId,nombre,equipo,posicion,partidos_jugados,goals,assists,mvp,rating_apa_promedio,score_total");

      if (modo === "temporada") rankingQuery = rankingQuery.eq("temporada", temporada);

      const [rankingResult, clubsResult] = await Promise.all([
        rankingQuery,
        supabase
          .from("v_clubes_temporada_public")
          .select("nombre,slug,logo_url,division,temporada,activo")
          .eq("temporada", temporada)
          .eq("activo", true),
      ]);

      if (cancelled) return;

      if (rankingResult.error) {
        console.error("Error cargando ranking de jugadores:", rankingResult.error);
        setJugadores([]);
        setErrorMsg("No se pudieron cargar los rankings de jugadores.");
        setLoading(false);
        return;
      }

      if (clubsResult.error) console.error("Error cargando clubes del ranking:", clubsResult.error);

      const divisionKey = normalizeDivision(division);
      const baseRows = ((rankingResult.data || []) as RankingJugadorRow[]).filter((row) =>
        modo === "historico" || normalizeDivision(row.division) === divisionKey,
      );

      const map = new Map<string, Jugador>();
      for (const row of baseRows) {
        const name = String(row.nombre || "").trim();
        const playerId = String(row.playerId || "").trim();
        if (!name && !playerId) continue;
        const key = playerId || `${normalizeText(name)}-${normalizeText(row.equipo)}`;
        const matches = Number(row.partidos_jugados || 0);
        const rating = Number(row.rating_apa_promedio || 0);
        const current = map.get(key) || {
          nombre: name || "Sin nombre",
          playerId,
          equipo: String(row.equipo || "Sin Club"),
          posicion: String(row.posicion || "Sin posición"),
          partidos: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
          avatarUrl: null,
        };
        current.partidos += matches;
        current.goles += Number(row.goals || 0);
        current.asistencias += Number(row.assists || 0);
        current.mvps += Number(row.mvp || 0);
        current.score += Number(row.score_total || 0);
        current.ratingTotal += rating * matches;
        if (name) current.nombre = name;
        if (playerId) current.playerId = playerId;
        if (row.equipo) current.equipo = String(row.equipo);
        if (row.posicion) current.posicion = String(row.posicion);
        map.set(key, current);
      }

      let list = Array.from(map.values());
      const playerIds = list.map((player) => player.playerId).filter(Boolean);

      if (playerIds.length) {
        const [profilesResult, rostersResult] = await Promise.all([
          supabase.from("public_profiles").select("playerid,avatar_url").in("playerid", playerIds),
          supabase.from("plantillas").select("playerid,equipo,temporada,division,estado").in("playerid", playerIds).neq("estado", "baja"),
        ]);
        if (!cancelled) {
          const avatarMap = new Map<string, string | null>();
          (profilesResult.data || []).forEach((row: any) => avatarMap.set(String(row.playerid || ""), row.avatar_url || null));
          const clubMap = new Map<string, string>();
          (rostersResult.data || [])
            .filter((row: any) => modo === "historico" || (row.temporada === temporada && normalizeDivision(row.division) === divisionKey))
            .forEach((row: any) => {
              if (row.playerid && row.equipo) clubMap.set(String(row.playerid), String(row.equipo));
            });
          list = list.map((player) => ({
            ...player,
            equipo: clubMap.get(player.playerId) || player.equipo,
            avatarUrl: avatarMap.get(player.playerId) || null,
          }));
        }
      }

      const filteredClubs = ((clubsResult.data || []) as any[])
        .filter((club) => normalizeDivision(club.division) === divisionKey)
        .map((club) => ({ nombre: String(club.nombre), slug: club.slug, logo_url: club.logo_url })) as ClubInfo[];

      if (!cancelled) {
        setJugadores(list);
        setClubesInfo(filteredClubs);
        setLoading(false);
      }
    }

    loadPlayers();
    return () => { cancelled = true; };
  }, [temporada, division, modo]);

  const clubMap = useMemo(() => {
    const map = new Map<string, ClubInfo>();
    clubesInfo.forEach((club) => map.set(normalizeText(club.nombre), club));
    return map;
  }, [clubesInfo]);

  const clubs = useMemo(
    () => Array.from(new Set(jugadores.map((player) => player.equipo).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [jugadores],
  );

  useEffect(() => {
    if (clubFilter !== "Todos" && !clubs.includes(clubFilter)) setClubFilter("Todos");
  }, [clubs, clubFilter]);

  const filteredPlayers = useMemo(
    () => clubFilter === "Todos" ? jugadores : jugadores.filter((player) => player.equipo === clubFilter),
    [jugadores, clubFilter],
  );

  function rating(player: Jugador) {
    return player.partidos ? Number((player.ratingTotal / player.partidos).toFixed(1)) : 0;
  }

  function metricValue(player: Jugador, tab: RankingTab) {
    if (tab === "goles") return player.goles;
    if (tab === "asistencias") return player.asistencias;
    if (tab === "mvps") return player.mvps;
    if (tab === "rating") return rating(player);
    return player.score;
  }

  function ranking(tab: RankingTab, limit?: number) {
    const sorted = [...filteredPlayers]
      .filter((player) => tab === "general" || metricValue(player, tab) > 0)
      .sort((a, b) => metricValue(b, tab) - metricValue(a, tab) || b.goles - a.goles || b.asistencias - a.asistencias);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  const generalRanking = useMemo(() => ranking("general"), [filteredPlayers]); // eslint-disable-line react-hooks/exhaustive-deps
  const activeRanking = useMemo(() => ranking(activeTab, 10), [filteredPlayers, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps
  const topScorers = useMemo(() => ranking("goles", 5), [filteredPlayers]); // eslint-disable-line react-hooks/exhaustive-deps
  const topAssists = useMemo(() => ranking("asistencias", 5), [filteredPlayers]); // eslint-disable-line react-hooks/exhaustive-deps
  const featured = generalRanking[0] || null;

  const tabLabels: Array<{ key: RankingTab; label: string }> = [
    { key: "general", label: "General" },
    { key: "goles", label: "Goleadores" },
    { key: "asistencias", label: "Asistencias" },
    { key: "mvps", label: "MVP" },
    { key: "rating", label: "Promedio" },
  ];

  return (
    <main className="min-h-screen bg-[#f5fbfe] text-[#102f55]">
      <section className="border-b border-[#cfe5f1] bg-[#eef8fd]">
        <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#2b79aa]">Competición · Jugadores</p>
          <div className="mt-2 grid gap-7 lg:grid-cols-[minmax(0,1fr)_620px] lg:items-end">
            <div>
              <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[.9] tracking-[-.045em] text-[#102f55]">
                Jugadores <span className="text-[#32a9df]">APA</span>
              </h1>
              <p className="mt-4 max-w-2xl text-[14px] font-semibold leading-6 text-[#466a85] sm:text-[16px]">
                Conocé el rendimiento de los jugadores de APA PSO Argentina. Explorá estadísticas, rankings y las figuras de cada temporada.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#567b96]">Vista</span>
                <select value={modo} onChange={(e) => setModo(e.target.value as RankingMode)} style={selectStyle} className="h-11 w-full rounded-[7px] border px-3 text-[12px] font-black outline-none">
                  <option value="temporada" style={selectStyle}>Temporada</option>
                  <option value="historico" style={selectStyle}>Histórico</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#567b96]">Club</span>
                <select value={clubFilter} onChange={(e) => setClubFilter(e.target.value)} style={selectStyle} className="h-11 w-full rounded-[7px] border px-3 text-[12px] font-black outline-none">
                  <option value="Todos" style={selectStyle}>Todos los clubes</option>
                  {clubs.map((club) => <option key={club} value={club} style={selectStyle}>{club}</option>)}
                </select>
              </label>
              {modo === "temporada" ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#567b96]">Temporada</span>
                    <select value={temporada} onChange={(e) => setTemporada(e.target.value)} style={selectStyle} className="h-11 w-full rounded-[7px] border px-3 text-[12px] font-black outline-none">
                      {temporadas.map((season) => <option key={season} value={season} style={selectStyle}>{season}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#567b96]">Categoría</span>
                    <select value={division} onChange={(e) => setDivision(e.target.value)} style={selectStyle} className="h-11 w-full rounded-[7px] border px-3 text-[12px] font-black outline-none">
                      <option value="Primera" style={selectStyle}>Primera División</option>
                      <option value="Segunda" style={selectStyle}>Segunda División</option>
                    </select>
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {errorMsg ? (
        <div className="mx-auto max-w-[1680px] px-5 pt-4 sm:px-8 lg:px-10">
          <div className="rounded-[8px] border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[13px] font-bold text-[#934747]">{errorMsg}</div>
        </div>
      ) : null}

      <section className="mx-auto max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        {loading ? (
          <div className="rounded-[10px] border border-[#d7e9f3] bg-white px-5 py-16 text-center text-[13px] font-bold text-[#708da1]">Cargando rankings...</div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[355px_minmax(0,1fr)]">
            <div className="space-y-4">
              <section className="rounded-[12px] bg-[#07375d] p-5 text-white sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#7dc8ee]">Jugador destacado</p>
                <h2 className="mt-1 text-[25px] font-black uppercase leading-tight">Líder de la temporada</h2>

                {featured ? (
                  <>
                    <div className="mt-6 flex items-center gap-4">
                      <PlayerAvatar player={featured} size="lg" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-wide text-[#7dc8ee]">#1 Ranking general</p>
                        {featured.playerId ? (
                          <Link href={`/jugadores/${encodeURIComponent(featured.playerId)}`} className="mt-1 block truncate text-[24px] font-black hover:underline">{featured.nombre}</Link>
                        ) : (
                          <strong className="mt-1 block truncate text-[24px] font-black">{featured.nombre}</strong>
                        )}
                        <div className="mt-1 text-[12px] font-semibold text-white/70">
                          <TeamLink name={featured.equipo} slug={clubMap.get(normalizeText(featured.equipo))?.slug} className="text-white/70 hover:text-white">{featured.equipo}</TeamLink>
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-white/55">{featured.posicion}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-4 divide-x divide-white/15 rounded-[8px] border border-white/10 bg-white/[.04] py-3 text-center">
                      <div><strong className="block text-xl text-[#62c4ed]">{featured.goles}</strong><span className="text-[8px] font-bold uppercase text-white/55">Goles</span></div>
                      <div><strong className="block text-xl text-[#62c4ed]">{featured.asistencias}</strong><span className="text-[8px] font-bold uppercase text-white/55">Asist.</span></div>
                      <div><strong className="block text-xl text-[#62c4ed]">{featured.partidos}</strong><span className="text-[8px] font-bold uppercase text-white/55">PJ</span></div>
                      <div><strong className="block text-xl text-[#62c4ed]">{rating(featured)}</strong><span className="text-[8px] font-bold uppercase text-white/55">Prom.</span></div>
                    </div>

                    {featured.playerId ? (
                      <Link href={`/jugadores/${encodeURIComponent(featured.playerId)}`} className="mt-5 flex h-11 items-center justify-center rounded-[7px] bg-[#56afe2] text-[12px] font-black text-[#062f50] transition hover:bg-[#73c2ec]">Ver perfil del jugador →</Link>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-6 text-[13px] text-white/60">No hay jugadores disponibles para estos filtros.</p>
                )}
              </section>

              {featured ? (
                <section className="rounded-[10px] border border-[#d6e9f3] bg-white px-5 py-2">
                  {[
                    ["Posición en ranking", "#1"],
                    ["Puntos totales", featured.score.toLocaleString("es-AR")],
                    ["Club", featured.equipo],
                    ["Rol principal", featured.posicion],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-[#e3edf3] py-3 last:border-0">
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-[#7892a5]">{label}</span>
                      <strong className="mt-0.5 block truncate text-[14px] font-black text-[#102f55]">{value}</strong>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>

            <div className="min-w-0 space-y-4">
              <section className="overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white">
                <div className="grid grid-cols-3 border-b border-[#d8e9f2] sm:grid-cols-5">
                  {tabLabels.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex min-h-14 items-center justify-center gap-2 border-r border-[#e2edf3] px-2 text-[10px] font-black uppercase transition last:border-r-0 sm:text-[11px] ${activeTab === tab.key ? "bg-[#e9f7fd] text-[#136fa6]" : "bg-white text-[#355d7b] hover:bg-[#f6fbfe]"}`}
                    >
                      <MetricIcon type={tab.key} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-4 sm:px-5">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-[20px] font-black uppercase text-[#102f55] sm:text-[23px]">Ranking de jugadores</h2>
                      <p className="mt-1 text-[11px] font-semibold text-[#6b879b]">
                        {modo === "historico" ? "Archivo histórico APA" : `${temporada} · ${division} División`}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#7790a2]">{filteredPlayers.length} jugadores</span>
                  </div>

                  <div className="hidden overflow-hidden rounded-[7px] border border-[#dbe9f1] md:block">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-[#07375d] text-[9px] font-black uppercase tracking-wide text-white">
                        <tr>
                          <th className="px-3 py-2.5 text-center">#</th>
                          <th className="px-3 py-2.5">Jugador</th>
                          <th className="px-3 py-2.5">Club</th>
                          <th className="px-3 py-2.5 text-center">PJ</th>
                          <th className="px-3 py-2.5 text-center">G</th>
                          <th className="px-3 py-2.5 text-center">A</th>
                          <th className="px-3 py-2.5 text-center">MVP</th>
                          <th className="px-3 py-2.5 text-center">{activeTab === "rating" ? "Prom." : activeTab === "general" ? "Puntos" : "Valor"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRanking.map((player, index) => {
                          const club = clubMap.get(normalizeText(player.equipo));
                          return (
                            <tr key={`${player.playerId}-${player.nombre}`} className="border-t border-[#e1edf3] text-[11px] font-semibold text-[#173b62] even:bg-[#f7fbfd] hover:bg-[#eef8fd]">
                              <td className="px-3 py-2.5 text-center font-black">{index + 1}</td>
                              <td className="px-3 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <PlayerAvatar player={player} size="sm" />
                                  {player.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="truncate font-black hover:text-[#258fcf]">{player.nombre}</Link> : <strong className="truncate">{player.nombre}</strong>}
                                </div>
                              </td>
                              <td className="max-w-[180px] px-3 py-2"><TeamLink name={player.equipo} slug={club?.slug} className="block truncate text-[#315f89]">{player.equipo}</TeamLink></td>
                              <td className="px-3 py-2 text-center">{player.partidos}</td>
                              <td className="px-3 py-2 text-center">{player.goles}</td>
                              <td className="px-3 py-2 text-center">{player.asistencias}</td>
                              <td className="px-3 py-2 text-center">{player.mvps}</td>
                              <td className="px-3 py-2 text-center text-[13px] font-black text-[#102f55]">{metricValue(player, activeTab).toLocaleString("es-AR")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-[#e1edf3] rounded-[7px] border border-[#dbe9f1] md:hidden">
                    {activeRanking.map((player, index) => (
                      <div key={`${player.playerId}-${player.nombre}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 px-3 py-3">
                        <strong className="text-center text-[12px] text-[#51738c]">{index + 1}</strong>
                        <div className="flex min-w-0 items-center gap-2">
                          <PlayerAvatar player={player} size="sm" />
                          <div className="min-w-0">
                            {player.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="block truncate text-[13px] font-black">{player.nombre}</Link> : <strong className="block truncate text-[13px]">{player.nombre}</strong>}
                            <span className="block truncate text-[10px] font-semibold text-[#718b9e]">{player.equipo} · {player.partidos} PJ</span>
                          </div>
                        </div>
                        <strong className="text-[16px] font-black text-[#146f9f]">{metricValue(player, activeTab).toLocaleString("es-AR")}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  { title: "Máximos goleadores", tab: "goles" as const, players: topScorers, unit: "Goles" },
                  { title: "Máximas asistencias", tab: "asistencias" as const, players: topAssists, unit: "Asist." },
                ].map((panel) => (
                  <section key={panel.title} className="overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white">
                    <div className="flex items-center justify-between border-b border-[#dceaf2] px-4 py-3">
                      <div className="flex items-center gap-2 text-[#146f9f]"><MetricIcon type={panel.tab} /><h3 className="text-[13px] font-black uppercase text-[#102f55]">{panel.title}</h3></div>
                      <button type="button" onClick={() => setActiveTab(panel.tab)} className="text-[10px] font-black text-[#278ec7]">Ver todos →</button>
                    </div>
                    <div className="px-3 py-2">
                      {panel.players.map((player, index) => {
                        const club = clubMap.get(normalizeText(player.equipo));
                        return (
                          <div key={`${panel.tab}-${player.playerId}-${index}`} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 border-b border-[#e4edf2] py-2 last:border-0">
                            <strong className="text-center text-[11px] text-[#5c7c94]">{index + 1}</strong>
                            <div className="min-w-0">
                              {player.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="block truncate text-[11px] font-black text-[#102f55] hover:text-[#258fcf]">{player.nombre}</Link> : <strong className="block truncate text-[11px]">{player.nombre}</strong>}
                              <TeamLink name={player.equipo} slug={club?.slug} className="block truncate text-[9px] font-semibold text-[#7890a1]">{player.equipo}</TeamLink>
                            </div>
                            <div className="text-right"><strong className="block text-[15px] font-black text-[#146f9f]">{metricValue(player, panel.tab)}</strong><span className="text-[7px] font-bold uppercase text-[#8aa0b0]">{panel.unit}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
