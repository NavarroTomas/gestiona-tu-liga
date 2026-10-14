"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";
import { getMyAdminPermissions, hasPermission } from "@/lib/adminPermissions";
import {
  matchIds,
  normalizeCompetition,
  normalizeDivision,
  normalizeGroup,
  normalizePhase,
  normalizeSeason,
  parseScore,
} from "@/lib/competitionData";

interface Partido {
  id: string;
  local: string;
  visitante: string;
  resultado: string | null;
  fecha: string | null;
  partido_id?: string | null;
  dia?: string | null;
  hora?: string | null;
  temporada?: string | null;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
}

interface EstadisticasJugador {
  jugador: string;
  playerId: string;
  goles: number;
  asistencias: number;
  mvps: number;
}


interface ResumenCompeticion {
  key: string;
  nombre: string;
  contexto: string;
  estado: "En curso" | "Finalizada" | "Pendiente";
  detalle: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  puntos?: number;
  posicion?: number | null;
}

interface ClubVisual {
  id?: string | number;
  nombre: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  descripcion?: string | null;
  color_principal?: string | null;
}

interface EquipoTemporada {
  club_id?: string | number | null;
  nombre: string;
  temporada: string;
  division: string;
  activo?: boolean | null;
  club_slug?: string | null;
  slug?: string | null;
}

type ResultadoEquipo = "G" | "E" | "P" | "-";


const DIVISION_LABELS: Record<string, string> = {
  primera: "Primera",
  segunda: "Segunda",
  Primera: "Primera",
  Segunda: "Segunda",
};

export default function PaginaEquipo() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSeason = searchParams.get("temporada");
  const previewDraft = searchParams.get("preview") === "1";
  const { seasons, activeSeason, loading: seasonsLoading } = usePublicSeasons("Temporada 4");
  const [canPreviewDraft, setCanPreviewDraft] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(!previewDraft);
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(requestedSeason || "Temporada 4");

  const nombreEquipoUrl = params?.nombre
    ? decodeURIComponent(params.nombre as string)
    : "";

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [plantel, setPlantel] = useState<EstadisticasJugador[]>([]);
  const [lideresHistoricos, setLideresHistoricos] = useState<EstadisticasJugador[]>([]);
  const [clubVisual, setClubVisual] = useState<ClubVisual | null>(null);
  const [equipoTemporada, setEquipoTemporada] =
    useState<EquipoTemporada | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombreRealEquipo, setNombreRealEquipo] = useState(nombreEquipoUrl);
  const [posicionLiga, setPosicionLiga] = useState<number | null>(null);
  const [titulos, setTitulos] = useState<any[]>([]);
  const [resumenCompeticiones, setResumenCompeticiones] = useState<ResumenCompeticion[]>([]);

  const [stats, setStats] = useState({
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    puntos: 0,
    racha: [] as ResultadoEquipo[],
  });

  useEffect(() => {
    let cancelled = false;

    async function checkPreviewPermission() {
      if (!previewDraft) {
        setCanPreviewDraft(false);
        setPreviewChecked(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setCanPreviewDraft(false);
        setPreviewChecked(true);
        return;
      }

      try {
        const permissions = await getMyAdminPermissions(user.id);
        if (cancelled) return;
        setCanPreviewDraft(hasPermission(permissions, "clubs.manage"));
      } catch {
        if (!cancelled) setCanPreviewDraft(false);
      } finally {
        if (!cancelled) setPreviewChecked(true);
      }
    }

    void checkPreviewPermission();
    return () => {
      cancelled = true;
    };
  }, [previewDraft]);

  useEffect(() => {
    if (seasonsLoading || !previewChecked) return;

    const requestedAllowed =
      Boolean(requestedSeason) &&
      (seasons.includes(requestedSeason as string) || (previewDraft && canPreviewDraft));

    setTemporadaSeleccionada(
      requestedAllowed && requestedSeason ? requestedSeason : activeSeason,
    );
  }, [activeSeason, requestedSeason, seasons, seasonsLoading, previewDraft, canPreviewDraft, previewChecked]);

  useEffect(() => {
    if (!nombreEquipoUrl || seasonsLoading || !previewChecked) return;
    fetchDatosEquipo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombreEquipoUrl, temporadaSeleccionada, seasonsLoading, previewChecked]);

  function normalizar(texto?: string | null) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function slugify(texto: string) {
    return normalizar(texto)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function divisionParaPartidos(division?: string | null) {
    if (!division) return ["Primera", "primera"];
    const limpia = String(division).trim();
    const lower = limpia.toLowerCase();
    const label = DIVISION_LABELS[limpia] || DIVISION_LABELS[lower] || limpia;
    return Array.from(new Set([limpia, lower, label]));
  }

  function calcularStatsEquipo(nombre: string, listaPartidos: Partido[]) {
    let pj = 0;
    let pg = 0;
    let pe = 0;
    let pp = 0;
    let gf = 0;
    let gc = 0;
    let puntos = 0;
    const rachaAux: ResultadoEquipo[] = [];
    const nombreNorm = normalizar(nombre);

    listaPartidos.forEach((partido: any) => {
      if (!partido.resultado || !String(partido.resultado).includes("-")) return;

      const golesLocal = parseInt(String(partido.resultado).split("-")[0].trim());
      const golesVisitante = parseInt(
        String(partido.resultado).split("-")[1].trim(),
      );

      if (isNaN(golesLocal) || isNaN(golesVisitante)) return;

      const esLocal = normalizar(partido.local) === nombreNorm;
      const esVisitante = normalizar(partido.visitante) === nombreNorm;

      if (!esLocal && !esVisitante) return;

      pj++;

      const golesFavor = esLocal ? golesLocal : golesVisitante;
      const golesContra = esLocal ? golesVisitante : golesLocal;

      gf += golesFavor;
      gc += golesContra;

      if (golesFavor > golesContra) {
        pg++;
        puntos += 3;
        rachaAux.push("G");
      } else if (golesFavor === golesContra) {
        pe++;
        puntos += 1;
        rachaAux.push("E");
      } else {
        pp++;
        rachaAux.push("P");
      }
    });

    return {
      pj,
      pg,
      pe,
      pp,
      gf,
      gc,
      puntos,
      racha: rachaAux.slice(-5),
    };
  }

  async function buscarClubEnVista() {
    const slugUrl = slugify(nombreEquipoUrl);
    const nombreNorm = normalizar(nombreEquipoUrl);

    const { data, error } = await supabase
      .from("v_clubes_temporada_public")
      .select("*")
      .eq("temporada", temporadaSeleccionada)
      .eq("activo", true)
      .limit(500);

    if (error) {
      console.error("ERROR CARGANDO CLUB DESDE VISTA:", error);
      return null;
    }

    const clubes = data || [];

    return (
      clubes.find((c: any) => normalizar(c.slug || c.club_slug) === slugUrl) ||
      clubes.find((c: any) => normalizar(c.nombre) === nombreNorm) ||
      clubes.find((c: any) => slugify(c.nombre || "") === slugUrl) ||
      null
    );
  }

  async function buscarClubFallback() {
    const slugUrl = slugify(nombreEquipoUrl);
    const nombreNorm = normalizar(nombreEquipoUrl);

    const { data, error } = await supabase
      .from("clubes_info")
      .select(
        "id, nombre, slug, logo_url, banner_url, descripcion, color_principal",
      )
      .limit(500);

    if (error) {
      console.error("ERROR CARGANDO CLUB FALLBACK:", error);
      return null;
    }

    const club = (data || []).find(
      (c: any) =>
        normalizar(c.slug) === slugUrl ||
        normalizar(c.nombre) === nombreNorm ||
        slugify(c.nombre || "") === slugUrl,
    );

    if (!club) return null;

    return {
      club_id: club.id,
      nombre: club.nombre,
      slug: club.slug,
      logo_url: club.logo_url,
      banner_url: club.banner_url,
      descripcion: club.descripcion,
      color_principal: club.color_principal,
      temporada: temporadaSeleccionada,
      division: "segunda",
      activo: true,
    };
  }

  function nombreCompeticion(partido: Partido) {
    const key = normalizeCompetition(partido.competicion, partido.division);
    if (key === "liga") return `Liga ${divisionBonita(partido.division)}`;
    if (key === "copa_clasificatoria") return "Clasificación a Copas";
    if (key === "copa_argentina") return "Copa Argentina";
    if (key === "copa_apa") return "Copa de la Liga";
    if (key === "copa_campeones") return "Copa de Campeones";
    if (key === "playoffs") return "Playoffs de Ascenso";
    return partido.competicion || "Competición";
  }

  function contextoCompeticion(partido: Partido) {
    const key = normalizeCompetition(partido.competicion, partido.division);
    if (key === "liga") return divisionBonita(partido.division);
    if (key === "copa_clasificatoria") {
      const grupo = normalizeGroup(partido.grupo);
      return grupo ? `Grupo ${grupo}` : "Fase de grupos";
    }
    const fase = normalizePhase(partido.fase);
    const labels: Record<string, string> = {
      octavos: "Octavos de final",
      cuartos: "Cuartos de final",
      semifinal: "Semifinal",
      final: "Final",
      final_ascenso: "Final de Ascenso",
      promocion: "Promoción",
    };
    return labels[fase] || partido.fase || "Sin fase";
  }

  function construirResumenCompeticiones(
    nombreClub: string,
    todosPartidos: Partido[],
    clubesTemporada: any[],
  ): ResumenCompeticion[] {
    const clubNorm = normalizar(nombreClub);
    const partidosClub = todosPartidos.filter(
      (p) => normalizar(p.local) === clubNorm || normalizar(p.visitante) === clubNorm,
    );
    const grupos = new Map<string, Partido[]>();

    for (const partido of partidosClub) {
      const competition = normalizeCompetition(partido.competicion, partido.division);
      const context =
        competition === "liga"
          ? normalizeDivision(partido.division)
          : competition === "copa_clasificatoria"
            ? normalizeGroup(partido.grupo)
            : normalizePhase(partido.fase);
      const key = `${competition}__${context || "general"}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(partido);
    }

    return Array.from(grupos.entries())
      .map(([key, lista]) => {
        const referencia = lista[0];
        const competition = normalizeCompetition(referencia.competicion, referencia.division);
        const calculadas = calcularStatsEquipo(nombreClub, lista);
        const finalizados = lista.filter((p) => parseScore(p.resultado)).length;
        const pendientes = lista.length - finalizados;
        const estado: ResumenCompeticion["estado"] =
          finalizados === 0 ? "Pendiente" : pendientes > 0 ? "En curso" : "Finalizada";

        let posicion: number | null = null;
        let detalle = contextoCompeticion(referencia);

        if (competition === "liga" || competition === "copa_clasificatoria") {
          const mismos = todosPartidos.filter((p) => {
            if (normalizeCompetition(p.competicion, p.division) !== competition) return false;
            if (competition === "liga") {
              return normalizeDivision(p.division) === normalizeDivision(referencia.division);
            }
            return normalizeGroup(p.grupo) === normalizeGroup(referencia.grupo);
          });
          const equipos = new Set<string>();
          mismos.forEach((p) => {
            if (p.local) equipos.add(p.local);
            if (p.visitante) equipos.add(p.visitante);
          });
          clubesTemporada.forEach((c: any) => {
            if (
              competition === "liga" &&
              normalizeDivision(c.division) === normalizeDivision(referencia.division)
            ) equipos.add(c.nombre);
          });
          const tabla = Array.from(equipos)
            .map((equipo) => {
              const st = calcularStatsEquipo(equipo, mismos);
              return { equipo, ...st, dg: st.gf - st.gc };
            })
            .sort((a, b) =>
              b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo),
            );
          const idx = tabla.findIndex((x) => normalizar(x.equipo) === clubNorm);
          posicion = idx >= 0 ? idx + 1 : null;
          detalle = `${contextoCompeticion(referencia)}${posicion ? ` · ${posicion}° puesto` : ""}`;
        } else {
          const ordenFases = ["octavos", "cuartos", "semifinal", "final", "final_ascenso", "promocion"];
          const fasesJugadas = partidosClub
            .filter((p) => normalizeCompetition(p.competicion, p.division) === competition)
            .map((p) => normalizePhase(p.fase))
            .filter(Boolean);
          const faseMax = fasesJugadas.sort(
            (a, b) => ordenFases.indexOf(b) - ordenFases.indexOf(a),
          )[0];
          if (faseMax) {
            const labels: Record<string, string> = {
              octavos: "Octavos de final",
              cuartos: "Cuartos de final",
              semifinal: "Semifinal",
              final: "Final",
              final_ascenso: "Final de Ascenso",
              promocion: "Promoción",
            };
            detalle = `Instancia alcanzada: ${labels[faseMax] || faseMax}`;
          }
        }

        return {
          key,
          nombre: nombreCompeticion(referencia),
          contexto: contextoCompeticion(referencia),
          estado,
          detalle,
          pj: calculadas.pj,
          pg: calculadas.pg,
          pe: calculadas.pe,
          pp: calculadas.pp,
          gf: calculadas.gf,
          gc: calculadas.gc,
          puntos: competition === "liga" || competition === "copa_clasificatoria" ? calculadas.puntos : undefined,
          posicion,
        };
      })
      .sort((a, b) => {
        const orden = ["Liga", "Clasificación", "Copa Argentina", "Copa de la Liga", "Copa de Campeones", "Playoffs"];
        return orden.findIndex((x) => a.nombre.startsWith(x)) - orden.findIndex((x) => b.nombre.startsWith(x));
      });
  }

  async function fetchDatosEquipo() {
    try {
      setLoading(true);

      const clubTemporada = (await buscarClubEnVista()) || (await buscarClubFallback());

      if (!clubTemporada) {
        setNombreRealEquipo(nombreEquipoUrl);
        setClubVisual(null);
        setEquipoTemporada(null);
        setPartidos([]);
        setPlantel([]);
        setLideresHistoricos([]);
        setTitulos([]);
        setPosicionLiga(null);
        setResumenCompeticiones([]);
        setStats({
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
          puntos: 0,
          racha: [],
        });
        return;
      }

      const nombreExacto = clubTemporada.nombre || nombreEquipoUrl;
      const temporadaActual = clubTemporada.temporada || temporadaSeleccionada;
      const divisionActual = clubTemporada.division || "segunda";
      const slugClub = clubTemporada.slug || clubTemporada.club_slug || slugify(nombreExacto);

      setNombreRealEquipo(nombreExacto);

      setClubVisual({
        id: clubTemporada.club_id || clubTemporada.id,
        nombre: nombreExacto,
        slug: slugClub,
        logo_url: clubTemporada.logo_url || null,
        banner_url: clubTemporada.banner_url || null,
        descripcion: clubTemporada.descripcion || null,
        color_principal: clubTemporada.color_principal || null,
      });

      setEquipoTemporada({
        club_id: clubTemporada.club_id || clubTemporada.id,
        nombre: nombreExacto,
        temporada: temporadaActual,
        division: divisionActual,
        activo: clubTemporada.activo ?? true,
        club_slug: slugClub,
        slug: slugClub,
      });

      const divisionesPartidos = divisionParaPartidos(divisionActual);

      const { data: partidosData, error: partidosError } = await supabase
        .from("partidos")
        .select(
          "id, partido_id, local, visitante, resultado, fecha, temporada, division, competicion, fase, grupo, dia, hora",
        )
        .limit(3000);

      if (partidosError) {
        console.error("ERROR CARGANDO PARTIDOS:", partidosError);
      }

      const partidosTemporada = ((partidosData || []) as Partido[]).filter(
        (p) => normalizeSeason(p.temporada) === normalizeSeason(temporadaActual),
      );
      const partidosDeDivision = partidosTemporada.filter(
        (p) =>
          normalizeCompetition(p.competicion, p.division) === "liga" &&
          normalizeDivision(p.division) === normalizeDivision(divisionActual),
      );

      const partidosDelEquipo = partidosTemporada.filter(
        (p: any) =>
          normalizar(p.local) === normalizar(nombreExacto) ||
          normalizar(p.visitante) === normalizar(nombreExacto),
      );

      setPartidos(partidosDelEquipo);

      const statsCalculadas = calcularStatsEquipo(nombreExacto, partidosDelEquipo);
      setStats(statsCalculadas);

      const { data: clubesDivision } = await supabase
        .from("v_clubes_temporada_public")
        .select("*")
        .eq("temporada", temporadaActual)
        .eq("activo", true)
        .limit(500);

      const tablaCompetencia = (clubesDivision || [])
        .filter((club: any) => normalizar(club.division) === normalizar(divisionActual))
        .map((club: any) => {
          const s = calcularStatsEquipo(club.nombre, partidosDeDivision);
          return {
            nombre: club.nombre,
            puntos: s.puntos,
            diferencia: s.gf - s.gc,
            gf: s.gf,
          };
        })
        .sort((a: any, b: any) => {
          if (b.puntos !== a.puntos) return b.puntos - a.puntos;
          if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
          if (b.gf !== a.gf) return b.gf - a.gf;
          return String(a.nombre || "").localeCompare(String(b.nombre || ""));
        });

      const posicion = tablaCompetencia.findIndex(
        (e: any) => normalizar(e.nombre) === normalizar(nombreExacto),
      );

      setPosicionLiga(posicion >= 0 ? posicion + 1 : null);
      setResumenCompeticiones(
        construirResumenCompeticiones(nombreExacto, partidosTemporada, clubesDivision || []),
      );

      const { data: titulosData } = await supabase
        .from("titulos")
        .select("id, equipo, competicion, temporada, division, descripcion, created_at")
        .ilike("equipo", nombreExacto)
        .eq("temporada", temporadaActual)
        .limit(100);

      setTitulos(titulosData || []);

      const { data: estadisticasJugadoresData, error: estadisticasJugadoresError } =
        await supabase
          .from("estadisticas_jugadores")
          .select(
            "id, partido_id, nombre, playerId, posicion, equipo, goals, assists, mvp, temporada, division",
          )
          .eq("equipo", nombreExacto)
          .eq("temporada", temporadaActual);

      if (estadisticasJugadoresError) {
        console.error(
          "ERROR CARGANDO ESTADÍSTICAS DE JUGADORES DEL CLUB:",
          estadisticasJugadoresError,
        );
      }

      const { data: plantillasData } = await supabase
        .from("plantillas")
        .select(
          "id, jugador, playerid, steam_id, profile_id, equipo, posicion, temporada, division, estado",
        )
        .eq("equipo", nombreExacto)
        .eq("temporada", temporadaActual)
        .neq("estado", "baja")
        .limit(200);

      const playerIdsActivos = new Set(
        (plantillasData || []).map((p: any) => String(p.playerid || "").trim()),
      );

      // Total de temporada del club: incluye cualquier competencia
      // porque estadisticas_jugadores se filtra solo por club + temporada.
      const estadisticasDelClub = estadisticasJugadoresData || [];

      // Historial del club: no depende de la plantilla actual.
      // Si un jugador se va de este club, sus goles/asistencias/MVP anteriores
      // siguen contando para el historial de este club.
      const jugadoresHistoricosClub = estadisticasDelClub;

      // Plantel actual: usa la plantilla activa. Si todavía no hay plantilla cargada,
      // cae al historial del club para no dejar la sección vacía.
      const jugadoresPlantelActual = estadisticasDelClub.filter((j: any) => {
        const pid = String(j.playerId || "").trim();

        if (playerIdsActivos.size > 0) {
          return playerIdsActivos.has(pid);
        }

        return true;
      });

      function agruparEstadisticasJugadores(lista: any[]) {
        const mapaAgrupado: { [key: string]: EstadisticasJugador } = {};

        lista.forEach((j: any) => {
          const playerId = String(j.playerId || "").trim();
          const nombreJugador = String(j.nombre || j.jugador || "Sin Nombre").trim();

          if (!playerId && !nombreJugador) return;

          const clave = playerId || nombreJugador;

          if (!mapaAgrupado[clave]) {
            mapaAgrupado[clave] = {
              jugador: nombreJugador || "Sin Nombre",
              playerId: playerId || encodeURIComponent(nombreJugador),
              goles: 0,
              asistencias: 0,
              mvps: 0,
            };
          }

          mapaAgrupado[clave].goles += Number(j.goals ?? j.goles ?? 0) || 0;
          mapaAgrupado[clave].asistencias +=
            Number(j.assists ?? j.asistencias ?? 0) || 0;
          mapaAgrupado[clave].mvps += Number(j.mvp ?? j.mvps ?? 0) || 0;
        });

        return Object.values(mapaAgrupado).sort((a, b) => {
          if (b.goles !== a.goles) return b.goles - a.goles;
          if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
          return b.mvps - a.mvps;
        });
      }

      setPlantel(agruparEstadisticasJugadores(jugadoresPlantelActual));
      setLideresHistoricos(agruparEstadisticasJugadores(jugadoresHistoricosClub));
    } catch (error) {
      console.error("ERROR CARGANDO PERFIL DEL CLUB:", error);
    } finally {
      setLoading(false);
    }
  }

  function iniciales(nombre?: string) {
    if (!nombre) return "CL";

    return nombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  function parsePartido(partido: Partido) {
    const partes = partido.resultado ? partido.resultado.split("-") : ["-", "-"];
    const golesLocal = Number(partes[0]?.trim());
    const golesVisitante = Number(partes[1]?.trim());
    const tieneResultado = !isNaN(golesLocal) && !isNaN(golesVisitante);

    const esLocal = normalizar(partido.local) === normalizar(nombreRealEquipo);
    const golesFavor = esLocal ? golesLocal : golesVisitante;
    const golesContra = esLocal ? golesVisitante : golesLocal;

    let estado: ResultadoEquipo = "-";
    let texto = "Pendiente";

    if (tieneResultado) {
      if (golesFavor > golesContra) {
        estado = "G";
        texto = "Victoria";
      } else if (golesFavor === golesContra) {
        estado = "E";
        texto = "Empate";
      } else {
        estado = "P";
        texto = "Derrota";
      }
    }

    return {
      golesLocal: tieneResultado ? golesLocal : "-",
      golesVisitante: tieneResultado ? golesVisitante : "-",
      estado,
      texto,
      esLocal,
    };
  }

  function claseResultado(resultado: ResultadoEquipo) {
    if (resultado === "G") return "apa-result-status apa-result-status--win";
    if (resultado === "E") return "apa-result-status apa-result-status--draw";
    if (resultado === "P") return "apa-result-status apa-result-status--loss";
    return "apa-result-status apa-result-status--pending";
  }

  const estadisticasHistoricasClub =
    lideresHistoricos.length > 0 ? lideresHistoricos : plantel;

  const topGoleador = estadisticasHistoricasClub[0];

  const topAsistidor = [...estadisticasHistoricasClub].sort(
    (a, b) => b.asistencias - a.asistencias,
  )[0];

  const topMvp = [...estadisticasHistoricasClub].sort((a, b) => b.mvps - a.mvps)[0];

  const colorPrincipal = clubVisual?.color_principal || "#38bdf8";
  const diferenciaGol = stats.gf - stats.gc;
  const figuraClub = topGoleador || topAsistidor || topMvp;

  const proximosPartidos = partidos.filter(
    (p) => !p.resultado || !p.resultado.includes("-"),
  );

  const proximoPartido = proximosPartidos[0];

  const palmaresAgrupado = titulos.reduce((acc: Record<string, number>, t: any) => {
    const key = t.competicion || "Título";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalTitulos = titulos.length;

  const ultimosPartidos = partidos
    .filter((p) => p.resultado && p.resultado.includes("-"))
    .slice(-5)
    .reverse();


  const historialAgrupado = Array.from(
    partidos.reduce((acc, partido) => {
      const competicion = nombreCompeticion(partido);
      const actuales = acc.get(competicion) || [];
      actuales.push(partido);
      acc.set(competicion, actuales);
      return acc;
    }, new Map<string, Partido[]>()),
  )
    .map(([competicion, lista]) => ({
      competicion,
      partidos: [...lista].sort((a, b) => {
        const fechaA = String(a.dia || "").trim();
        const fechaB = String(b.dia || "").trim();

        const parseFecha = (value: string) => {
          const match = value.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
          if (!match) return 0;
          const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : 2000;
          return new Date(year, Number(match[2]) - 1, Number(match[1])).getTime();
        };

        const diaA = parseFecha(fechaA);
        const diaB = parseFecha(fechaB);
        if (diaA !== diaB) return diaB - diaA;

        const faseOrden: Record<string, number> = {
          promocion: 70,
          final_ascenso: 65,
          final: 60,
          semifinal: 50,
          cuartos: 40,
          octavos: 30,
        };
        const faseA = faseOrden[normalizePhase(a.fase)] || 0;
        const faseB = faseOrden[normalizePhase(b.fase)] || 0;
        if (faseA !== faseB) return faseB - faseA;

        const numA = Number(String(a.fecha || "").match(/\d+/)?.[0] || 0);
        const numB = Number(String(b.fecha || "").match(/\d+/)?.[0] || 0);
        return numB - numA;
      }),
    }))
    .sort((a, b) => {
      const orden = [
        "Liga Primera",
        "Liga Segunda",
        "Clasificación a Copas",
        "Copa Argentina",
        "Copa de la Liga",
        "Copa de Campeones",
        "Playoffs de Ascenso",
      ];
      const ai = orden.indexOf(a.competicion);
      const bi = orden.indexOf(b.competicion);
      if (ai === -1 && bi === -1) return a.competicion.localeCompare(b.competicion);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  function textoPosicion(posicion: number | null) {
    if (!posicion) return "Sin posición";
    if (posicion === 1) return "👑 Líder";
    if (posicion === 2) return "🥈 2° Puesto";
    if (posicion === 3) return "🥉 3° Puesto";
    return `#${posicion} Puesto`;
  }

  function divisionBonita(division?: string | null) {
    if (!division) return "División";
    return DIVISION_LABELS[division] || DIVISION_LABELS[division.toLowerCase()] || division;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando club...
        </div>
      </main>
    );
  }

  if (!clubVisual && !equipoTemporada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-xl rounded-3xl border border-sky-400/20 bg-sky-400/10 p-8 text-center">
          <h1 className="text-3xl font-black uppercase">Club no encontrado</h1>
          <p className="mt-3 text-zinc-400">
            No se encontró un club activo para este torneo.
          </p>
          <Link
            href="/clubes"
            className="mt-6 inline-flex rounded-2xl bg-sky-400 px-5 py-3 font-black uppercase text-black"
          >
            Volver a clubes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 md:px-8">
        <Link
          href="/clubes"
          className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20"
        >
          ← Volver a clubes
        </Link>

        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/35 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.24)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{
              backgroundImage: clubVisual?.banner_url
                ? `url(${clubVisual.banner_url})`
                : "linear-gradient(135deg, rgba(0,229,255,.16), rgba(255,255,255,.04))",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/86 to-black/35" />

          <div
            className="absolute inset-0 opacity-45"
            style={{
              background: `radial-gradient(circle at top right, ${colorPrincipal}66, transparent 42%)`,
            }}
          />

          <div className="relative z-10 p-6 md:p-8">
            <div className="grid gap-7 xl:grid-cols-[1fr_460px] xl:items-center">
              <div>
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                    🏆 Torneo de Liga Liga
                  </span>

                  <span className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                    Clubes Liga · Perfil oficial
                  </span>
                </div>

                <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
                  <div
                    className="h-28 w-28 shrink-0 overflow-hidden rounded-[34px] border bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_35px_rgba(56,189,248,.28)] sm:h-32 sm:w-32 md:h-40 md:w-40"
                    style={{ borderColor: `${colorPrincipal}99` }}
                  >
                    {clubVisual?.logo_url ? (
                      <img
                        src={clubVisual.logo_url}
                        alt={nombreRealEquipo}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                        {iniciales(nombreRealEquipo)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="overflow-visible px-2 py-2 text-3xl font-black uppercase leading-[1.08] sm:text-4xl md:text-5xl xl:text-7xl">
                      <span className="block overflow-visible break-words bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                        {nombreRealEquipo}
                      </span>
                    </h1>

                    <div className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
                      {(clubVisual?.descripcion ||
                        "Institución oficial registrada en Gestioná tu Liga UE5. Perfil competitivo con plantel, estadísticas, racha e historial del club.")
                        .split(/\r?\n/)
                        .map((line, index) => (
                          <p
                            key={`club-description-${index}`}
                            className={line.trim() ? "block" : "block min-h-[1.75rem]"}
                          >
                            {line || "\u00A0"}
                          </p>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <label className="relative">
                        <span className="sr-only">Torneo</span>
                        <select
                          value={temporadaSeleccionada}
                          onChange={(event) => {
                            const next = event.target.value;
                            setTemporadaSeleccionada(next);
                            router.replace(
                              `/equipos/${encodeURIComponent(nombreEquipoUrl)}?temporada=${encodeURIComponent(next)}${previewDraft && canPreviewDraft ? "&preview=1" : ""}`,
                            );
                          }}
                          className="h-10 cursor-pointer appearance-none rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 pr-9 text-sm font-black uppercase text-sky-300 outline-none transition hover:border-sky-300"
                        >
                          {(previewDraft && canPreviewDraft && requestedSeason && !seasons.includes(requestedSeason)
                            ? [requestedSeason, ...seasons]
                            : seasons
                          ).map((season) => (
                            <option key={season} value={season} className="bg-[#06152c] text-white">
                              {displayLabel(season)}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-300">⌄</span>
                      </label>

                      <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                        {divisionBonita(equipoTemporada?.division)}
                      </span>

                      <span
                        className={`rounded-2xl border px-4 py-2 text-sm font-black uppercase ${
                          posicionLiga === 1
                            ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
                            : "border-sky-400/30 bg-sky-400/10 text-sky-300"
                        }`}
                      >
                        {textoPosicion(posicionLiga)}
                      </span>

                      <span className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black uppercase text-zinc-400">
                        DG {diferenciaGol > 0 ? `+${diferenciaGol}` : diferenciaGol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,.22)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                      Resumen competitivo
                    </p>
                    <h2 className="mt-1 text-2xl font-black uppercase">
                      {textoPosicion(posicionLiga)}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                    🛡️
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["PTS", stats.puntos, "text-yellow-300"],
                    ["PJ", stats.pj, "text-sky-300"],
                    ["GF", stats.gf, "text-emerald-300"],
                    ["GC", stats.gc, "text-red-300"],
                  ].map(([label, value, color]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        {label}
                      </p>

                      <p className={`mt-2 text-4xl md:text-5xl font-black leading-none ${color}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Últimos 5 partidos
                  </p>

                  <div className="flex gap-2">
                    {stats.racha.length === 0 ? (
                      <span className="text-sm text-zinc-500">Sin racha</span>
                    ) : (
                      stats.racha.map((r, index) => (
                        <span
                          key={`${r}-${index}`}
                          data-result-status={r === "G" ? "win" : r === "E" ? "draw" : r === "P" ? "loss" : "pending"}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black ${claseResultado(r)}`}
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] md:p-7">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                Torneo completa
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase">
                Rendimiento por competición
              </h2>
            </div>
            <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase text-zinc-400">
              Liga, copas y playoffs separados
            </span>
          </div>

          {resumenCompeticiones.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
              El club todavía no tiene partidos registrados en este torneo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resumenCompeticiones.map((item) => (
                <article key={item.key} className="rounded-[26px] border border-white/10 bg-black/35 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black uppercase text-white">{item.nombre}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                        {item.detalle}
                      </p>
                    </div>
                    <span className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${
                      item.estado === "Finalizada"
                        ? "border-zinc-400/25 bg-zinc-400/10 text-zinc-300"
                        : item.estado === "En curso"
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                          : "border-yellow-400/25 bg-yellow-400/10 text-yellow-300"
                    }`}>
                      {item.estado}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {[
                      ["PJ", item.pj],
                      ["PG", item.pg],
                      ["GF", item.gf],
                      ["GC", item.gc],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                        <p className="text-[9px] font-black uppercase text-zinc-500">{label}</p>
                        <p className="mt-1 text-xl font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  {(item.puntos !== undefined || item.posicion) && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-200">
                      <span>{item.puntos !== undefined ? `${item.puntos} puntos` : item.contexto}</span>
                      <span>{item.posicion ? `${item.posicion}° puesto` : "Sin posición"}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.08)]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                Palmarés oficial
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Títulos del club
              </h2>
            </div>

            <span className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-sm font-black uppercase text-yellow-300">
              🏆 {totalTitulos} títulos
            </span>
          </div>

          {titulos.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
              Este club todavía no tiene títulos cargados en el palmarés.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
              <div className="rounded-[28px] border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-black/30 to-black/50 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                  Resumen
                </p>

                <div className="mt-5 space-y-3">
                  {Object.entries(palmaresAgrupado).map(([competicion, cantidad]) => (
                    <div
                      key={competicion}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4"
                    >
                      <span className="font-black uppercase text-zinc-200">
                        {competicion}
                      </span>

                      <span className="text-2xl font-black text-yellow-300">
                        ×{cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {titulos.map((titulo: any) => (
                  <div
                    key={titulo.id}
                    className="rounded-2xl border border-white/10 bg-black/35 p-5"
                  >
                    <p className="text-2xl font-black text-yellow-300">
                      🏆 {titulo.competicion}
                    </p>

                    <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-zinc-500">
                      {displayLabel(titulo.temporada)}
                      {titulo.division ? ` · ${titulo.division}` : ""}
                    </p>

                    {titulo.descripcion && (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {titulo.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                  Agenda del club
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Próximo partido
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                📅
              </div>
            </div>

            {proximoPartido ? (
              <Link
                href={proximoPartido.partido_id ? `/estadisticas/${proximoPartido.partido_id}` : "#"}
                className="block rounded-[28px] border border-sky-500/20 bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18] p-5 transition hover:border-sky-400/45 hover:shadow-[0_0_25px_rgba(56,189,248,.14)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
                    Fecha {proximoPartido.fecha || "-"}
                  </span>

                  <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    {proximoPartido.dia || "Sin día"} · {proximoPartido.hora || "Sin hora"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] items-center gap-3">
                  <p className="text-center md:text-right text-xl font-black uppercase md:text-2xl">
                    {proximoPartido.local}
                  </p>

                  <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-3 text-center text-xl font-black text-yellow-300">
                    VS
                  </div>

                  <p className="text-center md:text-left text-xl font-black uppercase md:text-2xl">
                    {proximoPartido.visitante}
                  </p>
                </div>

                <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  {displayLabel(proximoPartido.temporada || equipoTemporada?.temporada)} · {proximoPartido.division || equipoTemporada?.division}
                </p>
              </Link>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-black/35 p-6 text-zinc-500">
                No hay próximos partidos programados para este club.
              </div>
            )}
          </div>

          <div className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                  Historia competitiva
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Récord del club
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                🏟️
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
              {[
                ["PJ", stats.pj, "text-sky-300"],
                ["PG", stats.pg, "text-emerald-300"],
                ["PE", stats.pe, "text-yellow-300"],
                ["PP", stats.pp, "text-red-300"],
                ["GF", stats.gf, "text-emerald-300"],
                ["GC", stats.gc, "text-red-300"],
                ["DG", diferenciaGol > 0 ? `+${diferenciaGol}` : diferenciaGol, "text-sky-300"],
                ["PTS", stats.puntos, "text-yellow-300"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    {label}
                  </p>

                  <p className={`mt-2 text-3xl font-black ${color}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                Forma reciente
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Últimos partidos
              </h2>
            </div>

            <div className="flex gap-2">
              {stats.racha.length === 0 ? (
                <span className="text-sm text-zinc-500">Sin racha</span>
              ) : (
                stats.racha.map((r, index) => (
                  <span
                    key={`${r}-forma-${index}`}
                    data-result-status={r === "G" ? "win" : r === "E" ? "draw" : r === "P" ? "loss" : "pending"}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black ${claseResultado(r)}`}
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

          {ultimosPartidos.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
              Todavía no hay partidos finalizados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              {ultimosPartidos.map((partido) => {
                const parsed = parsePartido(partido);

                return (
                  <Link
                    key={`forma-${partido.id}`}
                    href={partido.partido_id ? `/estadisticas/${partido.partido_id}` : "#"}
                    className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        data-result-status={parsed.estado === "G" ? "win" : parsed.estado === "E" ? "draw" : parsed.estado === "P" ? "loss" : "pending"}
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseResultado(parsed.estado)}`}
                      >
                        {parsed.texto}
                      </span>

                      <span className="text-[10px] font-black uppercase text-zinc-600">
                        F{partido.fecha || "-"}
                      </span>
                    </div>

                    <p className="truncate text-sm font-black uppercase text-zinc-300">
                      {partido.local}
                    </p>

                    <p className="my-2 rounded-xl border border-yellow-400/25 bg-yellow-400/10 py-2 text-center text-xl font-black text-yellow-300">
                      {parsed.golesLocal}-{parsed.golesVisitante}
                    </p>

                    <p className="truncate text-sm font-black uppercase text-zinc-300">
                      {partido.visitante}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="xl:col-span-4">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Historial estadístico del club
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
              Figura histórica y líderes del club
            </h2>
          </div>
          <Link
            href={figuraClub?.playerId ? `/jugadores/${figuraClub.playerId}` : "#"}
            className="group relative overflow-hidden rounded-[30px] border border-yellow-400/25 bg-gradient-to-br from-yellow-400/12 via-[#020714] to-black p-6 shadow-[0_0_35px_rgba(250,204,21,.10)] transition hover:-translate-y-1 hover:border-yellow-300/45"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_40%)]" />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                    Figura histórica del club
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    ⭐ Jugador clave
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-400/25 bg-yellow-400/10 text-3xl">
                  ⭐
                </div>
              </div>

              <h3 className="break-words text-2xl md:text-4xl font-black uppercase transition group-hover:text-yellow-300">
                {figuraClub?.jugador || "Sin datos"}
              </h3>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Goles
                  </p>
                  <p className="mt-1 text-2xl font-black text-yellow-300">
                    {figuraClub?.goles || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Asist.
                  </p>
                  <p className="mt-1 text-2xl font-black text-sky-300">
                    {figuraClub?.asistencias || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    MVP
                  </p>
                  <p className="mt-1 text-2xl font-black text-purple-300">
                    {figuraClub?.mvps || 0}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {[
            {
              titulo: "Top goleador",
              jugador: topGoleador,
              dato: `${topGoleador?.goles || 0} goles`,
              icon: "⚽",
            },
            {
              titulo: "Top asistidor",
              jugador: topAsistidor,
              dato: `${topAsistidor?.asistencias || 0} asistencias`,
              icon: "🎯",
            },
            {
              titulo: "Más MVP",
              jugador: topMvp,
              dato: `${topMvp?.mvps || 0} MVP`,
              icon: "👑",
            },
          ].map(({ titulo, jugador, dato, icon }) => (
            <Link
              key={titulo}
              href={jugador?.playerId ? `/jugadores/${jugador.playerId}` : "#"}
              className="group relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 transition hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,.16)]"
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.14),transparent_36%)]" />

              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
                  {icon}
                </div>

                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  {titulo}
                </p>

                <h3 className="mt-2 truncate text-2xl font-black uppercase transition group-hover:text-sky-300">
                  {jugador?.jugador || "Sin datos"}
                </h3>

                <p className="mt-2 text-xl font-black text-yellow-400">{dato}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_410px]">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                  Plantel oficial
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Escuadra del club
                </h2>
              </div>

              <p className="text-sm font-bold text-zinc-500">
                {plantel.length} jugadores
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                    <th className="py-3 text-left">#</th>
                    <th className="py-3 text-left">Jugador</th>
                    <th className="py-3 text-center">Goles</th>
                    <th className="py-3 text-center">Asist.</th>
                    <th className="py-3 text-center">MVP</th>
                    <th className="py-3 text-right">Perfil</th>
                  </tr>
                </thead>

                <tbody>
                  {plantel.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500">
                        No se encontraron jugadores registrados.
                      </td>
                    </tr>
                  ) : (
                    plantel.map((jugador, index) => (
                      <tr
                        key={jugador.playerId || jugador.jugador}
                        data-editor-component="club-squad-row"
                        className={`transition hover:brightness-125 ${
                          index < 3
                            ? "bg-gradient-to-r from-sky-500/14 via-[#071a33] to-[#030b18]"
                            : "bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                        }`}
                      >
                        <td data-editor-part="position" className="rounded-l-xl px-4 py-4 font-black text-sky-300">
                          #{index + 1}
                        </td>

                        <td data-editor-part="player" className="px-4 py-4 font-black uppercase">
                          <Link
                            href={`/jugadores/${jugador.playerId}`}
                            className="block transition hover:text-sky-300"
                          >
                            {jugador.jugador}
                          </Link>
                        </td>

                        <td data-editor-part="goals" className="py-4 text-center font-black text-yellow-400">
                          {jugador.goles}
                        </td>

                        <td data-editor-part="assists" className="py-4 text-center font-black text-zinc-300">
                          {jugador.asistencias}
                        </td>

                        <td data-editor-part="mvp" className="py-4 text-center font-black text-sky-300">
                          {jugador.mvps}
                        </td>

                        <td data-editor-part="profile" className="rounded-r-xl px-4 py-4 text-right">
                          <Link
                            href={`/jugadores/${jugador.playerId}`}
                            className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300 transition hover:text-white"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                Historial
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase">
                Partidos del club
              </h2>
            </div>

            <div className="max-h-[680px] space-y-5 overflow-y-auto pr-1">
              {partidos.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Este club aún no disputó partidos oficiales.
                </p>
              ) : (
                historialAgrupado.map((grupo) => (
                  <section key={grupo.competicion} className="space-y-2.5">
                    <div
                      data-history-competition="true"
                      className="rounded-xl border border-[#b9d9ea] bg-[#dff2fb] px-3 py-2 shadow-sm"
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0f3b62]">
                        {grupo.competicion}
                      </p>
                    </div>

                    {grupo.partidos.map((partido) => {
                      const parsed = parsePartido(partido);

                      return (
                        <Link
                          key={partido.id}
                          href={
                            partido.partido_id
                              ? `/estadisticas/${partido.partido_id}`
                              : "#"
                          }
                          className="block rounded-2xl border border-sky-500/20 bg-black/35 p-4 transition hover:border-sky-400/45 hover:bg-sky-500/10"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                                Fecha {partido.fecha || "-"}
                              </p>
                              <p className="mt-1 truncate text-[10px] font-bold text-[#68859a]">
                                {contextoCompeticion(partido)}
                              </p>
                            </div>

                            <span
                              data-result-status={parsed.estado === "G" ? "win" : parsed.estado === "E" ? "draw" : parsed.estado === "P" ? "loss" : "pending"}
                              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseResultado(parsed.estado)}`}
                            >
                              {parsed.texto}
                            </span>
                          </div>

                          <div className="grid grid-cols-[1fr_70px_1fr] items-center gap-2">
                            <span
                              className={`truncate text-right text-xs font-black ${
                                parsed.esLocal ? "text-white" : "text-zinc-400"
                              }`}
                            >
                              {partido.local}
                            </span>

                            <span
                              data-history-score="true"
                              className="rounded-xl border px-2 py-1 text-center font-black"
                            >
                              {parsed.golesLocal}-{parsed.golesVisitante}
                            </span>

                            <span
                              className={`truncate text-left text-xs font-black ${
                                !parsed.esLocal ? "text-white" : "text-zinc-400"
                              }`}
                            >
                              {partido.visitante}
                            </span>
                          </div>

                          <div className="mt-3 flex justify-between gap-3 text-[11px] text-zinc-600">
                            <span>{displayLabel(partido.temporada || equipoTemporada?.temporada)}</span>
                            <span className="truncate text-right">{nombreCompeticion(partido)}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </section>
                ))
              )}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
