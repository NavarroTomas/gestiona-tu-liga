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

type ContextoCompetencia =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones";

type ContextoHome = {
  nombre: string;
  label: string;
  icon: string;
  competicion: ContextoCompetencia;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
  badge: string;
};

// Home simplificado: solo accesos principales, no una card por cada fase/grupo.
// Las páginas específicas de Fixture/Stats siguen teniendo los filtros completos.
const contextosHome: ContextoHome[] = [
  {
    nombre: "liga-primera",
    label: "Liga · Primera",
    icon: "I",
    competicion: "liga",
    division: "primera",
    divisionDb: "Primera",
    badge: "Primera",
  },
  {
    nombre: "liga-segunda",
    label: "Liga · Segunda",
    icon: "II",
    competicion: "liga",
    division: "segunda",
    divisionDb: "Segunda",
    badge: "Segunda",
  },
  {
    nombre: "clasificacion",
    label: "Clasificación a Copas",
    icon: "CL",
    competicion: "copa_clasificatoria",
    fase: "grupos",
    badge: "Grupos A-D",
  },
  {
    nombre: "copa-argentina",
    label: "Copa Argentina",
    icon: "CA",
    competicion: "copa_argentina",
    badge: "Eliminatoria",
  },
  {
    nombre: "copa-apa",
    label: "Copa APA",
    icon: "APA",
    competicion: "copa_apa",
    badge: "Eliminatoria",
  },
  {
    nombre: "copa-campeones",
    label: "Copa de Campeones",
    icon: "CC",
    competicion: "copa_campeones",
    badge: "Semifinal / Final",
  },
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
      <div
        className={`pointer-events-none absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${assets.tint} via-yellow-300 to-green-300 opacity-80`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-black/24" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function normalizarTexto(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function ordenarPartidos(a: any, b: any) {
  const fechaA = Number(a?.fecha || 999);
  const fechaB = Number(b?.fecha || 999);

  if (fechaA !== fechaB) return fechaA - fechaB;

  const horaA = String(a?.hora || "99:99");
  const horaB = String(b?.hora || "99:99");

  return horaA.localeCompare(horaB);
}

export default function Home() {
  const theme = getSeasonTheme();

  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<NoticiaHome[]>([]);
  const [division, setDivision] = useState("liga-primera");
  const [temporada, setTemporada] = useState("Temporada 4");

  const contextoActual =
    contextosHome.find((item) => item.nombre === division) || contextosHome[0];

  useEffect(() => {
    cargarDatos();
  }, [division, temporada]);

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    const { data, error } = await supabase
      .from("noticias")
      .select(
        "id, titulo, descripcion, temporada, categoria, imagen_url, autor, publicada, destacada, created_at, updated_at",
      )
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

  function aplicarFiltroContexto(query: any) {
    query = query
      .eq("temporada", temporada)
      .eq("competicion", contextoActual.competicion);

    if (contextoActual.competicion === "liga") {
      query = query.in(
        "division",
        [contextoActual.division, contextoActual.divisionDb].filter(Boolean),
      );
    }

    if (contextoActual.competicion === "copa_clasificatoria") {
      query = query.eq("fase", "grupos");
      if (contextoActual.grupo) query = query.eq("grupo", contextoActual.grupo);
    }

    if (
      contextoActual.competicion === "copa_argentina" ||
      contextoActual.competicion === "copa_apa" ||
      contextoActual.competicion === "copa_campeones"
    ) {
      if (contextoActual.fase) query = query.eq("fase", contextoActual.fase);
    }

    return query;
  }

  async function cargarDatos() {
    let partidosQuery = supabase
      .from("partidos")
      .select(
        "id, partido_id, local, visitante, resultado, fecha, temporada, division, competicion, fase, grupo, dia, hora",
      )
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    partidosQuery = aplicarFiltroContexto(partidosQuery);

    const { data: partidosData, error: partidosError } = await partidosQuery;

    if (partidosError) {
      console.log(partidosError);
      setPartidos([]);
      setJugadores([]);
      setClubesInfo([]);
      return;
    }

    const partidoIds = Array.from(
      new Set(
        (partidosData || [])
          .map((partido: any) => String(partido.partido_id || "").trim())
          .filter(Boolean),
      ),
    );

    let jugadoresData: any[] = [];

    if (partidoIds.length > 0) {
      const { data, error: jugadoresError } = await supabase
        .from("estadisticas_jugadores")
        .select(
          "id, partido_id, nombre, playerId, equipo, temporada, division, fecha, goals, assists, mvp",
        )
        .in("partido_id", partidoIds);

      if (jugadoresError) {
        console.log(jugadoresError);
      } else {
        jugadoresData = data || [];
      }
    }

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

    setPartidos([...(partidosData || [])].sort(ordenarPartidos));
    setJugadores(jugadoresData || []);
  }

  const divisionActual = {
    nombre: contextoActual.nombre,
    label: contextoActual.label,
    icon: contextoActual.icon,
  };

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) => normalizarTexto(c.nombre) === normalizarTexto(nombre),
    );

    return club?.logo_url || null;
  }

  const equiposCantidad = new Set(
    partidos.flatMap((p) => [p.local, p.visitante]).filter(Boolean),
  ).size;
  const jugadoresCantidad = new Set(
    jugadores
      .map((j) => String(j.playerId || j.nombre || "").trim())
      .filter(Boolean),
  ).size;

  const golesTotales = partidos.reduce((total, partido) => {
    const resultado = String(partido.resultado || "").trim();
    const match = resultado.match(/^(\d+)\s*[-:]\s*(\d+)$/);
    if (!match) return total;
    return total + Number(match[1]) + Number(match[2]);
  }, 0);

  const partidosOrdenados = useMemo(
    () => [...partidos].sort(ordenarPartidos),
    [partidos],
  );

  const partidoDestacado =
    partidosOrdenados.find((p) => !p.resultado) ||
    partidosOrdenados.filter((p) => p.resultado).slice(-1)[0] ||
    partidosOrdenados[0];

  const proximosPartidos = partidosOrdenados
    .filter((p) => !p.resultado)
    .slice(0, 4);
  const ultimosResultados = partidosOrdenados
    .filter((p) => p.resultado)
    .slice(-4)
    .reverse();

  const nombreCompetencia =
    contextoActual.competicion === "liga"
      ? "Liga"
      : contextoActual.competicion === "copa_clasificatoria"
        ? "Clasificación a Copas"
        : contextoActual.competicion === "copa_argentina"
          ? "Copa Argentina"
          : contextoActual.competicion === "copa_apa"
            ? "Copa APA"
            : "Copa de Campeones";

  const detalleCompetencia = contextoActual.badge || "Competencia";

  const statsHome = [
    {
      label: "Clubes",
      value: equiposCantidad,
      img: "/themes/worldcup/backgrounds/stadium-night-01.png",
      detail: detalleCompetencia || "Competencia",
      color: "text-sky-200",
    },
    {
      label: "Partidos",
      value: partidos.length,
      img: "/themes/worldcup/backgrounds/pitch-top-01.png",
      detail: nombreCompetencia,
      color: "text-yellow-300",
    },
    {
      label: "Jugadores",
      value: jugadoresCantidad,
      img: "/themes/worldcup/backgrounds/crowd-night-01.png",
      detail: "Con estadísticas",
      color: "text-emerald-200",
    },
    {
      label: "Goles",
      value: golesTotales,
      img: "/themes/worldcup/backgrounds/stadium-night-01.png",
      detail: temporada,
      color: "text-orange-200",
    },
  ];

  const accesos = [
    {
      href: "/competicion",
      title: "Competicion",
      desc: "Torneos, copas, fixture, stats e historia.",
      img: "/themes/worldcup/backgrounds/crowd-night-01.png",
      bg: "/themes/worldcup/backgrounds/crowd-night-01.png",
    },
    {
      href: `/fixture?temporada=${encodeURIComponent(temporada)}`,
      title: "Fixture",
      desc: "Calendario oficial por temporada y categoria.",
      img: "/themes/worldcup/backgrounds/pitch-top-01.png",
      bg: "/themes/worldcup/backgrounds/pitch-top-01.png",
    },
    {
      href: "/clubes",
      title: "Clubes",
      desc: "Escudos, planteles, identidad e historial.",
      img: "/themes/worldcup/backgrounds/stadium-night-01.png",
      bg: "/themes/worldcup/backgrounds/stadium-night-01.png",
    },
    {
      href: "/jugadores",
      title: "Jugadores",
      desc: "Rankings, perfiles, goles, MVP y rating.",
      img: "/themes/worldcup/backgrounds/stadium-aerial-night-01.png",
      bg: "/themes/worldcup/backgrounds/stadium-aerial-night-01.png",
    },
    {
      href: "/mercado",
      title: "Mercado",
      desc: "Fichajes, salidas, libres y prestamos.",
      img: "/themes/worldcup/backgrounds/pitch-top-01.png",
      bg: "/themes/worldcup/backgrounds/pitch-top-01.png",
    },
    {
      href: "/entretenimiento",
      title: "Entretenimiento",
      desc: "Predicciones, Dream Team y premios APA.",
      img: "/themes/worldcup/backgrounds/crowd-night-01.png",
      bg: "/themes/worldcup/backgrounds/crowd-night-01.png",
    },
    {
      href: "/guia",
      title: "Guia",
      desc: "Mapa completo para entender la web.",
      img: "/themes/worldcup/backgrounds/stadium-night-01.png",
      bg: "/themes/worldcup/backgrounds/stadium-night-01.png",
    },
    {
      href: "/historia",
      title: "Historia APA",
      desc: "Premios, records y estadisticas desde la Temporada 4.",
      img: "/themes/worldcup/backgrounds/crowd-night-01.png",
      bg: "/themes/worldcup/backgrounds/crowd-night-01.png",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020814] px-4 pb-4 pt-3 text-white md:px-6 md:pb-6 md:pt-4">
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src="/themes/worldcup/backgrounds/fondo-general.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />

        <div className="absolute inset-0 bg-[#020814]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,transparent_0%,rgba(2,8,20,.18)_38%,rgba(2,8,20,.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-16%,rgba(245,181,49,.10),transparent_31%),radial-gradient(circle_at_13%_18%,rgba(91,167,216,.08),transparent_30%),radial-gradient(circle_at_88%_24%,rgba(37,118,75,.07),transparent_27%)]" />
        <div className="absolute inset-x-[-10%] top-[9rem] h-[24rem] rounded-[50%] border-t border-yellow-100/10 bg-[radial-gradient(ellipse_at_top,rgba(245,181,49,.06),transparent_58%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_76%)]" />
      </div>

      <SeasonDecorations />

      <section className="relative z-10 mx-auto max-w-[1240px] space-y-10">
        <HeroImagenesHome />

        <HomeIntro
          theme={theme}
          temporada={temporada}
          divisionActual={divisionActual}
        />

        <MuralFrame variant="blue">
          <WorldCupExperience
            temporadas={temporadas}
            temporada={temporada}
            setTemporada={setTemporada}
            divisiones={contextosHome}
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
              divisionLabel={contextoActual.label}
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

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {noticias.map((noticia) => (
                <article
                  key={noticia.id}
                  className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur"
                >
                  {noticia.imagen_url && (
                    <img
                      src={noticia.imagen_url}
                      alt={noticia.titulo}
                      className="mb-3 h-36 w-full rounded-xl object-cover"
                    />
                  )}

                  <p className="text-[10px] uppercase tracking-[0.22em] text-yellow-300">
                    {noticia.categoria || "General"}
                  </p>

                  <h3 className="mt-2 text-lg font-black uppercase text-white">
                    {noticia.titulo}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-300">
                    {noticia.descripcion}
                  </p>

                  <p className="mt-3 text-[10px] uppercase text-zinc-500">
                    {fechaNoticia(noticia.created_at)}
                  </p>
                </article>
              ))}
            </section>
          </>
        )}

        <SeparadorHome label="Explorar APA" />
        <QuickAccessGrid accesos={accesos} />
        <HeroCarruselHome />
      </section>
    </main>
  );
}
