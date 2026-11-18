"use client";
import { useState } from "react";
import type { LeagueBundle, News } from "@/lib/platform/types";
import { removeEntity, saveEntity, uploadImage } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { Notice } from "./ui";
import { NewsCards } from "./LeagueViews";
import s from "./platform.module.css";
export default function NewsManager({ data, onChanged }: {
    data: LeagueBundle;
    onChanged: () => Promise<void>;
}) {
    const [editing, setEditing] = useState<Partial<News> | null>(null), [image, setImage] = useState<File | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(""), [deleting, setDeleting] = useState<string | null>(null);
    async function save(e: React.FormEvent) { e.preventDefault(); if (!editing)
        return; setBusy(true); setError(""); try {
        let url = editing.image_url;
        if (image)
            url = await uploadImage(data.league.id, image);
        await saveEntity("news", { id: editing.id ?? crypto.randomUUID(), league_id: data.league.id, title: editing.title?.trim(), body: editing.body?.trim(), published: editing.published ?? true, image_url: url ?? null }, editing.id ? "update" : "create");
        setEditing(null);
        setImage(null);
        await onChanged();
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    return <section className={s.panel}><div className={s.panelTitle}><h2>Noticias de la liga</h2><button className={s.buttonSmall} onClick={() => { setEditing({ title: "", body: "", published: true }); setImage(null); }}>Escribir noticia +</button></div>{error && <Notice error>{error}</Notice>}{editing && <form className={s.editor} onSubmit={save}><div className={s.form}><label className={s.field}>Título<input autoFocus required maxLength={160} value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })}/></label><label className={s.field}>Contenido<textarea required maxLength={10000} rows={5} value={editing.body ?? ""} onChange={e => setEditing({ ...editing, body: e.target.value })}/></label><label className={s.field}>Imagen (opcional, hasta 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setImage(e.target.files?.[0] ?? null)}/></label><label className={s.wrap}><input type="checkbox" checked={editing.published ?? true} onChange={e => setEditing({ ...editing, published: e.target.checked })}/> Publicar en la página de la liga</label></div><div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy ? "Guardando…" : "Guardar noticia"}</button><button type="button" className={s.textButton} onClick={() => setEditing(null)}>Cancelar</button></div></form>}
    {data.news.length > 0 && <div className={s.tableWrap}><table className={s.table}><thead><tr><th>Noticia</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{[...data.news].reverse().map(n => <tr key={n.id}><td>{n.title}</td><td>{n.published ? "Publicada" : "Borrador"}</td><td><div className={s.rowActions}><button onClick={() => { setEditing(n); setImage(null); }}>Editar</button><button onClick={() => setDeleting(n.id)}>Eliminar</button></div></td></tr>)}</tbody></table></div>}
    {deleting && <div className={s.confirmation}><p>¿Eliminar esta noticia definitivamente?</p><div className={s.wrap}><button className={s.danger} disabled={busy} onClick={async () => { setBusy(true); try {
        await removeEntity("news", deleting, data.league.id);
        setDeleting(null);
        await onChanged();
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }}>Eliminar noticia</button><button className={s.textButton} onClick={() => setDeleting(null)}>Cancelar</button></div></div>}
    <div style={{ marginTop: 25 }}><NewsCards data={data}/></div></section>;
}
