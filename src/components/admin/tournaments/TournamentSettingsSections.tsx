"use client";

import type { CompetitionConfig, TournamentSeason } from "@/lib/adminTournaments";
import { Field, Input, Select, TournamentPanel, tournamentStyles as styles } from "./TournamentUi";

export function SeasonSettingsSection({
  seasons,
  season,
  seasonId,
  loading,
  newSeasonName,
  newSeasonNumber,
  cloneFrom,
  onSeasonId,
  onPatchSeason,
  onSaveSeason,
  onNewSeasonName,
  onNewSeasonNumber,
  onCloneFrom,
  onCreateSeason,
}: {
  seasons: TournamentSeason[];
  season: TournamentSeason | null;
  seasonId: string;
  loading: boolean;
  newSeasonName: string;
  newSeasonNumber: string;
  cloneFrom: string;
  onSeasonId: (value: string) => void;
  onPatchSeason: (patch: Partial<TournamentSeason>) => void;
  onSaveSeason: () => void;
  onNewSeasonName: (value: string) => void;
  onNewSeasonNumber: (value: string) => void;
  onCloneFrom: (value: string) => void;
  onCreateSeason: () => void;
}) {
  return (
    <div className={styles.grid2}>
      <TournamentPanel eyebrow="Temporada actual" title="Datos generales" description="Acá solo cambiás estado, fechas y cuál temporada es pública.">
        <div className={styles.list}>
          <Field label="Temporada"><Select value={seasonId} onChange={(e) => onSeasonId(e.target.value)}>{seasons.map((item) => <option key={String(item.id)} value={String(item.id)}>{item.nombre}</option>)}</Select></Field>
          {season && <>
            <div className={styles.grid2}>
              <Field label="Nombre"><Input value={season.nombre} onChange={(e) => onPatchSeason({ nombre: e.target.value })} /></Field>
              <Field label="Número"><Input type="number" value={season.numero ?? ""} onChange={(e) => onPatchSeason({ numero: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Estado"><Select value={season.estado || "borrador"} onChange={(e) => onPatchSeason({ estado: e.target.value })}><option value="borrador">Borrador</option><option value="activa">Activa</option><option value="finalizada">Finalizada</option><option value="archivada">Archivada</option></Select></Field>
              <Field label="Temporada pública"><Select value={season.activa ? "si" : "no"} onChange={(e) => onPatchSeason({ activa: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></Select></Field>
              <Field label="Inicio"><Input type="date" value={season.fecha_inicio || ""} onChange={(e) => onPatchSeason({ fecha_inicio: e.target.value || null })} /></Field>
              <Field label="Fin"><Input type="date" value={season.fecha_fin || ""} onChange={(e) => onPatchSeason({ fecha_fin: e.target.value || null })} /></Field>
            </div>
            <button className={styles.primary} disabled={loading} type="button" onClick={onSaveSeason}>Guardar temporada</button>
          </>}
        </div>
      </TournamentPanel>

      <TournamentPanel eyebrow="Nueva temporada" title="Crear y copiar" description="Creá Temporada 5, 6, etc. y opcionalmente copiá la estructura anterior.">
        <div className={styles.list}>
          <Field label="Nombre"><Input value={newSeasonName} onChange={(e) => onNewSeasonName(e.target.value)} placeholder="Temporada 5" /></Field>
          <Field label="Número"><Input type="number" value={newSeasonNumber} onChange={(e) => onNewSeasonNumber(e.target.value)} placeholder="5" /></Field>
          <Field label="Copiar reglas desde"><Select value={cloneFrom} onChange={(e) => onCloneFrom(e.target.value)}><option value="">Empezar desde cero</option>{seasons.map((item) => <option key={String(item.id)} value={item.nombre}>{item.nombre}</option>)}</Select></Field>
          <button className={styles.primary} disabled={loading} type="button" onClick={onCreateSeason}>Crear temporada</button>
        </div>
      </TournamentPanel>
    </div>
  );
}

export function CompetitionCatalogSection({
  season,
  configs,
  selectedConfigId,
  newName,
  newSlug,
  newType,
  loading,
  onSelect,
  onNewName,
  onNewSlug,
  onNewType,
  onAdd,
}: {
  season: TournamentSeason | null;
  configs: CompetitionConfig[];
  selectedConfigId: string;
  newName: string;
  newSlug: string;
  newType: string;
  loading: boolean;
  onSelect: (id: string) => void;
  onNewName: (value: string) => void;
  onNewSlug: (value: string) => void;
  onNewType: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className={styles.grid2}>
      <TournamentPanel eyebrow={season?.nombre || "Temporada"} title="Competiciones existentes" description="Elegí una para editar sus reglas en la pestaña Reglas.">
        <div className={styles.list}>
          {configs.length ? configs.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={item.id === selectedConfigId ? styles.primary : styles.secondary}>{item.nombre} · {item.activa ? "Activa" : "Oculta"}</button>
          )) : <div className={styles.empty}>Todavía no hay competiciones configuradas.</div>}
        </div>
      </TournamentPanel>

      <TournamentPanel eyebrow="Nueva competición" title="Agregar formato" description="Solo crea la definición. Los participantes y partidos se administran después en la pantalla de cada competición.">
        <div className={styles.list}>
          <Field label="Nombre"><Input value={newName} onChange={(e) => onNewName(e.target.value)} placeholder="Supercopa APA" /></Field>
          <Field label="Clave interna"><Input value={newSlug} onChange={(e) => onNewSlug(e.target.value)} placeholder="supercopa_apa" /></Field>
          <Field label="Tipo"><Select value={newType} onChange={(e) => onNewType(e.target.value)}><option value="liga">Liga</option><option value="grupos">Grupos</option><option value="eliminacion">Eliminación</option><option value="playoffs">Playoffs</option><option value="personalizada">Personalizada</option></Select></Field>
          <button className={styles.primary} disabled={loading} type="button" onClick={onAdd}>Agregar competición</button>
        </div>
      </TournamentPanel>
    </div>
  );
}

export function CompetitionRulesSection({
  config,
  loading,
  onPatchConfig,
  onPatchRule,
  onRemoveRule,
  onSave,
}: {
  config: CompetitionConfig | null;
  loading: boolean;
  onPatchConfig: (patch: Partial<CompetitionConfig>) => void;
  onPatchRule: (key: string, value: any) => void;
  onRemoveRule: (key: string) => void;
  onSave: () => void;
}) {
  if (!config) return <div className={styles.empty}>Elegí o creá una competición primero.</div>;

  return (
    <TournamentPanel eyebrow={config.nombre} title="Reglas deportivas" description="Esta pantalla modifica solamente la configuración de esta competición.">
      <div className={styles.list}>
        <div className={styles.grid2}>
          <Field label="Nombre"><Input value={config.nombre} onChange={(e) => onPatchConfig({ nombre: e.target.value })} /></Field>
          <Field label="Tipo"><Select value={config.tipo} onChange={(e) => onPatchConfig({ tipo: e.target.value })}><option value="liga">Liga</option><option value="grupos">Grupos</option><option value="eliminacion">Eliminación</option><option value="playoffs">Playoffs</option><option value="personalizada">Personalizada</option></Select></Field>
          <Field label="Visible / activa"><Select value={config.activa ? "si" : "no"} onChange={(e) => onPatchConfig({ activa: e.target.value === "si" })}><option value="si">Activa</option><option value="no">Oculta</option></Select></Field>
          <Field label="Orden"><Input type="number" value={config.orden} onChange={(e) => onPatchConfig({ orden: Number(e.target.value || 0) })} /></Field>
        </div>

        {config.tipo === "liga" && <div className={styles.grid2}>
          <Field label="Puntos victoria"><Input type="number" value={config.reglas.puntos_victoria ?? 3} onChange={(e) => onPatchRule("puntos_victoria", Number(e.target.value))} /></Field>
          <Field label="Puntos empate"><Input type="number" value={config.reglas.puntos_empate ?? 1} onChange={(e) => onPatchRule("puntos_empate", Number(e.target.value))} /></Field>
          <Field label="Puntos derrota"><Input type="number" value={config.reglas.puntos_derrota ?? 0} onChange={(e) => onPatchRule("puntos_derrota", Number(e.target.value))} /></Field>
          <Field label="Formato"><Select value={config.reglas.ida_vuelta ? "ida_vuelta" : "ida"} onChange={(e) => onPatchRule("ida_vuelta", e.target.value === "ida_vuelta")}><option value="ida">Una vuelta</option><option value="ida_vuelta">Ida y vuelta</option></Select></Field>
          <Field label="Desempates"><Input value={(config.reglas.desempates || ["pts", "dg", "gf"]).join(",")} onChange={(e) => onPatchRule("desempates", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></Field>
        </div>}

        {config.tipo === "grupos" && <div className={styles.grid2}>
          <Field label="Cantidad de grupos"><Input type="number" min="1" value={config.reglas.cantidad_grupos ?? 4} onChange={(e) => onPatchRule("cantidad_grupos", Number(e.target.value))} /></Field>
          <Field label="Equipos por grupo"><Input type="number" min="2" value={config.reglas.equipos_por_grupo ?? 4} onChange={(e) => onPatchRule("equipos_por_grupo", Number(e.target.value))} /></Field>
          <Field label="A Copa Argentina"><Input type="number" min="0" value={config.reglas.clasifican_copa_argentina ?? 2} onChange={(e) => onPatchRule("clasifican_copa_argentina", Number(e.target.value))} /></Field>
          <Field label="A Copa APA"><Input type="number" min="0" value={config.reglas.clasifican_copa_apa ?? 2} onChange={(e) => onPatchRule("clasifican_copa_apa", Number(e.target.value))} /></Field>
        </div>}

        {config.tipo === "eliminacion" && <Field label="Partido por tercer puesto"><Select value={config.reglas.tercer_puesto ? "si" : "no"} onChange={(e) => onPatchRule("tercer_puesto", e.target.value === "si")}><option value="no">No</option><option value="si">Sí</option></Select></Field>}

        {config.tipo === "playoffs" && <div className={styles.grid2}>
          <Field label="Puestos de Segunda"><Input value={(config.reglas.segunda_posiciones || [2, 3, 4, 5]).join(",")} onChange={(e) => onPatchRule("segunda_posiciones", e.target.value.split(",").map(Number).filter((n) => Number.isFinite(n) && n > 0))} /></Field>
          <Field label="Promoción desde abajo en Primera"><Input type="number" min="1" value={config.reglas.primera_promocion_desde_abajo ?? 2} onChange={(e) => onPatchRule("primera_promocion_desde_abajo", Number(e.target.value))} /></Field>
        </div>}

        <div>
          <p className={styles.sectionEyebrow}>Reglas extra</p>
          <div className={styles.list} style={{ marginTop: 10 }}>
            {Object.entries(config.reglas || {}).map(([key, value]) => <RuleRow key={key} ruleKey={key} value={value} onChange={onPatchRule} onRemove={onRemoveRule} />)}
            <button className={styles.secondary} type="button" onClick={() => onPatchRule(`regla_${Object.keys(config.reglas || {}).length + 1}`, "")}>+ Agregar regla libre</button>
          </div>
        </div>
        <button className={styles.primary} disabled={loading} type="button" onClick={onSave}>Guardar reglas</button>
      </div>
    </TournamentPanel>
  );
}

function RuleRow({ ruleKey, value, onChange, onRemove }: { ruleKey: string; value: any; onChange: (key: string, value: any) => void; onRemove: (key: string) => void }) {
  return (
    <div className={styles.row}>
      <div style={{ minWidth: 170 }}><strong>{ruleKey}</strong></div>
      <Input value={stringifyRule(value)} onChange={(e) => onChange(ruleKey, parseLooseValue(e.target.value))} />
      <button className={styles.danger} type="button" onClick={() => onRemove(ruleKey)}>Quitar</button>
    </div>
  );
}

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
