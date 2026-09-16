"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import NewsEditor from "./NewsEditor";
import NewsList from "./NewsList";
import { fetchTournamentSeasons } from "@/lib/adminTournaments";
import {
  DEFAULT_NEWS_DRAFT,
  deleteAdminNews,
  fetchAdminNews,
  notifyNewsCommunity,
  saveAdminNews,
  setNewsFeatured,
  setNewsPublished,
  uploadNewsImage,
  type AdminNewsDraft,
  type AdminNewsItem,
} from "@/lib/adminNews";
import {
  Tabs,
  TournamentHero,
  TournamentPage,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

type View = "publicaciones" | "crear";

export default function NewsManager() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [seasons, setSeasons] = useState<string[]>(["Temporada 4"]);
  const [view, setView] = useState<View>("publicaciones");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminNewsDraft>({ ...DEFAULT_NEWS_DRAFT });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifyCommunity, setNotifyCommunity] = useState(true);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.titulo} ${item.categoria || ""} ${item.autor || ""}`.toLowerCase().includes(q));
  }, [items, search]);

  async function loadNews() {
    setLoading(true);
    try {
      setItems(await fetchAdminNews());
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar las noticias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews();
    fetchTournamentSeasons()
      .then((rows) => {
        if (!rows.length) return;
        setSeasons(rows);
        setDraft((current) => ({ ...current, temporada: rows.includes(current.temporada || "") ? current.temporada : rows[0] }));
      })
      .catch(() => undefined);
  }, []);

  function patchDraft(patch: Partial<AdminNewsDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function resetEditor() {
    setEditingId(null);
    setDraft({ ...DEFAULT_NEWS_DRAFT, temporada: seasons[0] || "Temporada 4" });
    setImageFile(null);
    setNotifyCommunity(true);
  }

  function startCreate() {
    resetEditor();
    setMessage("");
    setView("crear");
  }

  function editItem(item: AdminNewsItem) {
    setEditingId(item.id);
    setDraft({
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      temporada: item.temporada || seasons[0] || "Temporada 4",
      categoria: item.categoria || "General",
      imagen_url: item.imagen_url || null,
      autor: item.autor || "",
      publicada: Boolean(item.publicada),
      destacada: Boolean(item.destacada),
    });
    setImageFile(null);
    setNotifyCommunity(false);
    setMessage("");
    setView("crear");
  }

  async function save() {
    if (!draft.titulo.trim()) {
      setMessage("El título es obligatorio.");
      return;
    }
    if (!draft.descripcion.trim()) {
      setMessage("El contenido es obligatorio.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      let imageUrl = draft.imagen_url || null;
      if (imageFile) imageUrl = await uploadNewsImage(imageFile);

      const payload = { ...draft, imagen_url: imageUrl };
      await saveAdminNews(payload, editingId);

      if (!editingId && payload.publicada && notifyCommunity) {
        try {
          const result = await notifyNewsCommunity(payload.titulo.trim());
          if (result.duplicated) setMessage("Noticia publicada. Ya existía una notificación reciente igual.");
          else setMessage("Noticia publicada y comunidad notificada.");
        } catch {
          setMessage("Noticia publicada, pero no pude notificar a la comunidad.");
        }
      } else {
        setMessage(editingId ? "Noticia actualizada." : payload.publicada ? "Noticia publicada." : "Borrador guardado.");
      }

      await loadNews();
      resetEditor();
      setView("publicaciones");
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar la noticia.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: AdminNewsItem) {
    try {
      await setNewsPublished(item.id, !item.publicada);
      await loadNews();
    } catch (error: any) {
      setMessage(error?.message || "No pude cambiar el estado de la noticia.");
    }
  }

  async function toggleFeatured(item: AdminNewsItem) {
    try {
      await setNewsFeatured(item.id, !item.destacada);
      await loadNews();
    } catch (error: any) {
      setMessage(error?.message || "No pude cambiar el destaque.");
    }
  }

  async function remove(item: AdminNewsItem) {
    if (!window.confirm(`¿Eliminar la noticia \"${item.titulo}\"?`)) return;
    try {
      await deleteAdminNews(item.id);
      setMessage("Noticia eliminada.");
      await loadNews();
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar la noticia.");
    }
  }

  const publishedCount = items.filter((item) => item.publicada).length;
  const draftCount = items.length - publishedCount;
  const featuredCount = items.filter((item) => item.destacada).length;

  return (
    <PermissionGuard permission="news.manage">
      <TournamentPage>
        <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>

        <TournamentHero
          eyebrow="Noticias"
          title="Prensa APA"
          description="Publicá noticias y administrá lo existente sin mezclar edición, estados y listado en una sola pantalla."
        >
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Publicadas</div><div className={styles.kpiValue}>{publishedCount}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Borradores</div><div className={styles.kpiValue}>{draftCount}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Destacadas</div><div className={styles.kpiValue}>{featuredCount}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs<View>
            value={view}
            onChange={setView}
            items={[
              { value: "publicaciones", label: "Publicaciones" },
              { value: "crear", label: editingId ? "Editar" : "Nueva noticia" },
            ]}
          />
          {view === "publicaciones" && <button type="button" className={styles.primary} onClick={startCreate}>Nueva noticia</button>}
        </div>

        <div style={{ marginTop: 16 }}>
          {view === "publicaciones" ? (
            <NewsList
              items={filteredItems}
              search={search}
              loading={loading}
              onSearch={setSearch}
              onEdit={editItem}
              onTogglePublished={togglePublished}
              onToggleFeatured={toggleFeatured}
              onDelete={remove}
              onRefresh={loadNews}
            />
          ) : (
            <NewsEditor
              draft={draft}
              seasons={seasons}
              editing={Boolean(editingId)}
              saving={saving}
              imageFile={imageFile}
              notifyCommunity={notifyCommunity}
              onChange={patchDraft}
              onImageFile={setImageFile}
              onNotifyCommunity={setNotifyCommunity}
              onSave={save}
              onCancel={() => { resetEditor(); setView("publicaciones"); }}
            />
          )}
        </div>
      </TournamentPage>
    </PermissionGuard>
  );
}
