"use client";

import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  createCompetitionConfig,
  createTournamentSeason,
  fetchCompetitionConfigs,
  fetchSeasonRecords,
  saveCompetitionConfig,
  updateTournamentSeason,
  type CompetitionConfig,
  type TournamentSeason,
} from "@/lib/adminTournaments";
import {
  Tabs,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  tournamentStyles as styles,
} from "./TournamentUi";
import {
  CompetitionCatalogSection,
  CompetitionRulesSection,
  SeasonSettingsSection,
} from "./TournamentSettingsSections";

type View = "temporada" | "competiciones" | "reglas";

export default function TournamentSettingsManager() {
  const [view, setView] = useState<View>("temporada");
  const [seasons, setSeasons] = useState<TournamentSeason[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [configs, setConfigs] = useState<CompetitionConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [newSeasonName, setNewSeasonName] = useState("");
  const [newSeasonNumber, setNewSeasonNumber] = useState("");
  const [cloneFrom, setCloneFrom] = useState("");

  const [newCompetitionName, setNewCompetitionName] = useState("");
  const [newCompetitionSlug, setNewCompetitionSlug] = useState("");
  const [newCompetitionType, setNewCompetitionType] = useState("liga");

  const season = useMemo(() => seasons.find((item) => String(item.id) === seasonId) || null, [seasons, seasonId]);
  const config = useMemo(() => configs.find((item) => item.id === selectedConfigId) || configs[0] || null, [configs, selectedConfigId]);

  async function loadSeasons(preferredName?: string) {
    const rows = await fetchSeasonRecords();
    setSeasons(rows);
    const preferred = preferredName ? rows.find((row) => row.nombre === preferredName) : null;
    setSeasonId((current) => preferred
      ? String(preferred.id)
      : current && rows.some((row) => String(row.id) === current)
        ? current
        : String(rows[0]?.id || ""));
  }

  useEffect(() => {
    loadSeasons().catch((error) => setMessage(error?.message || "No pude cargar las temporadas."));
  }, []);

  useEffect(() => {
    if (!season?.nombre) {
      setConfigs([]);
      return;
    }
    fetchCompetitionConfigs(season.nombre)
      .then((rows) => {
        setConfigs(rows);
        setSelectedConfigId((current) => rows.some((row) => row.id === current) ? current : rows[0]?.id || "");
      })
      .catch((error) => setMessage(error?.message || "No pude cargar las competiciones."));
  }, [season?.nombre]);

  function patchSeason(patch: Partial<TournamentSeason>) {
    if (!season) return;
    setSeasons((current) => current.map((item) => String(item.id) === String(season.id) ? { ...item, ...patch } : item));
  }

  async function saveSeason() {
    if (!season) return;
    setLoading(true);
    setMessage("");
    try {
      await updateTournamentSeason(season.id, {
        nombre: season.nombre,
        numero: season.numero ?? null,
        estado: season.estado || "borrador",
        activa: Boolean(season.activa),
        fecha_inicio: season.fecha_inicio || null,
        fecha_fin: season.fecha_fin || null,
      });
      setMessage("Temporada actualizada.");
      await loadSeasons(season.nombre);
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar la temporada.");
    } finally { setLoading(false); }
  }

  async function createSeason() {
    if (!newSeasonName.trim()) {
      setMessage("Escribí un nombre para la nueva temporada.");
      return;
    }
    setLoading(true);
    try {
      await createTournamentSeason({
        nombre: newSeasonName.trim(),
        numero: newSeasonNumber ? Number(newSeasonNumber) : null,
        estado: "borrador",
        activa: false,
        cloneFrom: cloneFrom || null,
      });
      setMessage(`Temporada ${newSeasonName.trim()} creada${cloneFrom ? " con reglas copiadas" : ""}.`);
      await loadSeasons(newSeasonName.trim());
      setNewSeasonName("");
      setNewSeasonNumber("");
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la temporada.");
    } finally { setLoading(false); }
  }

  function patchConfig(patch: Partial<CompetitionConfig>) {
    if (!config) return;
    setConfigs((current) => current.map((item) => item.id === config.id ? { ...item, ...patch } : item));
  }

  function patchRule(key: string, value: any) {
    if (!config) return;
    patchConfig({ reglas: { ...(config.reglas || {}), [key]: value } });
  }

  function removeRule(key: string) {
    if (!config) return;
    const next = { ...(config.reglas || {}) };
    delete next[key];
    patchConfig({ reglas: next });
  }

  async function saveConfig() {
    if (!config) return;
    setLoading(true);
    setMessage("");
    try {
      const saved = await saveCompetitionConfig(config);
      setConfigs((current) => current.map((item) => item.id === saved.id ? saved : item));
      setMessage(`Reglas de ${saved.nombre} guardadas.`);
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar las reglas.");
    } finally { setLoading(false); }
  }

  async function addCompetition() {
    if (!season || !newCompetitionName.trim() || !newCompetitionSlug.trim()) {
      setMessage("Completá nombre y clave de la competición.");
      return;
    }
    setLoading(true);
    try {
      const saved = await createCompetitionConfig({
        temporada: season.nombre,
        slug: newCompetitionSlug.trim().toLowerCase().replace(/\s+/g, "_"),
        nombre: newCompetitionName.trim(),
        tipo: newCompetitionType,
        activa: true,
        orden: (configs.at(-1)?.orden || 0) + 10,
        reglas: {},
      });
      setConfigs((current) => [...current, saved]);
      setSelectedConfigId(saved.id);
      setNewCompetitionName("");
      setNewCompetitionSlug("");
      setMessage("Competición creada. Ahora configurá sus reglas.");
      setView("reglas");
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la competición.");
    } finally { setLoading(false); }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Configuración"
          title="Temporadas y reglas"
          description="Cada pestaña modifica una sola parte del sistema. No hace falta tocar código para preparar una temporada nueva."
        />

        {message && <div className={styles.notice}>{message}</div>}

        <Tabs value={view} onChange={setView} items={[
          { value: "temporada", label: "1 · Temporada" },
          { value: "competiciones", label: "2 · Competiciones" },
          { value: "reglas", label: "3 · Reglas" },
        ]} />

        {view === "temporada" && (
          <SeasonSettingsSection
            seasons={seasons}
            season={season}
            seasonId={seasonId}
            loading={loading}
            newSeasonName={newSeasonName}
            newSeasonNumber={newSeasonNumber}
            cloneFrom={cloneFrom}
            onSeasonId={setSeasonId}
            onPatchSeason={patchSeason}
            onSaveSeason={saveSeason}
            onNewSeasonName={setNewSeasonName}
            onNewSeasonNumber={setNewSeasonNumber}
            onCloneFrom={setCloneFrom}
            onCreateSeason={createSeason}
          />
        )}

        {view === "competiciones" && (
          <CompetitionCatalogSection
            season={season}
            configs={configs}
            selectedConfigId={selectedConfigId}
            newName={newCompetitionName}
            newSlug={newCompetitionSlug}
            newType={newCompetitionType}
            loading={loading}
            onSelect={(id) => { setSelectedConfigId(id); setView("reglas"); }}
            onNewName={setNewCompetitionName}
            onNewSlug={setNewCompetitionSlug}
            onNewType={setNewCompetitionType}
            onAdd={addCompetition}
          />
        )}

        {view === "reglas" && (
          <CompetitionRulesSection
            config={config}
            loading={loading}
            onPatchConfig={patchConfig}
            onPatchRule={patchRule}
            onRemoveRule={removeRule}
            onSave={saveConfig}
          />
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
