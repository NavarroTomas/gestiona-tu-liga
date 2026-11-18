"use client";
import { useState } from "react";
import type { LeagueBundle } from "@/lib/platform/types";
import { platformClient, messageFor } from "@/lib/platform/client";
import { uploadImage } from "@/lib/platform/api";
import { inkFor } from "@/lib/platform/domain";
import { Monogram, Notice } from "./ui";
import s from "./platform.module.css";
export default function Settings({ data, onChanged }: {
    data: LeagueBundle;
    onChanged: () => Promise<void>;
}) {
    const [league, setLeague] = useState(data.league), [image, setImage] = useState<File | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState(""), [email, setEmail] = useState("");
    async function save(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); setSuccess(""); try {
        let url = league.logo_url;
        if (image)
            url = await uploadImage(league.id, image);
        const { error } = await platformClient().from("leagues").update({ name: league.name.trim(), description: league.description.trim(), primary_color: league.primary_color, secondary_color: league.secondary_color, logo_url: url, points_win: league.points_win, points_draw: league.points_draw, points_loss: league.points_loss }).eq("id", league.id);
        if (error)
            throw error;
        await onChanged();
        setSuccess("Los cambios quedaron guardados.");
        setImage(null);
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    return <><section className={s.panel}><h2>Identidad y reglas</h2><div className={s.settingsPreview} style={{ borderColor: league.primary_color }}><Monogram name={league.name} image={league.logo_url} large/><div><strong>{league.name}</strong><p className={s.help}>Vista previa de tu identidad</p><span style={{ display: "inline-block", padding: "5px 10px", borderRadius: 4, background: league.primary_color, color: inkFor(league.primary_color), fontSize: 12 }}>Color principal</span></div><span style={{ background: league.secondary_color, width: 40, height: 40, borderRadius: 5, marginLeft: "auto" }}/></div>
    <form className={s.form} onSubmit={save}><label className={s.field}>Nombre de la liga<input required maxLength={80} value={league.name} onChange={e => setLeague({ ...league, name: e.target.value })}/></label><label className={s.field}>Descripción pública<textarea maxLength={1000} value={league.description} onChange={e => setLeague({ ...league, description: e.target.value })}/></label><div className={s.formRow}><label className={s.field}>Color principal<input type="color" value={league.primary_color} onChange={e => setLeague({ ...league, primary_color: e.target.value })}/></label><label className={s.field}>Color secundario<input type="color" value={league.secondary_color} onChange={e => setLeague({ ...league, secondary_color: e.target.value })}/></label></div><label className={s.field}>Logo (JPG, PNG o WebP, hasta 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0] ?? null)}/></label><p className={s.help}>El enlace público mantiene su dirección aunque cambies el nombre.</p><h3>Puntos por resultado</h3><p className={s.help}>Modificar esta regla recalcula las posiciones de todos los partidos registrados de la liga.</p><div className={s.formRow}>{(["points_win", "points_draw", "points_loss"] as const).map((key, i) => <label className={s.field} key={key}>{["Victoria", "Empate", "Derrota"][i]}<input type="number" required min={-100} max={100} value={league[key]} onChange={e => setLeague({ ...league, [key]: Number(e.target.value) })}/></label>)}</div><button className={s.buttonSmall} style={{ justifySelf: "start" }} disabled={busy}>{busy ? "Guardando…" : "Guardar configuración"}</button></form></section>
    <section className={s.panel}><h2>Agregar administrador</h2><p>La persona debe tener una cuenta confirmada. Solo el creador de la liga puede otorgar acceso.</p><form className={s.form} onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try {
        const { error } = await platformClient().rpc("add_league_admin", { p_league_id: data.league.id, p_email: email.trim() });
        if (error)
            throw error;
        setSuccess("La persona ya tiene acceso de administrador.");
        setEmail("");
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }}><label className={s.field}>Correo del nuevo administrador<input type="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><button className={s.outline} style={{ justifySelf: "start" }} disabled={busy}>Agregar administrador</button></form></section>{error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}</>;
}
