"use client";

import { Field, Input, Select, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";
import { NEWS_CATEGORIES, type AdminNewsDraft } from "@/lib/adminNews";

export default function NewsEditor({ draft, seasons, editing, saving, notifyCommunity, onChange, onNotifyCommunity, onSave, onCancel }: {
  draft: AdminNewsDraft;
  seasons: string[];
  editing: boolean;
  saving: boolean;
  notifyCommunity: boolean;
  onChange: (patch: Partial<AdminNewsDraft>) => void;
  onNotifyCommunity: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <TournamentPanel eyebrow={editing ? "Edición" : "Nueva publicación"} title={editing ? "Editar noticia" : "Crear noticia"} description="Escribí lo esencial, elegí cómo se publica y guardá.">
      <div style={{ display: "grid", gap: 16 }}>
        <Field label="Título"><Input value={draft.titulo} onChange={(e) => onChange({ titulo: e.target.value })} placeholder="Ej: Mercado de pases abierto" /></Field>
        <Field label="Contenido">
          <textarea value={draft.descripcion} onChange={(e) => onChange({ descripcion: e.target.value })} placeholder="Escribí la noticia o comunicado..." style={{ width: "100%", minHeight: 220, resize: "vertical", border: "1px solid #245f8e", borderRadius: 12, background: "#123f69", color: "#fff", padding: 14, font: "inherit", lineHeight: 1.6, outline: "none" }} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          <Field label="Temporada"><Select value={draft.temporada || ""} onChange={(e) => onChange({ temporada: e.target.value })}>{seasons.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Categoría"><Select value={draft.categoria || "General"} onChange={(e) => onChange({ categoria: e.target.value })}>{NEWS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Autor"><Input value={draft.autor || ""} onChange={(e) => onChange({ autor: e.target.value })} placeholder="Prensa APA" /></Field>
        </div>
        <Field label="Imagen (URL opcional)"><Input value={draft.imagen_url || ""} onChange={(e) => onChange({ imagen_url: e.target.value || null })} placeholder="https://..." /></Field>
        {draft.imagen_url && <img src={draft.imagen_url} alt="Vista previa" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }} />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <label className={styles.row} style={{ cursor: "pointer" }}><div><div className={styles.rowTitle}>Publicada</div><div className={styles.rowMeta}>Visible en la web.</div></div><input type="checkbox" checked={draft.publicada} onChange={(e) => onChange({ publicada: e.target.checked })} /></label>
          <label className={styles.row} style={{ cursor: "pointer" }}><div><div className={styles.rowTitle}>Destacada</div><div className={styles.rowMeta}>Prioridad visual.</div></div><input type="checkbox" checked={draft.destacada} onChange={(e) => onChange({ destacada: e.target.checked })} /></label>
          {!editing && <label className={styles.row} style={{ cursor: "pointer" }}><div><div className={styles.rowTitle}>Notificar</div><div className={styles.rowMeta}>Avisa a la comunidad.</div></div><input type="checkbox" checked={notifyCommunity} onChange={(e) => onNotifyCommunity(e.target.checked)} /></label>}
        </div>
        <div className={styles.actions}><button type="button" className={styles.primary} disabled={saving} onClick={onSave}>{saving ? "Guardando..." : editing ? "Guardar cambios" : draft.publicada ? "Publicar noticia" : "Guardar borrador"}</button><button type="button" className={styles.secondary} disabled={saving} onClick={onCancel}>Cancelar</button></div>
      </div>
    </TournamentPanel>
  );
}
