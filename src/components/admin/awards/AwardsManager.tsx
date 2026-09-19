"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import GestorSteamRapido from "@/components/GestorSteamRapido";
import { supabase } from "@/lib/supabase";
import { fetchSeasonRecords } from "@/lib/adminTournaments";

type PremioKey = "balon_oro" | "the_best" | "raiko_trophy" | "bota_oro" | "golden_boy";
type MatchRow = {
  id: string | number;
  partido_id?: string | null;
  temporada?: string | null;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  local?: string | null;
  visitante?: string | null;
  resultado?: string | null;
};
type StatRow = {
  partido_id?: string | null;
  nombre?: string | null;
  playerId?: string | null;
  playerid?: string | null;
  equipo?: string | null;
  temporada?: string | null;
  division?: string | null;
  posicion?: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  rating_apa?: number | null;
  score?: number | null;
  tackles?: number | null;
  interceptions?: number | null;
  gKSaves?: number | null;
  gKCatches?: number | null;
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
};
type TitleRow = { temporada: string; competicion: string; equipo: string; division: string | null };
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
  golesRecibidos: number;
  tirosRecibidos: number;
  vallasInvictas: number;
  savePct: number;
  golesEvitados: number;
  desglose: { individual: number; merito: number; competencia: number; regularidad: number };
  raikoDesglose: { eficiencia: number; solidez: number; importantes: number; regularidad: number; reconocimiento: number };
};

const DIVISIONES = ["Todas", "Primera", "Segunda"];
const PREMIO_CONFIG: Record<PremioKey, { nombre: string; icono: string; descripcion: string }> = {
  balon_oro: { nombre: "Balón de Oro", icono: "🏆", descripcion: "Mejor temporada completa: rendimiento individual, títulos/premios, nivel competitivo y regularidad." },
  the_best: { nombre: "The Best", icono: "🏅", descripcion: "Mejor jugador de Segunda División con el mismo modelo equilibrado del Balón de Oro." },
  raiko_trophy: { nombre: "Raiko Trophy", icono: "🧤", descripcion: "Mejor arquero por eficiencia y solidez. Las atajadas brutas ya no dan ventaja por recibir más tiros." },
  bota_oro: { nombre: "Bota de Oro", icono: "⚽", descripcion: "Máximo goleador oficial, ponderado por importancia de la competición." },
  golden_boy: { nombre: "Golden Boy", icono: "⭐", descripcion: "Mejor jugador elegible con menos de 1000 horas de PSO." },
};

function norm(value?: string | null) { return String(value || "").trim().toLowerCase(); }
function clamp(value: number, min = 0, max = 100) { return Math.min(max, Math.max(min, value)); }
function playerId(row: StatRow) { return String(row.playerId || row.playerid || "").trim(); }
function gkSaves(row: StatRow) { return Number(row.gKSaves || 0); }
function gkCatches(row: StatRow) { return Number(row.gKCatches || 0); }
function competitionWeight(comp?: string | null, division?: string | null, fase?: string | null) {
  const c = norm(comp || "liga");
  const d = norm(division);
  const f = norm(fase);
  if (c === "copa_campeones") return 1.2;
  if (c.includes("playoff") || f.includes("playoff") || f.includes("promoc")) return 0.75;
  if (c === "liga") return d.includes("primera") ? 1 : d.includes("segunda") ? 0.8 : 0.9;
  if (c === "copa_argentina") return 1;
  if (c === "copa_apa") return 0.8;
  if (c === "copa_clasificatoria") return 0.7;
  return 0.9;
}
function individualPerMatch(row: StatRow) {
  const pos = String(row.posicion || "").toUpperCase();
  const rating = Math.max(0, Number(row.rating_apa || 0) - 5);
  const common = Number(row.goals || 0) * 8 + Number(row.assists || 0) * 5 + Number(row.mvp || 0) * 8 + rating * 3;
  if (pos === "GK") return common + Math.min(gkSaves(row), 6) * 0.5 + Math.min(gkCatches(row), 4) * 0.3;
  return common + Math.min(Number(row.tackles || 0) + Number(row.interceptions || 0), 16) * 0.18;
}
function resultGoals(result?: string | null) {
  const parts = String(result || "").split("-").map((n) => Number(n.trim()));
  return parts.length === 2 && parts.every(Number.isFinite) ? { local: parts[0], visitante: parts[1] } : null;
}
function goalsConceded(match: MatchRow, team?: string | null) {
  const score = resultGoals(match.resultado);
  if (!score || !team) return null;
  if (norm(match.local) === norm(team)) return score.visitante;
  if (norm(match.visitante) === norm(team)) return score.local;
  return null;
}
function inferLeagueChampions(matches: MatchRow[]) {
  const tables = new Map<string, Map<string, { pts: number; gd: number; gf: number }>>();
  matches.filter((m) => norm(m.competicion || "liga") === "liga").forEach((m) => {
    const score = resultGoals(m.resultado); if (!score || !m.local || !m.visitante) return;
    const key = String(m.division || "Sin división"); if (!tables.has(key)) tables.set(key, new Map());
    const table = tables.get(key)!;
    const ensure = (team: string) => { if (!table.has(team)) table.set(team, { pts: 0, gd: 0, gf: 0 }); return table.get(team)!; };
    const local = ensure(m.local); const away = ensure(m.visitante);
    local.gf += score.local; away.gf += score.visitante; local.gd += score.local - score.visitante; away.gd += score.visitante - score.local;
    if (score.local > score.visitante) local.pts += 3; else if (score.visitante > score.local) away.pts += 3; else { local.pts += 1; away.pts += 1; }
  });
  const champions: TitleRow[] = [];
  tables.forEach((table, division) => {
    const top = [...table.entries()].sort((a, b) => b[1].pts - a[1].pts || b[1].gd - a[1].gd || b[1].gf - a[1].gf)[0];
    if (top) champions.push({ temporada: "", competicion: "liga", equipo: top[0], division });
  });
  return champions;
}
function titleMerit(title: TitleRow) {
  const c = norm(title.competicion); const d = norm(title.division);
  if (c === "copa_campeones") return 32;
  if (c === "liga" && d.includes("primera")) return 30;
  if (c === "copa_argentina") return 24;
  if (c === "liga" && d.includes("segunda")) return 18;
  if (c === "copa_apa") return 16;
  if (c.includes("playoff")) return 10;
  return 12;
}
function awardMerit(key: string) {
  if (key === "bota_oro") return 18;
  if (key === "raiko_trophy") return 15;
  if (key === "the_best") return 12;
  if (key === "golden_boy") return 8;
  return 0;
}
function normalizeMetric(value: number, max: number) { return max > 0 ? Math.min(100, (value / max) * 100) : 0; }

export default function AwardsManager() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Todas");
  const [premio, setPremio] = useState<PremioKey>("balon_oro");
  const [temporadas, setTemporadas] = useState<string[]>(["Temporada 4"]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [savedAwards, setSavedAwards] = useState<SavedAward[]>([]);
  const [steamByPlayer, setSteamByPlayer] = useState<Record<string, string>>({});
  const [steamCache, setSteamCache] = useState<Record<string, { found: boolean; hours: number }>>({});
  const [profiles, setProfiles] = useState<Array<{ id: string; playerid: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [checkingSteam, setCheckingSteam] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSeasonRecords()
      .then((rows) => {
        const values = rows.map((row) => row.nombre);
        if (!values.length) return;
        setTemporadas(values);
        setTemporada(rows.find((row) => row.activa)?.nombre || values[0]);
      })
      .catch(() => undefined);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true); setMessage("");
    const [matchesRes, awardsRes, titlesRes, squadsRes] = await Promise.all([
      supabase.from("partidos").select("id,partido_id,temporada,division,competicion,fase,local,visitante,resultado").eq("temporada", temporada),
      supabase.from("premios_apa").select("id,temporada,division,premio,playerid,nombre,equipo,puntos,posicion").order("id", { ascending: false }),
      supabase.from("titulos").select("temporada,competicion,equipo,division").eq("temporada", temporada),
      supabase.from("plantillas").select("playerid,steam_id"),
    ]);
    const seasonMatches = (matchesRes.data || []) as MatchRow[];
    const ids = seasonMatches.map((m) => String(m.partido_id || m.id)).filter(Boolean);
    const statsRes = ids.length ? await supabase.from("estadisticas_jugadores").select("partido_id,nombre,playerId,equipo,temporada,division,posicion,goals,assists,mvp,rating_apa,score,tackles,interceptions,gKSaves,gKCatches").eq("temporada", temporada).in("partido_id", ids) : { data: [], error: null } as any;
    const pids = [...new Set(((statsRes.data || []) as StatRow[]).map(playerId).filter(Boolean))];
    const profilesRes = pids.length ? await supabase.from("profiles").select("id,playerid").in("playerid", pids) : { data: [], error: null } as any;
    if (matchesRes.error || statsRes.error) setMessage("No se pudieron cargar todos los datos del ranking.");
    setMatches(seasonMatches); setStats((statsRes.data || []) as StatRow[]); setSavedAwards((awardsRes.data || []) as SavedAward[]);
    const dbTitles = (titlesRes.data || []) as TitleRow[];
    const inferred = inferLeagueChampions(seasonMatches).map((t) => ({ ...t, temporada }));
    const titleKeys = new Set(dbTitles.map((t) => `${norm(t.competicion)}|${norm(t.division)}|${norm(t.equipo)}`));
    setTitles([...dbTitles, ...inferred.filter((t) => !titleKeys.has(`${norm(t.competicion)}|${norm(t.division)}|${norm(t.equipo)}`))]);
    const steamMap: Record<string, string> = {}; (squadsRes.data || []).forEach((r: any) => { if (r.playerid && r.steam_id) steamMap[String(r.playerid)] = String(r.steam_id); }); setSteamByPlayer(steamMap);
    setProfiles((profilesRes.data || []) as Array<{ id: string; playerid: string | null }>); setLoading(false);
  }, [temporada]);

  useEffect(() => { void loadData(); }, [loadData]);

  const candidatesBase = useMemo(() => {
    const matchById = new Map(matches.map((m) => [String(m.partido_id || m.id), m]));
    const map = new Map<string, any>();
    stats.forEach((row) => {
      const match = matchById.get(String(row.partido_id || "")); if (!match) return;
      const officialDivision = String(match.division || row.division || ""); if (division !== "Todas" && norm(officialDivision) !== norm(division)) return;
      const id = playerId(row); if (!id) return;
      const weight = competitionWeight(match.competicion, officialDivision, match.fase);
      if (!map.has(id)) map.set(id, {
        playerid: id, nombre: row.nombre || "Jugador APA", equipo: row.equipo || "Sin club", divisiones: {}, posiciones: {}, partidos: 0,
        goles: 0, asistencias: 0, mvps: 0, ratingTotal: 0, ratings: 0, atajadas: 0, atrapadas: 0, individualRaw: 0,
        competenciaRaw: 0, golesPonderados: 0, golesRecibidos: 0, tirosRecibidos: 0, vallasInvictas: 0, gkPartidos: 0,
        gkPesoCompetitivoTotal: 0,
      });
      const c = map.get(id);
      c.partidos += 1; c.goles += Number(row.goals || 0); c.asistencias += Number(row.assists || 0); c.mvps += Number(row.mvp || 0);
      c.atajadas += gkSaves(row); c.atrapadas += gkCatches(row); c.individualRaw += individualPerMatch(row) * weight;
      c.competenciaRaw += weight; c.golesPonderados += Number(row.goals || 0) * weight;
      if (String(row.posicion || "").toUpperCase() === "GK") {
        const conceded = goalsConceded(match, row.equipo);
        if (conceded !== null) {
          const saves = gkSaves(row);
          c.gkPartidos += 1;
          c.golesRecibidos += conceded;
          c.tirosRecibidos += saves + conceded;
          c.vallasInvictas += conceded === 0 ? 1 : 0;
          c.gkPesoCompetitivoTotal += weight;
        }
      }
      if (Number(row.rating_apa || 0) > 0) { c.ratingTotal += Number(row.rating_apa); c.ratings += 1; }
      c.divisiones[officialDivision] = (c.divisiones[officialDivision] || 0) + 1;
      const pos = String(row.posicion || "OUT").toUpperCase(); c.posiciones[pos] = (c.posiciones[pos] || 0) + 1;
      c.nombre = row.nombre || c.nombre; c.equipo = row.equipo || c.equipo;
    });
    return [...map.values()].map((c) => {
      const divisionPrincipal = Object.entries(c.divisiones).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Sin división";
      const posicionPrincipal = Object.entries(c.posiciones).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "OUT";
      const ratingPromedio = c.ratings ? c.ratingTotal / c.ratings : 0;
      const titlesForTeam = titles.filter((t) => norm(t.equipo) === norm(c.equipo));
      const awardsForPlayer = savedAwards.filter((a) => a.temporada === temporada && a.playerid === c.playerid && a.premio !== "balon_oro");
      const meritoRaw = titlesForTeam.reduce((sum, t) => sum + titleMerit(t), 0) + awardsForPlayer.reduce((sum, a) => sum + awardMerit(a.premio), 0);
      const competenciaRaw = c.partidos ? c.competenciaRaw / c.partidos : 0;
      const regularidadRaw = Math.min(1, c.partidos / 10) * 0.55 + Math.min(1, Math.max(0, ratingPromedio - 5) / 4) * 0.45;
      return {
        ...c,
        divisionPrincipal,
        posicionPrincipal,
        ratingPromedio: Math.round(ratingPromedio * 100) / 100,
        meritoRaw,
        competenciaRaw,
        regularidadRaw,
        savePct: c.tirosRecibidos > 0 ? c.atajadas / c.tirosRecibidos : 0,
        golesEvitados: 0,
      };
    });
  }, [stats, matches, division, titles, savedAwards, temporada]);

  const candidates = useMemo(() => {
    const pool = candidatesBase.filter((c) => premio !== "the_best" || norm(c.divisionPrincipal).includes("segunda"));
    const maxIndividual = Math.max(0, ...pool.map((c) => c.individualRaw));
    const maxMerit = Math.max(0, ...pool.map((c) => c.meritoRaw));

    const gkPool = pool.filter((c) => c.posicionPrincipal === "GK" && c.gkPartidos > 0);
    const totalGkSaves = gkPool.reduce((sum, c) => sum + c.atajadas, 0);
    const totalGkShots = gkPool.reduce((sum, c) => sum + c.tirosRecibidos, 0);
    const leagueSavePct = totalGkShots > 0 ? totalGkSaves / totalGkShots : 0;
    const maxGkMatches = Math.max(0, ...gkPool.map((c) => c.gkPartidos));
    const minGkMatches = Math.max(1, Math.ceil(maxGkMatches * 0.4));

    const enriched = pool.map((c) => {
      const individual = normalizeMetric(c.individualRaw, maxIndividual);
      const merito = normalizeMetric(c.meritoRaw, maxMerit);
      const competencia = Math.min(100, (c.competenciaRaw / 1.2) * 100);
      const regularidad = Math.min(100, c.regularidadRaw * 100);
      let puntos = individual * 0.55 + merito * 0.25 + competencia * 0.1 + regularidad * 0.1;

      const expectedGoals = c.tirosRecibidos * (1 - leagueSavePct);
      const golesEvitados = expectedGoals - c.golesRecibidos;
      const golesEvitadosPorPartido = c.gkPartidos > 0 ? golesEvitados / c.gkPartidos : 0;
      const saveScore = clamp(c.savePct * 100);
      const preventedScore = clamp(50 + golesEvitadosPorPartido * 25);
      const eficiencia = Math.round(saveScore * 0.7 + preventedScore * 0.3);

      const gcPorPartido = c.gkPartidos > 0 ? c.golesRecibidos / c.gkPartidos : 99;
      const gcScore = clamp(100 - gcPorPartido * 35);
      const cleanSheetRate = c.gkPartidos > 0 ? (c.vallasInvictas / c.gkPartidos) * 100 : 0;
      const solidez = Math.round(gcScore * 0.65 + cleanSheetRate * 0.35);

      const importantes = Math.round(clamp(((c.gkPesoCompetitivoTotal / Math.max(1, c.gkPartidos)) / 1.2) * 100));
      const volumeConfidence = clamp((c.gkPartidos / Math.max(1, maxGkMatches)) * 100);
      const shotConfidence = clamp((c.tirosRecibidos / 25) * 100);
      const raikoRegularidad = Math.round(volumeConfidence * 0.65 + shotConfidence * 0.35);
      const ratingScore = clamp(((c.ratingPromedio - 5) / 4) * 100);
      const mvpRate = c.gkPartidos > 0 ? c.mvps / c.gkPartidos : 0;
      const mvpScore = clamp((mvpRate / 0.35) * 100);
      const reconocimiento = Math.round(ratingScore * 0.7 + mvpScore * 0.3);

      if (premio === "bota_oro") puntos = c.golesPonderados * 10000 + c.asistencias * 10 + c.mvps;
      if (premio === "raiko_trophy") puntos = eficiencia * 0.4 + solidez * 0.2 + importantes * 0.15 + raikoRegularidad * 0.15 + reconocimiento * 0.1;

      return {
        ...c,
        golesEvitados: Math.round(golesEvitados * 100) / 100,
        puntos: Math.round(puntos * 10) / 10,
        desglose: { individual: Math.round(individual), merito: Math.round(merito), competencia: Math.round(competencia), regularidad: Math.round(regularidad) },
        raikoDesglose: { eficiencia, solidez, importantes, regularidad: raikoRegularidad, reconocimiento },
      } as Candidate;
    }).filter((c) => premio !== "raiko_trophy" || (c.posicionPrincipal === "GK" && c.gkPartidos >= minGkMatches && c.tirosRecibidos > 0));

    let eligible = enriched;
    if (premio === "golden_boy") eligible = enriched.filter((c) => {
      const steam = steamByPlayer[c.playerid]; const info = steam ? steamCache[steam] : null;
      return !!steam && !!info?.found && info.hours > 0 && info.hours < 1000;
    });
    return eligible.sort((a, b) => b.puntos - a.puntos).map((c, i) => ({ ...c, posicion: i + 1 }));
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
    setSteamCache(next); setCheckingSteam(false);
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
    if (error) { setMessage(`Error guardando premio: ${error.message}`); setSavingId(null); return; }
    const profile = profiles.find((p) => p.playerid === candidate.playerid);
    if (profile?.id) {
      await supabase.from("notificaciones").insert({ user_id: profile.id, tipo: "award", titulo: "Premio recibido", mensaje: `Ganaste ${PREMIO_CONFIG[premio].nombre} - ${temporada}.`, href: "/perfil", leida: false });
    }
    setMessage("Premio asignado correctamente."); setSavingId(null); await loadData();
  }

  async function deleteAward(id: number) {
    if (!window.confirm("¿Borrar este premio?")) return;
    const { error } = await supabase.from("premios_apa").delete().eq("id", id);
    if (error) setMessage(`Error borrando premio: ${error.message}`); else await loadData();
  }

  const config = PREMIO_CONFIG[premio];

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen bg-[#f5f6f8] text-[#0b2747]">
        <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-7 md:px-8">
          <Link href="/admin/historia" className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">← Volver a historia</Link>
          <section className="rounded-[24px] bg-gradient-to-br from-[#0b2747] via-[#123f69] to-[#245f8e] p-6 !text-white md:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] !text-white/70">Premios APA</p>
            <h1 className="mt-2 text-3xl font-black uppercase !text-white md:text-5xl">Ranking de premios</h1>
            <p className="mt-3 max-w-3xl text-sm !text-white/80">El Balón de Oro no usa score bruto. El Raiko Trophy mide eficiencia real: no premia simplemente al arquero que más tiros recibe.</p>
          </section>

          <section className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Configuración</p>
                <h2 className="mt-2 text-xl font-black uppercase">Seleccionar premio</h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">Temporada
                    <select value={temporada} onChange={(e) => setTemporada(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">{temporadas.map((t) => <option key={t}>{t}</option>)}</select>
                  </label>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">División
                    <select value={division} onChange={(e) => setDivision(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">{DIVISIONES.map((d) => <option key={d}>{d}</option>)}</select>
                  </label>
                  <label className="block text-[10px] font-black uppercase tracking-[0.12em]">Premio
                    <select value={premio} onChange={(e) => setPremio(e.target.value as PremioKey)} className="mt-2 w-full rounded-xl border border-[#d8e2ec] bg-white px-3 py-3 text-[#0b2747]">{Object.entries(PREMIO_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.icono} {value.nombre}</option>)}</select>
                  </label>
                  <div className="rounded-xl bg-[#f3f4f6] p-4"><div className="text-3xl">{config.icono}</div><p className="mt-2 font-black uppercase">{config.nombre}</p><p className="mt-1 text-xs leading-5 text-[#245f8e]">{config.descripcion}</p></div>
                  {premio === "golden_boy" ? <button onClick={checkSteamHours} disabled={checkingSteam} className="w-full rounded-xl bg-[#173f73] px-4 py-3 text-xs font-black uppercase !text-white disabled:opacity-50">{checkingSteam ? "Consultando..." : "Consultar horas Steam"}</button> : null}
                  <button onClick={() => void loadData()} className="w-full rounded-xl border border-[#cbd9e3] px-4 py-3 text-xs font-black uppercase">Actualizar datos</button>
                </div>
              </section>

              {premio === "raiko_trophy" ? (
                <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Modelo Raiko Trophy</p>
                  <div className="mt-3 space-y-2 text-xs font-bold">
                    <p>40% eficiencia de atajadas</p><p>20% solidez / goles recibidos</p><p>15% partidos importantes</p><p>15% regularidad y muestra</p><p>10% rating + MVP</p>
                    <p className="pt-2 text-[#245f8e]">Atajadas brutas: no suman puntos lineales.</p>
                  </div>
                </section>
              ) : (
                <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Modelo Balón de Oro</p>
                  <div className="mt-3 space-y-2 text-xs font-bold"><p>55% rendimiento individual</p><p>25% títulos + premios</p><p>10% nivel de competición</p><p>10% regularidad</p><p className="pt-2 text-[#245f8e]">Score bruto de PSO: 0%</p></div>
                </section>
              )}
              <GestorSteamRapido />
            </aside>

            <section className="space-y-4">
              {message ? <div className="rounded-xl border border-[#cbd9e3] bg-white px-4 py-3 text-sm font-bold">{message}</div> : null}
              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Ranking automático</p><h2 className="mt-1 text-2xl font-black uppercase">{config.icono} Candidatos</h2></div><span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-black">{candidates.length}</span></div>
                <div className="mt-5 space-y-3">
                  {loading ? <p className="text-sm text-[#245f8e]">Calculando...</p> : candidates.length === 0 ? <p className="text-sm text-[#245f8e]">No hay candidatos con estos filtros.</p> : candidates.slice(0, 15).map((c) => (
                    <article key={c.playerid} className="rounded-2xl border border-[#d8e2ec] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#123f69] text-lg font-black !text-white">{c.posicion}</div><div className="min-w-0"><p className="truncate text-lg font-black uppercase">{c.nombre}</p><p className="text-xs font-bold text-[#245f8e]">{c.equipo} · {c.divisionPrincipal} · {c.posicionPrincipal} · {c.partidos} PJ</p><p className="mt-1 text-xs text-[#245f8e]">{premio === "raiko_trophy" ? `${(c.savePct * 100).toFixed(1)}% ataj. · ${c.atajadas} saves · ${c.golesRecibidos} GC · ${c.vallasInvictas} vallas · ${c.golesEvitados >= 0 ? "+" : ""}${c.golesEvitados.toFixed(2)} GE` : `${c.goles} G · ${c.asistencias} A · ${c.mvps} MVP · RT ${c.ratingPromedio}`}</p></div></div>

                        {premio === "raiko_trophy" ? (
                          <div className="grid grid-cols-5 gap-2 xl:w-[520px]">{[["EFI", c.raikoDesglose.eficiencia], ["SOL", c.raikoDesglose.solidez], ["IMP", c.raikoDesglose.importantes], ["REG", c.raikoDesglose.regularidad], ["REC", c.raikoDesglose.reconocimiento]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-[#f3f4f6] p-2 text-center"><p className="text-[9px] font-black text-[#245f8e]">{label}</p><p className="mt-1 font-black">{value}</p></div>)}</div>
                        ) : premio === "balon_oro" || premio === "the_best" || premio === "golden_boy" ? (
                          <div className="grid grid-cols-4 gap-2 xl:w-[430px]">{[["IND", c.desglose.individual], ["MÉR", c.desglose.merito], ["COMP", c.desglose.competencia], ["REG", c.desglose.regularidad]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-[#f3f4f6] p-2 text-center"><p className="text-[9px] font-black text-[#245f8e]">{label}</p><p className="mt-1 font-black">{value}</p></div>)}</div>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#e5e7eb] pt-3"><p className="text-sm font-black">{c.puntos.toFixed(1)} pts</p><button onClick={() => void assignWinner(c)} disabled={savingId === c.playerid} className="rounded-xl bg-[#173f73] px-4 py-2 text-[10px] font-black uppercase !text-white disabled:opacity-50">{savingId === c.playerid ? "Guardando..." : "Asignar ganador"}</button></div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[22px] border border-[#d8e2ec] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">Historial</p><h2 className="mt-1 text-xl font-black uppercase">Premios asignados</h2>
                <div className="mt-4 space-y-2">{savedAwards.length === 0 ? <p className="text-sm text-[#245f8e]">Todavía no hay premios cargados.</p> : savedAwards.slice(0, 20).map((award) => <div key={award.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f3f4f6] px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-black uppercase">{PREMIO_CONFIG[award.premio as PremioKey]?.icono || "🏆"} {award.nombre}</p><p className="text-[11px] text-[#245f8e]">{PREMIO_CONFIG[award.premio as PremioKey]?.nombre || award.premio} · {award.temporada} · {award.equipo || "Sin club"}</p></div><button onClick={() => void deleteAward(award.id)} className="rounded-lg border border-red-300 px-3 py-2 text-[10px] font-black uppercase text-red-700">Borrar</button></div>)}</div>
              </section>
            </section>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
