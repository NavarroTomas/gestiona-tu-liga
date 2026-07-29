"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Equipo = {
  id?: string | number;
  nombre: string;
  logo_url?: string | null;
  slug?: string | null;
};

type PartidoCopa = {
  id: string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division: string;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

type Sancion = {
  id: string;
  temporada: string;
  equipo: string;
  puntos_descontados: number;
  motivo: string;
  created_at?: string;
};

const TEMPORADAS = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
  "Temporada 6",
];
const GRUPOS = ["A", "B", "C", "D"];

const FASES_MANUALES = [
  "Grupo A",
  "Grupo B",
  "Grupo C",
  "Grupo D",
  "Cuartos - Copa Argentina",
  "Cuartos - Copa APA",
  "Semifinal - Copa Argentina",
  "Semifinal - Copa APA",
  "Final - Copa Argentina",
  "Final - Copa APA",
];

const COMPETICION_GRUPOS = "copa_clasificatoria";
const COMPETICION_CAMPEONES = "copa_campeones";
const COMPETICION_PLAYOFFS = "playoffs";
const DIVISION_COPA = "copa";

function normalizar(texto?: string | null) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function generarPartidosGrupo(equipos: string[], grupo: string) {
  const limpios = equipos.filter(Boolean);

  if (limpios.length !== 4) {
    throw new Error(`El grupo ${grupo} debe tener exactamente 4 equipos.`);
  }

  return [
    { fecha: "1", local: limpios[0], visitante: limpios[1] },
    { fecha: "1", local: limpios[2], visitante: limpios[3] },
    { fecha: "2", local: limpios[0], visitante: limpios[2] },
    { fecha: "2", local: limpios[1], visitante: limpios[3] },
    { fecha: "3", local: limpios[0], visitante: limpios[3] },
    { fecha: "3", local: limpios[1], visitante: limpios[2] },
  ].map((p) => ({
    ...p,
    grupo,
    ronda: `Grupo ${grupo} · Fecha ${p.fecha}`,
  }));
}

function calcularTablaGrupo(partidos: PartidoCopa[], grupo: string) {
  const mapa: Record<string, any> = {};

  function asegurar(nombre: string) {
    if (!mapa[nombre]) {
      mapa[nombre] = {
        equipo: nombre,
        grupo,
        pts: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
      };
    }
  }

  partidos
    .filter((p) => p.grupo === grupo)
    .forEach((p) => {
      asegurar(p.local);
      asegurar(p.visitante);

      if (!p.resultado || !p.resultado.includes("-")) return;

      const [glRaw, gvRaw] = p.resultado.split("-");
      const gl = Number(glRaw?.trim());
      const gv = Number(gvRaw?.trim());

      if (Number.isNaN(gl) || Number.isNaN(gv)) return;

      mapa[p.local].pj += 1;
      mapa[p.visitante].pj += 1;

      mapa[p.local].gf += gl;
      mapa[p.local].gc += gv;
      mapa[p.visitante].gf += gv;
      mapa[p.visitante].gc += gl;

      if (gl > gv) {
        mapa[p.local].pg += 1;
        mapa[p.local].pts += 3;
        mapa[p.visitante].pp += 1;
      } else if (gl < gv) {
        mapa[p.visitante].pg += 1;
        mapa[p.visitante].pts += 3;
        mapa[p.local].pp += 1;
      } else {
        mapa[p.local].pe += 1;
        mapa[p.visitante].pe += 1;
        mapa[p.local].pts += 1;
        mapa[p.visitante].pts += 1;
      }
    });

  return Object.values(mapa)
    .map((e: any) => ({ ...e, dg: e.gf - e.gc }))
    .sort((a: any, b: any) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.equipo.localeCompare(b.equipo);
    });
}

export default function AdminCopasPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidos, setPartidos] = useState<PartidoCopa[]>([]);
  const [partidosCampeones, setPartidosCampeones] = useState<PartidoCopa[]>([]);
  const [partidosPlayoffs, setPartidosPlayoffs] = useState<PartidoCopa[]>([]);
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // MANTENIMIENTO / VISIBILIDAD DE COPAS
  const [copaApaActiva, setCopaApaActiva] = useState(false);
  const [copaArgentinaActiva, setCopaArgentinaActiva] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // SANCIONES / DESCUENTO DE PUNTOS
  const [equipoSancionar, setEquipoSancionar] = useState("");
  const [puntosRestar, setPuntosRestar] = useState(1);
  const [motivoSancion, setMotivoSancion] = useState("No presentación (W.O.)");
  const [guardandoSancion, setGuardandoSancion] = useState(false);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState("A");
  const [grupos, setGrupos] = useState<Record<string, string[]>>({
    A: ["", "", "", ""],
    B: ["", "", "", ""],
    C: ["", "", "", ""],
    D: ["", "", "", ""],
  });

  const [localManual, setLocalManual] = useState("");
  const [visitanteManual, setVisitanteManual] = useState("");
  const [faseManual, setFaseManual] = useState("Grupo A");
  const [fechaManual, setFechaManual] = useState("1");
  const [diaManual, setDiaManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  const [campeonPrimera, setCampeonPrimera] = useState("");
  const [campeonSegunda, setCampeonSegunda] = useState("");
  const [campeonCopaArgentina, setCampeonCopaArgentina] = useState("");
  const [campeonCopaApa, setCampeonCopaApa] = useState("");
  const [diaSemisCampeones, setDiaSemisCampeones] = useState("");
  const [horaSemisCampeones, setHoraSemisCampeones] = useState("");
  const [diaFinalCampeones, setDiaFinalCampeones] = useState("");
  const [horaFinalCampeones, setHoraFinalCampeones] = useState("");

  const [segundoSegunda, setSegundoSegunda] = useState("");
  const [terceroSegunda, setTerceroSegunda] = useState("");
  const [cuartoSegunda, setCuartoSegunda] = useState("");
  const [quintoSegunda, setQuintoSegunda] = useState("");
  const [anteultimoPrimera, setAnteultimoPrimera] = useState("");
  const [diaSemisPlayoffs, setDiaSemisPlayoffs] = useState("");
  const [horaSemisPlayoffs, setHoraSemisPlayoffs] = useState("");
  const [diaFinalPlayoffs, setDiaFinalPlayoffs] = useState("");
  const [horaFinalPlayoffs, setHoraFinalPlayoffs] = useState("");
  const [diaPromocion, setDiaPromocion] = useState("");
  const [horaPromocion, setHoraPromocion] = useState("");

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporada]);

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");

    const [equiposRes, partidosRes, campeonesRes, playoffsRes, configRes, sancionesRes] =
      await Promise.all([
        supabase
          .from("v_clubes_temporada_public")
          .select("*")
          .eq("temporada", temporada)
          .eq("activo", true)
          .order("nombre", { ascending: true }),

        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda",
          )
          .eq("temporada", temporada)
          .eq("competicion", COMPETICION_GRUPOS)
          .eq("fase", "grupos")
          .order("grupo", { ascending: true })
          .order("fecha", { ascending: true }),

        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda",
          )
          .eq("temporada", temporada)
          .eq("competicion", COMPETICION_CAMPEONES)
          .order("fecha", { ascending: true })
          .order("ronda", { ascending: true }),

        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda",
          )
          .eq("temporada", temporada)
          .eq("competicion", COMPETICION_PLAYOFFS)
          .order("fecha", { ascending: true })
          .order("ronda", { ascending: true }),

        supabase
          .from("configuracion_copas")
          .select("*")
          .eq("temporada", temporada)
          .maybeSingle(),

        supabase
          .from("sanciones_equipos")
          .select("*")
          .eq("temporada", temporada)
          .order("created_at", { ascending: false }),
      ]);

    if (equiposRes.error) {
      console.log(equiposRes.error);
      setMensaje("Error cargando clubes.");
    }

    if (partidosRes.error) {
      console.log(partidosRes.error);
      setMensaje("Error cargando partidos de copa.");
    }

    if (campeonesRes.error) {
      console.log(campeonesRes.error);
      setMensaje("Error cargando Copa de Campeones.");
    }

    if (playoffsRes.error) {
      console.log(playoffsRes.error);
      setMensaje("Error cargando Playoffs.");
    }

    if (configRes.data) {
      setCopaApaActiva(configRes.data.copa_apa_activa ?? false);
      setCopaArgentinaActiva(configRes.data.copa_argentina_activa ?? false);
    } else {
      setCopaApaActiva(false);
      setCopaArgentinaActiva(false);
    }

    if (sancionesRes.data) {
      setSanciones(sancionesRes.data as Sancion[]);
    }

    setEquipos(
      ((equiposRes.data || []) as any[]).map((e) => ({
        id: e.club_id,
        nombre: e.nombre,
        slug: e.slug,
        logo_url: e.logo_url,
      })),
    );

    setPartidos((partidosRes.data || []) as PartidoCopa[]);
    setPartidosCampeones((campeonesRes.data || []) as PartidoCopa[]);
    setPartidosPlayoffs((playoffsRes.data || []) as PartidoCopa[]);
    setLoading(false);
  }

  async function guardarEstadoCopas() {
    setGuardandoEstado(true);
    setMensaje("");

    const { error } = await supabase.from("configuracion_copas").upsert(
      {
        temporada,
        copa_apa_activa: copaApaActiva,
        copa_argentina_activa: copaArgentinaActiva,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "temporada" },
    );

    if (error) {
      console.log(error);
      setMensaje("Error guardando el estado de las copas.");
    } else {
      setMensaje(`¡Estado de visibilidad actualizado para ${temporada}!`);
    }

    setGuardandoEstado(false);
  }

  async function aplicarSancion(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoSancion(true);
    setMensaje("");

    if (!equipoSancionar) {
      setMensaje("Seleccioná un equipo para sancionar.");
      setGuardandoSancion(false);
      return;
    }

    const { error } = await supabase.from("sanciones_equipos").insert({
      temporada,
      equipo: equipoSancionar,
      puntos_descontados: Number(puntosRestar),
      motivo: motivoSancion,
    });

    if (error) {
      console.log(error);
      setMensaje("Error al registrar sanción.");
    } else {
      setMensaje(`Sanción aplicada: -${puntosRestar} pts a ${equipoSancionar}`);
      setEquipoSancionar("");
      await cargarTodo();
    }

    setGuardandoSancion(false);
  }

  async function eliminarSancion(id: string) {
    const confirmar = window.confirm("¿Eliminar esta sanción de la liga?");
    if (!confirmar) return;

    const { error } = await supabase.from("sanciones_equipos").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando sanción.");
    } else {
      setMensaje("Sanción eliminada con éxito.");
      await cargarTodo();
    }
  }

  const equiposUsados = useMemo(() => {
    return new Set(Object.values(grupos).flat().filter(Boolean));
  }, [grupos]);

  const tablasPorGrupo = useMemo(() => {
    return Object.fromEntries(
      GRUPOS.map((grupo) => [grupo, calcularTablaGrupo(partidos, grupo)]),
    ) as Record<string, any[]>;
  }, [partidos]);

  const clasificados = useMemo(() => {
    const copaArgentina: any[] = [];
    const copaApa: any[] = [];

    GRUPOS.forEach((grupo) => {
      const tabla = tablasPorGrupo[grupo] || [];

      tabla.forEach((item, index) => {
        if (index <= 1) {
          copaArgentina.push({ ...item, posicion: index + 1 });
        } else {
          copaApa.push({ ...item, posicion: index + 1 });
        }
      });
    });

    return { copaArgentina, copaApa };
  }, [tablasPorGrupo]);

  async function generarCuartosDeFinalAutomaticos() {
    setMensaje("");

    for (const g of GRUPOS) {
      if ((tablasPorGrupo[g] || []).length < 4) {
        setMensaje(`El Grupo ${g} aún no tiene los 4 equipos con tabla generada.`);
        return;
      }
    }

    const tA = tablasPorGrupo["A"];
    const tB = tablasPorGrupo["B"];
    const tC = tablasPorGrupo["C"];
    const tD = tablasPorGrupo["D"];

    const crucesArgentina = [
      { local: tA[0].equipo, visitante: tB[1].equipo, comp: "copa_argentina" },
      { local: tB[0].equipo, visitante: tA[1].equipo, comp: "copa_argentina" },
      { local: tC[0].equipo, visitante: tD[1].equipo, comp: "copa_argentina" },
      { local: tD[0].equipo, visitante: tC[1].equipo, comp: "copa_argentina" },
    ];

    const crucesApa = [
      { local: tA[2].equipo, visitante: tB[3].equipo, comp: "copa_apa" },
      { local: tB[2].equipo, visitante: tA[3].equipo, comp: "copa_apa" },
      { local: tC[2].equipo, visitante: tD[3].equipo, comp: "copa_apa" },
      { local: tD[2].equipo, visitante: tC[3].equipo, comp: "copa_apa" },
    ];

    const confirmacion = window.confirm(
      "Se van a generar los 8 cruces de Cuartos de Final (4 de Copa Argentina y 4 de Copa APA) según las posiciones de las tablas. ¿Continuar?",
    );
    if (!confirmacion) return;

    const payload = [...crucesArgentina, ...crucesApa].map((c) => ({
      local: c.local,
      visitante: c.visitante,
      resultado: null,
      fecha: "Cuartos",
      temporada,
      division: DIVISION_COPA,
      dia: null,
      hora: null,
      partido_id: null,
      competicion: c.comp,
      grupo: null,
      fase: "cuartos",
      ronda: `Cuartos de Final`,
    }));

    const { error } = await supabase.from("partidos").insert(payload);

    if (error) {
      console.log(error);
      setMensaje("Error al generar cruces de Cuartos de Final.");
      return;
    }

    setMensaje("¡Cruces de Cuartos de Final generados con éxito!");
    await cargarTodo();
  }

  function cambiarEquipoGrupo(grupo: string, index: number, equipo: string) {
    setGrupos((prev) => {
      const copia = { ...prev, [grupo]: [...prev[grupo]] };
      copia[grupo][index] = equipo;
      return copia;
    });
  }

  async function generarFaseGrupos() {
    setMensaje("");

    for (const grupo of GRUPOS) {
      const equiposGrupo = grupos[grupo].filter(Boolean);
      const unicos = new Set(equiposGrupo);

      if (equiposGrupo.length !== 4) {
        setMensaje(`El grupo ${grupo} debe tener 4 equipos.`);
        return;
      }

      if (unicos.size !== 4) {
        setMensaje(`El grupo ${grupo} tiene equipos repetidos.`);
        return;
      }
    }

    const todos = Object.values(grupos).flat().filter(Boolean);
    const todosUnicos = new Set(todos);

    if (todos.length !== todosUnicos.size) {
      setMensaje("Hay equipos repetidos entre distintos grupos.");
      return;
    }

    const existentes = partidos.filter((p) => p.competicion === COMPETICION_GRUPOS);

    if (existentes.length > 0) {
      const confirmar = window.confirm(
        `Ya existen ${existentes.length} partidos de fase de grupos.\n\n¿Borrar y regenerar?`,
      );

      if (!confirmar) return;

      const { error: deleteError } = await supabase
        .from("partidos")
        .delete()
        .eq("temporada", temporada)
        .eq("competicion", COMPETICION_GRUPOS)
        .eq("fase", "grupos");

      if (deleteError) {
        console.log(deleteError);
        setMensaje("No pude borrar la fase de grupos anterior.");
        return;
      }
    }

    const cruces = GRUPOS.flatMap((grupo) => generarPartidosGrupo(grupos[grupo], grupo));

    const payload = cruces.map((p) => ({
      local: p.local,
      visitante: p.visitante,
      resultado: null,
      fecha: p.fecha,
      temporada,
      division: DIVISION_COPA,
      dia: null,
      hora: null,
      partido_id: null,
      competicion: COMPETICION_GRUPOS,
      grupo: p.grupo,
      fase: "grupos",
      ronda: p.ronda,
    }));

    const { error } = await supabase.from("partidos").insert(payload);

    if (error) {
      console.log(error);
      setMensaje("Error generando fase de grupos.");
      return;
    }

    setMensaje(`Fase de grupos generada: ${payload.length} partidos.`);
    await cargarTodo();
  }

  async function crearCruceManual() {
    setMensaje("");

    if (!localManual || !visitanteManual) {
      setMensaje("Elegí local y visitante.");
      return;
    }

    if (localManual === visitanteManual) {
      setMensaje("Local y visitante no pueden ser el mismo equipo.");
      return;
    }

    const esGrupo = faseManual.startsWith("Grupo");
    const grupoAsignado = esGrupo ? faseManual.replace("Grupo ", "").trim() : null;
    let competicionAsignada = COMPETICION_GRUPOS;
    let faseNombre = "grupos";

    if (!esGrupo) {
      if (faseManual.includes("Copa Argentina")) competicionAsignada = "copa_argentina";
      if (faseManual.includes("Copa APA")) competicionAsignada = "copa_apa";

      if (faseManual.startsWith("Cuartos")) faseNombre = "cuartos";
      else if (faseManual.startsWith("Semifinal")) faseNombre = "semifinal";
      else if (faseManual.startsWith("Final")) faseNombre = "final";
    }

    const { error } = await supabase.from("partidos").insert({
      local: localManual,
      visitante: visitanteManual,
      resultado: null,
      fecha: fechaManual,
      temporada,
      division: DIVISION_COPA,
      dia: diaManual || null,
      hora: horaManual || null,
      partido_id: null,
      competicion: competicionAsignada,
      grupo: grupoAsignado,
      fase: faseNombre,
      ronda: `${faseManual} · Fecha ${fechaManual}`,
    });

    if (error) {
      console.log(error);
      setMensaje("Error creando cruce manual.");
      return;
    }

    setMensaje("Cruce manual creado.");
    setLocalManual("");
    setVisitanteManual("");
    await cargarTodo();
  }

  async function actualizarPartido(id: string, cambios: Partial<PartidoCopa>) {
    if (typeof cambios.resultado === "string" && cambios.resultado.trim()) {
      const resultadoLimpio = cambios.resultado.trim();

      if (!/^\d+\s*-\s*\d+$/.test(resultadoLimpio)) {
        setMensaje("El resultado debe tener formato 1-0, 2-2, 3-1, etc.");
        return;
      }

      cambios.resultado = resultadoLimpio.replace(/\s+/g, "");
    }

    const { error } = await supabase.from("partidos").update(cambios).eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error actualizando partido.");
      return;
    }

    setPartidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
    setPartidosCampeones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    );
    setPartidosPlayoffs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    );
  }

  async function eliminarPartido(id: string) {
    const confirmar = window.confirm("¿Eliminar este cruce de copa?");
    if (!confirmar) return;

    const { error } = await supabase.from("partidos").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando cruce.");
      return;
    }

    setPartidos((prev) => prev.filter((p) => p.id !== id));
    setPartidosCampeones((prev) => prev.filter((p) => p.id !== id));
  }

  async function eliminarFaseGrupos() {
    if (partidos.length === 0) {
      setMensaje("No hay partidos de grupos para eliminar.");
      return;
    }

    const confirmar = window.confirm(
      `Vas a eliminar ${partidos.length} partidos de fase de grupos. ¿Continuar?`,
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("partidos")
      .delete()
      .eq("temporada", temporada)
      .eq("competicion", COMPETICION_GRUPOS)
      .eq("fase", "grupos");

    if (error) {
      console.log(error);
      setMensaje("Error eliminando fase de grupos.");
      return;
    }

    setMensaje("Fase de grupos eliminada.");
    await cargarTodo();
  }

  function equiposDisponibles(valorActual = "") {
    return equipos.filter((equipo) => {
      if (equipo.nombre === valorActual) return true;
      return !equiposUsados.has(equipo.nombre);
    });
  }

  async function generarCopaCampeones() {
    setMensaje("");

    if (!campeonPrimera || !campeonSegunda || !campeonCopaArgentina || !campeonCopaApa) {
      setMensaje("Elegí los cuatro campeones: Primera, Segunda, Copa Argentina y Copa APA.");
      return;
    }

    const participantes = [
      campeonPrimera,
      campeonSegunda,
      campeonCopaArgentina,
      campeonCopaApa,
    ];

    if (new Set(participantes).size !== participantes.length) {
      setMensaje("No puede haber equipos repetidos en Copa de Campeones.");
      return;
    }

    if (partidosCampeones.length > 0) {
      const confirmar = window.confirm(
        `Ya existen ${partidosCampeones.length} partidos de Copa de Campeones para ${temporada}.\n\n¿Querés borrarlos y generarlos nuevamente?`,
      );

      if (!confirmar) return;

      const { error: deleteError } = await supabase
        .from("partidos")
        .delete()
        .eq("temporada", temporada)
        .eq("competicion", COMPETICION_CAMPEONES);

      if (deleteError) {
        console.log(deleteError);
        setMensaje("No pude borrar la Copa de Campeones anterior.");
        return;
      }
    }

    const payload = [
      {
        local: campeonPrimera,
        visitante: campeonCopaApa,
        resultado: null,
        fecha: "1",
        temporada,
        division: DIVISION_COPA,
        dia: diaSemisCampeones || null,
        hora: horaSemisCampeones || null,
        partido_id: null,
        competicion: COMPETICION_CAMPEONES,
        grupo: null,
        fase: "semifinal",
        ronda: "Copa de Campeones · Semifinal 1",
      },
      {
        local: campeonSegunda,
        visitante: campeonCopaArgentina,
        resultado: null,
        fecha: "1",
        temporada,
        division: DIVISION_COPA,
        dia: diaSemisCampeones || null,
        hora: horaSemisCampeones || null,
        partido_id: null,
        competicion: COMPETICION_CAMPEONES,
        grupo: null,
        fase: "semifinal",
        ronda: "Copa de Campeones · Semifinal 2",
      },
      {
        local: "Ganador SF1",
        visitante: "Ganador SF2",
        resultado: null,
        fecha: "2",
        temporada,
        division: DIVISION_COPA,
        dia: diaFinalCampeones || null,
        hora: horaFinalCampeones || null,
        partido_id: null,
        competicion: COMPETICION_CAMPEONES,
        grupo: null,
        fase: "final",
        ronda: "Copa de Campeones · Final",
      },
    ];

    const { error } = await supabase.from("partidos").insert(payload);

    if (error) {
      console.log(error);
      setMensaje("Error generando Copa de Campeones.");
      return;
    }

    setMensaje("Copa de Campeones generada: 2 semifinales y 1 final.");
    await cargarTodo();
  }

  async function eliminarCopaCampeones() {
    if (partidosCampeones.length === 0) {
      setMensaje("No hay partidos de Copa de Campeones para eliminar.");
      return;
    }

    const confirmar = window.confirm(
      `Vas a eliminar ${partidosCampeones.length} partidos de Copa de Campeones. ¿Continuar?`,
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("partidos")
      .delete()
      .eq("temporada", temporada)
      .eq("competicion", COMPETICION_CAMPEONES);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando Copa de Campeones.");
      return;
    }

    setMensaje("Copa de Campeones eliminada.");
    await cargarTodo();
  }

  async function generarPlayoffs() {
    setMensaje("");

    if (!segundoSegunda || !terceroSegunda || !cuartoSegunda || !quintoSegunda || !anteultimoPrimera) {
      setMensaje("Elegí 2°, 3°, 4° y 5° de Segunda, más el anteúltimo de Primera.");
      return;
    }

    const participantes = [
      segundoSegunda,
      terceroSegunda,
      cuartoSegunda,
      quintoSegunda,
      anteultimoPrimera,
    ];

    if (new Set(participantes).size !== participantes.length) {
      setMensaje("No puede haber equipos repetidos en Playoffs.");
      return;
    }

    if (partidosPlayoffs.length > 0) {
      const confirmar = window.confirm(
        `Ya existen ${partidosPlayoffs.length} partidos de Playoffs para ${temporada}.\n\n¿Querés borrarlos y generarlos nuevamente?`,
      );

      if (!confirmar) return;

      const { error: deleteError } = await supabase
        .from("partidos")
        .delete()
        .eq("temporada", temporada)
        .eq("competicion", COMPETICION_PLAYOFFS);

      if (deleteError) {
        console.log(deleteError);
        setMensaje("No pude borrar los Playoffs anteriores.");
        return;
      }
    }

    const payload = [
      {
        local: segundoSegunda,
        visitante: quintoSegunda,
        resultado: null,
        fecha: "1",
        temporada,
        division: DIVISION_COPA,
        dia: diaSemisPlayoffs || null,
        hora: horaSemisPlayoffs || null,
        partido_id: null,
        competicion: COMPETICION_PLAYOFFS,
        grupo: null,
        fase: "semifinal",
        ronda: "Playoffs Ascenso · Semifinal 1",
      },
      {
        local: terceroSegunda,
        visitante: cuartoSegunda,
        resultado: null,
        fecha: "1",
        temporada,
        division: DIVISION_COPA,
        dia: diaSemisPlayoffs || null,
        hora: horaSemisPlayoffs || null,
        partido_id: null,
        competicion: COMPETICION_PLAYOFFS,
        grupo: null,
        fase: "semifinal",
        ronda: "Playoffs Ascenso · Semifinal 2",
      },
      {
        local: "Ganador SF1",
        visitante: "Ganador SF2",
        resultado: null,
        fecha: "2",
        temporada,
        division: DIVISION_COPA,
        dia: diaFinalPlayoffs || null,
        hora: horaFinalPlayoffs || null,
        partido_id: null,
        competicion: COMPETICION_PLAYOFFS,
        grupo: null,
        fase: "final_ascenso",
        ronda: "Playoffs Ascenso · Final",
      },
      {
        local: "Ganador Final Ascenso",
        visitante: anteultimoPrimera,
        resultado: null,
        fecha: "3",
        temporada,
        division: DIVISION_COPA,
        dia: diaPromocion || null,
        hora: horaPromocion || null,
        partido_id: null,
        competicion: COMPETICION_PLAYOFFS,
        grupo: null,
        fase: "promocion",
        ronda: "Promoción · Ascenso/Descenso",
      },
    ];

    const { error } = await supabase.from("partidos").insert(payload);

    if (error) {
      console.log(error);
      setMensaje("Error generando Playoffs.");
      return;
    }

    setMensaje("Playoffs generados: 2 semifinales, 1 final de ascenso y 1 promoción.");
    await cargarTodo();
  }

  async function eliminarPlayoffs() {
    if (partidosPlayoffs.length === 0) {
      setMensaje("No hay partidos de Playoffs para eliminar.");
      return;
    }

    const confirmar = window.confirm(
      `Vas a eliminar ${partidosPlayoffs.length} partidos de Playoffs. ¿Continuar?`,
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("partidos")
      .delete()
      .eq("temporada", temporada)
      .eq("competicion", COMPETICION_PLAYOFFS);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando Playoffs.");
      return;
    }

    setMensaje("Playoffs eliminados.");
    await cargarTodo();
  }

  async function eliminarPartidoPlayoff(id: string) {
    const confirmar = window.confirm("¿Eliminar este partido de Playoffs?");
    if (!confirmar) return;

    const { error } = await supabase.from("partidos").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando partido de Playoffs.");
      return;
    }

    setPartidosPlayoffs((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-[1700px] space-y-8">
          <section className="relative overflow-hidden rounded-[40px] border border-yellow-500/25 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.12)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/30" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-300">
                  Admin · Copas APA
                </p>

                <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                  <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                    Copa
                  </span>
                  <span className="block text-yellow-300 drop-shadow-[0_0_22px_rgba(250,204,21,.40)]">
                    Grupos
                  </span>
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                  Cargá grupos, Copa de Campeones y Playoffs de Ascenso desde el mismo panel competitivo.
                </p>
              </div>

              <div className="rounded-[34px] border border-yellow-400/25 bg-black/35 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                  Resumen
                </p>

                <h2 className="mt-3 text-3xl font-black uppercase">
                  {temporada}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Partidos</p>
                    <p className="mt-2 text-3xl font-black text-yellow-300">{partidos.length}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Equipos</p>
                    <p className="mt-2 text-3xl font-black text-sky-300">{Object.values(grupos).flat().filter(Boolean).length}/16</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {mensaje && (
            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-4 text-sm font-black uppercase text-yellow-300">
              {mensaje}
            </div>
          )}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
            <aside className="space-y-6">
              <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 p-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                  Temporada
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {TEMPORADAS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemporada(t)}
                      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase transition ${
                        temporada === t
                          ? "border-sky-300 bg-sky-400 text-black"
                          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-sky-400/30 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              {/* MANTENIMIENTO DE COPAS */}
              <section className="rounded-[34px] border border-emerald-500/25 bg-[#020714]/95 p-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                  Estado de Copas
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase">
                  Visibilidad ({temporada})
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Activa o poné en mantenimiento las vistas públicas para esta temporada.
                </p>

                <div className="mt-5 space-y-4">
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 cursor-pointer">
                    <span className="text-sm font-black uppercase text-white">Copa APA</span>
                    <input
                      type="checkbox"
                      checked={copaApaActiva}
                      onChange={(e) => setCopaApaActiva(e.target.checked)}
                      className="h-5 w-5 accent-emerald-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 cursor-pointer">
                    <span className="text-sm font-black uppercase text-white">Copa Argentina</span>
                    <input
                      type="checkbox"
                      checked={copaArgentinaActiva}
                      onChange={(e) => setCopaArgentinaActiva(e.target.checked)}
                      className="h-5 w-5 accent-emerald-400 cursor-pointer"
                    />
                  </label>

                  <button
                    onClick={guardarEstadoCopas}
                    disabled={guardandoEstado}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white disabled:opacity-50"
                  >
                    {guardandoEstado ? "Guardando..." : "Guardar Estado"}
                  </button>
                </div>
              </section>

              {/* SANCIONES LIGA / QUITAR PUNTOS */}
              <section className="rounded-[34px] border border-red-500/25 bg-[#020714]/95 p-6 space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-red-400">
                    Sanciones Liga
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase">Quitar Puntos</h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Descuento de puntos a los equipos por no presentación (W.O.).
                  </p>
                </div>

                <form onSubmit={aplicarSancion} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Equipo
                    </label>
                    <select
                      value={equipoSancionar}
                      onChange={(e) => setEquipoSancionar(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black uppercase text-white outline-none"
                    >
                      <option value="">Seleccionar equipo...</option>
                      {equipos.map((eq) => (
                        <option key={`sancion-${eq.nombre}`} value={eq.nombre}>
                          {eq.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                        Puntos
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={puntosRestar}
                        onChange={(e) => setPuntosRestar(Number(e.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                        Motivo
                      </label>
                      <input
                        type="text"
                        value={motivoSancion}
                        onChange={(e) => setMotivoSancion(e.target.value)}
                        placeholder="W.O."
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black uppercase text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoSancion}
                    className="w-full rounded-2xl border border-red-400/30 bg-red-500 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {guardandoSancion ? "Aplicando..." : "- Restar Puntos"}
                  </button>
                </form>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                    Sanciones registradas ({sanciones.length})
                  </p>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sanciones.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-black uppercase text-white">{s.equipo}</p>
                          <p className="text-[9px] text-zinc-400">{s.motivo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-red-400">-{s.puntos_descontados} pts</span>
                          <button
                            onClick={() => eliminarSancion(s.id)}
                            className="rounded-lg border border-red-400/20 bg-red-400/20 px-2 py-0.5 text-[9px] font-black text-red-300 hover:bg-red-500 hover:text-white"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}

                    {sanciones.length === 0 && (
                      <p className="text-[11px] text-zinc-500 italic text-center py-1">
                        Sin sanciones en {temporada}.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                  Configurar grupos
                </p>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {GRUPOS.map((grupo) => (
                    <button
                      key={grupo}
                      onClick={() => setGrupoSeleccionado(grupo)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase transition ${
                        grupoSeleccionado === grupo
                          ? "border-yellow-300 bg-yellow-400 text-black"
                          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-yellow-400/30 hover:text-white"
                      }`}
                    >
                      {grupo}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {grupos[grupoSeleccionado].map((equipoActual, index) => (
                    <select
                      key={`${grupoSeleccionado}-${index}`}
                      value={equipoActual}
                      onChange={(e) =>
                        cambiarEquipoGrupo(grupoSeleccionado, index, e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                    >
                      <option value="">Equipo {index + 1}</option>

                      {equiposDisponibles(equipoActual).map((equipo) => (
                        <option key={`${grupoSeleccionado}-${index}-${equipo.nombre}`} value={equipo.nombre}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>

                <button
                  onClick={generarFaseGrupos}
                  className="mt-5 w-full rounded-2xl border border-yellow-400/30 bg-[#C9981A] px-5 py-4 text-sm font-black uppercase text-white transition hover:bg-[#D4A017]"
                >
                  Generar fase de grupos
                </button>

                <button
                  onClick={eliminarFaseGrupos}
                  className="mt-3 w-full rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                >
                  Eliminar grupos
                </button>
              </section>

              <section className="rounded-[34px] border border-emerald-500/25 bg-[#020714]/95 p-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                  Manual
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">Añadir cruce</h2>

                <div className="mt-5 space-y-3">
                  <select
                    value={faseManual}
                    onChange={(e) => setFaseManual(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  >
                    {FASES_MANUALES.map((fase) => (
                      <option key={fase} value={fase}>
                        {fase}
                      </option>
                    ))}
                  </select>

                  <select
                    value={localManual}
                    onChange={(e) => setLocalManual(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  >
                    <option value="">Local</option>
                    {equipos.map((e) => (
                      <option key={`local-${e.nombre}`} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={visitanteManual}
                    onChange={(e) => setVisitanteManual(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  >
                    <option value="">Visitante</option>
                    {equipos.map((e) => (
                      <option key={`vis-${e.nombre}`} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    value={fechaManual}
                    onChange={(e) => setFechaManual(e.target.value)}
                    placeholder="Fecha / Ronda"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  />

                  <input
                    value={diaManual}
                    onChange={(e) => setDiaManual(e.target.value)}
                    placeholder="Día"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  />

                  <input
                    value={horaManual}
                    onChange={(e) => setHoraManual(e.target.value)}
                    placeholder="Hora"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                  />

                  <button
                    onClick={crearCruceManual}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white"
                  >
                    + Añadir cruce
                  </button>
                </div>
              </section>
            </aside>

            <section className="space-y-6">
              <section className="grid grid-cols-1 gap-6 2xl:grid-cols-4">
                {GRUPOS.map((grupo) => (
                  <section
                    key={`tabla-${grupo}`}
                    className="rounded-[30px] border border-sky-500/25 bg-[#020714]/95 p-5"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                      Grupo {grupo}
                    </p>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[420px] border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-[0.18em] text-sky-300/80">
                            <th className="py-2 text-left">#</th>
                            <th className="py-2 text-left">Equipo</th>
                            <th className="py-2 text-center">PTS</th>
                            <th className="py-2 text-center">DG</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(tablasPorGrupo[grupo] || []).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-5 text-center text-zinc-500">
                                Sin datos
                              </td>
                            </tr>
                          ) : (
                            tablasPorGrupo[grupo].map((e, index) => (
                              <tr
                                key={`${grupo}-${e.equipo}`}
                                className="bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                              >
                                <td className="rounded-l-xl px-3 py-3 font-black text-yellow-300">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-3 text-xs font-black uppercase">
                                  {e.equipo}
                                </td>
                                <td className="py-3 text-center font-black text-yellow-300">
                                  {e.pts}
                                </td>
                                <td className="rounded-r-xl py-3 text-center font-black text-sky-300">
                                  {e.dg > 0 ? `+${e.dg}` : e.dg}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                    Clasifican a Copa Argentina
                  </p>

                  <div className="mt-5 space-y-2">
                    {clasificados.copaArgentina.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-zinc-500">
                        Todavía no hay clasificados.
                      </p>
                    ) : (
                      clasificados.copaArgentina.map((e) => (
                        <div
                          key={`arg-${e.grupo}-${e.equipo}`}
                          className="flex items-center justify-between rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3"
                        >
                          <span className="font-black uppercase">{e.equipo}</span>
                          <span className="text-xs font-black uppercase text-yellow-300">
                            {e.posicion}° Grupo {e.grupo}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                    Clasifican a Copa APA
                  </p>

                  <div className="mt-5 space-y-2">
                    {clasificados.copaApa.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-zinc-500">
                        Todavía no hay clasificados.
                      </p>
                    ) : (
                      clasificados.copaApa.map((e) => (
                        <div
                          key={`apa-${e.grupo}-${e.equipo}`}
                          className="flex items-center justify-between rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3"
                        >
                          <span className="font-black uppercase">{e.equipo}</span>
                          <span className="text-xs font-black uppercase text-sky-300">
                            {e.posicion}° Grupo {e.grupo}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </section>

              {/* GENERAR CUARTOS AUTOMÁTICOS */}
              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6 text-center">
                <h3 className="text-xl font-black uppercase text-yellow-300">Generar Cuartos de Final Automáticos</h3>
                <p className="mt-2 text-xs text-zinc-400">
                  Cruzará automáticamente los 1° vs 2° para Copa Argentina y 3° vs 4° para Copa APA.
                </p>
                <button
                  onClick={generarCuartosDeFinalAutomaticos}
                  className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400 px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  ⚡ Generar Cruces de Cuartos de Final
                </button>
              </section>

              <section className="rounded-[34px] border border-cyan-400/25 bg-[#020714]/95 p-6">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                      Copa de Campeones
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase">
                      Final Four
                    </h2>
                  </div>

                  <span className="text-xs font-black uppercase text-zinc-500">
                    {partidosCampeones.length} partidos
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
                  <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/5 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                      Crear torneo
                    </p>

                    <div className="mt-5 space-y-3">
                      <select
                        value={campeonPrimera}
                        onChange={(e) => setCampeonPrimera(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">Campeón Primera</option>
                        {equipos.map((e) => (
                          <option key={`camp-primera-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={campeonSegunda}
                        onChange={(e) => setCampeonSegunda(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">Campeón Segunda</option>
                        {equipos.map((e) => (
                          <option key={`camp-segunda-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={campeonCopaArgentina}
                        onChange={(e) => setCampeonCopaArgentina(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">Campeón Copa Argentina</option>
                        {equipos.map((e) => (
                          <option key={`camp-arg-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={campeonCopaApa}
                        onChange={(e) => setCampeonCopaApa(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">Campeón Copa APA</option>
                        {equipos.map((e) => (
                          <option key={`camp-apa-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          value={diaSemisCampeones}
                          onChange={(e) => setDiaSemisCampeones(e.target.value)}
                          placeholder="Día semifinales"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={horaSemisCampeones}
                          onChange={(e) => setHoraSemisCampeones(e.target.value)}
                          placeholder="Hora semifinales"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={diaFinalCampeones}
                          onChange={(e) => setDiaFinalCampeones(e.target.value)}
                          placeholder="Día final"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={horaFinalCampeones}
                          onChange={(e) => setHoraFinalCampeones(e.target.value)}
                          placeholder="Hora final"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />
                      </div>

                      <button
                        onClick={generarCopaCampeones}
                        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white"
                      >
                        Generar Copa de Campeones
                      </button>

                      <button
                        onClick={eliminarCopaCampeones}
                        className="w-full rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Eliminar Copa de Campeones
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {partidosCampeones.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                        Todavía no hay Copa de Campeones cargada.
                      </p>
                    ) : (
                      partidosCampeones.map((p) => (
                        <article
                          key={p.id}
                          className="rounded-2xl border border-cyan-400/15 bg-[#020714] p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase text-cyan-300">
                              {p.ronda || p.fase} · Fecha {p.fecha}
                            </span>

                            <button
                              onClick={() => eliminarPartido(p.id)}
                              className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                            >
                              Eliminar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] xl:items-center">
                            <select
                              value={p.local}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  local: e.target.value,
                                })
                              }
                              disabled={Boolean(p.partido_id)}
                              className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value={p.local}>{p.local}</option>
                              {equipos.map((e) => (
                                <option key={`champ-local-${p.id}-${e.nombre}`} value={e.nombre}>
                                  {e.nombre}
                                </option>
                              ))}
                            </select>

                            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-3 text-center">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-300/70">
                                Resultado
                              </p>

                              {p.partido_id ? (
                                <p className="mt-1 text-xl font-black text-yellow-300">
                                  {p.resultado || "VS"}
                                </p>
                              ) : (
                                <input
                                  value={p.resultado || ""}
                                  onChange={(e) =>
                                    actualizarPartido(p.id, {
                                      resultado: e.target.value || null,
                                    })
                                  }
                                  placeholder="VS"
                                  className="mt-1 w-full rounded-xl border border-yellow-400/20 bg-black/35 px-2 py-2 text-center text-lg font-black uppercase text-yellow-300 outline-none placeholder:text-yellow-300"
                                />
                              )}
                            </div>

                            <select
                              value={p.visitante}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  visitante: e.target.value,
                                })
                              }
                              disabled={Boolean(p.partido_id)}
                              className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value={p.visitante}>{p.visitante}</option>
                              {equipos.map((e) => (
                                <option key={`champ-vis-${p.id}-${e.nombre}`} value={e.nombre}>
                                  {e.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          {p.partido_id && (
                            <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                              🔒 Resultado bloqueado porque este partido ya tiene TXT cargado.
                            </p>
                          )}

                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <input
                              value={String(p.fecha || "")}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  fecha: e.target.value,
                                })
                              }
                              placeholder="Fecha"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />

                            <input
                              value={p.dia || ""}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  dia: e.target.value,
                                })
                              }
                              placeholder="Día"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />

                            <input
                              value={p.hora || ""}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  hora: e.target.value,
                                })
                              }
                              placeholder="Hora"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[34px] border border-orange-400/25 bg-[#020714]/95 p-6">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-300">
                      Playoffs de Ascenso
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase">
                      Segunda → Primera
                    </h2>
                  </div>

                  <span className="text-xs font-black uppercase text-zinc-500">
                    {partidosPlayoffs.length} partidos
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
                  <div className="rounded-[28px] border border-orange-400/20 bg-orange-400/5 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">
                      Crear playoffs
                    </p>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Formato: 2° vs 5°, 3° vs 4°, final entre ganadores y promoción contra el anteúltimo de Primera.
                    </p>

                    <div className="mt-5 space-y-3">
                      <select
                        value={segundoSegunda}
                        onChange={(e) => setSegundoSegunda(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">2° Segunda</option>
                        {equipos.map((e) => (
                          <option key={`playoff-2-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={terceroSegunda}
                        onChange={(e) => setTerceroSegunda(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">3° Segunda</option>
                        {equipos.map((e) => (
                          <option key={`playoff-3-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={cuartoSegunda}
                        onChange={(e) => setCuartoSegunda(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">4° Segunda</option>
                        {equipos.map((e) => (
                          <option key={`playoff-4-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={quintoSegunda}
                        onChange={(e) => setQuintoSegunda(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">5° Segunda</option>
                        {equipos.map((e) => (
                          <option key={`playoff-5-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={anteultimoPrimera}
                        onChange={(e) => setAnteultimoPrimera(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                      >
                        <option value="">Anteúltimo Primera</option>
                        {equipos.map((e) => (
                          <option key={`playoff-promocion-${e.nombre}`} value={e.nombre}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          value={diaSemisPlayoffs}
                          onChange={(e) => setDiaSemisPlayoffs(e.target.value)}
                          placeholder="Día semifinales"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={horaSemisPlayoffs}
                          onChange={(e) => setHoraSemisPlayoffs(e.target.value)}
                          placeholder="Hora semifinales"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={diaFinalPlayoffs}
                          onChange={(e) => setDiaFinalPlayoffs(e.target.value)}
                          placeholder="Día final ascenso"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={horaFinalPlayoffs}
                          onChange={(e) => setHoraFinalPlayoffs(e.target.value)}
                          placeholder="Hora final ascenso"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={diaPromocion}
                          onChange={(e) => setDiaPromocion(e.target.value)}
                          placeholder="Día promoción"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />

                        <input
                          value={horaPromocion}
                          onChange={(e) => setHoraPromocion(e.target.value)}
                          placeholder="Hora promoción"
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                        />
                      </div>

                      <button
                        onClick={generarPlayoffs}
                        className="w-full rounded-2xl border border-orange-300/30 bg-orange-300 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white"
                      >
                        Generar Playoffs
                      </button>

                      <button
                        onClick={eliminarPlayoffs}
                        className="w-full rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Eliminar Playoffs
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {partidosPlayoffs.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                        Todavía no hay Playoffs cargados.
                      </p>
                    ) : (
                      partidosPlayoffs.map((p) => (
                        <article
                          key={p.id}
                          className="rounded-2xl border border-orange-400/15 bg-[#020714] p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-[10px] font-black uppercase text-orange-300">
                              {p.ronda || p.fase} · Fecha {p.fecha}
                            </span>

                            <button
                              onClick={() => eliminarPartidoPlayoff(p.id)}
                              className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                            >
                              Eliminar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] xl:items-center">
                            <select
                              value={p.local}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  local: e.target.value,
                                })
                              }
                              disabled={Boolean(p.partido_id)}
                              className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value={p.local}>{p.local}</option>
                              {equipos.map((e) => (
                                <option key={`play-local-${p.id}-${e.nombre}`} value={e.nombre}>
                                  {e.nombre}
                                </option>
                              ))}
                            </select>

                            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-3 text-center">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-300/70">
                                Resultado
                              </p>

                              {p.partido_id ? (
                                <p className="mt-1 text-xl font-black text-yellow-300">
                                  {p.resultado || "VS"}
                                </p>
                              ) : (
                                <input
                                  value={p.resultado || ""}
                                  onChange={(e) =>
                                    actualizarPartido(p.id, {
                                      resultado: e.target.value || null,
                                    })
                                  }
                                  placeholder="VS"
                                  className="mt-1 w-full rounded-xl border border-yellow-400/20 bg-black/35 px-2 py-2 text-center text-lg font-black uppercase text-yellow-300 outline-none placeholder:text-yellow-300"
                                />
                              )}
                            </div>

                            <select
                              value={p.visitante}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  visitante: e.target.value,
                                })
                              }
                              disabled={Boolean(p.partido_id)}
                              className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value={p.visitante}>{p.visitante}</option>
                              {equipos.map((e) => (
                                <option key={`play-vis-${p.id}-${e.nombre}`} value={e.nombre}>
                                  {e.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          {p.partido_id && (
                            <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                              🔒 Resultado bloqueado porque este partido ya tiene TXT cargado.
                            </p>
                          )}

                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <input
                              value={String(p.fecha || "")}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  fecha: e.target.value,
                                })
                              }
                              placeholder="Fecha"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />

                            <input
                              value={p.dia || ""}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  dia: e.target.value,
                                })
                              }
                              placeholder="Día"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />

                            <input
                              value={p.hora || ""}
                              onChange={(e) =>
                                actualizarPartido(p.id, {
                                  hora: e.target.value,
                                })
                              }
                              placeholder="Hora"
                              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                            />
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                      Partidos de grupos
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase">
                      Calendario
                    </h2>
                  </div>

                  <span className="text-xs font-black uppercase text-zinc-500">
                    {partidos.length} partidos
                  </span>
                </div>

                {loading ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    Cargando...
                  </p>
                ) : partidos.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    Todavía no hay cruces cargados.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {partidos.map((p) => (
                      <article
                        key={p.id}
                        className="rounded-2xl border border-sky-500/15 bg-[#020714] p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                            Grupo {p.grupo} · Fecha {p.fecha}
                          </span>

                          <button
                            onClick={() => eliminarPartido(p.id)}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                          >
                            Eliminar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] xl:items-center">
                          <p className="truncate rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-sm font-black uppercase text-white">
                            {p.local}
                          </p>

                          <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-3 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-300/70">
                              Resultado
                            </p>

                            {p.partido_id ? (
                              <p className="mt-1 text-xl font-black text-yellow-300">
                                {p.resultado || "VS"}
                              </p>
                            ) : (
                              <input
                                value={p.resultado || ""}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    resultado: e.target.value || null,
                                  })
                                }
                                placeholder="VS"
                                className="mt-1 w-full rounded-xl border border-yellow-400/20 bg-black/35 px-2 py-2 text-center text-lg font-black uppercase text-yellow-300 outline-none placeholder:text-yellow-300"
                              />
                            )}
                          </div>

                          <p className="truncate rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-sm font-black uppercase text-white">
                            {p.visitante}
                          </p>
                        </div>

                        {p.partido_id && (
                          <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                            🔒 Resultado bloqueado porque este partido ya tiene TXT cargado.
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                          <input
                            value={String(p.fecha || "")}
                            onChange={(e) =>
                              actualizarPartido(p.id, {
                                fecha: e.target.value,
                                ronda: `Grupo ${p.grupo || ""} · Fecha ${e.target.value}`,
                              })
                            }
                            placeholder="Fecha"
                            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                          />

                          <input
                            value={p.dia || ""}
                            onChange={(e) =>
                              actualizarPartido(p.id, {
                                dia: e.target.value,
                              })
                            }
                            placeholder="Día"
                            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                          />

                          <input
                            value={p.hora || ""}
                            onChange={(e) =>
                              actualizarPartido(p.id, {
                                hora: e.target.value,
                              })
                            }
                            placeholder="Hora"
                            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                          />
                        </div>

                        {p.partido_id && (
                          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                            partido_id: {p.partido_id}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </section>
          </section>
        </section>
      </main>
    </PermissionGuard>
  );
}