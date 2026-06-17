"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import HeroImagenesHome from "../components/HeroImagenesHome";
import HeroCarruselHome from "../components/HeroCarruselHome";
import { getSeasonTheme } from "@/lib/seasonTheme";
import SeasonDecorations from "@/components/SeasonDecorations";
import EscudoEquipo from "@/components/home/EscudoEquipo";
import SeparadorHome from "@/components/home/SeparadorHome";
import HomeIntro from "@/components/home/HomeIntro";
import WorldCupExperience from "@/components/home/WorldCupExperience";
import ContextSelector from "@/components/home/ContextSelector";
import StatsGrid from "@/components/home/StatsGrid";
import FeaturedMatch from "@/components/home/FeaturedMatch";
import RankingsPanel from "@/components/home/RankingsPanel";
import FixturesResultsGrid from "@/components/home/FixturesResultsGrid";
import NewsHome from "@/components/home/NewsHome";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";
import FooterCTA from "@/components/home/FooterCTA";

const temporadas = ["Temporada 4"];

const divisiones = [
  { nombre: "primera", label: "Primera", icon: "🏆" },
  { nombre: "segunda", label: "Segunda", icon: "🥈" },
  { nombre: "tercera", label: "Tercera", icon: "🥉" },
  { nombre: "cuarta", label: "Cuarta", icon: "⭐" },
];

type NoticiaHome = {
  id: string;
  titulo: string;
  descripcion: string;
  temporada: string | null;
  categoria: string | null;
  imagen_url: string | null;
  autor: string | null;
  publicada: boolean;
  destacada: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

function fechaNoticia(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Home() {
  const theme = getSeasonTheme();

  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<NoticiaHome[]>([]);
  const [division, setDivision] = useState("primera");
  const [temporada, setTemporada] = useState("Temporada 4");

  const divisionDb =
    division === "primera"
      ? "Primera"
      : division === "segunda"
        ? "Segunda"
        : division === "tercera"
          ? "Tercera"
          : division === "cuarta"
            ? "Cuarta"
            : division;

  useEffect(() => {
    cargarDatos();
  }, [division, temporada]);

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("publicada", true)
      .order("destacada", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.log(error);
      return;
    }

    setNoticias((data || []) as NoticiaHome[]);
  }

  async function cargarDatos() {
    const { data: partidosData } = await supabase
      .from("partidos")
      .select("*")
      .in("division", [division, divisionDb])
      .eq("temporada", temporada)
      .order("fecha", { ascending: true });

    const { data: jugadoresData } = await supabase
      .from("partido_jugadores")
      .select("*")
      .in("division", [division, divisionDb])
      .eq("temporada", temporada);

    const nombresClubes = Array.from(
      new Set(
        [
          ...(partidosData || []).flatMap((p: any) => [p.local, p.visitante]),
          ...(jugadoresData || []).map((j: any) => j.equipo),
        ].filter(Boolean),
      ),
    );

    if (nombresClubes.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresClubes);

      if (clubesError) console.log(clubesError);
      setClubesInfo(clubesData || []);
    } else {
      setClubesInfo([]);
    }

    setPartidos(partidosData || []);
    setJugadores(jugadoresData || []);
  }

  const divisionActual = divisiones.find((d) => d.nombre === division) || divisiones[0];

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  const equiposCantidad = new Set(partidos.flatMap((p) => [p.local, p.visitante]).filter(Boolean)).size;
  const jugadoresCantidad = new Set(jugadores.map((j) => j.nombre).filter(Boolean)).size;
  const golesTotales = jugadores.reduce((acc, j) => acc + Number(j.goles || j.goals || 0), 0);
  const asistenciasTotales = jugadores.reduce((acc, j) => acc + Number(j.asistencias || j.assists || 0), 0);
  const mvpTotales = jugadores.reduce((acc, j) => acc + Number(j.mvp || j.mvps || 0), 0);

  const partidoDestacado = partidos.find((p) => !p.resultado) || partidos.find((p) => p.resultado) || partidos[0];
  const proximosPartidos = partidos.filter((p) => !p.resultado).slice(0, 4);
  const ultimosResultados = partidos.filter((p) => p.resultado).slice(-4).reverse();

  const rankings = useMemo(() => {
    const mapa: Record<string, any> = {};

    jugadores.forEach((j: any) => {
      const nombre = j.nombre || j.jugador || "Sin Nombre";
      const key = j.playerId || nombre;

      if (!mapa[key]) {
        mapa[key] = {
          nombre,
          equipo: j.equipo || "Sin Club",
          goles: 0,
          asistencias: 0,
          mvps: 0,
        };
      }

      mapa[key].goles += Number(j.goles || j.goals || 0);
      mapa[key].asistencias += Number(j.asistencias || j.assists || 0);
      mapa[key].mvps += Number(j.mvp || j.mvps || 0);
      if (j.equipo) mapa[key].equipo = j.equipo;
    });

    const lista = Object.values(mapa);

    return {
      goleador: [...lista].sort((a, b) => b.goles - a.goles)[0],
      asistidor: [...lista].sort((a, b) => b.asistencias - a.asistencias)[0],
      mvp: [...lista].sort((a, b) => b.mvps - a.mvps)[0],
    };
  }, [jugadores]);

  const statsHome = [
    { label: "Selecciones", value: equiposCantidad, img: "/themes/worldcup/card-clubes.png", detail: "en competencia", color: "text-sky-200" },
    { label: "Jornadas", value: partidos.length, img: "/themes/worldcup/card-partidos.png", detail: "en fixture", color: "text-yellow-300" },
    { label: "Jugadores", value: jugadoresCantidad, img: "/themes/worldcup/card-jugadores.png", detail: "registrados", color: "text-emerald-200" },
    { label: "Goles", value: golesTotales, img: "/themes/worldcup/card-rankings.png", detail: "temporada", color: "text-orange-200" },
  ];

  const noticiaDestacada = noticias.find((n) => n.destacada) || noticias[0];
  const noticiasSecundarias = noticias.filter((n) => n.id !== noticiaDestacada?.id).slice(0, 3);

  const accesos = [
    { href: "/competicion", title: "Competición", desc: "Torneos, copas, fixture, stats e historia.", img: "/themes/worldcup/trophy-worldcup.png", bg: "/themes/worldcup/trophy-worldcup.png" },
    { href: `/fixture?temporada=${encodeURIComponent(temporada)}`, title: "Fixture", desc: "Calendario oficial por temporada y categoría.", img: "/themes/worldcup/card-partidos.png", bg: "/themes/worldcup/card-partidos.png" },
    { href: "/clubes", title: "Clubes", desc: "Escudos, planteles, identidad e historial.", img: "/themes/worldcup/card-clubes.png", bg: "/themes/worldcup/card-clubes.png" },
    { href: "/jugadores", title: "Jugadores", desc: "Rankings, perfiles, goles, MVP y rating.", img: "/themes/worldcup/card-jugadores.png", bg: "/themes/worldcup/card-jugadores.png" },
    { href: "/mercado", title: "Mercado", desc: "Fichajes, salidas, libres y préstamos.", img: "/themes/worldcup/card-partidos.png", bg: "/themes/worldcup/card-partidos.png" },
    { href: "/entretenimiento", title: "Entretenimiento", desc: "Predicciones, Dream Team y premios APA.", img: "/themes/worldcup/trophy-goldenboy.png", bg: "/themes/worldcup/trophy-goldenboy.png" },
    { href: "/guia", title: "Guía", desc: "Mapa completo para entender la web.", img: "/themes/worldcup/world-map.png", bg: "/themes/worldcup/world-map.png" },
    { href: "/historia", title: "Historia APA", desc: "Premios, récords y estadísticas desde la Temporada 4.", img: "/themes/worldcup/trophy-balon.png", bg: "/themes/worldcup/trophy-balon.png" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04152b] p-4 text-white md:p-6">
      <div className="pointer-events-none fixed inset-0 z-0">
        <img src="/themes/worldcup/background-worldcup.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,21,43,.18),rgba(4,21,43,.42)_50%,rgba(3,12,27,.72))]" />
      </div>

      <SeasonDecorations />

      <section className="relative z-10 mx-auto max-w-[1500px] space-y-10">
        <HeroImagenesHome />

        <HomeIntro theme={theme} temporada={temporada} divisionActual={divisionActual} />
        <WorldCupExperience />
        <ContextSelector temporadas={temporadas} temporada={temporada} setTemporada={setTemporada} divisiones={divisiones} division={division} setDivision={setDivision} />
        <StatsGrid stats={statsHome} />

        <SeparadorHome label="Qué está pasando" />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
          <FeaturedMatch
            partido={partidoDestacado}
            temporada={temporada}
            division={division}
            divisionLabel={divisionActual.label}
            logoEquipo={logoEquipo}
            EscudoEquipo={EscudoEquipo}
          />

          <RankingsPanel rankings={rankings} logoEquipo={logoEquipo} EscudoEquipo={EscudoEquipo} />
        </section>

        <FixturesResultsGrid
          proximosPartidos={proximosPartidos}
          ultimosResultados={ultimosResultados}
          division={division}
          temporada={temporada}
          logoEquipo={logoEquipo}
          EscudoEquipo={EscudoEquipo}
        />

        {noticias.length > 0 && (
          <>
            <SeparadorHome label="Noticias APA" />
            <NewsHome noticias={noticias} noticiaDestacada={noticiaDestacada} noticiasSecundarias={noticiasSecundarias} fechaNoticia={fechaNoticia} />
          </>
        )}

        <SeparadorHome label="Explorar APA" />
        <QuickAccessGrid accesos={accesos} />
        <FooterCTA />
        <HeroCarruselHome />
      </section>
    </main>
  );
}
