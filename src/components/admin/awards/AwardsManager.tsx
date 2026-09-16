"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PermissionGuard from "@/components/PermissionGuard";
import GestorSteamRapido from "@/components/GestorSteamRapido";
import { supabase } from "@/lib/supabase";

type PremioKey = "balon_oro" | "the_best" | "raiko_trophy" | "bota_oro" | "golden_boy";

type StatRow = {
  partido_id: string | null;
  playerId: string | null;
  nombre: string | null;
  equipo: string | null;
  temporada: string | null;
  division: string | null;
  posicion: string | null;
  goals: number | null;
  assists: number | null;
  mvp: number | null;
  rating_apa: number | null;
  tackles: number | null;
  interceptions: number | null;
  gKSaves: number | null;
  gKCatches: number | null;
};

type MatchRow = {
  id: string | number;
  partido_id: string | null;
  temporada: string | null;
  division: string | null;
  competicion: string | null;
  fase: string | null;
};

type TitleRow = {
  equipo: string;
  competicion: string;
  temporada: string;
  division: string | null;
};

type SavedAward = {
  id: number;
  temporada: string;
  division: string | null;
  premio: string;
  playerid: string;
  nombre: string;
  equipo: string | null;
  puntos: number | null;
  posicion: number | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  playerid: string | null;
};

type Candidate = {
  playerid: string;
  nombre: string;
  equipo: string;
  divisionPrincipal: string;
  posicionPrincipal: string;
  partidos: number;
  goles: number;
  asistencias: number;
  mvps: number;
  ratingPromedio: number;
  atajadas: number;
  atrapadas: number;
  individualRaw: number;
  regularidadRaw: number;
  competenciaRaw: number;
  meritoRaw: number;
  golesPonderados: number;
  puntos: number;
  posicion: number;
  desglose: {
    individual: number;
    merito: number;
    competencia: number;
    regularidad: number;
  };
  steamId?: string | null;
  steamHours?: number | null;
  steamFound?: boolean;
};

const PREMIO_CONFIG: Record<PremioKey, { nombre: string; icono: string; descripcion: string }> = {
  balon_oro: {
    nombre: "Balón de Oro",
    icono: "🏆",
    descripcion: "Mejor temporada global: rendimiento, títulos, nivel competitivo y regularidad.",
  },
  the_best: {
    nombre: "The Best",
    icono: "🏅",
    descripcion: "Mejor jugador de Segunda División usando el mismo modelo equilibrado.",
  },
  raiko_trophy: {
    nombre: "Raiko Trophy",
    icono: "🧤",
    descripcion: "Mejor arquero. Atajadas y atrapadas importan, pero sin usar el score bruto de PSO.",
  },
  bota_oro: {
    nombre: "Bota de Oro",
    icono: "⚽",
    descripcion: "Máximo goleador oficial, ponderado por la importancia de la competición.",
  },
  golden_boy: {
    nombre: "Golden Boy",
    icono: "⭐",
    descripcion: "Mejor promesa elegible con menos de 1000 horas de PSO.",
  },
};

const DIVISIONES = ["Todas", "Primera", "Segunda"];

function normalizar(value?: string | null) {
  return String(value || "").toLowerCase().trim();
}

function pesoCompeticion(competicion?: string | null, division?: string | null, fase?: string | null) {
  const c = normalizar(competicion || "liga");
  const d = normalizar(division);
  const f = normalizar(fase);

  if (c === "copa_campeones") return 1.2;
  if (c === "copa_argentina") return 1;
  if (c === "copa_apa") return 0.8;
  if (c === "copa_clasificatoria") return 0.75;
  if (c.includes("playoff") || f.includes("playoff") || f.includes("promoc")) return 0.75;
  if (c === "liga" && d.includes("segunda")) return 0.8;
  return 1;
}

function puntosTitulo(titulo: TitleRow) {
  const c = normalizar(titulo.competicion);
  const d = normalizar(titulo.division);
  if (c === "copa_campeones") return 45;
  if (c === "liga" && d.includes("primera")) return 40;
  if (c === "liga" && d.includes("segunda")) return 26;
  if (c === "copa_argentina") return 32;
  if (c === "copa_apa") return 22;
  if (c.includes("playoff")) return 18;
  if (c === "copa_clasificatoria") return 12;
  return 12;
}

function puntosPremioAnterior(premio: string) {
  if (premio === "bota_oro") return 18;
  if (premio === "raiko_trophy") return 15;
  if (premio === "the_best") return 8;
  if (premio === "golden_boy") return 6;
  return 0;
}

function normalizarComponente(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export default function AwardsManager() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [temporadas, setTemporadas] = useState<string[]>(["Temporada 4"]);
  const [division, setDivision] = useState("Todas");
  const [premio, setPremio] = useState<PremioKey>("balon_oro");
  const [stats, setStats] = useState<StatRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [savedAwards, setSavedAwards] = useState<SavedAward[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [steamByPlayer, setSteamByPlayer] = useState<Record<string, string>>({});
  const [steamCache, setSteamCache] = useState<Record<string, { found: boolean; hours: number }>>({});
  const [loading, setLoading] = useState(true);
  const [checkingSteam, setCheckingSteam] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("temporadas")
      .select("nombre")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const values = Array.from(new Set((data || []).map((row: any) => String(row.nombre || "").trim()).filter(Boolean)));
        if (values.length) {
          setTemporadas(values);
          setTemporada(values[values.length - 1]);
        }
      });
  }, []);

  useEffect(() => {
    void loadData();
  }, [temporada]);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const [matchesRes, titlesRes, awardsRes, plantillasRes] = await Promise.all([
      supabase
        .from("partidos")
        .select("id,partido_id,temporada,division,competicion,fase")
        .eq("temporada", temporada),
      supabase
        .from("titulos")
        .select("equipo,competicion,temporada,division")
        .eq("temporada", temporada),
      supabase
        .from("premios_apa")
        .select("id,temporada,division,premio,playerid,nombre,equipo,puntos,posicion,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("plantillas").select("playerid,steam_id"),
    ]);

    if (matchesRes.error) {
      setMessage(`Error cargando partidos: ${matchesRes.error.message}`);
      setLoading(false);
      return;
    }

    const matchRows = (matchesRes.data || []) as MatchRow[];
    setMatches(matchRows);
    setTitles((titlesRes.data || []) as TitleRow[]);
    setSavedAwards((awardsRes.data || []) as SavedAward[]);

    const ids = matchRows.map((m) => String(m.partido_id || m.id)).filter(Boolean);
    let statRows: StatRow[] = [];
    if (ids.length) {
      const { data, error } = await supabase
        .from("estadisticas_jugadores")
        .select("partido_id,playerId,nombre,equipo,temporada,division,posicion,goals,assists,mvp,rating_apa,tackles,interceptions,gKSaves,gKCatches")
        .eq("temporada", temporada)
        .in("partido_id", ids);
      if (error) setMessage(`Error cargando estadísticas: ${error.message}`);
      statRows = (data || []) as StatRow[];
    }
    setStats(statRows);

    const playerIds = Array.from(new Set(statRows.map((s) => String(s.playerId || "").trim()).filter(Boolean)));
    if (playerIds.length) {
      const { data } = await supabase.from("profiles").select("id,playerid").in("playerid", playerIds);
      setProfiles((data || []) as ProfileRow[]);
    } else setProfiles([]);

    const steamMap: Record<string, string> = {};
    (plantillasRes.data || []).forEach((row: any) => {
      if (row.playerid && row.steam_id) steamMap[String(row.playerid)] = String(row.steam_id);
    });
    setSteamByPlayer(steamMap);
    setLoading(false);
  }

  const candidatesBase = useMemo(() => {
    const matchById: Record<string, MatchRow> = {};
    matches.forEach((m) => {
      matchById[String(m.partido_id || m.id)] = m;
    });

    const teamMerit: Record<string, number> = {};
    titles.forEach((title) => {
      const team = String(title.equipo || "").trim();
      if (!team) return;
      teamMerit[team] = (teamMerit[team] || 0) + puntosTitulo(title);
    });

    const personalMerit: Record<string, number> = {};
    savedAwards
      .filter((a) => a.temporada === temporada && a.premio !== "balon_oro")
      .forEach((a) => {
        personalMerit[a.playerid] = (personalMerit[a.playerid] || 0) + puntosPremioAnterior(a.premio);
      });

    const map: Record<string, any> = {};

    stats.forEach((s) => {
      const pid = String(s.playerId || "").trim();
      if (!pid) return;
      const match = matchById[String(s.partido_id || "")];
      if (!match) return;
      const officialDivision = String(match.division || s.division || "Sin división");
      if (division !== "Todas" && normalizar(officialDivision) !== normalizar(division)) return;

      const weight = pesoCompeticion(match.competicion, officialDivision, match.fase);
      const pos = String(s.posicion || "OUT").toUpperCase();
      const goals = Number(s.goals || 0);
      const assists = Number(s.assists || 0);
      const mvps = Number(s.mvp || 0);
      const rating = Number(s.rating_apa || 0);
      const saves = Number(s.gKSaves || 0);
      const catches = Number(s.gKCatches || 0);
      const tackles = Number(s.tackles || 0);
      const interceptions = Number(s.interceptions || 0);

      if (!map[pid]) {
        map[pid] = {
          playerid: pid,
          nombre: s.nombre || pid,
          equipo: s.equipo || "Sin club",
          partidos: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          atajadas: 0,
          atrapadas: 0,
          ratingTotal: 0,
          ratings: 0,
          individualRaw: 0,
          regularidadRaw: 0,
          competenciaTotal: 0,
          posiciones: {},
          divisiones: {},
          golesPonderados: 0,
        };
      }

      const row = map[pid];
      row.partidos += 1;
      row.goles += goals;
      row.asistencias += assists;
      row.mvps += mvps;
      row.atajadas += saves;
      row.atrapadas += catches;
      row.golesPonderados += goals * weight;
      row.competenciaTotal += weight;
      row.posiciones[pos] = (row.posiciones[pos] || 0) + 1;
      row.divisiones[officialDivision] = (row.divisiones[officialDivision] || 0) + 1;
      if (rating > 0) {
        row.ratingTotal += rating;
        row.ratings += 1;
      }

      const ratingContribution = Math.max(0, rating - 5) * 2.2;
      const gkContribution = pos === "GK" ? Math.min(12, saves * 1.25 + catches * 0.8) : 0;
      const fieldDefensiveContribution = pos !== "GK" ? Math.min(5, tackles * 0.25 + interceptions * 0.45) : 0;
      const attackingContribution = goals * 8 + assists * 5;
      const mvpContribution = mvps * 8;

      row.individualRaw += (attackingContribution + mvpContribution + ratingContribution + gkContribution + fieldDefensiveContribution) * weight;
      row.regularidadRaw += (ratingContribution + Math.min(8, mvps * 4)) * weight;
      row.nombre = s.nombre || row.nombre;
      row.equipo = s.equipo || row.equipo;
    });

    return Object.values(map).map((row: any) => {
      const posicionPrincipal = Object.entries(row.posiciones).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]?.[0] || "OUT";
      const divisionPrincipal = Object.entries(row.divisiones).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Sin división";
      return {
        playerid: row.playerid,
        nombre: row.nombre,
        equipo: row.equipo,
        divisionPrincipal,
        posicionPrincipal,
        partidos: row.partidos,
        goles: row.goles,
        asistencias: row.asistencias,
        mvps: row.mvps,
        ratingPromedio: row.ratings ? Math.round((row.ratingTotal / row.ratings) * 100) / 100 : 0,
        atajadas: row.atajadas,
        atrapadas: row.atrapadas,
        individualRaw: row.individualRaw,
        regularidadRaw: row.partidos ? row.regularidadRaw / row.partidos : 0,
        competenciaRaw: row.partidos ? row.competenciaTotal / row.partidos : 0,
        meritoRaw: (teamMerit[row.equipo] || 0) + (personalMerit[row.playerid] || 0),
        golesPonderados: row.golesPonderados,
      };
    });
  }, [matches, stats, titles, savedAwards, temporada, division]);

  const candidates = useMemo(() => {
    let base = candidatesBase;
    if (premio === "the_best") base = base.filter((c) => normalizar(c.divisionPrincipal).includes("segunda"));
    if (premio === "raiko_trophy") base = base.filter((c) => c.posicionPrincipal === "GK");

    const maxIndividual = Math.max(1, ...base.map((c) => c.individualRaw));
    const maxMerit = Math.max(1, ...base.map((c) => c.meritoRaw));
    const maxCompetition = Math.max(1, ...base.map((c) => c.competenciaRaw));
    const maxRegularity = Math.max(1, ...base.map((c) => c.regularidadRaw));

    let rows: Candidate[] = base.map((c) => {
      const individual = normalizarComponente(c.individualRaw, maxIndividual);
      const merito = normalizarComponente(c.meritoRaw, maxMerit);
      const competencia = normalizarComponente(c.competenciaRaw, maxCompetition);
      const regularidad = normalizarComponente(c.regularidadRaw, maxRegularity);

      let puntos = individual * 0.55 + merito * 0.25 + competencia * 0.1 + regularidad * 0.1;
      if (premio === "bota_oro") puntos = c.golesPonderados * 1000 + c.asistencias * 10 + c.mvps;
      if (premio === "raiko_trophy") {
        const gkRaw = c.atajadas * 2 + c.atrapadas * 1.2 + c.mvps * 8 + c.ratingPromedio * 4 + c.meritoRaw * 0.35;
        puntos = gkRaw;
      }

      const steamId = steamByPlayer[c.playerid] || null;
      const steam = steamId ? steamCache[steamId] : undefined;
      return {
        ...c,
        puntos: Math.round(puntos * 10) / 10,
        posicion: 0,
        desglose: {
          individual: Math.round(individual),
          merito: Math.round(merito),
          competencia: Math.round(competencia),
          regularidad: Math.round(regularidad),
        },
        steamId,
        steamHours: steam?.hours,
        steamFound: steam?.found,
      };
    });

    if (premio === "golden_boy") rows = rows.filter((c) => c.steamFound && Number(c.steamHours || 0) > 0 && Number(c.steamHours || 0) < 1000);

    return rows
      .sort((a, b) => {
        if (premio === "bota_oro") return b.golesPonderados - a.golesPonderados || b.asistencias - a.asistencias;
        return b.puntos - a.puntos;
      })
      .map((c, index) => ({ ...c, posicion: index + 1 }));
  }, [candidatesBase, premio, steamByPlayer, steamCache]);

  async function checkSteamHours() {
    setCheckingSteam(true);
    const next = { ...steamCache };
    for (const steamId of Array.from(new Set(Object.values(steamByPlayer)))) {
      if (!steamId || next[steamId]) continue;
      try {
        const response = await fetch(`/api/steam/hours?steamId=${encodeURIComponent(steamId)}`, { cache: "no-store" });
        const data = await response.json();
        next[steamId] = { found: !!data.found, hours: Number(data.hours || 0) };
      } catch {
        next[steamId] = { found: false, hours: 0 };
      }
    }
    setSteamCache(next);
    setCheckingSteam(false);
  }

  async function assignWinner(candidate: Candidate) {
    if (!window.confirm(`¿Asignar ${PREMIO_CONFIG[premio].nombre} a ${candidate.nombre}?`)) return;
    setSavingId(candidate.playerid);
    const { error } = await supabase.from("premios_apa").insert({
      temporada,
      division: division === "Todas" ? candidate.divisionPrincipal : division,
      premio,
      playerid: candidate.playerid,
      nombre: candidate.nombre,
      equipo: candidate.equipo,
      puntos: candidate.puntos,
      posicion: candidate.posicion,
    });
    if (error) {
      setMessage(`Error guardando premio: ${error.message}`);
      setSavingId(null);
      return;
    }

    const profile = profiles.find((p) => p.playerid === candidate.playerid);
    if (profile?.id) {
      await supabase.from("notificaciones").insert({
        user_id: profile.id,
        tipo: "award",
        titulo: "Premio recibido",
        mensaje: `Ganaste ${PREMIO_CONFIG[premio].nombre} - ${temporada}.`,
        href: "/perfil",
        leida: false,
      });
    }
    setMessage("Premio asignado correctamente.");
    setSavingId(null);
    await loadData();
  }

  async function deleteAward(id: number) {
    if (!window.confirm("¿Borrar este premio?")) return;
    const { error } = await supabase.from("premios_apa").delete().eq("id", id);
    if (error) setMessage(`Error borrando premio: ${error.message}`);
    else await loadData();
  }

  const config = PREMIO_CONFIG[premio];

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen bg-[#f5f6f8] text-[#0b2747]">
        <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-7 md:px-8">
          <Link href="/admin/historia" className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">← Volver a historia</Link>

          <section className="rounded-[24px] bg-gradient-to-br from-[#0b2747] via-[#123f69] to-[#245f8e] p-6 text-white md:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Premios APA</p>
            <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Ranking de premios</h1>
            <p className="mt-3 max-w-3xl text-sm text-white/80">El Balón de Oro ya no usa el score bruto de PSO. El ranking separa rendimiento, mérito colectivo/premios, nivel competitivo y regularidad.</p>
          </section>

          <section className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Configuración</p>
                <h2 className="mt-2 text-xl font-black uppercase">Seleccionar premio</h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">Temporada
                    <select value={temporada} onChange={(e) => setTemporada(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">
                      {temporadas.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">División
                    <select value={division} onChange={(e) => setDivision(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">
                      {DIVISIONES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </label>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">Premio
                    <select value={premio} onChange={(e) => setPremio(e.target.value as PremioKey)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">
                      {Object.entries(PREMIO_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.icono} {value.nombre}</option>)}
                    </select>
                  </label>
                  <div className="rounded-xl bg-[#f3f4f6] p-4">
                    <div className="text-3xl">{config.icono}</div>
                    <p className="mt-2 font-black uppercase">{config.nombre}</p>
                    <p className="mt-1 text-xs leading-5 text-[#245f8e]">{config.descripcion}</p>
                  </div>
                  {premio === "golden_boy" ? (
                    <button onClick={checkSteamHours} disabled={checkingSteam} className="w-full rounded-xl bg-[#173f73] px-4 py-3 text-xs font-black uppercase text-white disabled:opacity-50">{checkingSteam ? "Consultando..." : "Consultar horas Steam"}</button>
                  ) : null}
                  <button onClick={() => void loadData()} className="w-full rounded-xl border border-[#cbd9e3] px-4 py-3 text-xs font-black uppercase">Actualizar datos</button>
                </div>
              </section>

              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Modelo Balón de Oro</p>
                <div className="mt-3 space-y-2 text-xs font-bold">
                  <p>55% rendimiento individual</p>
                  <p>25% títulos + premios</p>
                  <p>10% nivel de competición</p>
                  <p>10% regularidad</p>
                  <p className="pt-2 text-[#245f8e]">Score bruto de PSO: 0%</p>
                </div>
              </section>

              <GestorSteamRapido />
            </aside>

            <section className="space-y-4">
              {message ? <div className="rounded-xl border border-[#cbd9e3] bg-white px-4 py-3 text-sm font-bold">{message}</div> : null}
              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <div className="flex items-end justify-between gap-4">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Ranking automático</p><h2 className="mt-1 text-2xl font-black uppercase">{config.icono} Candidatos</h2></div>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-black">{candidates.length}</span>
                </div>

                <div className="mt-5 space-y-3">
                  {loading ? <p className="text-sm text-[#245f8e]">Calculando...</p> : candidates.length === 0 ? <p className="text-sm text-[#245f8e]">No hay candidatos con estos filtros.</p> : candidates.slice(0, 15).map((c) => (
                    <article key={c.playerid} className="rounded-2xl border border-[#d8e2ec] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#123f69] text-lg font-black text-white">{c.posicion}</div>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-black uppercase">{c.nombre}</p>
                            <p className="text-xs font-bold text-[#245f8e]">{c.equipo} · {c.divisionPrincipal} · {c.posicionPrincipal} · {c.partidos} PJ</p>
                            <p className="mt-1 text-xs text-[#245f8e]">{c.goles} G · {c.asistencias} A · {c.mvps} MVP · RT {c.ratingPromedio}{c.posicionPrincipal === "GK" ? ` · ${c.atajadas} ataj.` : ""}</p>
                          </div>
                        </div>

                        {premio === "balon_oro" || premio === "the_best" || premio === "golden_boy" ? (
                          <div className="grid grid-cols-4 gap-2 xl:w-[430px]">
                            {[["IND", c.desglose.individual], ["MÉR", c.desglose.merito], ["COMP", c.desglose.competencia], ["REG", c.desglose.regularidad]].map(([label, value]) => (
                              <div key={String(label)} className="rounded-xl bg-[#f3f4f6] p-2 text-center"><p className="text-[9px] font-black text-[#245f8e]">{label}</p><p className="mt-1 font-black">{value}</p></div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#e5e7eb] pt-3">
                        <p className="text-sm font-black">{c.puntos.toFixed(1)} pts</p>
                        <button onClick={() => void assignWinner(c)} disabled={savingId === c.playerid} className="rounded-xl bg-[#173f73] px-4 py-2 text-[10px] font-black uppercase text-white disabled:opacity-50">{savingId === c.playerid ? "Guardando..." : "Asignar ganador"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Historial</p>
                <h2 className="mt-1 text-xl font-black uppercase">Premios asignados</h2>
                <div className="mt-4 space-y-2">
                  {savedAwards.length === 0 ? <p className="text-sm text-[#245f8e]">Todavía no hay premios cargados.</p> : savedAwards.slice(0, 20).map((award) => (
                    <div key={award.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f3f4f6] px-3 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-black uppercase">{PREMIO_CONFIG[award.premio as PremioKey]?.icono || "🏆"} {award.nombre}</p><p className="text-[11px] text-[#245f8e]">{PREMIO_CONFIG[award.premio as PremioKey]?.nombre || award.premio} · {award.temporada} · {award.equipo || "Sin club"}</p></div>
                      <button onClick={() => void deleteAward(award.id)} className="rounded-lg border border-red-300 px-3 py-2 text-[10px] font-black uppercase text-red-700">Borrar</button>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
