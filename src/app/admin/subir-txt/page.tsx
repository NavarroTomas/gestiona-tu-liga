"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";
import {
  assignNeutralPlayersToTeams,
  buildRawPlayerKey,
  cleanText,
  collectRawPlayers,
  combinePlayerStats,
  combineTeamStats,
  detectSegmentMinutes,
  numberValue,
  parseSegmentPayload,
  sha256,
  type OrdenTxt,
  type ParsedMatchSegment,
  type PlayerResolution,
} from "@/lib/matchStatsUpload";
import { matchFitsContext, normalizeRound } from "@/lib/competitionData";

type Competicion =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

type ModoCarga = "reemplazar" | "agregar";

type PartidoProgramado = {
  id: string | number;
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

type Plantilla = {
  jugador: string | null;
  playerid: string | null;
  equipo: string | null;
  posicion?: string | null;
  estado?: string | null;
};

type AliasCuenta = {
  alias_player_id: string;
  canonical_player_id: string;
  canonical_name?: string | null;
};

type SegmentoDb = {
  id: string;
  partido_id: string;
  archivo_nombre: string;
  archivo_hash: string;
  orden_txt: OrdenTxt;
  duracion_minutos: number | null;
  goles_local: number | null;
  goles_visitante: number | null;
  payload: any;
  created_at?: string | null;
};

const TEMPORADAS = ["Temporada 4"];

const COMPETICIONES: { value: Competicion; label: string }[] = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

const DIVISIONES = ["Primera", "Segunda"];
const GRUPOS = ["A", "B", "C", "D"];
const FASES_COPA = ["Octavos", "Cuartos", "Semifinal", "Final"];
const FASES_CAMPEONES = ["Semifinal", "Final"];
const FASES_PLAYOFFS = ["Semifinal", "Final Ascenso", "Promoción"];

function isMissingTableError(error: any) {
  return (
    error?.code === "42P01" ||
    String(error?.message || "")
      .toLowerCase()
      .includes("does not exist") ||
    String(error?.message || "")
      .toLowerCase()
      .includes("schema cache")
  );
}

export default function SubirTxtPage() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState<Competicion>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("1");
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [partidosProgramados, setPartidosProgramados] = useState<
    PartidoProgramado[]
  >([]);
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [ordenTxt, setOrdenTxt] = useState<OrdenTxt>("normal");
  const [modoCarga, setModoCarga] = useState<ModoCarga>("reemplazar");

  const [segmentosExistentes, setSegmentosExistentes] = useState<SegmentoDb[]>(
    [],
  );
  const [segmentosAnalizados, setSegmentosAnalizados] = useState<
    ParsedMatchSegment[]
  >([]);
  const [resoluciones, setResoluciones] = useState<
    Record<string, PlayerResolution>
  >({});
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [analisisListo, setAnalisisListo] = useState(false);
  const [advertenciaMigracion, setAdvertenciaMigracion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const competicionLabel = useMemo(
    () =>
      COMPETICIONES.find((item) => item.value === competicion)?.label ||
      "Competencia",
    [competicion],
  );

  const contextoLabel = useMemo(() => {
    if (competicion === "liga") return division;
    if (competicion === "copa_clasificatoria") return `Grupo ${grupo}`;
    return fase;
  }, [competicion, division, grupo, fase]);

  const divisionContexto = contextoLabel;

  const partidoSeleccionado = partidosProgramados.find(
    (p) => String(p.id) === String(partidoSeleccionadoId),
  );

  useEffect(() => {
    cargarContexto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporada, competicion, division, grupo, fase, fecha]);

  useEffect(() => {
    setAnalisisListo(false);
    setSegmentosAnalizados([]);
    setResoluciones({});
    setArchivos([]);
    if (partidoSeleccionado) cargarSegmentosExistentes(partidoSeleccionado);
    else setSegmentosExistentes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidoSeleccionadoId]);

  function normalizarTexto(value: string) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function slug(value: string) {
    return normalizarTexto(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function faseDb() {
    if (competicion === "copa_clasificatoria") return "grupos";
    const f = normalizarTexto(fase);
    if (f === "semifinal" || f === "semis") return "semifinal";
    if (f === "final") return "final";
    if (f === "final ascenso" || f === "final_ascenso") return "final_ascenso";
    if (f === "promocion") return "promocion";
    if (f === "octavos") return "octavos";
    if (f === "cuartos") return "cuartos";
    return f.replace(/\s+/g, "_");
  }

  function grupoDb() {
    return grupo.toUpperCase();
  }

  function stablePartidoId(partido: PartidoProgramado) {
    return `apa-${slug(temporada)}-partido-${String(partido.id)}`;
  }

  function idsPartido(partido: PartidoProgramado) {
    return Array.from(
      new Set(
        [stablePartidoId(partido), cleanText(partido.partido_id)].filter(
          Boolean,
        ),
      ),
    );
  }

  function datosCompeticionExtra() {
    return {
      competicion,
      fase: competicion === "liga" ? null : faseDb(),
      grupo: competicion === "copa_clasificatoria" ? grupoDb() : null,
    };
  }

  async function cargarContexto() {
    setMensaje("");

    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .order("fecha", { ascending: true })
      .order("local", { ascending: true });

    if (error) {
      console.error("Error cargando partidos programados:", error);
      setMensaje(`No se pudieron cargar los partidos: ${error.message}`);
      setFechasDisponibles([]);
      setPartidosProgramados([]);
      setPartidoSeleccionadoId("");
      return;
    }

    const context = {
      temporada,
      competicion,
      division: competicion === "liga" ? division : undefined,
      grupo: competicion === "copa_clasificatoria" ? grupoDb() : undefined,
      fase:
        ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion)
          ? faseDb()
          : undefined,
    };

    const todos = ((data || []) as PartidoProgramado[]).filter((partido) =>
      matchFitsContext(partido, context),
    );

    const fechas = Array.from(
      new Set(todos.map((p) => normalizeRound(p.fecha)).filter(Boolean)),
    ).sort((a, b) => Number(a) - Number(b));

    const fechaActiva =
      fechas.length > 0 && !fechas.includes(normalizeRound(fecha))
        ? fechas[0]
        : normalizeRound(fecha);
    if (fechaActiva !== normalizeRound(fecha)) setFecha(fechaActiva);

    const partidosFecha = todos.filter(
      (p) => normalizeRound(p.fecha) === fechaActiva,
    );
    setFechasDisponibles(fechas);
    setPartidosProgramados(partidosFecha);
    setPartidoSeleccionadoId((actual) =>
      partidosFecha.some((p) => String(p.id) === String(actual))
        ? String(actual)
        : String(partidosFecha[0]?.id || ""),
    );
  }

  async function cargarSegmentosExistentes(partido: PartidoProgramado) {
    const { data, error } = await supabase
      .from("partido_txt_segmentos")
      .select(
        "id,partido_id,archivo_nombre,archivo_hash,orden_txt,duracion_minutos,goles_local,goles_visitante,payload,created_at",
      )
      .in("partido_id", idsPartido(partido))
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        setAdvertenciaMigracion(
          "Falta ejecutar la migración SQL incluida para habilitar múltiples TXT y cuentas alternativas.",
        );
      } else {
        console.error(error);
      }
      setSegmentosExistentes([]);
      return;
    }

    setAdvertenciaMigracion("");
    setSegmentosExistentes((data || []) as SegmentoDb[]);
  }

  function resetAnalisis() {
    setAnalisisListo(false);
    setSegmentosAnalizados([]);
    setResoluciones({});
  }

  async function analizarArchivos() {
    try {
      setMensaje("");
      if (!partidoSeleccionado) {
        alert("Elegí un partido programado.");
        return;
      }
      if (archivos.length === 0) {
        alert("Elegí al menos un TXT o JSON.");
        return;
      }

      setLoading(true);

      if (
        modoCarga === "agregar" &&
        segmentosExistentes.length === 0 &&
        partidoSeleccionado.resultado &&
        partidoSeleccionado.partido_id
      ) {
        throw new Error(
          "Este partido fue cargado con el sistema anterior y no conserva el TXT original. Para combinar tramos, elegí todos los TXT del partido y usá ‘Reemplazar carga completa’.",
        );
      }

      const nuevos: ParsedMatchSegment[] = [];
      const hashes = new Set<string>();

      for (const archivo of archivos) {
        const text = await archivo.text();
        const hash = await sha256(text);
        if (hashes.has(hash))
          throw new Error(`El archivo ${archivo.name} está repetido.`);
        hashes.add(hash);

        let payload: any;
        try {
          payload = JSON.parse(text);
        } catch {
          throw new Error(`${archivo.name}: el contenido no es JSON válido.`);
        }

        nuevos.push(
          parseSegmentPayload({
            payload,
            fileName: archivo.name,
            fileHash: hash,
            order: ordenTxt,
            minutes: detectSegmentMinutes(payload),
            source: "new",
          }),
        );
      }

      const existentes =
        modoCarga === "agregar"
          ? segmentosExistentes.map((segmento) =>
              parseSegmentPayload({
                payload: segmento.payload,
                fileName: segmento.archivo_nombre,
                fileHash: segmento.archivo_hash,
                order: segmento.orden_txt,
                minutes: Number(segmento.duracion_minutos || 0),
                source: "existing",
                dbId: segmento.id,
              }),
            )
          : [];

      const todosSegmentos = [...existentes, ...nuevos];
      const hashesTotales = new Set<string>();
      for (const segmento of todosSegmentos) {
        if (hashesTotales.has(segmento.fileHash)) {
          throw new Error(
            `El TXT ${segmento.fileName} ya forma parte de este partido.`,
          );
        }
        hashesTotales.add(segmento.fileHash);
      }

      const { data: plantillasData, error: plantillasError } = await supabase
        .from("plantillas")
        .select("jugador,playerid,equipo,posicion,estado")
        .eq("temporada", temporada)
        .in("equipo", [
          partidoSeleccionado.local,
          partidoSeleccionado.visitante,
        ]);

      if (plantillasError) console.error(plantillasError);
      const roster = (
        (plantillasData || []) as (Plantilla & { estado?: string | null })[]
      ).filter(
        (p) =>
          cleanText(p.playerid) &&
          normalizarTexto(p.estado || "activo") !== "inactivo",
      );
      setPlantillas(roster);

      const segmentosConEquiposResueltos = assignNeutralPlayersToTeams({
        segments: todosSegmentos,
        roster,
        localTeam: partidoSeleccionado.local,
        visitorTeam: partidoSeleccionado.visitante,
      });

      const rawPlayers = collectRawPlayers(
        segmentosConEquiposResueltos,
        partidoSeleccionado.local,
        partidoSeleccionado.visitante,
      );
      const rawIds = rawPlayers.map((p) => p.rawPlayerId).filter(Boolean);

      let aliasRows: AliasCuenta[] = [];
      if (rawIds.length > 0) {
        const { data: aliasesData, error: aliasesError } = await supabase
          .from("player_account_aliases")
          .select("alias_player_id,canonical_player_id,canonical_name")
          .in("alias_player_id", rawIds);

        if (aliasesError) {
          if (isMissingTableError(aliasesError)) {
            setAdvertenciaMigracion(
              "Falta ejecutar la migración SQL incluida para habilitar múltiples TXT y cuentas alternativas.",
            );
          } else {
            console.error(aliasesError);
          }
        } else {
          aliasRows = (aliasesData || []) as AliasCuenta[];
        }
      }

      const nextResolutions: Record<string, PlayerResolution> = {};

      for (const raw of rawPlayers) {
        const exact = roster.find(
          (p) =>
            cleanText(p.playerid) === raw.rawPlayerId &&
            normalizarTexto(p.equipo || "") === normalizarTexto(raw.team),
        );
        const alias = aliasRows.find(
          (a) => a.alias_player_id === raw.rawPlayerId,
        );
        const canonicalRoster = alias
          ? roster.find(
              (p) => cleanText(p.playerid) === alias.canonical_player_id,
            )
          : undefined;

        if (exact) {
          nextResolutions[raw.rawKey] = {
            rawKey: raw.rawKey,
            rawPlayerId: raw.rawPlayerId,
            rawName: raw.rawName,
            team: raw.team,
            action: "map",
            canonicalPlayerId: cleanText(exact.playerid),
            canonicalName: cleanText(exact.jugador) || raw.rawName,
            saveAlias: false,
            source: "roster",
          };
        } else if (alias) {
          nextResolutions[raw.rawKey] = {
            rawKey: raw.rawKey,
            rawPlayerId: raw.rawPlayerId,
            rawName: raw.rawName,
            team: raw.team,
            action: "map",
            canonicalPlayerId: alias.canonical_player_id,
            canonicalName:
              cleanText(canonicalRoster?.jugador) ||
              cleanText(alias.canonical_name) ||
              raw.rawName,
            saveAlias: false,
            source: "alias",
          };
        } else {
          nextResolutions[raw.rawKey] = {
            rawKey: raw.rawKey,
            rawPlayerId: raw.rawPlayerId,
            rawName: raw.rawName,
            team: raw.team,
            action: "new",
            canonicalPlayerId: raw.rawPlayerId,
            canonicalName: raw.rawName,
            saveAlias: false,
            source: "new",
          };
        }
      }

      setSegmentosAnalizados(segmentosConEquiposResueltos);
      setResoluciones(nextResolutions);
      setAnalisisListo(true);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      alert(error?.message || "No pude analizar los archivos.");
    }
  }

  function cambiarMinutos(index: number, value: string) {
    setSegmentosAnalizados((actual) =>
      actual.map((segmento, i) =>
        i === index
          ? { ...segmento, minutes: Math.max(0, Number(value || 0)) }
          : segmento,
      ),
    );
  }

  function cambiarResolucion(rawKey: string, value: string) {
    const actual = resoluciones[rawKey];
    if (!actual) return;

    if (value === "__ignore") {
      setResoluciones((prev) => ({
        ...prev,
        [rawKey]: {
          ...actual,
          action: "ignore",
          saveAlias: false,
          source: "manual",
        },
      }));
      return;
    }

    if (value === "__new") {
      setResoluciones((prev) => ({
        ...prev,
        [rawKey]: {
          ...actual,
          action: "new",
          canonicalPlayerId: actual.rawPlayerId,
          canonicalName: actual.rawName,
          saveAlias: false,
          source: "new",
        },
      }));
      return;
    }

    const roster = plantillas.find((p) => cleanText(p.playerid) === value);
    if (!roster) return;

    setResoluciones((prev) => ({
      ...prev,
      [rawKey]: {
        ...actual,
        action: "map",
        canonicalPlayerId: cleanText(roster.playerid),
        canonicalName: cleanText(roster.jugador) || actual.rawName,
        saveAlias: Boolean(
          actual.rawPlayerId &&
            actual.rawPlayerId !== cleanText(roster.playerid),
        ),
        source: "manual",
      },
    }));
  }

  function calcularRatingAPA(j: any) {
    const esArquero =
      numberValue(j.gKSaves) > 0 ||
      numberValue(j.gKCatches) > 0 ||
      cleanText(j.posicion).toUpperCase().includes("GK");

    let rating = 6;
    if (esArquero) {
      rating += numberValue(j.gKSaves) * 0.35;
      rating += numberValue(j.gKCatches) * 0.2;
    } else {
      rating += numberValue(j.goals) * 1.2;
      rating += numberValue(j.assists) * 0.9;
      rating += numberValue(j.keyPasses) * 0.18;
      rating += numberValue(j.shotsOnTarget) * 0.12;
      rating += numberValue(j.tackles) * 0.1;
      rating += numberValue(j.interceptions) * 0.1;
    }
    rating -= numberValue(j.possessionsLost) * 0.05;
    return Math.round(Math.max(1, Math.min(10, rating)) * 100) / 100;
  }

  function normalizarEquipo(stats: any, idPartido: string, equipo: string) {
    return {
      partido_id: idPartido,
      equipo,
      temporada,
      division: divisionContexto,
      fecha,
      passes: numberValue(stats.passes),
      keyPasses: numberValue(stats.keyPasses),
      assists: numberValue(stats.assists),
      shots: numberValue(stats.shots),
      shotsOnTarget: numberValue(stats.shotsOnTarget),
      goals: numberValue(stats.goals),
      tackles: numberValue(stats.tackles),
      keyTackles: numberValue(stats.keyTackles),
      interceptions: numberValue(stats.interceptions),
      keyInterceptions: numberValue(stats.keyInterceptions),
      possession: numberValue(stats.possession),
      possessionsLost: numberValue(stats.possessionsLost),
      fouls: numberValue(stats.fouls),
      offsides: numberValue(stats.offsides),
      handballs: numberValue(stats.handballs),
      setPieceTimeouts: numberValue(stats.setPieceTimeouts),
      freeKicks: numberValue(stats.freeKicks),
      penalties: numberValue(stats.penalties),
      goalKicks: numberValue(stats.goalKicks),
      cornerKicks: numberValue(stats.cornerKicks),
      throwIns: numberValue(stats.throwIns),
      yellowCards: numberValue(stats.yellowCards),
      redCards: numberValue(stats.redCards),
    };
  }

  async function recalcularRanking(playerIds: string[]) {
    const ids = Array.from(new Set(playerIds.map(cleanText).filter(Boolean)));
    if (ids.length === 0) return;

    const { data: historial, error: historialError } = await supabase
      .from("estadisticas_jugadores")
      .select("nombre,playerId,equipo,goals,assists,mvp")
      .eq("temporada", temporada)
      .eq("division", divisionContexto)
      .in("playerId", ids);

    if (historialError) throw historialError;

    const { error: deleteError } = await supabase
      .from("jugadores")
      .delete()
      .eq("temporada", temporada)
      .eq("division", divisionContexto)
      .in("playerId", ids);

    if (deleteError) throw deleteError;

    const map = new Map<string, any>();
    for (const row of historial || []) {
      const playerId = cleanText((row as any).playerId);
      const equipo = cleanText((row as any).equipo) || "Sin Club";
      if (!playerId) continue;
      const key = `${playerId}__${equipo}`;
      if (!map.has(key)) {
        map.set(key, {
          nombre: cleanText((row as any).nombre) || "Sin Nombre",
          playerId,
          equipo,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          temporada,
          division: divisionContexto,
        });
      }
      const item = map.get(key);
      item.goles += numberValue((row as any).goals);
      item.asistencias += numberValue((row as any).assists);
      item.mvps += numberValue((row as any).mvp);
      if ((row as any).nombre) item.nombre = (row as any).nombre;
    }

    const resumen = Array.from(map.values());
    if (resumen.length > 0) {
      const { error } = await supabase.from("jugadores").upsert(resumen, {
        onConflict: "playerId,temporada,division,equipo",
      });
      if (error) throw error;
    }
  }

  async function guardarAliases() {
    const aliases = Object.values(resoluciones)
      .filter(
        (r) =>
          r.action === "map" &&
          r.saveAlias &&
          r.rawPlayerId &&
          r.canonicalPlayerId &&
          r.rawPlayerId !== r.canonicalPlayerId,
      )
      .map((r) => ({
        alias_player_id: r.rawPlayerId,
        canonical_player_id: r.canonicalPlayerId,
        canonical_name: r.canonicalName,
        source_player_name: r.rawName,
        equipo: r.team,
      }));

    if (aliases.length === 0) return;

    const { error } = await supabase
      .from("player_account_aliases")
      .upsert(aliases, {
        onConflict: "alias_player_id",
      });
    if (error) throw error;
  }

  async function guardarPlantillasNuevas() {
    if (!partidoSeleccionado) return 0;

    const nuevos = Object.values(resoluciones)
      .filter((r) => r.action === "new" && r.canonicalPlayerId)
      .map((r) => ({
        jugador: r.canonicalName || r.rawName,
        playerid: r.canonicalPlayerId,
        equipo: r.team,
        posicion: "N/D",
        temporada,
        division: divisionContexto,
        estado: "activo",
      }));

    const unicos = Array.from(
      new Map(
        nuevos.map((item) => [`${item.equipo}__${item.playerid}`, item]),
      ).values(),
    );
    if (unicos.length === 0) return 0;

    const ids = unicos.map((item) => item.playerid);
    const { data: existentes, error } = await supabase
      .from("plantillas")
      .select("playerid,equipo")
      .eq("temporada", temporada)
      .in("playerid", ids);
    if (error) throw error;

    const keys = new Set(
      (existentes || []).map(
        (p: any) => `${cleanText(p.equipo)}__${cleanText(p.playerid)}`,
      ),
    );
    const insertar = unicos.filter(
      (item) => !keys.has(`${item.equipo}__${item.playerid}`),
    );
    if (insertar.length === 0) return 0;

    const { error: insertError } = await supabase
      .from("plantillas")
      .insert(insertar);
    if (insertError) throw insertError;
    return insertar.length;
  }

  async function procesarCarga() {
    try {
      if (
        !partidoSeleccionado ||
        !analisisListo ||
        segmentosAnalizados.length === 0
      ) {
        alert("Primero analizá los TXT.");
        return;
      }

      const unresolved = Object.values(resoluciones).filter(
        (r) => r.action !== "ignore" && !r.canonicalName,
      );
      if (unresolved.length > 0) {
        alert("Hay jugadores sin resolver en la revisión.");
        return;
      }

      const localStats = combineTeamStats(segmentosAnalizados, "local");
      const visitorStats = combineTeamStats(segmentosAnalizados, "visitor");
      const golesLocal = numberValue(localStats.goals);
      const golesVisitante = numberValue(visitorStats.goals);
      const resultado = `${golesLocal}-${golesVisitante}`;
      const nuevos = Object.values(resoluciones).filter(
        (r) => r.action === "new",
      ).length;
      const aliases = Object.values(resoluciones).filter(
        (r) => r.action === "map" && r.rawPlayerId !== r.canonicalPlayerId,
      ).length;

      const confirmar = window.confirm(
        `Vas a consolidar ${segmentosAnalizados.length} TXT en un solo partido.\n\n${competicionLabel} · ${contextoLabel} · Fecha ${fecha}\n${partidoSeleccionado.local} ${resultado} ${partidoSeleccionado.visitante}\n\nCuentas alternativas vinculadas: ${aliases}\nJugadores nuevos confirmados: ${nuevos}\n\n¿Confirmar carga?`,
      );
      if (!confirmar) return;

      setLoading(true);
      setMensaje("");

      const idEstable = stablePartidoId(partidoSeleccionado);
      const oldIds = idsPartido(partidoSeleccionado);

      const { data: anteriores, error: anterioresError } = await supabase
        .from("estadisticas_jugadores")
        .select("playerId")
        .in("partido_id", oldIds);
      if (anterioresError) throw anterioresError;

      const jugadoresConsolidados = combinePlayerStats({
        segments: segmentosAnalizados,
        resolutions: resoluciones,
        localTeam: partidoSeleccionado.local,
        visitorTeam: partidoSeleccionado.visitante,
      });

      const mejorJugador = [...jugadoresConsolidados].sort(
        (a, b) => numberValue(b.score) - numberValue(a.score),
      )[0];

      const jugadoresStats = jugadoresConsolidados.map((j) => ({
        partido_id: idEstable,
        nombre: j.nombre,
        playerId: j.playerId,
        posicion: j.posicion || "",
        equipo: j.equipo,
        temporada,
        division: divisionContexto,
        fecha,
        passes: numberValue(j.passes),
        keyPasses: numberValue(j.keyPasses),
        assists: numberValue(j.assists),
        shots: numberValue(j.shots),
        shotsOnTarget: numberValue(j.shotsOnTarget),
        goals: numberValue(j.goals),
        tackles: numberValue(j.tackles),
        keyTackles: numberValue(j.keyTackles),
        interceptions: numberValue(j.interceptions),
        keyInterceptions: numberValue(j.keyInterceptions),
        possessionsLost: numberValue(j.possessionsLost),
        gKSaves: numberValue(j.gKSaves),
        gKCatches: numberValue(j.gKCatches),
        overallRating: numberValue(j.overallRating),
        rating_apa: calcularRatingAPA(j),
        score: numberValue(j.score),
        mvp:
          mejorJugador &&
          `${j.equipo}__${j.playerId || j.nombre}` ===
            `${mejorJugador.equipo}__${mejorJugador.playerId || mejorJugador.nombre}`
            ? 1
            : 0,
      }));

      const equiposStats = [
        normalizarEquipo(localStats, idEstable, partidoSeleccionado.local),
        normalizarEquipo(
          visitorStats,
          idEstable,
          partidoSeleccionado.visitante,
        ),
      ];

      const segmentosRows = segmentosAnalizados.map((segmento) => ({
        partido_id: idEstable,
        partido_row_id: String(partidoSeleccionado.id),
        archivo_nombre: segmento.fileName,
        archivo_hash: segmento.fileHash,
        orden_txt: segmento.order,
        duracion_minutos: segmento.minutes || null,
        goles_local: numberValue(segmento.localStats?.goals),
        goles_visitante: numberValue(segmento.visitorStats?.goals),
        payload: segmento.payload,
      }));

      const backupSegmentos = [...segmentosExistentes];
      const { error: deleteSegmentsError } = await supabase
        .from("partido_txt_segmentos")
        .delete()
        .in("partido_id", oldIds);
      if (deleteSegmentsError) throw deleteSegmentsError;

      const { error: insertSegmentsError } = await supabase
        .from("partido_txt_segmentos")
        .insert(segmentosRows);
      if (insertSegmentsError) {
        if (backupSegmentos.length > 0) {
          await supabase.from("partido_txt_segmentos").insert(
            backupSegmentos.map((s) => ({
              partido_id: s.partido_id,
              partido_row_id: String(partidoSeleccionado.id),
              archivo_nombre: s.archivo_nombre,
              archivo_hash: s.archivo_hash,
              orden_txt: s.orden_txt,
              duracion_minutos: s.duracion_minutos,
              goles_local: s.goles_local,
              goles_visitante: s.goles_visitante,
              payload: s.payload,
            })),
          );
        }
        throw insertSegmentsError;
      }

      const { error: updatePartidoError } = await supabase
        .from("partidos")
        .update({
          local: partidoSeleccionado.local,
          visitante: partidoSeleccionado.visitante,
          resultado,
          fecha,
          temporada,
          division: competicion === "liga" ? division : divisionContexto,
          partido_id: idEstable,
          ...datosCompeticionExtra(),
        })
        .eq("id", partidoSeleccionado.id);
      if (updatePartidoError) throw updatePartidoError;

      const { error: deleteEquiposError } = await supabase
        .from("estadisticas_equipos")
        .delete()
        .in("partido_id", oldIds);
      if (deleteEquiposError) throw deleteEquiposError;

      const { error: deleteJugadoresError } = await supabase
        .from("estadisticas_jugadores")
        .delete()
        .in("partido_id", oldIds);
      if (deleteJugadoresError) throw deleteJugadoresError;

      const { error: equiposError } = await supabase
        .from("estadisticas_equipos")
        .insert(equiposStats);
      if (equiposError) throw equiposError;

      if (jugadoresStats.length > 0) {
        const { error: jugadoresError } = await supabase
          .from("estadisticas_jugadores")
          .insert(jugadoresStats);
        if (jugadoresError) throw jugadoresError;
      }

      await guardarAliases();
      const nuevosPlantilla = await guardarPlantillasNuevas();

      const afectados = [
        ...(anteriores || []).map((j: any) => cleanText(j.playerId)),
        ...jugadoresStats.map((j) => cleanText(j.playerId)),
      ];
      await recalcularRanking(afectados);

      setMensaje(
        `Carga consolidada: ${partidoSeleccionado.local} ${resultado} ${partidoSeleccionado.visitante}. TXT: ${segmentosAnalizados.length}. Jugadores: ${jugadoresStats.length}. Nuevos en plantilla: ${nuevosPlantilla}. MVP: ${mejorJugador?.nombre || "Sin MVP"}.`,
      );

      setArchivos([]);
      resetAnalisis();
      await cargarContexto();
      await cargarSegmentosExistentes({
        ...partidoSeleccionado,
        partido_id: idEstable,
        resultado,
      });
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      alert(
        `No pude guardar la carga: ${error?.message || "error desconocido"}`,
      );
    }
  }

  async function anularCargaTxt() {
    try {
      if (!partidoSeleccionado) return;
      if (!partidoSeleccionado.partido_id && !partidoSeleccionado.resultado) {
        alert("Este partido no tiene una carga para anular.");
        return;
      }

      const confirmar = window.confirm(
        `Vas a anular toda la carga de ${partidoSeleccionado.local} vs ${partidoSeleccionado.visitante}. Se borrarán todos sus TXT, estadísticas y resultado. ¿Confirmar?`,
      );
      if (!confirmar) return;

      setLoading(true);
      const ids = idsPartido(partidoSeleccionado);
      const { data: jugadoresAntes, error: jugadoresError } = await supabase
        .from("estadisticas_jugadores")
        .select("playerId")
        .in("partido_id", ids);
      if (jugadoresError) throw jugadoresError;

      const { error: segmentosError } = await supabase
        .from("partido_txt_segmentos")
        .delete()
        .in("partido_id", ids);
      if (segmentosError && !isMissingTableError(segmentosError))
        throw segmentosError;

      const { error: equiposError } = await supabase
        .from("estadisticas_equipos")
        .delete()
        .in("partido_id", ids);
      if (equiposError) throw equiposError;

      const { error: detallesError } = await supabase
        .from("estadisticas_jugadores")
        .delete()
        .in("partido_id", ids);
      if (detallesError) throw detallesError;

      const { error: partidoError } = await supabase
        .from("partidos")
        .update({ resultado: null, partido_id: null })
        .eq("id", partidoSeleccionado.id);
      if (partidoError) throw partidoError;

      await recalcularRanking(
        (jugadoresAntes || []).map((j: any) => cleanText(j.playerId)),
      );
      setMensaje(
        `Carga anulada: ${partidoSeleccionado.local} vs ${partidoSeleccionado.visitante}.`,
      );
      setArchivos([]);
      resetAnalisis();
      await cargarContexto();
      setSegmentosExistentes([]);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      alert(
        `No pude anular la carga: ${error?.message || "error desconocido"}`,
      );
    }
  }

  const rawPlayers =
    analisisListo && partidoSeleccionado
      ? collectRawPlayers(
          segmentosAnalizados,
          partidoSeleccionado.local,
          partidoSeleccionado.visitante,
        )
      : [];

  const resultadoAnalizado = analisisListo
    ? `${numberValue(combineTeamStats(segmentosAnalizados, "local").goals)}-${numberValue(
        combineTeamStats(segmentosAnalizados, "visitor").goals,
      )}`
    : "";

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
                El flujo normal sigue siendo un solo TXT. Cuando el juego corta
                un partido, podés agregar varios tramos y consolidarlos sin
                duplicar jugadores ni perder estadísticas.
              </p>
            </div>
          </section>

          {advertenciaMigracion && (
            <section className="rounded-2xl border border-red-400/35 bg-red-500/10 p-5 text-sm font-bold text-red-100">
              {advertenciaMigracion}
            </section>
          )}

          <section className="space-y-7 rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.12)] md:p-8">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                1. Contexto
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
                  onChange={(e) =>
                    setCompeticion(e.target.value as Competicion)
                  }
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
                    {DIVISIONES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                )}
                {competicion === "copa_clasificatoria" && (
                  <select
                    className="input"
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                  >
                    {GRUPOS.map((item) => (
                      <option key={item} value={item}>
                        Grupo {item}
                      </option>
                    ))}
                  </select>
                )}
                {[
                  "copa_argentina",
                  "copa_apa",
                  "copa_campeones",
                  "playoffs",
                ].includes(competicion) && (
                  <select
                    className="input"
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                  >
                    {(competicion === "copa_campeones"
                      ? FASES_CAMPEONES
                      : competicion === "playoffs"
                        ? FASES_PLAYOFFS
                        : FASES_COPA
                    ).map((item) => (
                      <option key={item}>{item}</option>
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
                    fechasDisponibles.map((item) => (
                      <option key={item} value={item}>
                        Fecha {item}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                2. Partido programado
              </p>
              {partidosProgramados.length === 0 ? (
                <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-5 text-yellow-300">
                  No hay partidos programados para este contexto.
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
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_110px_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-center">
                      <p className="text-xs uppercase text-zinc-500">Local</p>
                      <p className="mt-2 text-xl font-black uppercase">
                        {partidoSeleccionado.local}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-center text-2xl font-black text-yellow-300">
                      {partidoSeleccionado.resultado || "VS"}
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
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.12em]">
                    <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-sky-300">
                      {competicionLabel}
                    </span>
                    <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                      {contextoLabel}
                    </span>
                    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-300">
                      TXT guardados: {segmentosExistentes.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                3. Tipo de carga
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setModoCarga("reemplazar");
                    resetAnalisis();
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase transition ${modoCarga === "reemplazar" ? "border-sky-300 bg-sky-400 text-black" : "border-white/10 bg-black/35 text-zinc-400"}`}
                >
                  Carga normal / reemplazar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoCarga("agregar");
                    resetAnalisis();
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase transition ${modoCarga === "agregar" ? "border-yellow-300 bg-yellow-400 text-black" : "border-white/10 bg-black/35 text-zinc-400"}`}
                >
                  Agregar tramo al mismo partido
                </button>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Usá “Agregar tramo” únicamente cuando el partido continuó en
                otra sala y generó otro TXT.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                4. Orden del TXT
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrdenTxt("normal");
                    resetAnalisis();
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase ${ordenTxt === "normal" ? "border-sky-300 bg-sky-400 text-black" : "border-white/10 bg-black/35 text-zinc-400"}`}
                >
                  team1 = local
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrdenTxt("invertido");
                    resetAnalisis();
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-black uppercase ${ordenTxt === "invertido" ? "border-yellow-300 bg-yellow-400 text-black" : "border-white/10 bg-black/35 text-zinc-400"}`}
                >
                  team1 = visitante
                </button>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                5. Archivos MatchStats
              </p>
              <input
                className="input"
                type="file"
                accept=".txt,.json"
                multiple
                onChange={(e) => {
                  setArchivos(Array.from(e.target.files || []));
                  resetAnalisis();
                }}
              />
              {archivos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {archivos.map((archivo) => (
                    <span
                      key={`${archivo.name}-${archivo.size}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                    >
                      {archivo.name}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={analizarArchivos}
                disabled={loading || archivos.length === 0}
                className="btn mt-4 disabled:opacity-50"
              >
                {loading ? "Analizando..." : "Analizar TXT antes de guardar"}
              </button>
            </div>
          </section>

          {analisisListo && partidoSeleccionado && (
            <section className="space-y-7 rounded-[34px] border border-yellow-400/25 bg-[#020714] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Revisión previa
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    Resultado consolidado: {resultadoAnalizado}
                  </h2>
                </div>
                <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-sm font-black text-yellow-200">
                  {segmentosAnalizados.length} TXT en un partido
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {segmentosAnalizados.map((segmento, index) => (
                  <div
                    key={`${segmento.fileHash}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/35 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-white">
                          {segmento.fileName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          {segmento.source === "existing"
                            ? "Ya guardado"
                            : "Nuevo"}{" "}
                          ·{" "}
                          {segmento.order === "normal"
                            ? "team1 local"
                            : "team1 visitante"}
                        </p>
                      </div>
                      <span className="rounded-lg bg-yellow-400 px-3 py-2 font-black text-black">
                        {numberValue(segmento.localStats?.goals)}-
                        {numberValue(segmento.visitorStats?.goals)}
                      </span>
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        Duración del tramo en minutos
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={segmento.minutes || ""}
                        onChange={(e) => cambiarMinutos(index, e.target.value)}
                        className="input"
                        placeholder="Ejemplo: 6 o 18"
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                  Revisión de cuentas de jugadores
                </p>
                <div className="space-y-3">
                  {rawPlayers.map((raw) => {
                    const resolution = resoluciones[raw.rawKey];
                    const rosterOptions = plantillas.filter(
                      (p) =>
                        normalizarTexto(p.equipo || "") ===
                        normalizarTexto(raw.team),
                    );
                    const selectValue =
                      resolution?.action === "ignore"
                        ? "__ignore"
                        : resolution?.action === "new"
                          ? "__new"
                          : resolution?.canonicalPlayerId || "__new";

                    return (
                      <div
                        key={raw.rawKey}
                        className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 md:grid-cols-[1.1fr_1fr_1.5fr] md:items-center"
                      >
                        <div>
                          <p className="font-black text-white">{raw.rawName}</p>
                          <p className="mt-1 break-all text-xs text-zinc-500">
                            Cuenta TXT: {raw.rawPlayerId || "Sin ID"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-300">
                            {raw.team}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Aparece en {raw.appearances} tramo(s)
                          </p>
                        </div>
                        <select
                          className="input"
                          value={selectValue}
                          onChange={(e) =>
                            cambiarResolucion(raw.rawKey, e.target.value)
                          }
                        >
                          <option value="__new">
                            Confirmar como jugador/cuenta nueva
                          </option>
                          <option value="__ignore">
                            Ignorar esta cuenta en estadísticas individuales
                          </option>
                          {rosterOptions.map((p) => (
                            <option
                              key={`${p.equipo}-${p.playerid}`}
                              value={cleanText(p.playerid)}
                            >
                              Vincular con {p.jugador || p.playerid} ·{" "}
                              {p.playerid}
                            </option>
                          ))}
                        </select>
                        {resolution?.source === "alias" && (
                          <p className="md:col-span-3 text-xs font-bold text-emerald-300">
                            Alias reconocido automáticamente: se acumulará en{" "}
                            {resolution.canonicalName}.
                          </p>
                        )}
                        {resolution?.saveAlias && (
                          <p className="md:col-span-3 text-xs font-bold text-yellow-300">
                            La relación quedará guardada para futuras cargas.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={procesarCarga}
                  disabled={loading}
                  className="btn disabled:opacity-50"
                >
                  {loading
                    ? "Guardando..."
                    : "Confirmar y guardar partido consolidado"}
                </button>
                <button
                  type="button"
                  onClick={resetAnalisis}
                  disabled={loading}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-sm font-black uppercase text-zinc-300"
                >
                  Cancelar revisión
                </button>
              </div>
            </section>
          )}

          <section className="rounded-[28px] border border-white/10 bg-[#020714] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
                  Corrección total
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Anula el resultado, todos los segmentos TXT y las estadísticas
                  consolidadas del partido seleccionado.
                </p>
              </div>
              <button
                type="button"
                onClick={anularCargaTxt}
                disabled={
                  loading ||
                  !partidoSeleccionado ||
                  (!partidoSeleccionado.partido_id &&
                    !partidoSeleccionado.resultado)
                }
                className="rounded-2xl border border-red-400/35 bg-red-500/10 px-5 py-4 text-sm font-black uppercase text-red-200 disabled:opacity-40"
              >
                Anular carga completa
              </button>
            </div>
          </section>

          {mensaje && (
            <p className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 font-bold text-emerald-300">
              {mensaje}
            </p>
          )}

          <section className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
            <b>Funcionamiento:</b> un TXT sigue siendo el caso normal. Si el
            juego corta el partido, cargá el primer tramo normalmente y luego
            elegí “Agregar tramo al mismo partido” para sumar el segundo. Las
            cuentas alternativas pueden vincularse al PSO ID oficial antes de
            guardar.
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
