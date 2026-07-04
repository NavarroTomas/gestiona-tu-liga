"use client";

import type { ReactNode } from "react";
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
import StatsGrid from "@/components/home/StatsGrid";
import FeaturedMatch from "@/components/home/FeaturedMatch";

import FixturesResultsGrid from "@/components/home/FixturesResultsGrid";

import QuickAccessGrid from "@/components/home/QuickAccessGrid";

const temporadas = ["Temporada 4"];

const divisiones = [
  { nombre: "primera", label: "Primera", icon: "I" },
  { nombre: "segunda", label: "Segunda", icon: "II" },
  { nombre: "tercera", label: "Tercera", icon: "III" },
  { nombre: "cuarta", label: "Cuarta", icon: "IV" },
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

function MuralFrame({
  children,
  variant = "blue",
  className = "",
}: {
  children: ReactNode;
  variant?: "blue" | "green" | "gold";
  className?: string;
}) {
  const assets = {
    blue: {
      photo: "/themes/worldcup/backgrounds/stadium-night-01.png",
      tint: "from-sky-300",
    },
    green: {
      photo: "/themes/worldcup/backgrounds/pitch-top-01.png",
      tint: "from-green-300",
    },
    gold: {
      photo: "/themes/worldcup/backgrounds/crowd-night-01.png",
      tint: "from-yellow-300",
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-yellow-100/16 bg-[#0b1716]/64 shadow-[0_24px_75px_rgba(0,0,0,.44)] backdrop-blur-[2px] ${className}`}
    >
      <img
        src={assets.photo}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16]"
      />
      <div className={`pointer-events-none absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${assets.tint} via-yellow-300 to-green-300 opacity-80`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-black/24" />
      <div className="relative z-10">{children}</div>
    </div>
  );
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
      .select("id, titulo, descripcion, temporada, categoria, imagen_url, autor, publicada, destacada, created_at, updated_at")
      .eq("publicada", true)
      .order("destacada", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.log(error);
      return;
    }

    setNoticias((data || []) as unknown as NoticiaHome[]);
  }

  async function cargarDatos() {
    const { data: partidosData } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
      .in("division", [division, divisionDb])
      .eq("temporada", temporada)
      .order("fecha", { ascending: true });

    const { data: jugadoresData } = await supabase
      .from("partido_jugadores")
      .select("id, partido_id, nombre, jugador, playerId, equipo, temporada, division, fecha, goles, goals, asistencias, assists, mvp, mvps")
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
    { label: "Clubes", value: equiposCantidad, img: "/themes/worldcup/backgrounds/stadium-night-01.png", detail: "en competencia", color: "text-sky-200" },
    { label: "Partidos", value: partidos.length, img: "/themes/worldcup/backgrounds/pitch-top-01.png", detail: "en fixture", color: "text-yellow-300" },
    { label: "Jugadores", value: jugadoresCantidad, img: "/themes/worldcup/backgrounds/crowd-night-01.png", detail: "registrados", color: "text-emerald-200" },
    { label: "Goles", value: golesTotales, img: "/themes/worldcup/backgrounds/stadium-night-01.png", detail: "temporada", color: "text-orange-200" },
  ];

  const noticiaDestacada = noticias.find((n) => n.destacada) || noticias[0];
  const noticiasSecundarias = noticias.filter((n) => n.id !== noticiaDestacada?.id).slice(0, 3);

  const accesos = [
    { href: "/competicion", title: "Competicion", desc: "Torneos, copas, fixture, stats e historia.", img: "/themes/worldcup/backgrounds/crowd-night-01.png", bg: "/themes/worldcup/backgrounds/crowd-night-01.png" },
    { href: `/fixture?temporada=${encodeURIComponent(temporada)}`, title: "Fixture", desc: "Calendario oficial por temporada y categoria.", img: "/themes/worldcup/backgrounds/pitch-top-01.png", bg: "/themes/worldcup/backgrounds/pitch-top-01.png" },
    { href: "/clubes", title: "Clubes", desc: "Escudos, planteles, identidad e historial.", img: "/themes/worldcup/backgrounds/stadium-night-01.png", bg: "/themes/worldcup/backgrounds/stadium-night-01.png" },
    { href: "/jugadores", title: "Jugadores", desc: "Rankings, perfiles, goles, MVP y rating.", img: "/themes/worldcup/backgrounds/stadium-aerial-night-01.png", bg: "/themes/worldcup/backgrounds/stadium-aerial-night-01.png" },
    { href: "/mercado", title: "Mercado", desc: "Fichajes, salidas, libres y prestamos.", img: "/themes/worldcup/backgrounds/pitch-top-01.png", bg: "/themes/worldcup/backgrounds/pitch-top-01.png" },
    { href: "/entretenimiento", title: "Entretenimiento", desc: "Predicciones, Dream Team y premios APA.", img: "/themes/worldcup/backgrounds/crowd-night-01.png", bg: "/themes/worldcup/backgrounds/crowd-night-01.png" },
    { href: "/guia", title: "Guia", desc: "Mapa completo para entender la web.", img: "/themes/worldcup/backgrounds/stadium-night-01.png", bg: "/themes/worldcup/backgrounds/stadium-night-01.png" },
    { href: "/historia", title: "Historia APA", desc: "Premios, records y estadisticas desde la Temporada 4.", img: "/themes/worldcup/backgrounds/crowd-night-01.png", bg: "/themes/worldcup/backgrounds/crowd-night-01.png" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020814] px-4 pb-4 pt-3 text-white md:px-6 md:pb-6 md:pt-4">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-16%,rgba(245,181,49,.18),transparent_31%),radial-gradient(circle_at_13%_18%,rgba(91,167,216,.13),transparent_30%),radial-gradient(circle_at_88%_24%,rgba(37,118,75,.10),transparent_27%),linear-gradient(180deg,#0b1830_0%,#071121_48%,#040b16_78%,#01030a_100%)]" />
        <div className="absolute inset-x-[-10%] top-[9rem] h-[24rem] rounded-[50%] border-t border-yellow-100/10 bg-[radial-gradient(ellipse_at_top,rgba(245,181,49,.10),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(115deg,transparent_0%,rgba(91,167,216,.07)_18%,transparent_36%,rgba(245,181,49,.09)_54%,transparent_74%)] blur-xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_76%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,246,220,.62)_1px,transparent_1px)] opacity-[0.045] [background-size:36px_36px]" />
      </div>

      <SeasonDecorations />

      <section className="relative z-10 mx-auto max-w-[1240px] space-y-10">
        <HeroImagenesHome />

        <HomeIntro theme={theme} temporada={temporada} divisionActual={divisionActual} />
        <MuralFrame variant="blue">
          <WorldCupExperience
            temporadas={temporadas}
            temporada={temporada}
            setTemporada={setTemporada}
            divisiones={divisiones}
            division={division}
            setDivision={setDivision}
          />
        </MuralFrame>
        <StatsGrid stats={statsHome} />
        <SeparadorHome label="Qué está pasando" />
        <section className="grid grid-cols-1 gap-6">
          <MuralFrame variant="blue">
            <FeaturedMatch
              partido={partidoDestacado}
              temporada={temporada}
              division={division}
              divisionLabel={divisionActual.label}
              logoEquipo={logoEquipo}
              EscudoEquipo={EscudoEquipo}
            />
          </MuralFrame>

          
           
          
        </section>

        <MuralFrame variant="green">
          <FixturesResultsGrid
            proximosPartidos={proximosPartidos}
            ultimosResultados={ultimosResultados}
            division={division}
            temporada={temporada}
            logoEquipo={logoEquipo}
            EscudoEquipo={EscudoEquipo}
          />
        </MuralFrame>

        {noticias.length > 0 && (
          <>
            <SeparadorHome label="Noticias APA" />
            
              
          </>
        )}

        <SeparadorHome label="Explorar APA" />
        <QuickAccessGrid accesos={accesos} />
        <HeroCarruselHome />
      </section>
    </main>
  );
}
