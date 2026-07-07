"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type PremioKey =
  "balon_oro" | "the_best" | "raiko_trophy" | "bota_oro" | "golden_boy";

type PremioConfig = {
  key: PremioKey;
  nombre: string;
  icono: string;
  descripcion: string;
};

type StatJugador = {
  partido_id?: string | null;
  nombre: string | null;
  playerId?: string | null;
  playerid?: string | null;
  equipo: string | null;
  temporada: string | null;
  division: string | null;
  posicion?: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  overallRating?: number | null;
  rating_apa?: number | null;
  score?: number | null;
  tackles?: number | null;
  interceptions?: number | null;
  passes?: number | null;
  gKSaves?: number | null;
  gKCatches?: number | null;
};

type PartidoOficial = {
  id: string | number;
  partido_id?: string | null;
  temporada?: string | null;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
  local?: string | null;
  visitante?: string | null;
  resultado?: string | null;
};

type Perfil = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  steam_id: string | null;
};

type Candidato = {
  playerid: string;
  nombre: string;
  equipo: string;
  divisionPrincipal: string;
  partidos: number;
  temporadasJugadas: number;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  ratingPromedio: number;
  atajadas: number;
  atrapadas: number;
  basePonderada: number;
  raikoPonderado: number;
  golesPonderados: number;
  goldenPonderado: number;
  influencia: number;
  bonusEquipo: number;
  competicionesResumen: string;
  puntos: number;
  posicion: number;
  steamId?: string | null;
  steamHours?: number | null;
  steamFound?: boolean;
  steamReason?: string | null;
  elegibleGoldenBoy?: boolean;
  motivoNoElegible?: string[];
};

type PremioGuardado = {
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

const temporadas = ["Temporada 4"];

const divisiones = ["Todas", "Primera", "Segunda"];

const PESO_RENDIMIENTO_INDIVIDUAL = 0.65;
const PESO_IMPACTO_EQUIPO = 0.20;
const PESO_LOGRO_COLECTIVO = 0.15;

const premios: PremioConfig[] = [
  {
    key: "balon_oro",
    nombre: "Balón de Oro",
    icono: "🏆",
    descripcion:
      "Premio máximo APA. Calcula rendimiento global con peso por competición, división, influencia individual y logro colectivo.",
  },
  {
    key: "the_best",
    nombre: "The Best",
    icono: "🏅",
    descripcion:
      "Mejor jugador de Segunda División. Cuenta todo su rendimiento oficial de temporada, incluyendo copas.",
  },
  {
    key: "raiko_trophy",
    nombre: "Raiko Trophy",
    icono: "🧤",
    descripcion:
      "Mejor arquero de la temporada. Mantiene peso por división y suma peso por competición, influencia y logro colectivo.",
  },
  {
    key: "bota_oro",
    nombre: "Bota de Oro",
    icono: "⚽",
    descripcion:
      "Máximo goleador de la temporada. Cuenta goles oficiales con peso por competición.",
  },
  {
    key: "golden_boy",
    nombre: "Golden Boy",
    icono: "⭐",
    descripcion:
      "Mejor promesa: máximo 2 temporadas, menos de 25 PJ y menos de 500 hs en PSO. Cuenta Liga y copas con pesos oficiales.",
  },
];

function valorGKSave(r: StatJugador) {
  return Number((r as any).gKSAVES || r.gKSaves || (r as any).gksaves || 0);
}

function valorGKCatches(r: StatJugador) {
  return Number(
    (r as any).gKCatches || (r as any).gKCATCHES || (r as any).gkcatches || 0,
  );
}

function normalizarPlayerId(stat: StatJugador) {
  return String(stat.playerId || stat.playerid || "").trim();
}

function nombrePremio(key: string) {
  return premios.find((p) => p.key === key)?.nombre || key;
}

function iconoPremio(key: string) {
  return premios.find((p) => p.key === key)?.icono || "🏆";
}

function normalizarDivision(division?: string | null) {
  return String(division || "")
    .toLowerCase()
    .trim();
}

function normalizarCompeticion(competicion?: string | null) {
  return String(competicion || "liga")
    .toLowerCase()
    .trim();
}

function pesoDivision(division?: string | null) {
  const d = normalizarDivision(division);

  if (d.includes("primera")) return 1;
  if (d.includes("segunda")) return 0.75;

  return 1;
}

function pesoCompeticion(competicion?: string | null) {
  const c = normalizarCompeticion(competicion);

  if (c === "liga") return 1;
  if (c === "copa_argentina") return 1.05;
  if (c === "copa_clasificatoria") return 0.95;
  if (c === "copa_apa") return 0.9;

  return 1;
}

function nombreCompeticion(competicion?: string | null) {
  const c = normalizarCompeticion(competicion);

  if (c === "liga") return "Liga";
  if (c === "copa_argentina") return "Copa Argentina";
  if (c === "copa_clasificatoria") return "Clasificación";
  if (c === "copa_apa") return "Copa APA";

  return competicion || "Competición";
}

function esSegundaDivision(division?: string | null) {
  return normalizarDivision(division).includes("segunda");
}

function calcularBaseStat(s: StatJugador) {
  const rating = Number(s.rating_apa ?? 0);

  return (
    Number(s.goals || 0) * 3 +
    Number(s.assists || 0) * 2 +
    Number(s.mvp || 0) * 10 +
    rating * 15 +
    Number(s.score || 0) / 5
  );
}

function calcularRaikoStat(s: StatJugador) {
  const rating = Number(s.rating_apa ?? 0);

  return (
    valorGKSave(s) * 2 +
    valorGKCatches(s) * 2 +
    Number(s.mvp || 0) * 10 +
    rating * 15
  );
}

function calcularGoldenStat(s: StatJugador) {
  const rating = Number(s.rating_apa ?? 0);

  return (
    Number(s.goals || 0) * 4 +
    Number(s.assists || 0) * 3 +
    Number(s.mvp || 0) * 8 +
    rating * 10 +
    Number(s.score || 0) / 10
  );
}

function golesReales(resultado?: string | null) {
  const texto = String(resultado || "").trim();
  if (!texto.includes("-")) return null;

  const [localRaw, visitanteRaw] = texto.split("-");
  const local = Number(localRaw?.trim());
  const visitante = Number(visitanteRaw?.trim());

  if (Number.isNaN(local) || Number.isNaN(visitante)) return null;

  return { local, visitante };
}

function ganadorPartido(partido: PartidoOficial) {
  const goles = golesReales(partido.resultado);
  if (!goles) return null;

  if (goles.local > goles.visitante) return partido.local || null;
  if (goles.visitante > goles.local) return partido.visitante || null;

  return null;
}

function faseValor(fase?: string | null) {
  const f = String(fase || "").toLowerCase();

  if (f.includes("final")) return 4;
  if (f.includes("semi")) return 3;
  if (f.includes("cuarto")) return 2;
  if (f.includes("octavo")) return 1;

  return 0;
}

function crearBonusEquipo(partidos: PartidoOficial[]) {
  const bonus: Record<string, number> = {};
  const liga: Record<
    string,
    Record<string, { pts: number; gf: number; gc: number }>
  > = {};
  const grupos: Record<
    string,
    Record<string, { pts: number; gf: number; gc: number }>
  > = {};
  const copas: Record<string, Record<string, number>> = {};

  function addTabla(
    tabla: Record<
      string,
      Record<string, { pts: number; gf: number; gc: number }>
    >,
    context: string,
    equipo: string,
    pts: number,
    gf: number,
    gc: number,
  ) {
    if (!tabla[context]) tabla[context] = {};
    if (!tabla[context][equipo])
      tabla[context][equipo] = { pts: 0, gf: 0, gc: 0 };
    tabla[context][equipo].pts += pts;
    tabla[context][equipo].gf += gf;
    tabla[context][equipo].gc += gc;
  }

  partidos.forEach((p) => {
    const comp = normalizarCompeticion(p.competicion);
    const local = String(p.local || "").trim();
    const visitante = String(p.visitante || "").trim();
    const goles = golesReales(p.resultado);

    if (!local || !visitante || !goles) return;

    if (comp === "liga") {
      const context = String(p.division || "Sin división");
      const ptsLocal =
        goles.local > goles.visitante
          ? 3
          : goles.local === goles.visitante
            ? 1
            : 0;
      const ptsVisitante =
        goles.visitante > goles.local
          ? 3
          : goles.local === goles.visitante
            ? 1
            : 0;

      addTabla(liga, context, local, ptsLocal, goles.local, goles.visitante);
      addTabla(
        liga,
        context,
        visitante,
        ptsVisitante,
        goles.visitante,
        goles.local,
      );
    }

    if (comp === "copa_clasificatoria") {
      const context = String(p.grupo || "Sin grupo");
      const ptsLocal =
        goles.local > goles.visitante
          ? 3
          : goles.local === goles.visitante
            ? 1
            : 0;
      const ptsVisitante =
        goles.visitante > goles.local
          ? 3
          : goles.local === goles.visitante
            ? 1
            : 0;

      addTabla(grupos, context, local, ptsLocal, goles.local, goles.visitante);
      addTabla(
        grupos,
        context,
        visitante,
        ptsVisitante,
        goles.visitante,
        goles.local,
      );
    }

    if (comp === "copa_argentina" || comp === "copa_apa") {
      const maxFase = faseValor(p.fase);
      if (!copas[comp]) copas[comp] = {};
      copas[comp][local] = Math.max(copas[comp][local] || 0, maxFase);
      copas[comp][visitante] = Math.max(copas[comp][visitante] || 0, maxFase);

      if (maxFase >= 4) {
        const ganador = ganadorPartido(p);
        if (ganador) {
          const perdedor = ganador === local ? visitante : local;
          bonus[`${comp}|${ganador}`] = Math.max(
            bonus[`${comp}|${ganador}`] || 0,
            comp === "copa_argentina" ? 0.06 : 0.04,
          );
          bonus[`${comp}|${perdedor}`] = Math.max(
            bonus[`${comp}|${perdedor}`] || 0,
            comp === "copa_argentina" ? 0.04 : 0.02,
          );
        }
      }
    }
  });

  Object.entries(liga).forEach(([division, tabla]) => {
    Object.entries(tabla)
      .sort(
        (a, b) =>
          b[1].pts - a[1].pts ||
          b[1].gf - b[1].gc - (a[1].gf - a[1].gc) ||
          b[1].gf - a[1].gf,
      )
      .forEach(([equipo], index) => {
        const valor =
          index === 0
            ? 0.08
            : index === 1
              ? 0.05
              : index === 2
                ? 0.03
                : index === 3
                  ? 0.02
                  : 0;
        if (valor > 0)
          bonus[`liga|${division}|${equipo}`] = Math.max(
            bonus[`liga|${division}|${equipo}`] || 0,
            valor,
          );
      });
  });

  Object.entries(grupos).forEach(([grupo, tabla]) => {
    Object.entries(tabla)
      .sort(
        (a, b) =>
          b[1].pts - a[1].pts ||
          b[1].gf - b[1].gc - (a[1].gf - a[1].gc) ||
          b[1].gf - a[1].gf,
      )
      .slice(0, 2)
      .forEach(([equipo]) => {
        bonus[`copa_clasificatoria|${grupo}|${equipo}`] = Math.max(
          bonus[`copa_clasificatoria|${grupo}|${equipo}`] || 0,
          0.03,
        );
      });
  });

  Object.entries(copas).forEach(([comp, equipos]) => {
    Object.entries(equipos).forEach(([equipo, maxFase]) => {
      if (maxFase >= 3) {
        const valor = comp === "copa_argentina" ? 0.02 : 0.015;
        bonus[`${comp}|${equipo}`] = Math.max(
          bonus[`${comp}|${equipo}`] || 0,
          valor,
        );
      }
    });
  });

  return bonus;
}

function obtenerBonusEquipo(
  bonus: Record<string, number>,
  partido: PartidoOficial | undefined,
  equipo: string,
) {
  if (!partido || !equipo) return 0;

  const comp = normalizarCompeticion(partido.competicion);

  if (comp === "liga")
    return bonus[`liga|${partido.division || "Sin división"}|${equipo}`] || 0;
  if (comp === "copa_clasificatoria")
    return (
      bonus[`copa_clasificatoria|${partido.grupo || "Sin grupo"}|${equipo}`] ||
      0
    );

  return bonus[`${comp}|${equipo}`] || 0;
}

function rendimientoIndividualPremio(
  premio: PremioKey,
  c: Omit<Candidato, "puntos" | "posicion">,
) {
  if (premio === "raiko_trophy") return c.raikoPonderado;

  if (premio === "bota_oro") {
    return (
      c.golesPonderados * 100000 +
      c.asistencias * 1000 +
      c.mvps * 100 +
      c.ratingPromedio
    );
  }

  if (premio === "golden_boy") return c.goldenPonderado;

  return c.basePonderada;
}

function calcularPuntos(
  premio: PremioKey,
  c: Omit<Candidato, "puntos" | "posicion">,
) {
  const rendimientoIndividual = rendimientoIndividualPremio(premio, c);

  const impactoEquipo = rendimientoIndividual * Math.min(1, Math.max(0, c.influencia));

  const logroColectivo =
    rendimientoIndividual * Math.min(1, Math.max(0, c.bonusEquipo * 10));

  return (
    rendimientoIndividual * PESO_RENDIMIENTO_INDIVIDUAL +
    impactoEquipo * PESO_IMPACTO_EQUIPO +
    logroColectivo * PESO_LOGRO_COLECTIVO
  );
}

export default function AdminPremiosPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Todas");
  const [premio, setPremio] = useState<PremioKey>("balon_oro");

  const [stats, setStats] = useState<StatJugador[]>([]);
  const [partidosOficiales, setPartidosOficiales] = useState<PartidoOficial[]>(
    [],
  );
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [premiosGuardados, setPremiosGuardados] = useState<PremioGuardado[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [calculandoSteam, setCalculandoSteam] = useState(false);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [steamCache, setSteamCache] = useState<
    Record<string, { found: boolean; hours: number; reason?: string | null }>
  >({});

  useEffect(() => {
    cargarDatos();
  }, [temporada, division]);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const { data: partidosData, error: partidosError } = await supabase
      .from("partidos")
      .select(
        "id,partido_id,temporada,division,competicion,fase,grupo,local,visitante,resultado",
      )
      .eq("temporada", temporada);

    if (partidosError) {
      console.log(partidosError);
      setPartidosOficiales([]);
      setStats([]);
      setPerfiles([]);
      setMensaje("Error cargando partidos oficiales: " + partidosError.message);
      setLoading(false);
      return;
    }

    const partidosLimpios = (partidosData || []) as unknown as PartidoOficial[];
    const partidoIds = Array.from(
      new Set(
        partidosLimpios
          .map((p: any) => String(p.partido_id || p.id || "").trim())
          .filter(Boolean),
      ),
    );

    setPartidosOficiales(partidosLimpios);

    let statsLimpias: StatJugador[] = [];

    if (partidoIds.length > 0) {
      const { data: statsData, error: statsError } = await supabase
        .from("estadisticas_jugadores")
        .select(
          "partido_id,nombre,playerId,equipo,temporada,division,posicion,goals,assists,mvp,overallRating,rating_apa,score,tackles,interceptions,passes,gKSaves,gKCatches",
        )
        .eq("temporada", temporada)
        .in("partido_id", partidoIds);

      if (statsError) {
        console.log(statsError);
        setStats([]);
        setPerfiles([]);
        setMensaje("Error cargando estadísticas: " + statsError.message);
      } else {
        statsLimpias = (statsData || []) as unknown as StatJugador[];
        setStats(statsLimpias);
      }
    } else {
      setStats([]);
    }

    const playerIds = Array.from(
      new Set(
        statsLimpias.map((stat) => normalizarPlayerId(stat)).filter(Boolean),
      ),
    );

    if (playerIds.length > 0) {
      const { data: perfilesData, error: perfilesError } = await supabase
        .from("profiles")
        .select("id,display_name,username,playerid,steam_id")
        .in("playerid", playerIds);

      if (perfilesError) {
        console.log(perfilesError);
        setPerfiles([]);
        setMensaje("Error cargando perfiles: " + perfilesError.message);
      } else {
        setPerfiles((perfilesData || []) as unknown as Perfil[]);
      }
    } else {
      setPerfiles([]);
    }

    const { data: premiosData, error: premiosError } = await supabase
      .from("premios_apa")
      .select(
        "id,temporada,division,premio,playerid,nombre,equipo,puntos,posicion,created_at",
      )
      .order("created_at", { ascending: false });

    if (premiosError) {
      console.log(premiosError);
      setPremiosGuardados([]);
      setMensaje("Error cargando premios: " + premiosError.message);
    } else {
      setPremiosGuardados((premiosData || []) as unknown as PremioGuardado[]);
    }

    setLoading(false);
  }

  const perfilesPorPlayerId = useMemo(() => {
    const mapa: Record<string, Perfil> = {};

    perfiles.forEach((p) => {
      const key = String(p.playerid || "").trim();
      if (key) mapa[key] = p;
    });

    return mapa;
  }, [perfiles]);

  const candidatosBase = useMemo(() => {
    const partidoPorId: Record<string, PartidoOficial> = {};

    partidosOficiales.forEach((p) => {
      const key = String(p.partido_id || p.id || "").trim();
      if (key) partidoPorId[key] = p;
    });

    const bonusEquipo = crearBonusEquipo(partidosOficiales);

    const statsValidas = stats.filter((s) => {
      const partido = partidoPorId[String(s.partido_id || "").trim()];
      if (!partido) return false;
      if (s.temporada !== temporada) return false;

      const divOficial = String(partido.division || s.division || "");
      if (division !== "Todas" && divOficial !== division) return false;

      return true;
    });

    const equipoTotales: Record<string, any> = {};

    statsValidas.forEach((s) => {
      const equipo = String(s.equipo || "Sin club");
      const key = `${s.partido_id}|${equipo}`;

      if (!equipoTotales[key]) {
        equipoTotales[key] = {
          goals: 0,
          assists: 0,
          mvp: 0,
          atajadas: 0,
          atrapadas: 0,
          tackles: 0,
          interceptions: 0,
        };
      }

      equipoTotales[key].goals += Number(s.goals || 0);
      equipoTotales[key].assists += Number(s.assists || 0);
      equipoTotales[key].mvp += Number(s.mvp || 0);
      equipoTotales[key].atajadas += valorGKSave(s);
      equipoTotales[key].atrapadas += valorGKCatches(s);
      equipoTotales[key].tackles += Number(s.tackles || 0);
      equipoTotales[key].interceptions += Number(s.interceptions || 0);
    });

    const mapa: Record<string, any> = {};

    statsValidas.forEach((s) => {
      const playerid = normalizarPlayerId(s);
      const nombre = String(s.nombre || "").trim();

      if (!playerid && !nombre) return;

      const key = playerid || nombre;
      const partido = partidoPorId[String(s.partido_id || "").trim()];
      const divisionOficial = partido?.division || s.division || "Sin división";
      const competicion = normalizarCompeticion(partido?.competicion);
      const pCompeticion = pesoCompeticion(competicion);
      const pDivision = pesoDivision(divisionOficial);
      const peso = pCompeticion * pDivision;
      const rating = Number(s.rating_apa ?? 0);
      const equipo = s.equipo || "Sin club";
      const equipoKey = `${s.partido_id}|${equipo}`;
      const totalesEquipo = equipoTotales[equipoKey] || {};
      const bonusPartidoEquipo = obtenerBonusEquipo(
        bonusEquipo,
        partido,
        equipo,
      );

      const participacionAtaque = Math.min(
        1,
        (Number(s.goals || 0) + Number(s.assists || 0)) /
          Math.max(
            1,
            Number(totalesEquipo.goals || 0) +
              Number(totalesEquipo.assists || 0),
          ),
      );
      const participacionMvp = Math.min(
        1,
        Number(s.mvp || 0) / Math.max(1, Number(totalesEquipo.mvp || 0)),
      );
      const participacionDefensiva = Math.min(
        1,
        (Number(s.tackles || 0) + Number(s.interceptions || 0)) /
          Math.max(
            1,
            Number(totalesEquipo.tackles || 0) +
              Number(totalesEquipo.interceptions || 0),
          ),
      );
      const participacionArquero = Math.min(
        1,
        (valorGKSave(s) + valorGKCatches(s)) /
          Math.max(
            1,
            Number(totalesEquipo.atajadas || 0) +
              Number(totalesEquipo.atrapadas || 0),
          ),
      );

      const influenciaPartido = Math.max(
        participacionAtaque,
        participacionMvp,
        participacionDefensiva,
        participacionArquero,
      );

      if (!mapa[key]) {
        mapa[key] = {
          playerid,
          nombre: nombre || "Jugador APA",
          equipo,
          partidos: 0,
          temporadasSet: new Set<string>(),
          divisionesConteo: {} as Record<string, number>,
          competicionesConteo: {} as Record<string, number>,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
          ratings: 0,
          atajadas: 0,
          atrapadas: 0,
          basePonderada: 0,
          raikoPonderado: 0,
          golesPonderados: 0,
          goldenPonderado: 0,
          influenciaTotal: 0,
          influenciaPartidos: 0,
          bonusEquipoTotal: 0,
          bonusEquipoPartidos: 0,
        };
      }

      mapa[key].partidos += 1;
      if (s.temporada) mapa[key].temporadasSet.add(s.temporada);
      if (divisionOficial) {
        mapa[key].divisionesConteo[divisionOficial] =
          (mapa[key].divisionesConteo[divisionOficial] || 0) + 1;
      }
      if (competicion) {
        const nombreComp = nombreCompeticion(competicion);
        mapa[key].competicionesConteo[nombreComp] =
          (mapa[key].competicionesConteo[nombreComp] || 0) + 1;
      }

      mapa[key].goles += Number(s.goals || 0);
      mapa[key].asistencias += Number(s.assists || 0);
      mapa[key].mvps += Number(s.mvp || 0);
      mapa[key].score += Number(s.score || 0);
      mapa[key].atajadas += valorGKSave(s);
      mapa[key].atrapadas += valorGKCatches(s);
      mapa[key].basePonderada += calcularBaseStat(s) * peso;
      mapa[key].raikoPonderado += calcularRaikoStat(s) * peso;
      mapa[key].golesPonderados += Number(s.goals || 0) * pCompeticion;
      mapa[key].goldenPonderado += calcularGoldenStat(s) * peso;
      mapa[key].influenciaTotal += influenciaPartido;
      mapa[key].influenciaPartidos += 1;
      mapa[key].bonusEquipoTotal += bonusPartidoEquipo;
      mapa[key].bonusEquipoPartidos += bonusPartidoEquipo > 0 ? 1 : 0;

      if (rating > 0) {
        mapa[key].ratingTotal += rating;
        mapa[key].ratings += 1;
      }

      if (s.equipo) mapa[key].equipo = s.equipo;
      if (s.nombre) mapa[key].nombre = s.nombre;
      if (playerid) mapa[key].playerid = playerid;
    });

    return Object.values(mapa).map((j: any) => {
      const divisionPrincipal =
        Object.entries(j.divisionesConteo || {}).sort(
          (a: any, b: any) => Number(b[1]) - Number(a[1]),
        )[0]?.[0] || "Sin división";

      const competicionesResumen = Object.entries(j.competicionesConteo || {})
        .sort((a: any, b: any) => Number(b[1]) - Number(a[1]))
        .map(([nombre, cantidad]) => `${nombre} ${cantidad}`)
        .join(" · ");

      const base = {
        playerid: j.playerid || "",
        nombre: j.nombre,
        equipo: j.equipo,
        divisionPrincipal,
        partidos: j.partidos,
        temporadasJugadas: j.temporadasSet.size,
        goles: j.goles,
        asistencias: j.asistencias,
        mvps: j.mvps,
        score: j.score,
        ratingPromedio:
          j.ratings > 0
            ? Math.round((j.ratingTotal / j.ratings) * 100) / 100
            : 0,
        atajadas: j.atajadas,
        atrapadas: j.atrapadas,
        basePonderada: j.basePonderada,
        raikoPonderado: j.raikoPonderado,
        golesPonderados: j.golesPonderados,
        goldenPonderado: j.goldenPonderado,
        influencia:
          j.influenciaPartidos > 0
            ? Math.round((j.influenciaTotal / j.influenciaPartidos) * 100) / 100
            : 0,
        bonusEquipo:
          j.bonusEquipoPartidos > 0
            ? Math.round((j.bonusEquipoTotal / j.bonusEquipoPartidos) * 100) /
              100
            : 0,
        competicionesResumen: competicionesResumen || "Sin competición",
      };

      return base;
    }) as Omit<Candidato, "puntos" | "posicion">[];
  }, [stats, temporada, division, partidosOficiales]);

  const candidatos = useMemo(() => {
    let lista = candidatosBase.map((c) => {
      const perfil = perfilesPorPlayerId[c.playerid];
      const steamId = perfil?.steam_id || null;
      const steamInfo = steamId ? steamCache[steamId] : null;

      const motivoNoElegible: string[] = [];
      let elegibleGoldenBoy = true;

      if (premio === "golden_boy") {
        if (c.temporadasJugadas > 2) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("más de 2 temporadas");
        }

        if (c.partidos >= 25) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("25 o más PJ");
        }

        if (!steamId) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("sin SteamID");
        } else if (!steamInfo) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("horas sin consultar");
        } else if (!steamInfo.found) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("horas no verificables");
        } else if (steamInfo.hours >= 500) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("500 hs o más");
        }
      }

      const item: Candidato = {
        ...c,
        puntos: Math.round(calcularPuntos(premio, c) * 10) / 10,
        posicion: 0,
        steamId,
        steamFound: steamInfo?.found,
        steamHours: steamInfo?.hours,
        steamReason: steamInfo?.reason || null,
        elegibleGoldenBoy,
        motivoNoElegible,
      };

      return item;
    });

    if (premio === "raiko_trophy") {
      lista = lista.filter((c) => c.atajadas > 0 || c.atrapadas > 0);
    }

    if (premio === "the_best") {
      lista = lista.filter((c) => esSegundaDivision(c.divisionPrincipal));
    }

    if (premio === "golden_boy") {
      lista = lista.filter((c) => c.elegibleGoldenBoy);
    }

    lista = lista
      .filter((c) => c.playerid)
      .sort((a, b) => b.puntos - a.puntos)
      .map((c, index) => ({
        ...c,
        posicion: index + 1,
      }));

    return lista;
  }, [candidatosBase, perfilesPorPlayerId, premio, steamCache]);

  const candidatosNoElegiblesGoldenBoy = useMemo(() => {
    if (premio !== "golden_boy") return [];

    return candidatosBase
      .map((c) => {
        const perfil = perfilesPorPlayerId[c.playerid];
        const steamId = perfil?.steam_id || null;
        const steamInfo = steamId ? steamCache[steamId] : null;

        const motivoNoElegible: string[] = [];

        if (c.temporadasJugadas > 2)
          motivoNoElegible.push("más de 2 temporadas");
        if (c.partidos >= 25) motivoNoElegible.push("25 o más PJ");
        if (!steamId) motivoNoElegible.push("sin SteamID");
        else if (!steamInfo) motivoNoElegible.push("horas sin consultar");
        else if (!steamInfo.found)
          motivoNoElegible.push("horas no verificables");
        else if (steamInfo.hours >= 500) motivoNoElegible.push("500 hs o más");

        return {
          ...c,
          steamId,
          steamFound: steamInfo?.found,
          steamHours: steamInfo?.hours,
          motivoNoElegible,
        };
      })
      .filter((c) => c.motivoNoElegible.length > 0)
      .slice(0, 10);
  }, [candidatosBase, perfilesPorPlayerId, premio, steamCache]);

  async function consultarHorasSteam() {
    if (premio !== "golden_boy") return;

    setCalculandoSteam(true);
    setMensaje("");

    const steamIds = Array.from(
      new Set(
        candidatosBase
          .map((c) => perfilesPorPlayerId[c.playerid]?.steam_id)
          .filter(Boolean) as string[],
      ),
    );

    if (steamIds.length === 0) {
      setMensaje("No hay SteamID cargados para consultar.");
      setCalculandoSteam(false);
      return;
    }

    const nuevoCache = { ...steamCache };

    for (const steamId of steamIds) {
      if (nuevoCache[steamId]) continue;

      try {
        const res = await fetch(
          `/api/steam/hours?steamId=${encodeURIComponent(steamId)}`,
          {
            cache: "no-store",
          },
        );

        const data = await res.json();

        nuevoCache[steamId] = {
          found: !!data.found,
          hours: Number(data.hours || 0),
          reason: data.reason || null,
        };
      } catch (error) {
        console.log(error);
        nuevoCache[steamId] = {
          found: false,
          hours: 0,
          reason: "No se pudo consultar Steam.",
        };
      }
    }

    setSteamCache(nuevoCache);
    setCalculandoSteam(false);
  }

  async function notificarPremioGanado(candidato: Candidato) {
    const perfil = perfilesPorPlayerId[candidato.playerid];

    if (!perfil?.id) {
      console.log(
        "No hay perfil vinculado para notificar premio:",
        candidato.playerid,
      );
      return;
    }

    const premioTexto = nombrePremio(premio);
    const mensajePremio = `Ganaste ${premioTexto} - ${temporada}${division !== "Todas" ? ` · ${division}` : ""}.`;

    const haceCincoMinutos = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: existente, error: existenteError } = await supabase
      .from("notificaciones")
      .select("id")
      .eq("user_id", perfil.id)
      .eq("tipo", "award")
      .eq("titulo", "Premio recibido")
      .eq("mensaje", mensajePremio)
      .gte("created_at", haceCincoMinutos)
      .limit(1);

    if (existenteError) {
      console.log(existenteError);
    }

    if (existente && existente.length > 0) {
      return;
    }

    const { error } = await supabase.from("notificaciones").insert({
      user_id: perfil.id,
      tipo: "award",
      titulo: "Premio recibido",
      mensaje: mensajePremio,
      href: "/perfil",
      leida: false,
    });

    if (error) {
      console.log("No pude crear notificación de premio:", error);
    }
  }

  async function asignarGanador(candidato: Candidato) {
    if (!candidato.playerid) {
      setMensaje("Este candidato no tiene PlayerId.");
      return;
    }

    const confirmar = window.confirm(
      `¿Asignar ${iconoPremio(premio)} ${nombrePremio(premio)} a ${candidato.nombre}?`,
    );

    if (!confirmar) return;

    setGuardandoId(candidato.playerid);
    setMensaje("");

    const { error } = await supabase.from("premios_apa").insert({
      temporada,
      division: division === "Todas" ? candidato.divisionPrincipal : division,
      premio,
      playerid: candidato.playerid,
      nombre: candidato.nombre,
      equipo: candidato.equipo,
      puntos: candidato.puntos,
      posicion: candidato.posicion,
    });

    setGuardandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error guardando premio: " + error.message);
      return;
    }

    await notificarPremioGanado(candidato);

    setMensaje(
      "Premio asignado correctamente y notificación enviada si el jugador tiene perfil vinculado.",
    );
    await cargarDatos();
  }

  async function borrarPremio(id: number) {
    const confirmar = window.confirm("¿Borrar este premio?");
    if (!confirmar) return;

    const { error } = await supabase.from("premios_apa").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error borrando premio: " + error.message);
      return;
    }

    setMensaje("Premio borrado.");
    await cargarDatos();
  }

  const premioActual = premios.find((p) => p.key === premio) || premios[0];

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
          <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(250,204,21,.16)] sm:rounded-[38px] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25" />

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300 sm:text-xs sm:tracking-[0.45em]">
                Premios APA
              </p>

              <h1 className="mt-4 text-[clamp(2.3rem,8vw,5rem)] font-black uppercase italic leading-none">
                Trofeos individuales
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
                Seleccioná temporada y premio. APA calcula automáticamente los
                candidatos y el staff solamente confirma al ganador.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[460px_1fr]">
            <aside className="space-y-6">
              <section className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                  Configuración
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                  Seleccionar premio
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                      Temporada
                    </label>
                    <select
                      value={temporada}
                      onChange={(e) => setTemporada(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                    >
                      {temporadas.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                      División
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                    >
                      {divisiones.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                      Premio
                    </label>
                    <select
                      value={premio}
                      onChange={(e) => setPremio(e.target.value as PremioKey)}
                      className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                    >
                      {premios.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.icono} {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                    <p className="text-4xl">{premioActual.icono}</p>
                    <h3 className="mt-3 text-2xl font-black uppercase">
                      {premioActual.nombre}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {premioActual.descripcion}
                    </p>

                    {(premio === "balon_oro" ||
                      premio === "raiko_trophy" ||
                      premio === "golden_boy") && (
                      <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold leading-5 text-yellow-200">
                        Fórmula: 65% rendimiento individual · 20% impacto en el equipo · 15% logro colectivo. Pesos: Liga x1.00 · Copa Argentina x1.05 · Clasificación x0.95 · Copa APA x0.90 · Primera x1.00 · Segunda x0.75
                      </p>
                    )}

                    {premio === "the_best" && (
                      <p className="mt-3 rounded-xl border border-purple-400/20 bg-purple-400/10 p-3 text-xs font-bold leading-5 text-purple-200">
                        Solo compiten jugadores cuya división principal sea Segunda. También cuentan sus partidos de copas oficiales. Fórmula: 65% rendimiento individual · 20% impacto en el equipo · 15% logro colectivo.
                      </p>
                    )}
                  </div>

                  {premio === "golden_boy" && (
                    <button
                      type="button"
                      onClick={consultarHorasSteam}
                      disabled={calculandoSteam || loading}
                      className="w-full rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {calculandoSteam
                        ? "Consultando Steam..."
                        : "Consultar horas Steam"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={cargarDatos}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm font-black uppercase text-zinc-300 transition hover:border-yellow-400/40 hover:text-white disabled:opacity-50"
                  >
                    Actualizar datos
                  </button>

                  {mensaje && (
                    <p className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
                      {mensaje}
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Premios cargados
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase">
                  Historial
                </h2>

                <div className="mt-5 space-y-3">
                  {premiosGuardados.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                      Todavía no hay premios cargados.
                    </p>
                  ) : (
                    premiosGuardados.map((p) => (
                      <article
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-lg font-black uppercase text-white">
                              {iconoPremio(p.premio)} {nombrePremio(p.premio)}
                            </p>
                            <p className="mt-1 truncate text-sm font-black uppercase tracking-[0.12em] text-yellow-300">
                              {p.nombre}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {p.temporada}
                              {p.division ? ` · ${p.division}` : ""} ·{" "}
                              {p.equipo || "Sin club"} ·{" "}
                              {Number(p.puntos || 0).toFixed(1)} pts
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => borrarPremio(p.id)}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                          >
                            Borrar
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </aside>

            <section className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] md:p-6">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Ranking automático
                  </p>

                  <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                    {premioActual.icono} Candidatos
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {temporada}{" "}
                    {division !== "Todas"
                      ? `· ${division}`
                      : "· Todas las divisiones"}
                  </p>
                </div>

                <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-300">
                  {candidatos.length} candidatos
                </span>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Cargando datos...
                </p>
              ) : premio === "golden_boy" &&
                Object.keys(steamCache).length === 0 ? (
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5">
                  <p className="font-black uppercase text-sky-300">
                    Primero consultá las horas de Steam.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Golden Boy necesita verificar automáticamente que el jugador
                    tenga menos de 500 horas de Pro Soccer Online.
                  </p>
                </div>
              ) : candidatos.length === 0 ? (
                <div className="space-y-4">
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    No hay candidatos para este premio con los filtros actuales.
                  </p>

                  {premio === "golden_boy" &&
                    candidatosNoElegiblesGoldenBoy.length > 0 && (
                      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
                        <p className="font-black uppercase text-red-300">
                          Jugadores descartados
                        </p>

                        <div className="mt-4 space-y-2">
                          {candidatosNoElegiblesGoldenBoy.map((c) => (
                            <div
                              key={c.playerid || c.nombre}
                              className="rounded-xl border border-red-400/10 bg-black/25 p-3 text-sm"
                            >
                              <p className="font-black text-white">
                                {c.nombre}
                              </p>
                              <p className="text-red-200">
                                {c.motivoNoElegible.join(", ")}
                                {typeof c.steamHours === "number"
                                  ? ` · ${c.steamHours} hs`
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  {candidatos.slice(0, 10).map((c) => (
                    <article
                      key={c.playerid}
                      className="rounded-[24px] border border-white/10 bg-black/35 p-4 transition hover:border-yellow-400/35 hover:bg-yellow-400/5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                              c.posicion === 1
                                ? "bg-yellow-400 text-black"
                                : c.posicion === 2
                                  ? "bg-zinc-200 text-black"
                                  : c.posicion === 3
                                    ? "bg-orange-500 text-black"
                                    : "bg-white/10 text-zinc-400"
                            }`}
                          >
                            {c.posicion}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xl font-black uppercase text-white">
                              {c.nombre}
                            </p>
                            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                              {c.equipo} · {c.divisionPrincipal} · {c.partidos}{" "}
                              PJ · RT {c.ratingPromedio}
                            </p>

                            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-sky-300">
                              {c.competicionesResumen}
                            </p>

                            {(premio === "balon_oro" ||
                              premio === "raiko_trophy" ||
                              premio === "golden_boy") && (
                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-yellow-300">
                                División x
                                {pesoDivision(c.divisionPrincipal).toFixed(2)} ·
                                Influencia {(c.influencia * 100).toFixed(0)}% ·
                                Equipo +{(c.bonusEquipo * 100).toFixed(0)}%
                              </p>
                            )}

                            {premio === "the_best" && (
                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-purple-300">
                                Segunda División · Copas incluidas
                              </p>
                            )}

                            {premio === "golden_boy" && (
                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-sky-300">
                                {typeof c.steamHours === "number"
                                  ? `${c.steamHours} hs PSO`
                                  : "Horas no consultadas"}
                                {" · "}
                                {c.temporadasJugadas} temp.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:w-[520px] md:grid-cols-8">
                          {[
                            ["G", c.goles],
                            ["A", c.asistencias],
                            ["MVP", c.mvps],
                            ["SCORE", c.score],
                            ["ATAJ", c.atajadas],
                            ["IMP", `${Math.round(c.influencia * 100)}%`],
                            ["LOG", `${Math.round(c.bonusEquipo * 100)}%`],
                            ["PTS", c.puntos.toFixed(1)],
                          ].map(([label, value]) => (
                            <div
                              key={String(label)}
                              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-center"
                            >
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                {label}
                              </p>
                              <p className="mt-1 text-sm font-black text-yellow-300">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => asignarGanador(c)}
                        disabled={guardandoId === c.playerid}
                        className="mt-4 w-full rounded-2xl border border-yellow-400/30 bg-yellow-400 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {guardandoId === c.playerid
                          ? "Guardando..."
                          : "Asignar ganador"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </section>
      </main>
    </PermissionGuard>
  );
}
