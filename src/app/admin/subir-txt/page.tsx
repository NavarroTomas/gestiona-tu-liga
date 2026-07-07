"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Competicion =
  "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones";

type OrdenTxt = "normal" | "invertido";

type PartidoProgramado = {
  id: string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
  dia?: string | null;
  hora?: string | null;
};

type Equipo = {
  id?: string;
  nombre: string;
  temporada?: string;
  division?: string;
};

const TEMPORADAS = ["Temporada 4"];

const COMPETICIONES: { value: Competicion; label: string }[] = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
];

const DIVISIONES = ["Primera", "Segunda"];
const GRUPOS = ["A", "B", "C", "D"];
const FASES_COPA = ["Octavos", "Cuartos", "Semifinal", "Final"];
const FASES_CAMPEONES = ["Semifinal", "Final"];

export default function SubirTxtPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState<Competicion>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("1");
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidosProgramados, setPartidosProgramados] = useState<
    PartidoProgramado[]
  >([]);
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [ordenTxt, setOrdenTxt] = useState<OrdenTxt>("normal");

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const competicionLabel = useMemo(() => {
    return (
      COMPETICIONES.find((item) => item.value === competicion)?.label ||
      "Competencia"
    );
  }, [competicion]);

  const contextoLabel = useMemo(() => {
    if (competicion === "liga") return division;
    if (competicion === "copa_clasificatoria") return `Grupo ${grupo}`;
    return fase;
  }, [competicion, division, grupo, fase]);

  const divisionContexto = useMemo(() => {
    if (competicion === "liga") return division;
    if (competicion === "copa_clasificatoria") return `Grupo ${grupo}`;
    return fase;
  }, [competicion, division, grupo, fase]);

  useEffect(() => {
    cargarContexto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporada, competicion, division, grupo, fase, fecha]);

  function normalizarDivisionFiltro(value: string) {
    const v = String(value || "")
      .toLowerCase()
      .trim();

    if (v === "primera" || v === "primera division" || v === "primera división")
      return "primera";
    if (v === "segunda" || v === "segunda division" || v === "segunda división")
      return "segunda";

    return v;
  }

  function normalizarTexto(value: string) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function normalizarCompeticionFiltro(value: string) {
    const v = normalizarTexto(value);

    if (v === "liga" || v === "torneo de liga" || v === "torneo_liga")
      return "liga";
    if (
      v === "copa_clasificatoria" ||
      v === "clasificacion" ||
      v === "clasificacion a copas" ||
      v === "clasificacion_a_copas"
    ) {
      return "copa_clasificatoria";
    }
    if (v === "copa argentina" || v === "copa_argentina")
      return "copa_argentina";
    if (v === "copa apa" || v === "copa_apa") return "copa_apa";
    if (v === "copa campeones" || v === "copa de campeones" || v === "copa_campeones") return "copa_campeones";

    return v;
  }

  function faseDb() {
    if (competicion === "copa_clasificatoria") return "grupos";
    return normalizarTexto(fase).replace(/\s+/g, "_");
  }

  function grupoDb() {
    return grupo.toUpperCase();
  }

  async function cargarContexto() {
    setMensaje("");

    let partidosQuery = supabase
      .from("partidos")
      .select("*")
      .eq("temporada", temporada)
      .eq("competicion", competicion)
      .order("fecha", { ascending: true })
      .order("local", { ascending: true });

    if (competicion === "liga") {
      partidosQuery = partidosQuery.eq("division", division);
    }

    if (competicion === "copa_clasificatoria") {
      partidosQuery = partidosQuery.eq("fase", "grupos").eq("grupo", grupoDb());
    }

    if (competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones") {
      partidosQuery = partidosQuery.eq("fase", faseDb());
    }

    const equiposQuery = supabase
      .from("v_clubes_temporada_public")
      .select("*")
      .eq("temporada", temporada)
      .eq("activo", true)
      .order("nombre", { ascending: true });

    const [equiposRes, partidosRes] = await Promise.all([
      equiposQuery,
      partidosQuery,
    ]);

    if (equiposRes.error) {
      console.log(equiposRes.error);
    }

    if (partidosRes.error) {
      console.log(partidosRes.error);
      setFechasDisponibles([]);
      setPartidosProgramados([]);
      setPartidoSeleccionadoId("");
      return;
    }

    const equiposData = ((equiposRes.data || []) as any[])
      .filter((equipo) => {
        if (competicion !== "liga") return true;
        return (
          normalizarDivisionFiltro(equipo.division) ===
          normalizarDivisionFiltro(division)
        );
      })
      .map((equipo) => ({
        id: equipo.club_id || equipo.id || equipo.nombre,
        nombre: equipo.nombre,
        temporada: equipo.temporada,
        division: equipo.division,
      })) as Equipo[];

    const todosLosPartidos = (partidosRes.data || []) as PartidoProgramado[];

    const fechas = Array.from(
      new Set(
        todosLosPartidos
          .map((p) => String(p.fecha || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => Number(a) - Number(b));

    const fechaActiva =
      fechas.length > 0 && !fechas.includes(String(fecha))
        ? fechas[0]
        : String(fecha);

    if (fechaActiva !== String(fecha)) {
      setFecha(fechaActiva);
    }

    const partidosData = todosLosPartidos.filter(
      (p) => String(p.fecha || "").trim() === fechaActiva,
    );

    setEquipos(equiposData);
    setFechasDisponibles(fechas);
    setPartidosProgramados(partidosData);

    setPartidoSeleccionadoId((actual) => {
      const existeSeleccion = partidosData.some(
        (p) => String(p.id) === String(actual),
      );
      return existeSeleccion
        ? String(actual)
        : String(partidosData[0]?.id || "");
    });
  }

  function n(valor: any) {
    return Number(valor || 0);
  }

  function limpiar(txt: string) {
    return (txt || "").trim();
  }

  function slug(value: string) {
    return normalizarTexto(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function partidoId(local: string, visitante: string, resultado: string) {
    const contexto =
      competicion === "liga"
        ? division
        : competicion === "copa_clasificatoria"
          ? `grupo-${grupo}`
          : fase;

    return `${slug(temporada)}-${competicion}-${slug(contexto)}-fecha-${slug(fecha)}-${slug(local)}-${resultado}-${slug(visitante)}`;
  }

  function datosCompeticionExtra() {
    return {
      competicion,
      fase: competicion === "liga" ? null : faseDb(),
      grupo: competicion === "copa_clasificatoria" ? grupoDb() : null,
    };
  }

  function normalizarEquipo(
    stats: any,
    idPartido: string,
    equipoOficial: string,
  ) {
    return {
      partido_id: idPartido,
      equipo: equipoOficial,
      temporada,
      division: divisionContexto,
      fecha,

      passes: n(stats.passes),
      keyPasses: n(stats.keyPasses),
      assists: n(stats.assists),
      shots: n(stats.shots),
      shotsOnTarget: n(stats.shotsOnTarget),
      goals: n(stats.goals),
      tackles: n(stats.tackles),
      keyTackles: n(stats.keyTackles),
      interceptions: n(stats.interceptions),
      keyInterceptions: n(stats.keyInterceptions),
      possession: n(stats.possession),
      possessionsLost: n(stats.possessionsLost),
      fouls: n(stats.fouls),
      offsides: n(stats.offsides),
      handballs: n(stats.handballs),
      setPieceTimeouts: n(stats.setPieceTimeouts),
      freeKicks: n(stats.freeKicks),
      penalties: n(stats.penalties),
      goalKicks: n(stats.goalKicks),
      cornerKicks: n(stats.cornerKicks),
      throwIns: n(stats.throwIns),
      yellowCards: n(stats.yellowCards),
      redCards: n(stats.redCards),
    };
  }

  function calcularRatingAPA(j: any) {
    const goles = n(j.goals);
    const asistencias = n(j.assists);
    const pasesClave = n(j.keyPasses);
    const tirosAlArco = n(j.shotsOnTarget);
    const tackles = n(j.tackles);
    const intercepciones = n(j.interceptions);
    const perdidas = n(j.possessionsLost);
    const amarillas = n(j.yellowCards);
    const rojas = n(j.redCards);

    const atajadas = n(j.gKSaves);
    const atrapadas = n(j.gKCatches);

    const esArquero =
      atajadas > 0 ||
      atrapadas > 0 ||
      String(j.position || j.postion || "")
        .toUpperCase()
        .includes("GK");

    let rating = 6;

    if (esArquero) {
      rating += atajadas * 0.35;
      rating += atrapadas * 0.2;
    } else {
      rating += goles * 1.2;
      rating += asistencias * 0.9;
      rating += pasesClave * 0.18;
      rating += tirosAlArco * 0.12;
      rating += tackles * 0.1;
      rating += intercepciones * 0.1;
    }

    rating -= perdidas * 0.05;
    rating -= amarillas * 0.2;
    rating -= rojas * 1;

    rating = Math.max(1, Math.min(10, rating));

    return Math.round(rating * 100) / 100;
  }

  function normalizarJugador(
    j: any,
    idPartido: string,
    esMvp: boolean,
    equipoOficial: string,
  ) {
    return {
      partido_id: idPartido,
      nombre: limpiar(j.playerName),
      playerId: j.playerId || "",
      posicion: j.postion || j.position || "",
      equipo: equipoOficial,
      temporada,
      division: divisionContexto,
      fecha,

      passes: n(j.passes),
      keyPasses: n(j.keyPasses),
      assists: n(j.assists),
      shots: n(j.shots),
      shotsOnTarget: n(j.shotsOnTarget),
      goals: n(j.goals),
      tackles: n(j.tackles),
      keyTackles: n(j.keyTackles),
      interceptions: n(j.interceptions),
      keyInterceptions: n(j.keyInterceptions),
      possessionsLost: n(j.possessionsLost),
      gKSaves: n(j.gKSaves),
      gKCatches: n(j.gKCatches),
      overallRating: n(j.overallRating),
      rating_apa: calcularRatingAPA(j),
      score: n(j.score),
      mvp: esMvp ? 1 : 0,
    };
  }

  const partidoSeleccionado = partidosProgramados.find(
    (p) => String(p.id) === String(partidoSeleccionadoId),
  );

  async function subirTxt() {
    try {
      setMensaje("");

      if (!archivo) {
        alert("Elegí un archivo TXT primero");
        return;
      }

      if (!partidoSeleccionado) {
        alert("Elegí un partido programado antes de cargar el TXT");
        return;
      }

      setLoading(true);

      const texto = await archivo.text();
      const data = JSON.parse(texto);

      const team1 = data.team1Stats;
      const team2 = data.team2Stats;

      if (!team1 || !team2) {
        alert("El TXT no tiene team1Stats o team2Stats");
        setLoading(false);
        return;
      }

      const localOficial = partidoSeleccionado.local;
      const visitanteOficial = partidoSeleccionado.visitante;

      const statsLocal = ordenTxt === "normal" ? team1 : team2;
      const statsVisitante = ordenTxt === "normal" ? team2 : team1;

      const jugadoresLocalRaw =
        ordenTxt === "normal"
          ? data.team1PlayerStats || []
          : data.team2PlayerStats || [];
      const jugadoresVisitanteRaw =
        ordenTxt === "normal"
          ? data.team2PlayerStats || []
          : data.team1PlayerStats || [];

      const golesLocal = n(statsLocal.goals);
      const golesVisitante = n(statsVisitante.goals);

      const resultado = `${golesLocal}-${golesVisitante}`;
      const idPartido = partidoId(localOficial, visitanteOficial, resultado);

      const confirmar = window.confirm(
        `Vas a cargar el TXT para:\n\n${competicionLabel} · ${contextoLabel} · Fecha ${fecha}\n${localOficial} ${resultado} ${visitanteOficial}\n\nOrden TXT: ${
          ordenTxt === "normal"
            ? "team1 = local / team2 = visitante"
            : "team1 = visitante / team2 = local"
        }\n\n¿Confirmar carga?`,
      );

      if (!confirmar) {
        setLoading(false);
        return;
      }

      const { data: partidoYaCargado } = await supabase
        .from("partidos")
        .select("id")
        .eq("partido_id", idPartido);

      if (
        partidoYaCargado &&
        partidoYaCargado.length > 0 &&
        partidoYaCargado[0].id !== partidoSeleccionado.id
      ) {
        alert("Este partido ya existe con otro registro.");
        setLoading(false);
        return;
      }

      const { error: updatePartidoError } = await supabase
        .from("partidos")
        .update({
          local: localOficial,
          visitante: visitanteOficial,
          resultado,
          fecha,
          temporada,
          division: competicion === "liga" ? division : divisionContexto,
          partido_id: idPartido,
          ...datosCompeticionExtra(),
        })
        .eq("id", partidoSeleccionado.id);

      if (updatePartidoError) {
        console.log(updatePartidoError);
        alert("Error actualizando el partido programado");
        setLoading(false);
        return;
      }

      await supabase
        .from("estadisticas_equipos")
        .delete()
        .eq("partido_id", idPartido);
      await supabase
        .from("estadisticas_jugadores")
        .delete()
        .eq("partido_id", idPartido);

      const equiposStats = [
        normalizarEquipo(statsLocal, idPartido, localOficial),
        normalizarEquipo(statsVisitante, idPartido, visitanteOficial),
      ];

      const { error: equiposError } = await supabase
        .from("estadisticas_equipos")
        .insert(equiposStats);

      if (equiposError) {
        console.log(equiposError);
        alert(
          "Partido actualizado, pero error guardando estadísticas de equipos",
        );
        setLoading(false);
        return;
      }

      const jugadoresRawConEquipo = [
        ...jugadoresLocalRaw.map((j: any) => ({
          ...j,
          equipoOficial: localOficial,
        })),
        ...jugadoresVisitanteRaw.map((j: any) => ({
          ...j,
          equipoOficial: visitanteOficial,
        })),
      ];

      const mejorJugador = jugadoresRawConEquipo
        .filter((j: any) => limpiar(j.playerName))
        .sort((a: any, b: any) => n(b.score) - n(a.score))[0];

      const jugadoresDetallados = jugadoresRawConEquipo
        .filter((j: any) => limpiar(j.playerName))
        .map((j: any) =>
          normalizarJugador(
            j,
            idPartido,
            mejorJugador?.playerId === j.playerId,
            j.equipoOficial,
          ),
        );

      const { error: jugadoresDetalleError } = await supabase
        .from("estadisticas_jugadores")
        .insert(jugadoresDetallados);

      if (jugadoresDetalleError) {
        console.log(jugadoresDetalleError);
        alert(
          "Error guardando estadísticas detalladas de jugadores: " +
            jugadoresDetalleError.message,
        );
        setLoading(false);
        return;
      }

      const jugadoresUnicos = Array.from(
        new Set(jugadoresDetallados.map((j) => j.playerId).filter(Boolean)),
      );
      const jugadoresResumen = [];

      for (const playerId of jugadoresUnicos) {
        const jugadorBase = jugadoresDetallados.find(
          (j) => j.playerId === playerId,
        );

        if (!jugadorBase) continue;

        const { data: historialJugador, error: historialError } = await supabase
          .from("estadisticas_jugadores")
          .select("goals,assists,mvp")
          .eq("playerId", playerId)
          .eq("temporada", temporada)
          .eq("division", divisionContexto)
          .eq("equipo", jugadorBase.equipo);

        if (historialError) {
          console.log(historialError);
          continue;
        }

        const totalGoles = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.goals || 0),
          0,
        );
        const totalAsistencias = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.assists || 0),
          0,
        );
        const totalMvps = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.mvp || 0),
          0,
        );

        jugadoresResumen.push({
          nombre: jugadorBase.nombre,
          playerId,
          equipo: jugadorBase.equipo,
          goles: totalGoles,
          asistencias: totalAsistencias,
          mvps: totalMvps,
          temporada,
          division: divisionContexto,
        });
      }

      const { error: jugadoresError } = await supabase
        .from("jugadores")
        .upsert(jugadoresResumen, {
          onConflict: "playerId,temporada,division,equipo",
        });

      if (jugadoresError) {
        console.log(jugadoresError);
        alert(
          "Stats detalladas cargadas, pero error cargando ranking de jugadores",
        );
        setLoading(false);
        return;
      }

      const jugadoresParaPlantilla = jugadoresDetallados
        .filter((j) => j.playerId)
        .reduce((acc: any[], jugadorActual: any) => {
          const yaExiste = acc.some(
            (j) => j.playerid === jugadorActual.playerId,
          );

          if (!yaExiste) {
            acc.push({
              jugador: jugadorActual.nombre,
              playerid: jugadorActual.playerId,
              equipo: jugadorActual.equipo,
              posicion: jugadorActual.posicion || "N/D",
              temporada,
              division: divisionContexto,
              estado: "activo",
            });
          }

          return acc;
        }, []);

      let jugadoresNuevosPlantilla = 0;

      if (jugadoresParaPlantilla.length > 0) {
        const playerIdsTxt = jugadoresParaPlantilla.map((j) => j.playerid);

        const { data: plantillasExistentes, error: plantillasExistentesError } =
          await supabase
            .from("plantillas")
            .select("playerid")
            .eq("temporada", temporada)
            .eq("division", divisionContexto)
            .in("playerid", playerIdsTxt);

        if (plantillasExistentesError) {
          console.log(plantillasExistentesError);
        } else {
          const playerIdsExistentes = new Set(
            (plantillasExistentes || []).map((p: any) => p.playerid),
          );
          const plantillasNuevas = jugadoresParaPlantilla.filter(
            (j) => !playerIdsExistentes.has(j.playerid),
          );

          jugadoresNuevosPlantilla = plantillasNuevas.length;

          if (plantillasNuevas.length > 0) {
            const { error: plantillasError } = await supabase
              .from("plantillas")
              .insert(plantillasNuevas);

            if (plantillasError) {
              console.log(plantillasError);
              alert(
                "Stats cargadas, pero hubo un error agregando jugadores nuevos a plantillas.",
              );
              setLoading(false);
              return;
            }
          }
        }
      }

      setMensaje(
        `Cargado perfecto: ${localOficial} ${resultado} ${visitanteOficial}. Competencia: ${competicionLabel}. Contexto: ${contextoLabel}. Jugadores: ${jugadoresDetallados.length}. Nuevos en plantilla: ${jugadoresNuevosPlantilla}. MVP por score: ${
          mejorJugador?.playerName || "Sin MVP"
        }`,
      );

      setArchivo(null);
      await cargarContexto();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(
        "No pude leer el TXT. Tiene que ser el formato JSON del MatchStats.",
      );
    }
  }

  async function anularCargaTxt() {
    try {
      setMensaje("");

      if (!partidoSeleccionado) {
        alert("Elegí un partido antes de anular una carga TXT");
        return;
      }

      const idPartido = partidoSeleccionado.partido_id;

      if (!idPartido || !partidoSeleccionado.resultado) {
        alert("Este partido no tiene un TXT cargado para anular.");
        return;
      }

      const confirmar = window.confirm(
        `Vas a ANULAR la carga TXT de:\n\n${competicionLabel} · ${contextoLabel} · Fecha ${fecha}\n${partidoSeleccionado.local} ${partidoSeleccionado.resultado} ${partidoSeleccionado.visitante}\n\nEsto borrará las estadísticas del partido, limpiará el resultado y recalculará el ranking de los jugadores afectados.\n\n¿Confirmar anulación?`,
      );

      if (!confirmar) return;

      setLoading(true);

      const { data: jugadoresAntes, error: jugadoresAntesError } =
        await supabase
          .from("estadisticas_jugadores")
          .select("playerId")
          .eq("partido_id", idPartido);

      if (jugadoresAntesError) {
        console.log(jugadoresAntesError);
        alert("No pude leer los jugadores del partido antes de anular.");
        setLoading(false);
        return;
      }

      const playerIdsAfectados = Array.from(
        new Set(
          (jugadoresAntes || [])
            .map((j: any) => String(j.playerId || "").trim())
            .filter(Boolean),
        ),
      );

      const { error: equiposDeleteError } = await supabase
        .from("estadisticas_equipos")
        .delete()
        .eq("partido_id", idPartido);

      if (equiposDeleteError) {
        console.log(equiposDeleteError);
        alert("No pude borrar las estadísticas de equipos.");
        setLoading(false);
        return;
      }

      const { error: jugadoresDeleteError } = await supabase
        .from("estadisticas_jugadores")
        .delete()
        .eq("partido_id", idPartido);

      if (jugadoresDeleteError) {
        console.log(jugadoresDeleteError);
        alert("No pude borrar las estadísticas de jugadores.");
        setLoading(false);
        return;
      }

      const { error: partidoUpdateError } = await supabase
        .from("partidos")
        .update({
          resultado: null,
          partido_id: null,
        })
        .eq("id", partidoSeleccionado.id);

      if (partidoUpdateError) {
        console.log(partidoUpdateError);
        alert(
          "Se borraron estadísticas, pero no pude limpiar el resultado del partido.",
        );
        setLoading(false);
        return;
      }

      if (playerIdsAfectados.length > 0) {
        const { data: historialRestante, error: historialRestanteError } =
          await supabase
            .from("estadisticas_jugadores")
            .select("nombre,playerId,equipo,goals,assists,mvp")
            .eq("temporada", temporada)
            .eq("division", divisionContexto)
            .in("playerId", playerIdsAfectados);

        if (historialRestanteError) {
          console.log(historialRestanteError);
          alert(
            "Partido anulado, pero no pude recalcular el ranking de jugadores.",
          );
          setLoading(false);
          await cargarContexto();
          return;
        }

        const { error: jugadoresResumenDeleteError } = await supabase
          .from("jugadores")
          .delete()
          .eq("temporada", temporada)
          .eq("division", divisionContexto)
          .in("playerId", playerIdsAfectados);

        if (jugadoresResumenDeleteError) {
          console.log(jugadoresResumenDeleteError);
          alert(
            "Partido anulado, pero no pude limpiar el ranking anterior de jugadores.",
          );
          setLoading(false);
          await cargarContexto();
          return;
        }

        const resumenMap = new Map<string, any>();

        (historialRestante || []).forEach((j: any) => {
          const playerId = String(j.playerId || "").trim();
          if (!playerId) return;

          const equipo = j.equipo || "Sin Club";
          const key = `${playerId}__${equipo}`;

          if (!resumenMap.has(key)) {
            resumenMap.set(key, {
              nombre: j.nombre || "Sin Nombre",
              playerId,
              equipo,
              goles: 0,
              asistencias: 0,
              mvps: 0,
              temporada,
              division: divisionContexto,
            });
          }

          const actual = resumenMap.get(key);
          actual.goles += Number(j.goals || 0);
          actual.asistencias += Number(j.assists || 0);
          actual.mvps += Number(j.mvp || 0);
          if (j.nombre) actual.nombre = j.nombre;
        });

        const resumenRecalculado = Array.from(resumenMap.values());

        if (resumenRecalculado.length > 0) {
          const { error: jugadoresResumenInsertError } = await supabase
            .from("jugadores")
            .upsert(resumenRecalculado, {
              onConflict: "playerId,temporada,division,equipo",
            });

          if (jugadoresResumenInsertError) {
            console.log(jugadoresResumenInsertError);
            alert(
              "Partido anulado, pero no pude reinsertar el ranking recalculado.",
            );
            setLoading(false);
            await cargarContexto();
            return;
          }
        }
      }

      setMensaje(
        `Carga TXT anulada: ${partidoSeleccionado.local} vs ${partidoSeleccionado.visitante}. Ranking recalculado para ${playerIdsAfectados.length} jugadores afectados.`,
      );

      setArchivo(null);
      await cargarContexto();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert("No pude anular la carga TXT.");
    }
  }

  return (
    <PermissionGuard permission="matches.upload_txt">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-10 md:px-8">
          <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Admin APA PSO
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-6xl">
                Subir TXT
              </h1>

              <p className="mt-5 max-w-3xl text-zinc-300">
                Primero elegí el partido programado. El TXT carga estadísticas,
                pero los equipos oficiales salen del fixture creado en Admin.
              </p>
            </div>
          </section>

          <section className="space-y-6 rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.12)] md:p-8">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                1. Contexto del partido
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <select
                  className="input"
                  value={temporada}
                  onChange={(e) => setTemporada(e.target.value)}
                >
                  {TEMPORADAS.map((temp) => (
                    <option key={temp}>{temp}</option>
                  ))}
                </select>

                <select
                  className="input"
                  value={competicion}
                  onChange={(e) => {
                    const value = e.target.value as Competicion;
                    setCompeticion(value);
                  }}
                >
                  {COMPETICIONES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                {competicion === "liga" && (
                  <select
                    className="input"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  >
                    {DIVISIONES.map((div) => (
                      <option key={div}>{div}</option>
                    ))}
                  </select>
                )}

                {competicion === "copa_clasificatoria" && (
                  <select
                    className="input"
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                  >
                    {GRUPOS.map((g) => (
                      <option key={g} value={g}>
                        Grupo {g}
                      </option>
                    ))}
                  </select>
                )}

                {(competicion === "copa_argentina" ||
                  competicion === "copa_apa" ||
                  competicion === "copa_campeones") && (
                  <select
                    className="input"
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                  >
                    {(competicion === "copa_campeones" ? FASES_CAMPEONES : FASES_COPA).map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                )}

                <select
                  className="input"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                >
                  {fechasDisponibles.length === 0 ? (
                    <option value={fecha}>Fecha {fecha}</option>
                  ) : (
                    fechasDisponibles.map((f) => (
                      <option key={f} value={f}>
                        Fecha {f}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.16em]">
                <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-sky-300">
                  {competicionLabel}
                </span>
                <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                  {contextoLabel}
                </span>
                <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-400">
                  Fecha {fecha}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                2. Partido programado
              </p>

              {partidosProgramados.length === 0 ? (
                <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-5 text-yellow-300">
                  No hay partidos programados para este contexto. Primero crealo
                  en <b>/admin/fixture</b>.
                </div>
              ) : (
                <select
                  className="input"
                  value={partidoSeleccionadoId}
                  onChange={(e) => setPartidoSeleccionadoId(e.target.value)}
                >
                  {partidosProgramados.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.local} vs {p.visitante}
                      {p.resultado ? ` · ${p.resultado}` : " · pendiente"}
                    </option>
                  ))}
                </select>
              )}

              {partidoSeleccionado && (
                <div className="mt-5 rounded-[28px] border border-sky-500/25 bg-black/35 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                    Partido seleccionado
                  </p>

                  <div className="mt-4 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_90px_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-center">
                      <p className="text-xs uppercase text-zinc-500">Local</p>
                      <p className="mt-2 text-xl font-black uppercase">
                        {partidoSeleccionado.local}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-center text-2xl font-black text-yellow-300">
                      VS
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-center">
                      <p className="text-xs uppercase text-zinc-500">
                        Visitante
                      </p>
                      <p className="mt-2 text-xl font-black uppercase">
                        {partidoSeleccionado.visitante}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-black uppercase">
                    <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-sky-300">
                      {competicionLabel}
                    </span>

                    <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                      {contextoLabel}
                    </span>

                    <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-sky-300">
                      Fecha {partidoSeleccionado.fecha || fecha}
                    </span>

                    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-400">
                      {partidoSeleccionado.dia || "Sin día"}
                    </span>

                    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-400">
                      {partidoSeleccionado.hora || "Sin hora"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                3. Orden del TXT
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  onClick={() => setOrdenTxt("normal")}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase transition ${
                    ordenTxt === "normal"
                      ? "border-sky-300 bg-sky-400 text-black"
                      : "border-white/10 bg-black/35 text-zinc-400 hover:border-sky-400/30 hover:text-white"
                  }`}
                >
                  team1 = local / team2 = visitante
                </button>

                <button
                  onClick={() => setOrdenTxt("invertido")}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase transition ${
                    ordenTxt === "invertido"
                      ? "border-yellow-300 bg-yellow-400 text-black"
                      : "border-white/10 bg-black/35 text-zinc-400 hover:border-yellow-400/30 hover:text-white"
                  }`}
                >
                  team1 = visitante / team2 = local
                </button>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                4. Archivo MatchStats
              </p>

              <input
                className="input"
                type="file"
                accept=".txt,.json"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <button
                onClick={subirTxt}
                disabled={loading}
                className="btn disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Cargar TXT al partido seleccionado"}
              </button>

              <button
                onClick={anularCargaTxt}
                disabled={
                  loading ||
                  !partidoSeleccionado ||
                  !partidoSeleccionado.partido_id ||
                  !partidoSeleccionado.resultado
                }
                className="rounded-2xl border border-red-400/35 bg-red-500/10 px-5 py-4 text-sm font-black uppercase text-red-200 transition hover:border-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anular carga TXT
              </button>
            </div>

            {mensaje && <p className="font-bold text-emerald-400">{mensaje}</p>}
          </section>

          <section className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
            <b>Importante:</b> el nombre del equipo ya no depende del TXT. El
            TXT solo aporta estadísticas. Los equipos oficiales salen del
            partido seleccionado en el fixture.
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
