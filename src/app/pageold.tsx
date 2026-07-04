"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import HeroImagenesHome from "../components/HeroImagenesHome";
import HeroCarruselHome from "../components/HeroCarruselHome";

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

type HomeArea = {
  key: string;
  numero: string;
  title: string;
  short: string;
  desc: string;
  href: string;
  image: string;
  tone: string;
  links: { label: string; href: string }[];
};

const areas: HomeArea[] = [
  {
    key: "competicion",
    numero: "01",
    title: "Competición",
    short: "Liga, copa e historia",
    desc: "El centro para seguir la temporada, divisiones, fixture, tablas y recorrido oficial.",
    href: "/competicion",
    image: "/themes/worldcup/backgrounds/crowd-night-01.png",
    tone: "from-cyan-300/35 via-sky-500/10 to-transparent",
    links: [
      { label: "Torneos", href: "/competicion" },
      { label: "Stats", href: "/estadisticas" },
      { label: "Historia", href: "/historia" },
    ],
  },
  {
    key: "fixture",
    numero: "02",
    title: "Fixture",
    short: "Calendario vivo",
    desc: "Partidos próximos, resultados recientes y lectura rápida de lo que se viene.",
    href: "/fixture",
    image: "/themes/worldcup/backgrounds/pitch-top-01.png",
    tone: "from-emerald-300/35 via-lime-400/10 to-transparent",
    links: [
      { label: "Calendario", href: "/fixture" },
      { label: "Partidos", href: "/partidos" },
      { label: "Estadísticas", href: "/estadisticas" },
    ],
  },
  {
    key: "clubes",
    numero: "03",
    title: "Clubes",
    short: "Identidad y planteles",
    desc: "Escudos, clubes, mercado y plantillas conectados como una escena de temporada.",
    href: "/clubes",
    image: "/themes/worldcup/backgrounds/stadium-night-01.png",
    tone: "from-yellow-300/35 via-orange-400/10 to-transparent",
    links: [
      { label: "Clubes", href: "/clubes" },
      { label: "Plantillas", href: "/plantillas" },
      { label: "Mercado", href: "/mercado" },
    ],
  },
  {
    key: "jugadores",
    numero: "04",
    title: "Jugadores",
    short: "Perfiles y ranking",
    desc: "Goles, MVP, perfiles públicos y rendimiento individual de la comunidad.",
    href: "/jugadores",
    image: "/themes/worldcup/backgrounds/stadium-aerial-night-01.png",
    tone: "from-violet-300/35 via-fuchsia-500/10 to-transparent",
    links: [
      { label: "Ranking", href: "/jugadores" },
      { label: "Premios", href: "/entretenimiento/premios" },
      { label: "Dream Team", href: "/entretenimiento/dream-team" },
    ],
  },
  {
    key: "comunidad",
    numero: "05",
    title: "Comunidad",
    short: "Predicciones y juego",
    desc: "La zona donde la liga se juega también fuera de la cancha: predicciones, Dream Team y premios.",
    href: "/entretenimiento",
    image: "/themes/worldcup/backgrounds/crowd-night-01.png",
    tone: "from-rose-300/35 via-pink-500/10 to-transparent",
    links: [
      { label: "Predicciones", href: "/entretenimiento/predicciones" },
      { label: "Dream Team", href: "/entretenimiento/dream-team" },
      { label: "Premios", href: "/entretenimiento/premios" },
    ],
  },
];

function fechaNoticia(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nf(value: number) {
  return new Intl.NumberFormat("es-AR").format(value || 0);
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,.9)]" />
      {children}
    </span>
  );
}

function TeamMark({
  nombre,
  logo,
  align = "left",
}: {
  nombre?: string | null;
  logo?: string | null;
  align?: "left" | "right";
}) {
  const initials = String(nombre || "?").slice(0, 2).toUpperCase();

  return (
    <div className={`flex items-center gap-4 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "left" && (
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/8 shadow-[0_0_40px_rgba(56,189,248,.12)]">
          {logo ? <img src={logo} alt={nombre || "Club"} className="h-full w-full object-contain p-2" /> : <span className="text-sm font-black">{initials}</span>}
        </div>
      )}

      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">
          {align === "right" ? "Visitante" : "Local"}
        </div>
        <div className="mt-1 max-w-[13rem] truncate text-2xl font-black uppercase leading-none tracking-[-0.04em] text-white md:text-4xl">
          {nombre || "Sin club"}
        </div>
      </div>

      {align === "right" && (
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/8 shadow-[0_0_40px_rgba(253,224,71,.12)]">
          {logo ? <img src={logo} alt={nombre || "Club"} className="h-full w-full object-contain p-2" /> : <span className="text-sm font-black">{initials}</span>}
        </div>
      )}
    </div>
  );
}



function bgByArea(key: string) {
  switch (key) {
    case "competicion":
      return "/themes/worldcup/backgrounds/crowd-night-01.png";
    case "fixture":
      return "/themes/worldcup/backgrounds/pitch-top-01.png";
    case "clubes":
      return "/themes/worldcup/backgrounds/stadium-empty-night-01.png";
    case "jugadores":
      return "/themes/worldcup/backgrounds/stadium-aerial-night-01.png";
    case "comunidad":
      return "/themes/worldcup/backgrounds/crowd-night-01.png";
    default:
      return "/themes/worldcup/backgrounds/stadium-night-01.png";
  }
}

function glowByArea(key: string) {
  switch (key) {
    case "competicion":
      return "radial-gradient(circle at 22% 30%, rgba(56,189,248,.18), transparent 28%), radial-gradient(circle at 82% 40%, rgba(253,224,71,.16), transparent 26%)";
    case "fixture":
      return "radial-gradient(circle at 18% 26%, rgba(34,197,94,.18), transparent 28%), radial-gradient(circle at 80% 38%, rgba(56,189,248,.12), transparent 24%)";
    case "clubes":
      return "radial-gradient(circle at 18% 28%, rgba(253,224,71,.18), transparent 28%), radial-gradient(circle at 84% 36%, rgba(249,115,22,.12), transparent 24%)";
    case "jugadores":
      return "radial-gradient(circle at 18% 28%, rgba(168,85,247,.18), transparent 28%), radial-gradient(circle at 84% 36%, rgba(56,189,248,.12), transparent 24%)";
    case "comunidad":
      return "radial-gradient(circle at 18% 28%, rgba(244,63,94,.18), transparent 28%), radial-gradient(circle at 84% 36%, rgba(253,224,71,.12), transparent 24%)";
    default:
      return "radial-gradient(circle at 18% 28%, rgba(56,189,248,.16), transparent 28%), radial-gradient(circle at 84% 36%, rgba(253,224,71,.12), transparent 24%)";
  }
}

function pageBackdrop(key: string) {
  switch (key) {
    case "fixture":
      return "radial-gradient(circle at 50% 18%, rgba(34,197,94,.16), transparent 24%), radial-gradient(circle at 18% 30%, rgba(56,189,248,.12), transparent 28%), linear-gradient(115deg, rgba(125,211,252,.28) 0%, rgba(125,211,252,.10) 12%, transparent 24%, transparent 70%, rgba(34,197,94,.18) 82%, rgba(250,204,21,.16) 100%), linear-gradient(180deg,#071529 0%,#06101f 42%,#020711 100%)";
    case "clubes":
      return "radial-gradient(circle at 50% 18%, rgba(250,204,21,.18), transparent 24%), radial-gradient(circle at 18% 30%, rgba(56,189,248,.12), transparent 28%), linear-gradient(115deg, rgba(147,197,253,.26) 0%, rgba(147,197,253,.10) 12%, transparent 25%, transparent 68%, rgba(250,204,21,.20) 82%, rgba(34,197,94,.16) 100%), linear-gradient(180deg,#071529 0%,#06101f 42%,#020711 100%)";
    case "jugadores":
      return "radial-gradient(circle at 50% 18%, rgba(168,85,247,.18), transparent 24%), radial-gradient(circle at 18% 30%, rgba(56,189,248,.12), transparent 28%), linear-gradient(115deg, rgba(125,211,252,.25) 0%, rgba(125,211,252,.09) 12%, transparent 24%, transparent 68%, rgba(168,85,247,.18) 82%, rgba(236,72,153,.14) 100%), linear-gradient(180deg,#071529 0%,#06101f 42%,#020711 100%)";
    case "comunidad":
      return "radial-gradient(circle at 50% 18%, rgba(244,63,94,.16), transparent 24%), radial-gradient(circle at 18% 30%, rgba(56,189,248,.12), transparent 28%), linear-gradient(115deg, rgba(147,197,253,.24) 0%, rgba(147,197,253,.09) 12%, transparent 24%, transparent 68%, rgba(244,63,94,.18) 82%, rgba(250,204,21,.14) 100%), linear-gradient(180deg,#071529 0%,#06101f 42%,#020711 100%)";
    default:
      return "radial-gradient(circle at 50% 16%, rgba(250,204,21,.14), transparent 24%), radial-gradient(circle at 17% 26%, rgba(125,211,252,.20), transparent 28%), radial-gradient(circle at 86% 28%, rgba(34,197,94,.18), transparent 26%), linear-gradient(115deg, rgba(147,197,253,.30) 0%, rgba(147,197,253,.12) 12%, transparent 25%, transparent 69%, rgba(34,197,94,.24) 82%, rgba(250,204,21,.18) 100%), linear-gradient(180deg,#071529 0%,#06101f 42%,#020711 100%)";
  }
}

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<NoticiaHome[]>([]);
  const [division, setDivision] = useState("primera");
  const [temporada, setTemporada] = useState("Temporada 4");
  const [areaActiva, setAreaActiva] = useState(areas[0].key);

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
  const areaSeleccionada = areas.find((area) => area.key === areaActiva) || areas[0];

  function logoEquipo(nombre?: string | null) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  const equiposCantidad = new Set(partidos.flatMap((p) => [p.local, p.visitante]).filter(Boolean)).size;
  const jugadoresCantidad = new Set(jugadores.map((j) => j.nombre || j.jugador).filter(Boolean)).size;
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

  const noticiaDestacada = noticias.find((n) => n.destacada) || noticias[0];
  const noticiasSecundarias = noticias.filter((n) => n.id !== noticiaDestacada?.id).slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 transition duration-500" style={{ backgroundImage: pageBackdrop(areaActiva) }} />

        {/* Fondo propio: sin SeasonDecorations y sin asset del túnel */}
        <div className="absolute left-[-12vw] top-[-6vh] h-[120vh] w-[34vw] min-w-[240px] rotate-[-8deg] bg-[linear-gradient(180deg,rgba(147,197,253,.50)_0%,rgba(255,255,255,.22)_45%,rgba(96,165,250,.18)_100%)] opacity-65" />
        <div className="absolute left-[3vw] top-[30vh] h-[9rem] w-[9rem] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,.30)_0%,rgba(250,204,21,.15)_18%,transparent_52%)] blur-sm" />

        <div className="absolute right-[-12vw] top-[-6vh] h-[120vh] w-[36vw] min-w-[250px] rotate-[8deg] bg-[linear-gradient(180deg,rgba(34,197,94,.50)_0%,rgba(250,204,21,.22)_46%,rgba(21,128,61,.20)_100%)] opacity-65" />
        <div className="absolute right-[3vw] top-[29vh] h-[12rem] w-[12rem] rotate-[12deg] rounded-[36px] bg-[radial-gradient(circle,rgba(37,99,235,.32)_0%,rgba(37,99,235,.25)_26%,transparent_48%)] opacity-70" />

        <div className="absolute left-1/2 top-[12vh] h-[52vh] w-[62vw] -translate-x-1/2 rounded-[50%] border border-cyan-200/12" />
        <div className="absolute left-1/2 top-[27vh] h-[42vh] w-[82vw] -translate-x-1/2 rounded-[50%] border border-yellow-200/10" />
        <div className="absolute left-1/2 top-[8vh] h-[70vh] w-[46vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,.12)_0%,rgba(56,189,248,.05)_30%,transparent_66%)]" />
        <div className="absolute left-1/2 top-[17vh] h-[36vh] w-[58vw] -translate-x-1/2 rounded-[44px] bg-[linear-gradient(120deg,transparent_0%,rgba(56,189,248,.07)_28%,rgba(250,204,21,.06)_52%,transparent_76%)] blur-[1px]" />
        <div className="absolute left-1/2 top-[36vh] h-px w-[74vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="absolute left-1/2 top-[47vh] h-px w-[58vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/16 to-transparent" />
        <div className="absolute left-[24vw] top-[18vh] h-[18rem] w-[10rem] rotate-[24deg] bg-[linear-gradient(180deg,rgba(56,189,248,.12),transparent)] blur-md" />
        <div className="absolute right-[22vw] top-[20vh] h-[18rem] w-[10rem] rotate-[-24deg] bg-[linear-gradient(180deg,rgba(250,204,21,.10),transparent)] blur-md" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,.90)_0%,rgba(2,7,17,.62)_18%,rgba(2,7,17,.36)_50%,rgba(2,7,17,.62)_82%,rgba(2,7,17,.90)_100%),linear-gradient(180deg,rgba(2,7,17,.34)_0%,rgba(2,7,17,.76)_62%,#020711_100%)]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,transparent_0%,transparent_44%,rgba(2,7,17,.66)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
        <section className="relative left-1/2 isolate -mt-6 min-h-[calc(100svh-70px)] w-screen -translate-x-1/2 overflow-hidden md:-mt-8">
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src="/themes/worldcup/backgrounds/home-cancha-argentina.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,.84)_0%,rgba(2,7,17,.58)_24%,rgba(2,7,17,.30)_52%,rgba(2,7,17,.55)_78%,rgba(2,7,17,.82)_100%),linear-gradient(180deg,rgba(2,7,17,.10)_0%,rgba(2,7,17,.40)_70%,#020711_100%)]" />
            <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:58px_58px]" />
            <div className="absolute left-1/2 top-[12%] h-[62%] w-[92vw] -translate-x-1/2 rounded-[50%] border border-white/10" />
            <div className="absolute left-1/2 top-[52%] h-px w-[88vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-70px)] max-w-[1500px] flex-col justify-center px-5 py-10 sm:px-8 md:py-14 lg:px-14 xl:px-20">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,760px)_430px] lg:justify-between">
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.32em] text-yellow-100/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(250,204,21,.9)]" />
                  Temporada 4
                </span>

                <h1 className="mt-6 text-[72px] font-black uppercase italic leading-[0.82] tracking-[-0.08em] text-white sm:text-[92px] md:text-[118px] lg:text-[136px]">
                  APA<br />
                  <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-cyan-100 bg-clip-text text-transparent">
                    PSO
                  </span>
                </h1>

                <p className="mt-6 max-w-[45rem] text-base leading-8 text-white/84 md:text-lg">
                  La casa oficial de la liga argentina de Pro Soccer Online. Competencia, clubes, partidos, estadísticas y comunidad en un solo lugar.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/competicion"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#f0d35d] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#07111f] shadow-[0_20px_50px_rgba(240,211,93,.22)] transition hover:translate-y-[-2px] hover:brightness-105"
                  >
                    Iniciar recorrido <span className="transition group-hover:translate-x-1">→</span>
                  </Link>

                  <a
                    href="#navegador"
                    className="inline-flex items-center rounded-full border border-white/16 bg-black/18 px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm transition hover:border-cyan-200/35 hover:bg-white/[0.07]"
                  >
                    Ver secciones
                  </a>
                </div>
              </div>

              <aside className="relative hidden max-w-[430px] justify-self-end lg:block">
                <div className="absolute inset-y-[-2.5rem] -left-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                <div className="mb-6 text-[10px] font-black uppercase tracking-[0.34em] text-cyan-100/82">
                  Centro APA
                </div>

                <div className="space-y-6">
                  <div className="border-b border-white/12 pb-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.26em] text-yellow-100/76">
                      Qué es la página
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      Hub oficial para seguir la liga, consultar clubes, mirar estadísticas, participar en predicciones y tener toda la comunidad APA en un solo lugar.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-white/12 pb-5">
                    {[
                      ["Liga", "Fixture y tablas"],
                      ["Clubes", "Planteles y mercado"],
                      ["Jugadores", "Perfiles y stats"],
                      ["Comunidad", "Predicciones y premios"],
                    ].map(([title, desc]) => (
                      <div key={title}>
                        <div className="text-base font-black uppercase italic tracking-[-0.03em] text-white/94">
                          {title}
                        </div>
                        <div className="mt-1 text-[11px] leading-5 text-white/52">{desc}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.26em] text-yellow-100/76">
                      Redes / comunidad
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/74">
                      <span className="rounded-full border border-white/14 bg-black/18 px-3 py-2 backdrop-blur-sm">Discord</span>
                      <span className="rounded-full border border-white/14 bg-black/18 px-3 py-2 backdrop-blur-sm">YouTube</span>
                      <span className="rounded-full border border-white/14 bg-black/18 px-3 py-2 backdrop-blur-sm">Instagram</span>
                      <span className="rounded-full border border-white/14 bg-black/18 px-3 py-2 backdrop-blur-sm">TikTok</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="relative z-10 mt-10 border-y border-white/12 py-5">
              <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
                {[
                  ["Clubes", equiposCantidad],
                  ["Partidos", partidos.length],
                  ["Jugadores", jugadoresCantidad],
                  ["Goles", golesTotales],
                ].map(([label, value]) => (
                  <div key={String(label)} className="relative px-0 sm:px-6 sm:first:pl-0 sm:not(:last-child):border-r sm:border-white/12">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/68">{label}</div>
                    <div className="mt-2 text-4xl font-black italic tracking-[-0.05em] text-white md:text-5xl">{nf(Number(value))}</div>
                    <div className="pointer-events-none absolute bottom-0 left-0 h-px w-16 bg-gradient-to-r from-yellow-300/70 to-transparent sm:left-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="relative my-8 md:my-10">
          <HeroImagenesHome />
        </div>

        <section id="navegador" className="relative py-10 md:py-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Chip>Navegador oficial</Chip>
              <h2 className="mt-4 max-w-[12ch] text-4xl font-black uppercase italic leading-[0.88] tracking-[-0.06em] md:text-6xl">
                Elegí tu entrada
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {temporadas.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemporada(t)}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                    temporada === t ? "bg-yellow-300 text-[#07111f]" : "bg-white/[0.04] text-white/62 hover:bg-white/[0.08]"
                  }`}
                >
                  {t}
                </button>
              ))}
              {divisiones.map((d) => (
                <button
                  key={d.nombre}
                  onClick={() => setDivision(d.nombre)}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                    division === d.nombre ? "bg-cyan-200 text-[#07111f]" : "bg-white/[0.04] text-white/62 hover:bg-white/[0.08]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[620px] overflow-hidden rounded-[34px] md:rounded-[46px]">
            <img
              src={bgByArea(areaActiva)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.24] transition duration-500"
            />
            <div className="absolute inset-0" style={{ backgroundImage: glowByArea(areaActiva) }} />
            <div className={`absolute inset-0 bg-gradient-to-r ${areaSeleccionada.tone}`} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,.95)_0%,rgba(2,7,17,.90)_26%,rgba(2,7,17,.62)_58%,rgba(2,7,17,.78)_72%,rgba(2,7,17,.92)_100%)]" />
            <div className="absolute inset-y-0 left-[31%] hidden w-px bg-white/10 md:block" />
            <div className="absolute inset-x-8 top-8 h-px bg-white/10" />
            <div className="absolute inset-x-8 bottom-8 h-px bg-white/10" />

            <div className="relative z-10 grid min-h-[620px] gap-8 p-6 md:grid-cols-[330px_1fr] md:p-9">
              <div className="flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.34em] text-white/42">
                    Selector de modo
                  </div>

                  <div className="mt-7 space-y-1">
                    {areas.map((area) => {
                      const active = area.key === areaActiva;
                      return (
                        <button
                          key={area.key}
                          onClick={() => setAreaActiva(area.key)}
                          className={`group grid w-full grid-cols-[44px_1fr_24px] items-center gap-3 border-b border-white/10 py-4 text-left transition ${
                            active ? "text-white" : "text-white/45 hover:text-white/78"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-[0.24em] ${active ? "text-yellow-200" : "text-white/28"}`}>
                            {area.numero}
                          </span>
                          <span>
                            <span className="block text-lg font-black uppercase italic tracking-[-0.03em] md:text-xl">
                              {area.title}
                            </span>
                            <span className="mt-1 block text-xs text-white/42">{area.short}</span>
                          </span>
                          <span className={`${active ? "text-cyan-100" : "text-white/20"} transition group-hover:translate-x-1`}>→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-8 max-w-[18rem] text-xs leading-6 text-white/45">
                  La sección cambia sin romper la escena: misma atmósfera, distintas rutas de navegación.
                </p>
              </div>

              <div className="flex flex-col justify-end pb-6 md:pb-10">
                <div className="max-w-[48rem]">
                  <div className="text-[10px] font-black uppercase tracking-[0.34em] text-yellow-100/70">
                    {areaSeleccionada.numero} · {areaSeleccionada.short}
                  </div>

                  <h3 className="mt-4 text-5xl font-black uppercase italic leading-[0.88] tracking-[-0.07em] text-white md:text-7xl">
                    {areaSeleccionada.title}
                  </h3>

                  <p className="mt-5 max-w-[34rem] text-base leading-8 text-white/74">
                    {areaSeleccionada.desc}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={areaSeleccionada.href}
                      className="rounded-full bg-[#f0d35d] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#07111f] transition hover:translate-y-[-1px]"
                    >
                      Entrar
                    </Link>

                    {areaSeleccionada.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full border border-white/12 bg-white/[0.035] px-5 py-4 text-sm font-semibold text-white/82 transition hover:bg-white/[0.08]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-10 md:py-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Chip>Pulso de temporada</Chip>
              <h2 className="mt-4 text-4xl font-black uppercase italic leading-[0.9] tracking-[-0.06em] md:text-6xl">
                Datos vivos
              </h2>
            </div>
            <p className="max-w-[38rem] text-sm leading-7 text-white/58">
              Lectura rápida integrada al fondo: estadísticas principales, líderes y movimiento de la división seleccionada.
            </p>
          </div>

          <div className="border-y border-white/10 py-7">
            <div className="grid gap-6 md:grid-cols-4">
              {[
                ["Clubes", equiposCantidad, "Competencia"],
                ["Partidos", partidos.length, "Fixture"],
                ["Asistencias", asistenciasTotales, "Juego creado"],
                ["MVP", mvpTotales, "Destacados"],
              ].map(([label, value, detail]) => (
                <div key={String(label)} className="md:border-r md:border-white/10 md:pr-6 md:last:border-r-0">
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/54">{label}</div>
                  <div className="mt-3 text-5xl font-black italic tracking-[-0.06em] text-white">{nf(Number(value))}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">{detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Goleador", rankings.goleador?.nombre || "Sin datos", rankings.goleador?.equipo || "APA", rankings.goleador?.goles || 0],
              ["Asistidor", rankings.asistidor?.nombre || "Sin datos", rankings.asistidor?.equipo || "APA", rankings.asistidor?.asistencias || 0],
              ["MVP", rankings.mvp?.nombre || "Sin datos", rankings.mvp?.equipo || "APA", rankings.mvp?.mvps || 0],
            ].map(([label, name, club, value]) => (
              <div key={String(label)} className="relative border-l border-white/12 pl-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-100/60">{label}</div>
                <div className="mt-2 text-2xl font-black uppercase italic tracking-[-0.04em] text-white">{name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/42">{club}</div>
                <div className="absolute right-0 top-0 text-5xl font-black italic tracking-[-0.06em] text-white/16">{nf(Number(value))}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative py-10 md:py-16">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <div className="relative min-h-[540px] overflow-hidden rounded-[34px] md:rounded-[46px]">
            <img
              src="/themes/worldcup/backgrounds/stadium-aerial-night-01.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-28"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#020711_0%,rgba(2,7,17,.82)_28%,rgba(2,7,17,.58)_52%,rgba(2,7,17,.88)_100%)]" />
            <div className="absolute inset-x-8 top-8 h-px bg-white/10" />
            <div className="absolute inset-x-8 bottom-8 h-px bg-white/10" />

            <div className="relative z-10 flex min-h-[540px] flex-col justify-between p-6 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Chip>Partido destacado</Chip>
                  <h2 className="mt-4 max-w-[12ch] text-4xl font-black uppercase italic leading-[0.9] tracking-[-0.06em] md:text-6xl">
                    La noche del fixture
                  </h2>
                </div>
                <Link href="/fixture" className="hidden text-sm font-black uppercase tracking-[0.2em] text-cyan-100/68 md:block">
                  Ver fixture ↗
                </Link>
              </div>

              {partidoDestacado ? (
                <div className="grid items-center gap-8 md:grid-cols-[1fr_170px_1fr]">
                  <TeamMark nombre={partidoDestacado.local} logo={logoEquipo(partidoDestacado.local)} align="left" />

                  <div className="text-center">
                    <div className="text-6xl font-black italic tracking-[-0.08em] text-yellow-100 md:text-7xl">
                      {partidoDestacado.resultado || "VS"}
                    </div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.32em] text-white/42">
                      {partidoDestacado.fecha || partidoDestacado.dia || "Sin fecha"} · {partidoDestacado.hora || "Sin hora"}
                    </div>
                  </div>

                  <TeamMark nombre={partidoDestacado.visitante} logo={logoEquipo(partidoDestacado.visitante)} align="right" />
                </div>
              ) : (
                <div className="text-white/58">No hay partido destacado cargado.</div>
              )}

              <div className="grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/60">Próximos partidos</div>
                  <div className="mt-4 space-y-3">
                    {proximosPartidos.length > 0 ? proximosPartidos.map((p) => (
                      <div key={p.id || p.partido_id} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0">
                        <span className="text-sm font-semibold text-white/78">{p.local} <span className="text-white/35">vs</span> {p.visitante}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/42">{p.fecha || p.dia || "S/F"}</span>
                      </div>
                    )) : <div className="text-sm text-white/45">No hay próximos partidos cargados.</div>}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-100/60">Últimos resultados</div>
                  <div className="mt-4 space-y-3">
                    {ultimosResultados.length > 0 ? ultimosResultados.map((p) => (
                      <div key={p.id || p.partido_id} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0">
                        <span className="text-sm font-semibold text-white/78">{p.local} <span className="text-yellow-100">{p.resultado}</span> {p.visitante}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/42">{p.fecha || p.dia || "S/F"}</span>
                      </div>
                    )) : <div className="text-sm text-white/45">No hay resultados cargados.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {noticias.length > 0 && (
          <section className="relative py-10 md:py-16">
            <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-end">
              <div>
                <Chip>Noticias APA</Chip>
                <h2 className="mt-4 max-w-[12ch] text-4xl font-black uppercase italic leading-[0.9] tracking-[-0.06em] md:text-6xl">
                  Lo último de la liga
                </h2>
                <p className="mt-5 max-w-[34rem] text-sm leading-7 text-white/60">
                  Las noticias se muestran como una portada editorial, no como otra colección de cajas repetidas.
                </p>
              </div>

              <div className="border-l border-white/10 pl-5">
                {noticiaDestacada && (
                  <Link href={`/noticias/${noticiaDestacada.id}`} className="group block">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-100/60">
                      {fechaNoticia(noticiaDestacada.created_at)} · {noticiaDestacada.categoria || "APA"}
                    </div>
                    <div className="mt-3 text-3xl font-black uppercase italic leading-[0.95] tracking-[-0.05em] text-white group-hover:text-yellow-100 md:text-5xl">
                      {noticiaDestacada.titulo}
                    </div>
                    <p className="mt-4 max-w-[42rem] text-sm leading-7 text-white/66">{noticiaDestacada.descripcion}</p>
                  </Link>
                )}

                <div className="mt-8 space-y-4">
                  {noticiasSecundarias.map((noticia, index) => (
                    <Link key={noticia.id} href={`/noticias/${noticia.id}`} className="flex items-start justify-between gap-6 border-t border-white/10 pt-4 text-white/70 transition hover:text-white">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/32">0{index + 1}</div>
                        <div className="mt-1 text-lg font-black uppercase tracking-[-0.03em]">{noticia.titulo}</div>
                      </div>
                      <span className="text-cyan-100/70">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="relative py-10 md:py-16">
          <HeroCarruselHome />
        </section>
      </section>
    </main>
  );
}
