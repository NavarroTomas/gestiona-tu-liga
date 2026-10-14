"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useMemo } from "react";
import { Field, Input, Select, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";
import { NEWS_CATEGORIES, type AdminNewsDraft } from "@/lib/adminNews";

export default function NewsEditor({ draft, seasons, editing, saving, imageFile, notifyCommunity, onChange, onImageFile, onNotifyCommunity, onSave, onCancel }: {
  draft: AdminNewsDraft;
  seasons: string[];
  editing: boolean;
  saving: boolean;
  imageFile: File | null;
  notifyCommunity: boolean;
  onChange: (patch: Partial<AdminNewsDraft>) => void;
  onImageFile: (file: File | null) => void;
  onNotifyCommunity: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : draft.imagen_url || "", [imageFile, draft.imagen_url]);

  return (
    <TournamentPanel eyebrow={editing ? "Edición" : "Nueva publicación"} title={editing ? "Editar noticia" : "Crear noticia"} description="Escribí lo esencial, elegí cómo se publica y guardá.">
      <div style={{ display: "grid", gap: 16 }}>
        <Field label="Título"><Input value={draft.titulo} onChange={(e) => onChange({ titulo: e.target.value })} placeholder="Ej: Mercado de pases abierto" /></Field>
        <Field label="Contenido">
          <textarea value={draft.descripcion} onChange={(e) => onChange({ descripcion: e.target.value })} placeholder="Escribí la noticia o comunicado..." style={{ width: "100%", minHeight: 220, resize: "vertical", border: "1px solid #245f8e", borderRadius: 12, background: "#123f69", color: "#fff", padding: 14, font: "inherit", lineHeight: 1.6, outline: "none" }} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          <Field label="Torneo"><Select value={draft.temporada || ""} onChange={(e) => onChange({ temporada: e.target.value })}>{seasons.map((s) => <option key={s} value={s}>{displayLabel(s)}</option>)}</Select></Field>
          <Field label="Categoría"><Select value={draft.categoria || "General"} onChange={(e) => onChange({ categoria: e.target.value })}>{NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{displayLabel(c)}</option>)}</Select></Field>
          <Field label="Autor"><Input value={draft.autor || ""} onChange={(e) => onChange({ autor: e.target.value })} placeholder="Prensa Liga" /></Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, alignItems: "end" }}>
          <Field label="Imagen desde tu PC"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0] || null; onImageFile(file); if (file) onChange({ imagen_url: null }); }} /></Field>
          <Field label="O URL externa"><Input value={draft.imagen_url || ""} onChange={(e) => { onChange({ imagen_url: e.target.value || null }); if (e.target.value.trim()) onImageFile(null); }} placeholder="https://..." /></Field>
        </div>

        {preview ? <img src={preview} alt="Vista previa" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 12, border: "1px solid #245f8e" }} /> : <div style={{ minHeight: 140, display: "grid", placeItems: "center", border: "1px dashed #245f8e", borderRadius: 12, color: "#245f8e", background: "#f5f6f8" }}>Sin imagen</div>}

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
