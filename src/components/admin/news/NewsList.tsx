"use client";

import { Input, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";
import type { AdminNewsItem } from "@/lib/adminNews";

export default function NewsList({ items, search, loading, onSearch, onEdit, onTogglePublished, onToggleFeatured, onDelete, onRefresh }: {
  items: AdminNewsItem[];
  search: string;
  loading: boolean;
  onSearch: (value: string) => void;
  onEdit: (item: AdminNewsItem) => void;
  onTogglePublished: (item: AdminNewsItem) => void;
  onToggleFeatured: (item: AdminNewsItem) => void;
  onDelete: (item: AdminNewsItem) => void;
  onRefresh: () => void;
}) {
  return (
    <TournamentPanel
      eyebrow="Publicaciones"
      title="Noticias cargadas"
      description="Buscá, editá o cambiá el estado sin entrar al formulario."
      action={<button type="button" className={styles.secondary} onClick={onRefresh} disabled={loading}>{loading ? "Actualizando..." : "Actualizar"}</button>}
    >
      <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar por título, categoría o autor..." />

      <div className={styles.list} style={{ marginTop: 16 }}>
        {loading ? (
          <div className={styles.empty}>Cargando noticias...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No hay noticias para mostrar.</div>
        ) : items.map((item) => (
          <article key={item.id} className={styles.row} style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
              {item.imagen_url && (
                <img src={item.imagen_url} alt="" style={{ width: 96, height: 68, objectFit: "cover", borderRadius: 10, flex: "0 0 auto" }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <span className={styles.badge}>{item.categoria || "General"}</span>
                  <span className={styles.badge}>{item.publicada ? "Publicada" : "Borrador"}</span>
                  {item.destacada && <span className={styles.badge}>Destacada</span>}
                </div>
                <div className={styles.rowTitle}>{item.titulo}</div>
                <div className={styles.rowMeta} style={{ marginTop: 4 }}>{item.descripcion}</div>
                <div className={styles.rowMeta} style={{ marginTop: 6 }}>{item.temporada || "Sin temporada"} · {item.autor || "Prensa APA"}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => onEdit(item)}>Editar</button>
              <button type="button" className={styles.secondary} onClick={() => onTogglePublished(item)}>{item.publicada ? "Ocultar" : "Publicar"}</button>
              <button type="button" className={styles.secondary} onClick={() => onToggleFeatured(item)}>{item.destacada ? "Quitar destaque" : "Destacar"}</button>
              <button type="button" className={styles.danger} onClick={() => onDelete(item)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </TournamentPanel>
  );
}
