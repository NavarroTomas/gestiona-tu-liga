"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeagueHero from "@/components/home/LeagueHero";
import HomeNewsStandings from "@/components/home/HomeNewsStandings";
import HomeAwards from "@/components/home/HomeAwards";
import HomeCompetitionStrip from "@/components/home/HomeCompetitionStrip";
import HomeMatchStrip from "@/components/home/HomeMatchStrip";
import {
  buildAutomaticNews,
  buildStandings,
  normalizeText,
  sortMatches,
  type ClubInfo,
  type HomeAward,
  type HomeMatch,
  type HomeNews,
} from "@/lib/homePortal";

type PlayerStat = { playerId?: string | null; nombre?: string | null; goals?: number | null };

export default function HomeLeaguePortal() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [matches, setMatches] = useState<HomeMatch[]>([]);
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [news, setNews] = useState<HomeNews[]>([]);
  const [awards, setAwards] = useState<HomeAward[]>([]);
  const [stats, setStats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const seasonsRes = await supabase.from("temporadas").select("nombre").order("created_at", { ascending: true });
      const seasonNames = (seasonsRes.data || []).map((row: any) => String(row.nombre || "")).filter(Boolean);
      const currentSeason = seasonNames[seasonNames.length - 1] || "Temporada 4";
      if (!active) return;
      setTemporada(currentSeason);

      const [matchesRes, newsRes, awardsRes] = await Promise.all([
        supabase.from("partidos").select("id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,fase,grupo,dia,hora").eq("temporada", currentSeason),
        supabase.from("noticias").select("id,titulo,descripcion,categoria,imagen_url,destacada,created_at").eq("publicada", true).order("destacada", { ascending: false }).order("created_at", { ascending: false }).limit(6),
        supabase.from("premios_apa").select("id,premio,nombre,equipo,puntos,posicion").eq("temporada", currentSeason).order("id", { ascending: false }).limit(8),
      ]);

      if (!active) return;
      const seasonMatches = ((matchesRes.data || []) as HomeMatch[]).sort(sortMatches);
      setMatches(seasonMatches);
      setNews((newsRes.data || []) as HomeNews[]);
      setAwards((awardsRes.data || []) as HomeAward[]);

      const teamNames = [...new Set(seasonMatches.flatMap((match) => [match.local, match.visitante]).filter(Boolean))] as string[];
      if (teamNames.length) {
        const clubsRes = await supabase.from("clubes_info").select("nombre,logo_url").in("nombre", teamNames);
        if (active) setClubs((clubsRes.data || []) as ClubInfo[]);
      }

      const matchIds = seasonMatches.map((match) => String(match.partido_id || match.id));
      if (matchIds.length) {
        const statsRes = await supabase.from("estadisticas_jugadores").select("playerId,nombre,goals").eq("temporada", currentSeason).in("partido_id", matchIds);
        if (active) setStats((statsRes.data || []) as PlayerStat[]);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  const standings = useMemo(() => buildStandings(matches, "Primera"), [matches]);
  const automaticNews = useMemo(() => buildAutomaticNews(matches), [matches]);
  const mergedNews = useMemo(() => {
    const manual = news.slice(0, 4);
    if (manual.length >= 4) return manual;
    return [...manual, ...automaticNews.slice(0, 4 - manual.length)];
  }, [news, automaticNews]);

  const upcoming = useMemo(() => matches.filter((match) => !match.resultado).sort(sortMatches), [matches]);
  const featured = upcoming[0];

  const logoEquipo = (team: string) => clubs.find((club) => normalizeText(club.nombre) === normalizeText(team))?.logo_url || null;

  const clubsCount = new Set(matches.flatMap((m) => [m.local, m.visitante]).filter(Boolean)).size;
  const playersCount = new Set(stats.map((row) => String(row.playerId || row.nombre || "")).filter(Boolean)).size;
  const goalsCount = matches.reduce((sum, match) => {
    const found = String(match.resultado || "").match(/^(\d+)\s*[-:]\s*(\d+)$/);
    return found ? sum + Number(found[1]) + Number(found[2]) : sum;
  }, 0);

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#0b2747]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 md:px-8 md:py-8">
        <LeagueHero temporada={temporada} />
        <HomeNewsStandings news={mergedNews} standings={standings} logoEquipo={logoEquipo} />
        <HomeAwards awards={awards} logoEquipo={logoEquipo} />
        <HomeCompetitionStrip />
        <HomeMatchStrip featured={featured} upcoming={upcoming} clubs={clubs} />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clubes", clubsCount],
            ["Partidos", matches.length],
            ["Jugadores", playersCount],
            ["Goles", goalsCount],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-[#0b2747] px-5 py-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4 rounded-[24px] bg-[#102f55] px-6 py-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Comunidad APA</p>
            <h2 className="mt-1 text-2xl font-black uppercase">Unite a la comunidad</h2>
          </div>
          <a href="https://discord.com" target="_blank" rel="noreferrer" className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#0b2747]">Discord →</a>
        </section>
      </div>
    </main>
  );
}
