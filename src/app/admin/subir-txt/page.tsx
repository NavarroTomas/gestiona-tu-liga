"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type PartidoProgramado = {
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
};

type Equipo = {
  id?: string;
  nombre: string;
  temporada?: string;
  division?: string;
};

export default function SubirTxtPage() {

  const temporadas = ["Temporada 4"];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [archivo, setArchivo] = useState<File | null>(null);
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("1");

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidosProgramados, setPartidosProgramados] = useState<
    PartidoProgramado[]
  >([]);
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [ordenTxt, setOrdenTxt] = useState<"normal" | "invertido">("normal");

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarContexto();
  }, [temporada, division, fecha]);

  async function cargarContexto() {
    setMensaje("");

    const [equiposRes, partidosRes] = await Promise.all([
      supabase
        .from("equipos")
        .select("id,nombre,temporada,division")
        .eq("temporada", temporada)
        .eq("division", division)
        .order("nombre", { ascending: true }),
      supabase
        .from("partidos")
        .select("id,partido_id,local,visitante,resultado,fecha,temporada,division,dia,hora")
        .eq("temporada", temporada)
        .eq("division", division)
        .eq("fecha", fecha)
        .order("local", { ascending: true }),
    ]);

    if (equiposRes.error) {
      console.log(equiposRes.error);
    }

    if (partidosRes.error) {
      console.log(partidosRes.error);
    }

    const equiposData = (equiposRes.data || []) as unknown as Equipo[];
    const partidosData = (partidosRes.data || []) as unknown as PartidoProgramado[];

    setEquipos(equiposData);
    setPartidosProgramados(partidosData);

    const existeSeleccion = partidosData.some(
      (p) => p.id === partidoSeleccionadoId,
    );

    if (!existeSeleccion) {
      setPartidoSeleccionadoId(partidosData[0]?.id || "");
    }
  }

  function n(valor: any) {
    return Number(valor || 0);
  }

  function limpiar(txt: string) {
    return (txt || "").trim();
  }

  function partidoId(local: string, visitante: string, resultado: string) {
    return `${temporada}-${division}-fecha-${fecha}-${local}-${resultado}-${visitante}`;
  }

  function normalizarEquipo(stats: any, idPartido: string, equipoOficial: string) {
    return {
      partido_id: idPartido,
      equipo: equipoOficial,
      temporada,
      division,
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
      rating += atrapadas * 0.20;
    } else {
      rating += goles * 1.2;
      rating += asistencias * 0.9;
      rating += pasesClave * 0.18;
      rating += tirosAlArco * 0.12;
      rating += tackles * 0.10;
      rating += intercepciones * 0.10;
    }

    rating -= perdidas * 0.05;
    rating -= amarillas * 0.20;
    rating -= rojas * 1.00;

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
      division,
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
    (p) => p.id === partidoSeleccionadoId,
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
        `Vas a cargar el TXT para:\n\n${localOficial} ${resultado} ${visitanteOficial}\n\nOrden TXT: ${
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
          division,
          partido_id: idPartido,
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
        alert("Partido actualizado, pero error guardando estadísticas de equipos");
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
          .eq("division", division)
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
          division,
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
              division,
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
            .eq("division", division)
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
        `Cargado perfecto: ${localOficial} ${resultado} ${visitanteOficial}. Jugadores: ${jugadoresDetallados.length}. Nuevos en plantilla: ${jugadoresNuevosPlantilla}. MVP por score: ${
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
return (
    <PermissionGuard permission="matches.upload_txt">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              Admin APA PSO
            </p>

            <h1 className="mt-4 text-5xl md:text-6xl font-black uppercase italic leading-none">
              Subir TXT
            </h1>

            <p className="mt-5 max-w-3xl text-zinc-300">
              Primero elegí el partido programado. El TXT carga estadísticas,
              pero los equipos oficiales salen del fixture creado en Admin.
            </p>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)] space-y-6">
          <div>
            <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
              1. Contexto del partido
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="input"
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>

              <input
                className="input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Fecha"
              />
            </div>
          </div>

          <div>
            <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
              2. Partido programado
            </p>

            {partidosProgramados.length === 0 ? (
              <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-5 text-yellow-300">
                No hay partidos programados para esta fecha. Primero crealo en
                <b> /admin/fixture</b>.
              </div>
            ) : (
              <select
                className="input"
                value={partidoSeleccionadoId}
                onChange={(e) => setPartidoSeleccionadoId(e.target.value)}
              >
                {partidosProgramados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.local} vs {p.visitante}
                    {p.resultado ? ` · ${p.resultado}` : " · pendiente"}
                  </option>
                ))}
              </select>
            )}

            {partidoSeleccionado && (
              <div className="mt-5 rounded-[28px] border border-sky-500/25 bg-black/35 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-sky-300 font-black">
                  Partido seleccionado
                </p>

                <div className="mt-4 grid grid-cols-[1fr_90px_1fr] items-center gap-4">
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
                    <p className="text-xs uppercase text-zinc-500">Visitante</p>
                    <p className="mt-2 text-xl font-black uppercase">
                      {partidoSeleccionado.visitante}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm font-black uppercase">
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
            <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
              3. Orden del TXT
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
              4. Archivo MatchStats
            </p>

            <input
              className="input"
              type="file"
              accept=".txt,.json"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={subirTxt}
            disabled={loading}
            className="btn disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar TXT al partido seleccionado"}
          </button>

          {mensaje && <p className="text-emerald-400 font-bold">{mensaje}</p>}
        </section>

        <section className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
          <b>Importante:</b> el nombre del equipo ya no depende del TXT. El TXT
          solo aporta estadísticas. Los equipos oficiales salen del partido
          seleccionado en el fixture.
        </section>
      </div>
      </main>
    </PermissionGuard>
  );
}
