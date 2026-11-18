"use client";
import { useState } from "react";
import type { LeagueBundle, Player, Team } from "@/lib/platform/types";
import { removeEntity, saveEntity, uploadImage } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { Monogram, Notice } from "./ui";
import s from "./platform.module.css";
export default function Entities({ data, kind, onChanged }: {
    data: LeagueBundle;
    kind: "teams" | "players";
    onChanged: () => Promise<void>;
}) {
    const [editing, setEditing] = useState<Partial<Team & Player> | null>(null), [image, setImage] = useState<File | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(""), [deleting, setDeleting] = useState<string | null>(null), [query, setQuery] = useState("");
    const isTeam = kind === "teams", items = isTeam ? data.teams : data.players;
    async function save(e: React.FormEvent) { e.preventDefault(); if (!editing)
        return; setBusy(true); setError(""); try {
        if (!editing.name?.trim())
            throw new Error("Escribí un nombre.");
        let imageUrl = isTeam ? editing.logo_url : editing.photo_url;
        if (image)
            imageUrl = await uploadImage(data.league.id, image);
        await saveEntity(kind, isTeam ? { id: editing.id ?? crypto.randomUUID(), league_id: data.league.id, name: editing.name.trim(), short_name: editing.short_name ?? "", logo_url: imageUrl ?? null } : { id: editing.id ?? crypto.randomUUID(), league_id: data.league.id, name: editing.name.trim(), team_id: editing.team_id || null, position: editing.position || "Sin definir", photo_url: imageUrl ?? null });
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
    async function remove() { if (!deleting)
        return; setBusy(true); setError(""); try {
        await removeEntity(kind, deleting, data.league.id);
        setDeleting(null);
        await onChanged();
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    return <section className={s.panel}><div className={s.panelTitle}><h2>{isTeam ? "Equipos de la liga" : "Jugadores"} <span className={s.badge}>{items.length}</span></h2><button className={s.buttonSmall} onClick={() => { setEditing({ name: "", short_name: "", team_id: "", position: "Sin definir" }); setImage(null); setError(""); }}>{isTeam ? "Agregar equipo" : "Agregar jugador"} +</button></div>
 {error && <Notice error>{error}</Notice>}
 {editing && <form onSubmit={save} className={s.editor}><h3>{editing.id ? "Editar" : "Nuevo"} {isTeam ? "equipo" : "jugador"}</h3><div className={s.formRow}><label className={s.field}>Nombre<input autoFocus required maxLength={80} value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })}/></label>{isTeam ? <label className={s.field}>Abreviatura (opcional)<input maxLength={8} value={editing.short_name ?? ""} onChange={e => setEditing({ ...editing, short_name: e.target.value.toUpperCase() })}/></label> : <label className={s.field}>Posición<select value={editing.position ?? "Sin definir"} onChange={e => setEditing({ ...editing, position: e.target.value })}>{["Sin definir", "Arquero", "Defensor", "Mediocampista", "Delantero"].map(p => <option key={p}>{p}</option>)}</select></label>}</div>
 {!isTeam && data.league.mode === "teams" && <label className={s.field} style={{ marginTop: 16 }}>Equipo<select value={editing.team_id ?? ""} onChange={e => setEditing({ ...editing, team_id: e.target.value })}><option value="">Sin asignar</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
 <label className={s.field} style={{ marginTop: 16 }}>{isTeam ? "Escudo" : "Foto"} (opcional, JPG/PNG/WebP, hasta 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setImage(e.target.files?.[0] ?? null)}/></label>
 <div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button><button type="button" className={s.textButton} disabled={busy} onClick={() => setEditing(null)}>Cancelar</button></div></form>}
 {deleting && <div className={s.confirmation}><p>¿Eliminar este {isTeam ? "equipo" : "jugador"}? Si tiene partidos o estadísticas relacionadas, primero tendrás que revisar esos registros.</p><div className={s.wrap}><button className={s.danger} disabled={busy} onClick={remove}>Eliminar definitivamente</button><button className={s.textButton} disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button></div></div>}
 {items.length > 0 && <label className={s.field} style={{ maxWidth: 300, marginBottom: 18 }}>Buscar {isTeam ? "equipo" : "jugador"}<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre"/></label>}
 {items.length ? <div className={s.tableWrap}><table className={s.table}><thead><tr><th>Nombre</th><th>{isTeam ? "Plantel" : "Equipo / posición"}</th><th>Acciones</th></tr></thead><tbody>{items.filter(x => x.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(item => <tr key={item.id}><td><strong><Monogram name={item.name} image={isTeam ? (item as Team).logo_url : (item as Player).photo_url}/>{item.name}</strong></td><td>{isTeam ? `${data.players.filter(p => p.team_id === item.id).length} jugadores` : `${data.teams.find(t => t.id === (item as Player).team_id)?.name ?? "Sin equipo fijo"} · ${(item as Player).position}`}</td><td><div className={s.rowActions}><button onClick={() => { setEditing({ ...item }); setImage(null); setError(""); }}>Editar</button><button onClick={() => { setDeleting(item.id); setError(""); }}>Eliminar</button></div></td></tr>)}</tbody></table></div> : <div className={s.empty}><h3>{isTeam ? "Sumá el primer equipo." : "Sumá a quienes van a jugar."}</h3><p>{isTeam ? "Cargá los equipos para preparar el fixture de tu competencia." : "Cada jugador tendrá sus estadísticas a partir de los partidos en los que participe."}</p></div>}
 </section>;
}
