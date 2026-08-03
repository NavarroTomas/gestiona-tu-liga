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
  competicion?: string | null;
  equipo: string;
  puntos_descontados: number;
  motivo?: string | null;
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
  "3.º Puesto - Copa Argentina",
  "3.º Puesto - Copa APA",
  "Final - Copa Argentina",
  "Final - Copa APA",
];

const COMPETICION_GRUPOS = "copa_clasificatoria";
const DIVISION_COPA = "copa";

function normalizar(texto?: string | null) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function obtenerGanadorYPerdedor(partido: PartidoCopa): {
  ganador: string | null;
  perdedor: string | null;
} {
  if (!partido.resultado || !partido.resultado.includes("-"))
    return { ganador: null, perdedor: null };
  const [glRaw, gvRaw] = partido.resultado.split("-");
  const gl = Number(glRaw?.trim());
  const gv = Number(gvRaw?.trim());
  if (Number.isNaN(gl) || Number.isNaN(gv)) return { ganador: null, perdedor: null };

  if (gl > gv) return { ganador: partido.local, perdedor: partido.visitante };
  if (gv > gl) return { ganador: partido.visitante, perdedor: partido.local };
  return { ganador: null, perdedor: null };
}

function obtenerGanador(partido: PartidoCopa): string | null {
  return obtenerGanadorYPerdedor(partido).ganador;
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

function calcularTablaGrupo(
  partidos: PartidoCopa[],
  grupo: string,
  sanciones: Sancion[] = []
) {
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
        sancion_pts: 0,
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

  Object.keys(mapa).forEach((nombreEquipo) => {
    const sancionesEquipo = sanciones.filter(
      (s) => normalizar(s.equipo) === normalizar(nombreEquipo)
    );
    const totalDescuento = sancionesEquipo.reduce(
      (acc, s) => acc + Number(s.puntos_descontados),
      0
    );

    mapa[nombreEquipo].sancion_pts = totalDescuento;
    mapa[nombreEquipo].pts = mapa[nombreEquipo].pts - totalDescuento;
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
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // TAB DE FILTRO DE CALENDARIO
  const [tabFiltroCompeticion, setTabFiltroCompeticion] = useState<
    "todos" | "primera" | "segunda" | "grupos" | "copa_argentina" | "copa_apa"
  >("copa_argentina");

  const [equipoSancionar, setEquipoSancionar] = useState("");
  const [puntosRestar, setPuntosRestar] = useState(1);
  const [motivoSancion, setMotivoSancion] = useState("No presentación (W.O.)");
  const [guardandoSancion, setGuardandoSancion] = useState(false);

  const [copaApaActiva, setCopaApaActiva] = useState(false);
  const [copaArgentinaActiva, setCopaArgentinaActiva] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const [grupos, setGrupos] = useState<Record<string, string[]>>({
    A: ["", "", "", ""],
    B: ["", "", "", ""],
    C: ["", "", "", ""],
    D: ["", "", "", ""],
  });

  const [localManual, setLocalManual] = useState("");
  const [visitanteManual, setVisitanteManual] = useState("");
  const [faseManual, setFaseManual] = useState("3.º Puesto - Copa Argentina");
  const [fechaManual, setFechaManual] = useState("1");
  const [diaManual, setDiaManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  useEffect(() => {
    cargarTodo();
  }, [temporada]);

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");

    const [equiposRes, partidosRes, configRes, sancionesRes] = await Promise.all([
      supabase
        .from("v_clubes_temporada_public")
        .select("*")
        .eq("temporada", temporada)
        .eq("activo", true)
        .order("nombre", { ascending: true }),

      supabase
        .from("partidos")
        .select(
          "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda"
        )
        .eq("temporada", temporada),

      supabase
        .from("configuracion_copas")
        .select("*")
        .eq("temporada", temporada)
        .maybeSingle(),

      supabase
        .from("sanciones_equipos")
        .select("*")
        .eq("temporada", temporada)
        .eq("competicion", "copa")
        .order("created_at", { ascending: false }),
    ]);

    if (configRes.data) {
      setCopaApaActiva(configRes.data.copa_apa_activa ?? false);
      setCopaArgentinaActiva(configRes.data.copa_argentina_activa ?? false);
    } else {
      setCopaApaActiva(false);
      setCopaArgentinaActiva(false);
    }

    if (sancionesRes.data) {
      setSanciones(sancionesRes.data as Sancion[]);
    } else {
      setSanciones([]);
    }

    setEquipos(
      ((equiposRes.data || []) as any[]).map((e) => ({
        id: e.club_id,
        nombre: e.nombre,
        slug: e.slug,
        logo_url: e.logo_url,
      }))
    );

    setPartidos((partidosRes.data || []) as PartidoCopa[]);
    setLoading(false);
  }

  // GENERAR AUTOMÁTICAMENTE SEMIFINALES
  async function generarSemifinalesAutomaticas(competicion: "copa_argentina" | "copa_apa") {
    setMensaje("");

    const cuartosComp = partidos.filter(
      (p) =>
        p.competicion === competicion &&
        (p.fase?.toLowerCase() === "cuartos" || p.ronda?.toLowerCase().includes("cuartos"))
    );

    if (cuartosComp.length < 4) {
      setMensaje(`Se necesitan 4 partidos de Cuartos de Final para generar las Semis.`);
      return;
    }

    const ganadores = cuartosComp.map(obtenerGanador);
    if (ganadores.some((g) => !g)) {
      setMensaje(`Todos los partidos de Cuartos deben tener resultado cargado.`);
      return;
    }

    const confirmacion = window.confirm(
      `Se crearán los 2 cruces de Semifinales con los ganadores:\n- ${ganadores[0]} vs ${ganadores[1]}\n- ${ganadores[2]} vs ${ganadores[3]}\n\n¿Continuar?`
    );
    if (!confirmacion) return;

    const payload = [
      {
        local: ganadores[0]!,
        visitante: ganadores[1]!,
        resultado: null,
        fecha: "Semifinal",
        temporada,
        division: DIVISION_COPA,
        competicion,
        fase: "semifinal",
        ronda: "Semifinal 1",
      },
      {
        local: ganadores[2]!,
        visitante: ganadores[3]!,
        resultado: null,
        fecha: "Semifinal",
        temporada,
        division: DIVISION_COPA,
        competicion,
        fase: "semifinal",
        ronda: "Semifinal 2",
      },
    ];

    const { error } = await supabase.from("partidos").insert(payload);
    if (error) {
      setMensaje("Error al generar Semifinales.");
    } else {
      setMensaje("¡Semifinales generadas con éxito!");
      await cargarTodo();
    }
  }

  // GENERAR AUTOMÁTICAMENTE LA GRAN FINAL Y EL 3.º PUESTO DESDE SEMIS
  async function generarFinalY3erPuestoAutomatico(competicion: "copa_argentina" | "copa_apa") {
    setMensaje("");

    const semisComp = partidos.filter(
      (p) =>
        p.competicion === competicion &&
        (p.fase?.toLowerCase().includes("semifinal") || p.ronda?.toLowerCase().includes("semifinal"))
    );

    if (semisComp.length < 2) {
      setMensaje(`Se necesitan 2 semifinales jugadas para generar la Final y el 3.º Puesto.`);
      return;
    }

    const resultadosSemis = semisComp.map(obtenerGanadorYPerdedor);
    if (resultadosSemis.some((r) => !r.ganador || !r.perdedor)) {
      setMensaje(`Las dos semifinales deben tener un resultado definido.`);
      return;
    }

    const ganadores = [resultadosSemis[0].ganador!, resultadosSemis[1].ganador!];
    const perdedores = [resultadosSemis[0].perdedor!, resultadosSemis[1].perdedor!];

    const confirmacion = window.confirm(
      `Se generarán los siguientes cruces:\n\n🏆 GRAN FINAL:\n${ganadores[0]} vs ${ganadores[1]}\n\n🥉 3.º Y 4.º PUESTO:\n${perdedores[0]} vs ${perdedores[1]}\n\n¿Continuar?`
    );
    if (!confirmacion) return;

    const payload = [
      {
        local: ganadores[0],
        visitante: ganadores[1],
        resultado: null,
        fecha: "Final",
        temporada,
        division: DIVISION_COPA,
        competicion,
        fase: "final",
        ronda: "Gran Final",
      },
      {
        local: perdedores[0],
        visitante: perdedores[1],
        resultado: null,
        fecha: "3er Puesto",
        temporada,
        division: DIVISION_COPA,
        competicion,
        fase: "3er_puesto",
        ronda: "3.º y 4.º Puesto",
      },
    ];

    const { error } = await supabase.from("partidos").insert(payload);
    if (error) setMensaje("Error al generar la Final y el 3.º Puesto.");
    else {
      setMensaje("¡Gran Final y 3.º Puesto generados con éxito!");
      await cargarTodo();
    }
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
      { onConflict: "temporada" }
    );

    if (error) setMensaje("Error guardando el estado de las copas.");
    else setMensaje(`¡Estado de copas actualizado para ${temporada}!`);

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
      competicion: "copa",
      equipo: equipoSancionar,
      puntos_descontados: Number(puntosRestar),
      motivo: motivoSancion,
    });

    if (error) setMensaje("Error al aplicar la sanción.");
    else {
      setMensaje(`Sanción de Copa aplicada a ${equipoSancionar}.`);
      setEquipoSancionar("");
      await cargarTodo();
    }

    setGuardandoSancion(false);
  }

  async function eliminarSancion(id: string) {
    if (!window.confirm("¿Eliminar esta sanción de copa?")) return;
    const { error } = await supabase.from("sanciones_equipos").delete().eq("id", id);
    if (error) setMensaje("Error eliminando sanción.");
    else {
      setMensaje("Sanción eliminada.");
      await cargarTodo();
    }
  }

  const tablasPorGrupo = useMemo(() => {
    return Object.fromEntries(
      GRUPOS.map((grupo) => [grupo, calcularTablaGrupo(partidos, grupo, sanciones)])
    ) as Record<string, any[]>;
  }, [partidos, sanciones]);

  // GENERAR CUARTOS: 1os vs 2os (Copa Argentina) y 3os vs 4os (Copa APA) sorteados sin repetir grupo
  async function generarCuartosDeFinalAutomaticos() {
    setMensaje("");
    for (const g of GRUPOS) {
      if ((tablasPorGrupo[g] || []).length < 4) {
        setMensaje(`El Grupo ${g} aún no tiene los 4 equipos con tabla generada.`);
        return;
      }
    }

    const bombos: Record<number, { equipo: string; grupo: string }[]> = {
      0: [], // 1ros
      1: [], // 2dos
      2: [], // 3ros
      3: [], // 4tos
    };

    GRUPOS.forEach((g) => {
      const tabla = tablasPorGrupo[g] || [];
      tabla.forEach((item, index) => {
        if (index <= 3) {
          bombos[index].push({ equipo: item.equipo, grupo: g });
        }
      });
    });

    function sortearCruces(cabezasDeSerie: { equipo: string; grupo: string }[], bolillero: { equipo: string; grupo: string }[], comp: string) {
      let intentos = 0;
      while (intentos < 1000) {
        intentos++;
        const bolilleroShuffled = [...bolillero].sort(() => Math.random() - 0.5);
        let valido = true;
        const emparejamientos: { local: string; visitante: string; comp: string }[] = [];

        for (let i = 0; i < cabezasDeSerie.length; i++) {
          const localObj = cabezasDeSerie[i];
          const visitanteObj = bolilleroShuffled[i];

          // REGLA: No pueden ser del mismo grupo
          if (localObj.grupo === visitanteObj.grupo) {
            valido = false;
            break;
          }

          emparejamientos.push({
            local: localObj.equipo,
            visitante: visitanteObj.equipo,
            comp,
          });
        }

        if (valido) return emparejamientos;
      }
      return null;
    }

    // 1ros (bombo 0) vs 2dos (bombo 1) para Copa Argentina
    const crucesArgentina = sortearCruces(bombos[0], bombos[1], "copa_argentina");
    // 3ros (bombo 2) vs 4tos (bombo 3) para Copa APA
    const crucesApa = sortearCruces(bombos[2], bombos[3], "copa_apa");

    if (!crucesArgentina || !crucesApa) {
      setMensaje("No se pudo encontrar una combinación válida sin repetir grupos. Intentá de nuevo.");
      return;
    }

    if (!window.confirm("¿Generar los cruces de Cuartos de Final (1os vs 2os y 3os vs 4os aleatorios sin repetir grupo)?")) return;

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
    if (error) setMensaje("Error al generar cruces de Cuartos.");
    else {
      setMensaje("¡Cruces de Cuartos de Final sorteados con éxito (1os vs 2os / 3os vs 4os)!");
      await cargarTodo();
    }
  }

  async function crearCruceManual() {
    setMensaje("");

    if (!localManual || !visitanteManual) {
      setMensaje("Elegí local y visitante.");
      return;
    }

    let esGrupo = faseManual.startsWith("Grupo");
    let grupoAsignado = esGrupo ? faseManual.replace("Grupo ", "").trim() : null;
    let competicionAsignada = COMPETICION_GRUPOS;
    let faseNombre = "grupos";

    if (!esGrupo) {
      if (faseManual.includes("Copa Argentina")) competicionAsignada = "copa_argentina";
      if (faseManual.includes("Copa APA")) competicionAsignada = "copa_apa";

      if (faseManual.startsWith("Cuartos")) faseNombre = "cuartos";
      else if (faseManual.startsWith("Semifinal")) faseNombre = "semifinal";
      else if (faseManual.startsWith("3.º Puesto")) faseNombre = "3er_puesto";
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

    if (error) setMensaje("Error creando cruce manual.");
    else {
      setMensaje("Cruce manual creado.");
      setLocalManual("");
      setVisitanteManual("");
      await cargarTodo();
    }
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
    if (error) setMensaje("Error actualizando partido.");
    else setPartidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
  }

  async function eliminarPartido(id: string) {
    if (!window.confirm("¿Eliminar este cruce?")) return;
    const { error } = await supabase.from("partidos").delete().eq("id", id);
    if (error) setMensaje("Error eliminando cruce.");
    else setPartidos((prev) => prev.filter((p) => p.id !== id));
  }

  // FILTRAR Y ORDENAR NUMÉRICAMENTE POR FECHA
  const partidosFiltrados = useMemo(() => {
    let lista = [...partidos];

    if (tabFiltroCompeticion === "primera") {
      lista = lista.filter(
        (p) =>
          p.division === "primera" ||
          p.competicion === "liga" ||
          (p.fase === "grupos" && p.division === "primera")
      );
    } else if (tabFiltroCompeticion === "segunda") {
      lista = lista.filter(
        (p) =>
          p.division === "segunda" ||
          (p.fase === "grupos" && p.division === "segunda")
      );
    } else if (tabFiltroCompeticion === "grupos") {
      lista = lista.filter(
        (p) => p.competicion === COMPETICION_GRUPOS || Boolean(p.grupo)
      );
    } else if (tabFiltroCompeticion === "copa_argentina") {
      lista = lista.filter((p) => p.competicion === "copa_argentina");
    } else if (tabFiltroCompeticion === "copa_apa") {
      lista = lista.filter((p) => p.competicion === "copa_apa");
    }

    return lista.sort((a, b) => {
      const numA = parseInt(String(a.fecha || "0").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.fecha || "0").replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  }, [partidos, tabFiltroCompeticion]);

  return (
    <PermissionGuard permission="competitions.manage">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-[1700px] space-y-8">
          <section className="relative overflow-hidden rounded-[40px] border border-yellow-500/25 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.12)] md:p-10">
            <h1 className="text-5xl font-black uppercase italic text-yellow-300">
              Admin Copas & Liga APA
            </h1>
            <p className="mt-2 text-zinc-300">
              Gestión de Grupos, Liga, Cuartos, Semifinales, 3.º Puesto, Finales y Horarios.
            </p>
          </section>

          {mensaje && (
            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-4 text-sm font-black uppercase text-yellow-300">
              {mensaje}
            </div>
          )}

          {/* AVANCE AUTOMÁTICO A SEMIFINALES, FINALES Y 3º PUESTO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
            <div className="space-y-3 border-r border-white/10 pr-4">
              <h3 className="text-lg font-black uppercase text-yellow-300">
                🇦🇷 Copa Argentina
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => generarSemifinalesAutomaticas("copa_argentina")}
                  className="rounded-xl border border-yellow-400/30 bg-yellow-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-white"
                >
                  ⚡ Avanzar Ganadores a Semis
                </button>
                <button
                  onClick={() => generarFinalY3erPuestoAutomatico("copa_argentina")}
                  className="rounded-xl border border-yellow-400/30 bg-yellow-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-white"
                >
                  🏆 Generar Gran Final & 3.º Puesto
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black uppercase text-sky-300">
                🏆 Copa APA
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => generarSemifinalesAutomaticas("copa_apa")}
                  className="rounded-xl border border-sky-400/30 bg-sky-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-white"
                >
                  ⚡ Avanzar Ganadores a Semis
                </button>
                <button
                  onClick={() => generarFinalY3erPuestoAutomatico("copa_apa")}
                  className="rounded-xl border border-sky-400/30 bg-sky-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-white"
                >
                  🏆 Generar Gran Final & 3.º Puesto
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
            <aside className="space-y-6">
              {/* SANCIONES */}
              <section className="rounded-[34px] border border-red-500/25 bg-[#020714]/95 p-6 space-y-4">
                <h2 className="text-2xl font-black uppercase text-red-400">Quitar Puntos (Copa)</h2>
                <form onSubmit={aplicarSancion} className="space-y-3">
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
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-red-400/30 bg-red-500 px-5 py-3 text-xs font-black uppercase text-white hover:bg-red-600"
                  >
                    - Restar Puntos
                  </button>
                </form>
              </section>

              {/* VISIBILIDAD */}
              <section className="rounded-[34px] border border-emerald-500/25 bg-[#020714]/95 p-6">
                <h2 className="text-2xl font-black uppercase text-emerald-300">Visibilidad Copas</h2>
                <div className="mt-5 space-y-4">
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 cursor-pointer">
                    <span className="text-sm font-black uppercase text-white">Copa APA</span>
                    <input
                      type="checkbox"
                      checked={copaApaActiva}
                      onChange={(e) => setCopaApaActiva(e.target.checked)}
                      className="h-5 w-5 accent-emerald-400"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 cursor-pointer">
                    <span className="text-sm font-black uppercase text-white">Copa Argentina</span>
                    <input
                      type="checkbox"
                      checked={copaArgentinaActiva}
                      onChange={(e) => setCopaArgentinaActiva(e.target.checked)}
                      className="h-5 w-5 accent-emerald-400"
                    />
                  </label>
                  <button
                    onClick={guardarEstadoCopas}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-3 text-sm font-black uppercase text-black hover:bg-white"
                  >
                    Guardar Estado
                  </button>
                </div>
              </section>

              {/* CRUCE MANUAL */}
              <section className="rounded-[34px] border border-emerald-500/25 bg-[#020714]/95 p-6">
                <h2 className="text-2xl font-black uppercase text-emerald-300">Añadir Cruce Manual</h2>
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
                  <button
                    onClick={crearCruceManual}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-4 text-sm font-black uppercase text-black hover:bg-white"
                  >
                    + Añadir cruce
                  </button>
                </div>
              </section>
            </aside>

            <section className="space-y-6">
              {/* BOTÓN GENERAR CUARTOS */}
              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6 text-center">
                <button
                  onClick={generarCuartosDeFinalAutomaticos}
                  className="rounded-2xl border border-yellow-400/30 bg-yellow-400 px-6 py-3 text-sm font-black uppercase text-black hover:bg-white"
                >
                  ⚡ Generar Cruces de Cuartos de Final (Sorteo sin repetir grupo)
                </button>
              </section>

              {/* PROGRAMACIÓN DE PARTIDOS CON FILTROS Y ORDEN NUMÉRICO */}
              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                      Programación de Horarios
                    </p>
                    <h2 className="mt-1 text-3xl font-black uppercase">
                      Calendario
                    </h2>
                  </div>

                  {/* PESTAÑAS DE NAVEGACIÓN Y FILTRO */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTabFiltroCompeticion("primera")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "primera"
                          ? "border-sky-400 bg-sky-400 text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ⚽ Primera
                    </button>

                    <button
                      onClick={() => setTabFiltroCompeticion("segunda")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "segunda"
                          ? "border-sky-400 bg-sky-400 text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ⚽ Segunda
                    </button>

                    <button
                      onClick={() => setTabFiltroCompeticion("grupos")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "grupos"
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      🛡️ Grupos
                    </button>

                    <button
                      onClick={() => setTabFiltroCompeticion("copa_argentina")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "copa_argentina"
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      🇦🇷 Copa Arg
                    </button>

                    <button
                      onClick={() => setTabFiltroCompeticion("copa_apa")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "copa_apa"
                          ? "border-sky-400 bg-sky-400 text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      🏆 Copa APA
                    </button>

                    <button
                      onClick={() => setTabFiltroCompeticion("todos")}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition ${
                        tabFiltroCompeticion === "todos"
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Ver Todos ({partidos.length})
                    </button>
                  </div>
                </div>

                {partidosFiltrados.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-6 text-center text-sm text-zinc-500 uppercase font-black">
                    No hay partidos cargados para esta categoría/competencia.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {partidosFiltrados.map((p) => (
                      <article
                        key={p.id}
                        className="rounded-2xl border border-sky-500/15 bg-[#020714] p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                            {p.ronda || p.fase || (p.division ? `División ${p.division}` : p.competicion)}
                          </span>
                          <button
                            onClick={() => eliminarPartido(p.id)}
                            className="text-xs text-red-400 font-bold hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>

                        <div className="grid grid-cols-[1fr_100px_1fr] items-center gap-2">
                          <p className="text-center font-black uppercase text-xs truncate">{p.local}</p>
                          <input
                            value={p.resultado || ""}
                            onChange={(e) => actualizarPartido(p.id, { resultado: e.target.value || null })}
                            placeholder="VS"
                            className="rounded-xl border border-yellow-400/20 bg-black/35 py-1.5 text-center text-xs font-black uppercase text-yellow-300 outline-none"
                          />
                          <p className="text-center font-black uppercase text-xs truncate">{p.visitante}</p>
                        </div>

                        {/* INPUTS DE FECHA/FASE, DÍA Y HORA */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                          <div>
                            <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">
                              Fase / Fecha
                            </label>
                            <input
                              value={String(p.fecha || p.fase || "")}
                              onChange={(e) => actualizarPartido(p.id, { fecha: e.target.value })}
                              placeholder="Ej: 1"
                              className="w-full rounded-xl border border-white/10 bg-black/35 px-2 py-1.5 text-xs font-black uppercase text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">
                              Día
                            </label>
                            <input
                              value={p.dia || ""}
                              onChange={(e) => actualizarPartido(p.id, { dia: e.target.value })}
                              placeholder="Ej: LUN 12/08"
                              className="w-full rounded-xl border border-white/10 bg-black/35 px-2 py-1.5 text-xs font-black uppercase text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1">
                              Hora
                            </label>
                            <input
                              value={p.hora || ""}
                              onChange={(e) => actualizarPartido(p.id, { hora: e.target.value })}
                              placeholder="Ej: 22:00"
                              className="w-full rounded-xl border border-white/10 bg-black/35 px-2 py-1.5 text-xs font-black uppercase text-white outline-none"
                            />
                          </div>
                        </div>
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