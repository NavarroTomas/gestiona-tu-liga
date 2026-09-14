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
  Field,
  Input,
  Select,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "./TournamentUi";

function parseLooseValue(value: string): any {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try { return JSON.parse(trimmed); } catch { return trimmed; }
  }
  return trimmed;
}

function stringifyRule(value: any) {
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  return String(value ?? "");
}

export default function TournamentSettingsManager() {
  const [seasons, setSeasons] = useState<TournamentSeason[]>([]);
  const [seasonId, setSeasonId] = useState<string>("");
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
    setSeasonId((current) => preferred ? String(preferred.id) : current && rows.some((row) => String(row.id) === current) ? current : String(rows[0]?.id || ""));
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
      .catch((error) => setMessage(error?.message || "No pude cargar las reglas de la temporada."));
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
      setMessage(`Temporada ${newSeasonName.trim()} creada${cloneFrom ? " con las reglas copiadas" : ""}.`);
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
      setMessage("Competición creada. Ahora podés definir sus reglas.");
    } catch (error: any) {
      setMessage(error?.message || "No pude crear la competición.");
    } finally { setLoading(false); }
  }

  return (
    <PermissionGuard permission="competitions.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Editor sin código"
          title="Temporadas y reglas"
          description="Configurá la estructura deportiva desde el panel. Estos valores quedan guardados en la base y pueden ser consumidos por Fixture y Competición sin editar el código."
        />

        {message && <div className={styles.notice}>{message}</div>}

        <div className={styles.split} style={{ marginTop: 22 }}>
          <TournamentPanel eyebrow="Temporadas" title="Contexto deportivo" description="Creá, activá, cerrá o archivá temporadas sin tocar el proyecto.">
            <div className={styles.list}>
              <Field label="Temporada">
                <Select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
                  {seasons.map((item) => <option key={String(item.id)} value={String(item.id)}>{item.nombre}</option>)}
                </Select>
              </Field>

              {season && (
                <>
                  <div className={styles.grid2}>
                    <Field label="Nombre"><Input value={season.nombre} onChange={(e) => patchSeason({ nombre: e.target.value })} /></Field>
                    <Field label="Número"><Input type="number" value={season.numero ?? ""} onChange={(e) => patchSeason({ numero: e.target.value ? Number(e.target.value) : null })} /></Field>
                    <Field label="Estado">
                      <Select value={season.estado || "borrador"} onChange={(e) => patchSeason({ estado: e.target.value })}>
                        <option value="borrador">Borrador</option><option value="activa">Activa</option><option value="finalizada">Finalizada</option><option value="archivada">Archivada</option>
                      </Select>
                    </Field>
                    <Field label="Temporada pública">
                      <Select value={season.activa ? "si" : "no"} onChange={(e) => patchSeason({ activa: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></Select>
                    </Field>
                    <Field label="Inicio"><Input type="date" value={season.fecha_inicio || ""} onChange={(e) => patchSeason({ fecha_inicio: e.target.value || null })} /></Field>
                    <Field label="Fin"><Input type="date" value={season.fecha_fin || ""} onChange={(e) => patchSeason({ fecha_fin: e.target.value || null })} /></Field>
                  </div>
                  <button className={styles.primary} disabled={loading} type="button" onClick={saveSeason}>Guardar temporada</button>
                </>
              )}
            </div>
          </TournamentPanel>

          <TournamentPanel eyebrow="Nueva temporada" title="Crear sin código" description="Podés copiar las reglas de una temporada anterior y después modificarlas.">
            <div className={styles.list}>
              <Field label="Nombre"><Input value={newSeasonName} onChange={(e) => setNewSeasonName(e.target.value)} placeholder="Temporada 5" /></Field>
              <Field label="Número"><Input type="number" value={newSeasonNumber} onChange={(e) => setNewSeasonNumber(e.target.value)} placeholder="5" /></Field>
              <Field label="Copiar reglas desde">
                <Select value={cloneFrom} onChange={(e) => setCloneFrom(e.target.value)}><option value="">Empezar desde cero</option>{seasons.map((item) => <option key={String(item.id)} value={item.nombre}>{item.nombre}</option>)}</Select>
              </Field>
              <button className={styles.primary} disabled={loading} type="button" onClick={createSeason}>Crear temporada</button>
            </div>
          </TournamentPanel>
        </div>

        {season && (
          <div style={{ marginTop: 22 }}>
            <TournamentPanel eyebrow={season.nombre} title="Reglas de competición" description="Elegí una competición y modificá sus parámetros. En Reglas extra podés guardar parámetros nuevos sin cambiar la base de datos.">
              <div className={styles.split}>
                <div className={styles.list}>
                  {configs.map((item) => (
                    <button key={item.id} type="button" onClick={() => setSelectedConfigId(item.id)} className={item.id === config?.id ? styles.primary : styles.secondary}>
                      {item.nombre} · {item.activa ? "Activa" : "Oculta"}
                    </button>
                  ))}

                  <div className={styles.panel} style={{ padding: 16 }}>
                    <p className={styles.sectionEyebrow}>Nueva competición</p>
                    <div className={styles.list} style={{ marginTop: 10 }}>
                      <Input value={newCompetitionName} onChange={(e) => setNewCompetitionName(e.target.value)} placeholder="Nombre" />
                      <Input value={newCompetitionSlug} onChange={(e) => setNewCompetitionSlug(e.target.value)} placeholder="clave_interna" />
                      <Select value={newCompetitionType} onChange={(e) => setNewCompetitionType(e.target.value)}><option value="liga">Liga</option><option value="grupos">Grupos</option><option value="eliminacion">Eliminación</option><option value="playoffs">Playoffs</option><option value="personalizada">Personalizada</option></Select>
                      <button className={styles.secondary} type="button" onClick={addCompetition}>Agregar competición</button>
                    </div>
                  </div>
                </div>

                {config ? (
                  <div className={styles.list}>
                    <div className={styles.grid2}>
                      <Field label="Nombre"><Input value={config.nombre} onChange={(e) => patchConfig({ nombre: e.target.value })} /></Field>
                      <Field label="Tipo"><Select value={config.tipo} onChange={(e) => patchConfig({ tipo: e.target.value })}><option value="liga">Liga</option><option value="grupos">Grupos</option><option value="eliminacion">Eliminación</option><option value="playoffs">Playoffs</option><option value="personalizada">Personalizada</option></Select></Field>
                      <Field label="Activa"><Select value={config.activa ? "si" : "no"} onChange={(e) => patchConfig({ activa: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></Select></Field>
                      <Field label="Orden"><Input type="number" value={config.orden} onChange={(e) => patchConfig({ orden: Number(e.target.value || 0) })} /></Field>
                    </div>

                    {config.tipo === "liga" && (
                      <div className={styles.grid2}>
                        <Field label="Puntos victoria"><Input type="number" value={config.reglas.puntos_victoria ?? 3} onChange={(e) => patchRule("puntos_victoria", Number(e.target.value))} /></Field>
                        <Field label="Puntos empate"><Input type="number" value={config.reglas.puntos_empate ?? 1} onChange={(e) => patchRule("puntos_empate", Number(e.target.value))} /></Field>
                        <Field label="Puntos derrota"><Input type="number" value={config.reglas.puntos_derrota ?? 0} onChange={(e) => patchRule("puntos_derrota", Number(e.target.value))} /></Field>
                        <Field label="Formato"><Select value={config.reglas.ida_vuelta ? "ida_vuelta" : "ida"} onChange={(e) => patchRule("ida_vuelta", e.target.value === "ida_vuelta")}><option value="ida">Una vuelta</option><option value="ida_vuelta">Ida y vuelta</option></Select></Field>
                        <Field label="Desempates (orden)"><Input value={(config.reglas.desempates || ["pts","dg","gf"]).join(",")} onChange={(e) => patchRule("desempates", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></Field>
                      </div>
                    )}

                    {config.tipo === "grupos" && (
                      <div className={styles.grid2}>
                        <Field label="Cantidad de grupos"><Input type="number" min="1" value={config.reglas.cantidad_grupos ?? 4} onChange={(e) => patchRule("cantidad_grupos", Number(e.target.value))} /></Field>
                        <Field label="Equipos por grupo"><Input type="number" min="2" value={config.reglas.equipos_por_grupo ?? 4} onChange={(e) => patchRule("equipos_por_grupo", Number(e.target.value))} /></Field>
                        <Field label="Clasifican Copa Argentina"><Input type="number" min="0" value={config.reglas.clasifican_copa_argentina ?? 2} onChange={(e) => patchRule("clasifican_copa_argentina", Number(e.target.value))} /></Field>
                        <Field label="Clasifican Copa APA"><Input type="number" min="0" value={config.reglas.clasifican_copa_apa ?? 2} onChange={(e) => patchRule("clasifican_copa_apa", Number(e.target.value))} /></Field>
                      </div>
                    )}

                    {config.tipo === "eliminacion" && (
                      <Field label="Partido por tercer puesto"><Select value={config.reglas.tercer_puesto ? "si" : "no"} onChange={(e) => patchRule("tercer_puesto", e.target.value === "si")}><option value="no">No</option><option value="si">Sí</option></Select></Field>
                    )}

                    {config.tipo === "playoffs" && (
                      <div className={styles.grid2}>
                        <Field label="Posiciones de Segunda"><Input value={(config.reglas.segunda_posiciones || [2,3,4,5]).join(",")} onChange={(e) => patchRule("segunda_posiciones", e.target.value.split(",").map(Number).filter((n) => Number.isFinite(n) && n > 0))} /></Field>
                        <Field label="Promoción: posición desde abajo en Primera"><Input type="number" min="1" value={config.reglas.primera_promocion_desde_abajo ?? 2} onChange={(e) => patchRule("primera_promocion_desde_abajo", Number(e.target.value))} /></Field>
                      </div>
                    )}

                    <div>
                      <p className={styles.sectionEyebrow}>Reglas extra</p>
                      <div className={styles.list} style={{ marginTop: 10 }}>
                        {Object.entries(config.reglas || {}).map(([key, value]) => (
                          <div key={key} className={styles.row}>
                            <div style={{ minWidth: 170 }}><strong>{key}</strong></div>
                            <Input value={stringifyRule(value)} onChange={(e) => patchRule(key, parseLooseValue(e.target.value))} />
                            <button className={styles.danger} type="button" onClick={() => removeRule(key)}>Quitar</button>
                          </div>
                        ))}
                        <button className={styles.secondary} type="button" onClick={() => patchRule(`regla_${Object.keys(config.reglas || {}).length + 1}`, "")}>+ Agregar regla libre</button>
                      </div>
                    </div>

                    <button className={styles.primary} disabled={loading} type="button" onClick={saveConfig}>Guardar reglas</button>
                  </div>
                ) : <div className={styles.empty}>Esta temporada todavía no tiene competiciones configuradas.</div>}
              </div>
            </TournamentPanel>
          </div>
        )}
      </TournamentPage>
    </PermissionGuard>
  );
}
