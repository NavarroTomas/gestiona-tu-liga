"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import {
  fetchCompetitionConfigs,
  fetchTournamentMatches,
  fetchTournamentSeasons,
  fetchTournamentTeams,
  isLoadedMatch,
  type CompetitionConfig,
  type TournamentMatch,
  type TournamentTeam,
} from "@/lib/adminTournaments";
import {
  Field,
  Input,
  Select,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "./TournamentUi";

type Draft = {
  local: string;
  visitante: string;
  competicion: string;
  division: string;
  fase: string;
  ronda: string;
  fecha: string;
  dia: string;
  hora: string;
  estado: string;
};

const emptyDraft: Draft = {
  local: "",
  visitante: "",
  competicion: "liga",
  division: "primera",
  fase: "liga",
  ronda: "",
  fecha: "1",
  dia: "",
  hora: "",
  estado: "programado",
};

export default function TournamentAdvancedManager() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [configs, setConfigs] = useState<CompetitionConfig[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournamentSeasons().then((rows) => {
      setSeasons(rows);
      setSeason(rows[0] || "Temporada 4");
    }).catch(() => {
      setSeasons(["Temporada 4"]);
      setSeason("Temporada 4");
    });
  }, []);

  async function load() {
    if (!season) return;
    setLoading(true);
    setMessage("");
    try {
      const [teamRows, matchRows, configRows] = await Promise.all([
        fetchTournamentTeams(season),
        fetchTournamentMatches({ temporada: season }),
        fetchCompetitionConfigs(season),
      ]);
      setTeams(teamRows);
      setMatches(matchRows);
      setConfigs(configRows);
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar las herramientas avanzadas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [season]);

  const selected = useMemo(() => matches.find((match) => String(match.id) === selectedId) || null, [matches, selectedId]);
  const selectedLoaded = Boolean(selected && isLoadedMatch(selected));

  function patchDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function loadSelectedIntoDraft(match: TournamentMatch) {
    setSelectedId(String(match.id));
    setDraft({
      local: match.local || "",
      visitante: match.visitante || "",
      competicion: match.competicion || "liga",
      division: match.division || "",
      fase: match.fase || "",
      ronda: match.ronda || "",
      fecha: String(match.fecha || ""),
      dia: match.dia || "",
      hora: match.hora || "",
      estado: match.estado || "programado",
    });
  }

  async function createMatch() {
    if (!draft.local || !draft.visitante || draft.local === draft.visitante) {
      setMessage("Elegí dos clubes distintos.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert({
        temporada: season,
        local: draft.local,
        visitante: draft.visitante,
        competicion: draft.competicion || null,
        division: draft.division || null,
        fase: draft.fase || null,
        ronda: draft.ronda || null,
        fecha: draft.fecha || null,
        dia: draft.dia || null,
        hora: draft.hora || null,
        estado: draft.estado || "programado",
        resultado: null,
        partido_id: null,
      });
      if (error) throw error;
      setMessage("Partido excepcional creado correctamente.");
      setDraft(emptyDraft);
      setSelectedId("");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude crear el partido.");
    } finally { setLoading(false); }
  }

  async function saveSelected() {
    if (!selected) return;
    if (!draft.local || !draft.visitante || draft.local === draft.visitante) {
      setMessage("Elegí dos clubes distintos.");
      return;
    }

    setLoading(true);
    try {
      const structuralPatch = {
        local: draft.local,
        visitante: draft.visitante,
        competicion: draft.competicion || null,
        division: draft.division || null,
        fase: draft.fase || null,
        ronda: draft.ronda || null,
        fecha: draft.fecha || null,
        dia: draft.dia || null,
        hora: draft.hora || null,
        estado: draft.estado || "programado",
      };

      if (selectedLoaded) {
        const changedStructure =
          draft.local !== selected.local ||
          draft.visitante !== (selected.visitante || "") ||
          draft.competicion !== (selected.competicion || "") ||
          draft.division !== (selected.division || "") ||
          draft.fase !== (selected.fase || "");

        if (changedStructure) {
          setMessage("Este partido ya tiene resultado/estadísticas. Para cambiar equipos o estructura primero corregilo o anulalo desde Centro de partidos; acá sí podés cambiar fecha, día, hora, ronda y estado.");
          return;
        }
      }

      const safePatch = selectedLoaded
        ? { fecha: structuralPatch.fecha, dia: structuralPatch.dia, hora: structuralPatch.hora, ronda: structuralPatch.ronda, estado: structuralPatch.estado }
        : structuralPatch;

      const { error } = await supabase.from("partidos").update(safePatch).eq("id", selected.id);
      if (error) throw error;
      setMessage("Cambios guardados.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar los cambios.");
    } finally { setLoading(false); }
  }

  async function duplicateSelected() {
    if (!selected) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").insert({
        temporada: season,
        local: draft.local,
        visitante: draft.visitante,
        competicion: draft.competicion || null,
        division: draft.division || null,
        fase: draft.fase || null,
        ronda: draft.ronda ? `${draft.ronda} · copia` : "Copia manual",
        fecha: draft.fecha || null,
        dia: draft.dia || null,
        hora: draft.hora || null,
        estado: "programado",
        resultado: null,
        partido_id: null,
      });
      if (error) throw error;
      setMessage("Partido duplicado como nuevo partido vacío.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude duplicar el partido.");
    } finally { setLoading(false); }
  }

  async function deleteSelected() {
    if (!selected) return;
    if (isLoadedMatch(selected)) {
      setMessage("No se puede borrar desde acá porque el partido ya tiene datos oficiales. Usá Centro de partidos para anular/corregir la carga.");
      return;
    }
    if (!window.confirm(`¿Eliminar ${selected.local} vs ${selected.visitante}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("partidos").delete().eq("id", selected.id);
      if (error) throw error;
      setSelectedId("");
      setDraft(emptyDraft);
      setMessage("Partido vacío eliminado.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar el partido.");
    } finally { setLoading(false); }
  }

  const competitionOptions = useMemo(() => {
    const base = [
      { slug: "liga", nombre: "Liga" },
      { slug: "copa_clasificatoria", nombre: "Clasificatoria" },
      { slug: "copa_argentina", nombre: "Copa Argentina" },
      { slug: "copa_apa", nombre: "Copa de la Liga" },
      { slug: "copa_campeones", nombre: "Copa de Campeones" },
      { slug: "playoffs", nombre: "Playoffs" },
    ];
    const seen = new Set(base.map((item) => item.slug));
    for (const config of configs) if (!seen.has(config.slug)) base.push({ slug: config.slug, nombre: config.nombre });
    return base;
  }, [configs]);

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Modo avanzado"
          title="Excepciones y cambios manuales"
          description="Usá esta pantalla cuando el flujo normal no alcanza. Podés crear cruces especiales, reubicar partidos vacíos, cambiar participantes, fases, fechas y estados sin tocar código."
        >
          <div className={styles.toolbar}>
            <Field label="Torneo">
              <Select value={season} onChange={(e) => { setSeason(e.target.value); setSelectedId(""); setDraft(emptyDraft); }}>
                {seasons.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}
              </Select>
            </Field>
            <Link href="/admin/torneos/configuracion" className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Editar reglas globales</Link>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <div className={styles.split} style={{ marginTop: 22 }}>
          <TournamentPanel eyebrow="Partidos" title="Elegir partido existente" description="Seleccioná un partido para corregir su estructura. Los partidos con estadísticas tienen protecciones adicionales.">
            <div className={styles.list}>
              {matches.map((match) => (
                <button key={String(match.id)} type="button" className={String(match.id) === selectedId ? styles.primary : styles.secondary} onClick={() => loadSelectedIntoDraft(match)} style={{ textAlign: "left" }}>
                  {match.local} vs {match.visitante} · {match.competicion || "sin competición"} · {match.fecha || "sin fecha"}
                </button>
              ))}
              {!matches.length && <div className={styles.empty}>No hay partidos para este torneo.</div>}
            </div>
          </TournamentPanel>

          <TournamentPanel eyebrow={selected ? "Editar existente" : "Crear excepción"} title={selected ? `${selected.local} vs ${selected.visitante}` : "Nuevo partido manual"} description={selectedLoaded ? "Este partido ya tiene datos oficiales: equipos y competición quedan protegidos para no romper estadísticas." : "Todos los campos estructurales se pueden modificar."}>
            <div className={styles.grid2}>
              <Field label="Local"><Select value={draft.local} onChange={(e) => patchDraft({ local: e.target.value })}><option value="">Seleccionar</option>{teams.map((team) => <option key={`l-${team.nombre}`} value={team.nombre}>{displayLabel(team.nombre)}</option>)}</Select></Field>
              <Field label="Visitante"><Select value={draft.visitante} onChange={(e) => patchDraft({ visitante: e.target.value })}><option value="">Seleccionar</option>{teams.map((team) => <option key={`v-${team.nombre}`} value={team.nombre}>{displayLabel(team.nombre)}</option>)}</Select></Field>
              <Field label="Competición"><Select value={draft.competicion} onChange={(e) => patchDraft({ competicion: e.target.value })}>{competitionOptions.map((item) => <option key={item.slug} value={item.slug}>{displayLabel(item.nombre)}</option>)}</Select></Field>
              <Field label="División"><Input value={draft.division} onChange={(e) => patchDraft({ division: e.target.value })} placeholder="primera / segunda / copa / personalizada" /></Field>
              <Field label="Fase"><Input value={draft.fase} onChange={(e) => patchDraft({ fase: e.target.value })} placeholder="liga / grupos / cuartos / semifinal / final" /></Field>
              <Field label="Ronda / etiqueta"><Input value={draft.ronda} onChange={(e) => patchDraft({ ronda: e.target.value })} placeholder="Ej: Copa de la Liga · Repechaje" /></Field>
              <Field label="Fecha"><Input value={draft.fecha} onChange={(e) => patchDraft({ fecha: e.target.value })} /></Field>
              <Field label="Estado"><Select value={draft.estado} onChange={(e) => patchDraft({ estado: e.target.value })}><option value="programado">Programado</option><option value="postergado">Postergado</option><option value="suspendido">Suspendido</option><option value="cancelado">Cancelado</option></Select></Field>
              <Field label="Día"><Input value={draft.dia} onChange={(e) => patchDraft({ dia: e.target.value })} placeholder="Ej: Domingo 20/09" /></Field>
              <Field label="Hora"><Input value={draft.hora} onChange={(e) => patchDraft({ hora: e.target.value })} placeholder="21:00" /></Field>
            </div>

            <div className={styles.toolbar}>
              {selected ? (
                <>
                  <button type="button" className={styles.primary} onClick={saveSelected} disabled={loading}>Guardar cambios</button>
                  <button type="button" className={styles.secondary} onClick={duplicateSelected} disabled={loading}>Duplicar como partido nuevo</button>
                  <button type="button" className={styles.danger} onClick={deleteSelected} disabled={loading || selectedLoaded}>Eliminar partido vacío</button>
                  {selectedLoaded && <Link href={`/admin/partidos/${selected.id}`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir en Centro de partidos</Link>}
                </>
              ) : (
                <button type="button" className={styles.primary} onClick={createMatch} disabled={loading}>Crear partido excepcional</button>
              )}
            </div>
          </TournamentPanel>
        </div>
      </TournamentPage>
    </PermissionGuard>
  );
}
