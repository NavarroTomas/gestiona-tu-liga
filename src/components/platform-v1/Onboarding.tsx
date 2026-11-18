"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createLeague } from "@/lib/platform/api";
import { messageFor, platformClient } from "@/lib/platform/client";
import { DRAFT_KEY, formatNames, purposeNames, restoreDraft, validateDraft } from "@/lib/platform/domain";
import type { LeagueDraft, LeagueFormat, LeaguePurpose } from "@/lib/platform/types";
import { Arrow, Brand, Notice, usePlatformSession } from "./ui";
import s from "./platform.module.css";
const blank: LeagueDraft = { version: 1, requestId: "", purpose: "amateur", mode: "teams", name: "", description: "", expectedParticipants: 8, format: "round_robin", primaryColor: "#216348", secondaryColor: "#dbe99d" };
const palettes = [{ name: "Verde cancha", primary: "#216348", secondary: "#dbe99d" }, { name: "Azul club", primary: "#234f8c", secondary: "#dce8f8" }, { name: "Rojo camiseta", primary: "#94372e", secondary: "#f2dfc9" }, { name: "Negro y blanco", primary: "#252b28", secondary: "#e7e9e2" }];
export default function Onboarding() {
    const router = useRouter(), { user, ready } = usePlatformSession();
    const [draft, setDraft] = useState<LeagueDraft>(blank), [initialized, setInitialized] = useState(false), [step, setStep] = useState(0), [error, setError] = useState(""), [busy, setBusy] = useState(false), [creating, setCreating] = useState(false), [pendingEmail, setPendingEmail] = useState(false), [leaving, setLeaving] = useState(false);
    const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [showPassword, setShowPassword] = useState(false), [displayName, setDisplayName] = useState("");
    const titleRef = useRef<HTMLHeadingElement>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), submitting = useRef(false);
    useEffect(() => { try {
        const raw = localStorage.getItem(DRAFT_KEY);
        const saved = raw ? JSON.parse(raw) : null;
        const restored = restoreDraft(saved, { ...blank, requestId: crypto.randomUUID() });
        setDraft(restored);
        if (!validateDraft(restored))
            setStep(6);
    }
    catch {
        setDraft({ ...blank, requestId: crypto.randomUUID() });
    } setInitialized(true); return () => { if (timer.current)
        clearTimeout(timer.current); }; }, []);
    useEffect(() => { if (initialized)
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
        catch { } }, [draft, initialized]);
    useEffect(() => { if (initialized)
        titleRef.current?.focus(); }, [step, initialized]);
    const update = (value: Partial<LeagueDraft>) => setDraft(d => ({ ...d, ...value }));
    function move(next: number) { setError(""); if (next < 0 || next > 6 || busy)
        return; setLeaving(true); timer.current = setTimeout(() => { setStep(next); setLeaving(false); }, 160); }
    async function create() { const issue = validateDraft(draft); if (issue) {
        setError(issue);
        return;
    } if (submitting.current)
        return; submitting.current = true; setBusy(true); setCreating(true); setError(""); try {
        const league = await createLeague(draft);
        try {
            localStorage.removeItem(DRAFT_KEY);
        }
        catch { }
        router.replace(`/panel/${league.id}`);
    }
    catch (e) {
        setError(messageFor(e));
        setCreating(false);
        setBusy(false);
        submitting.current = false;
    } }
    async function submit(event: React.FormEvent) { event.preventDefault(); if (step === 2 && !draft.name.trim()) {
        setError("Escribí el nombre de tu liga.");
        return;
    } if (step === 3 && (!Number.isInteger(draft.expectedParticipants) || draft.expectedParticipants < 2 || draft.expectedParticipants > 128)) {
        setError("Ingresá una cantidad entre 2 y 128.");
        return;
    } if (step < 6) {
        move(step + 1);
        return;
    } if (!ready) {
        setError("Estamos comprobando tu sesión. Esperá un momento.");
        return;
    } if (user) {
        await create();
        return;
    } if (password.length < 10) {
        setError("Usá una contraseña de al menos 10 caracteres.");
        return;
    } setBusy(true); setError(""); try {
        const { data, error } = await platformClient().auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/crear-liga` } });
        if (error)
            throw error;
        setPassword("");
        if (data.session) {
            await create();
        }
        else {
            setPendingEmail(true);
            setBusy(false);
        }
    }
    catch (e) {
        setError(messageFor(e));
        setBusy(false);
    } }
    const titles = ["¿Para qué es tu liga?", "¿Cómo van a competir?", "¿Cómo se llama tu liga?", draft.mode === "teams" ? "¿Cuántos equipos van a jugar?" : "¿Cuántos jugadores son?", "¿Cómo querés organizar los partidos?", "Dale los colores de tu liga.", user ? "Revisá tu liga antes de crearla." : "Creá tu cuenta para guardar la liga."];
    return <main className={s.onboarding}><header className={s.onboardHeader}><Brand light/><Link href={user ? "/mis-ligas" : "/login"}>{user ? "Volver a mis ligas" : "Ya tengo una cuenta"}</Link></header><div className={s.progress} aria-label={`Paso ${step + 1} de 7`}><span style={{ width: `${(step + 1) / 7 * 100}%` }}/></div>
 {creating ? <section className={s.creating} role="status"><span className={s.spinner}/><p>ESTAMOS PREPARANDO TU COMPETENCIA</p><h1>Creando {draft.name}.</h1><p>Guardando tu configuración, preparando la temporada y asignando tu acceso de administrador.</p><div className={s.creatingSteps}><span>Identidad</span><span>Temporada inicial</span><span>Panel de administración</span></div></section> : pendingEmail ? <section className={s.onboardBody}><h1>Confirmá tu correo.</h1><p className={s.onboardHint}>Enviamos un enlace a {email}. Al confirmarlo vas a poder continuar con la creación. Las respuestas quedaron guardadas en este navegador.</p><Notice>Si no llega, revisá spam. El envío depende del servicio de correo configurado para la plataforma.</Notice><Link href="/login" className={s.buttonLight}>Ya confirmé, ingresar <Arrow /></Link></section> : <section className={s.onboardBody}><form onSubmit={submit}><div className={`${s.step} ${leaving ? s.stepLeaving : ""}`} key={step}><div className={s.stepNumber}>Tu liga, paso a paso / {String(step + 1).padStart(2, "0")} de 07</div><h1 tabIndex={-1} ref={titleRef}>{titles[step]}</h1>
 {step === 0 && <><p className={s.onboardHint}>Así podemos preparar una configuración que te sirva.</p><div className={s.choices}>{(Object.entries(purposeNames) as [
            LeaguePurpose,
            string
        ][]).map(([key, label], i) => <button type="button" className={s.choice} aria-pressed={draft.purpose === key} key={key} onClick={() => update({ purpose: key })}><span>{i + 1}</span><strong>{label}</strong></button>)}</div></>}
 {step === 1 && <><p className={s.onboardHint}>Podés administrar equipos fijos o seguir a cada jugador.</p><div className={s.choices}>{([{ key: "teams", title: "Por equipos", text: "Cada equipo tiene su plantel. Tabla de posiciones y fixture." }, { key: "players", title: "Por jugadores", text: "Los equipos cambian en cada partido. Puntos y estadísticas individuales." }] as const).map((option, i) => <button type="button" key={option.key} className={s.choice} aria-pressed={draft.mode === option.key} onClick={() => update({ mode: option.key, format: option.key === "players" ? "friendly" : "round_robin" })}><span>{i + 1}</span><div><strong>{option.title}</strong><small>{option.text}</small></div></button>)}</div></>}
 {step === 2 && <><p className={s.onboardHint}>Este nombre y la descripción se mostrarán en la página pública.</p><div className={s.onboardField}><label htmlFor="league-name">Nombre de la liga</label><input id="league-name" required maxLength={80} autoComplete="off" value={draft.name} onChange={e => update({ name: e.target.value })} placeholder="Por ejemplo, Liga del domingo"/><label htmlFor="league-idea" style={{ marginTop: 14 }}>¿Cuál es la idea? (opcional)</label><textarea id="league-idea" maxLength={1000} value={draft.description} onChange={e => update({ description: e.target.value })} placeholder="Un torneo de fútbol 7 para los equipos del barrio…"/></div></>}
 {step === 3 && <><p className={s.onboardHint}>Es una estimación. Después vas a cargar los nombres y podés agregar más participantes.</p><div className={s.onboardField}><label htmlFor="participant-count">Cantidad de {draft.mode === "teams" ? "equipos" : "jugadores"}</label><input id="participant-count" type="number" required min={2} max={128} inputMode="numeric" value={draft.expectedParticipants || ""} onChange={e => update({ expectedParticipants: Number(e.target.value) })}/></div></>}
 {step === 4 && <><p className={s.onboardHint}>{draft.mode === "players" ? "Programá cada encuentro y repartí a los jugadores cuando sepas quiénes van a jugar." : "Vas a poder generar el fixture después de cargar tus equipos."}</p><div className={s.choices}>{(Object.entries(formatNames) as [
            LeagueFormat,
            string
        ][]).filter(([key]) => draft.mode === "teams" || key === "friendly").map(([key, label], i) => <button type="button" key={key} className={s.choice} aria-pressed={draft.format === key} onClick={() => update({ format: key })}><span>{i + 1}</span><strong>{label}</strong></button>)}</div></>}
 {step === 5 && <><p className={s.onboardHint}>Elegí una combinación o usá tus propios colores. Podés cambiarlos después.</p><div className={s.choices}>{palettes.map((p, i) => <button type="button" key={p.name} className={s.choice} aria-pressed={draft.primaryColor === p.primary && draft.secondaryColor === p.secondary} onClick={() => update({ primaryColor: p.primary, secondaryColor: p.secondary })}><span style={{ background: p.primary, borderColor: p.secondary, color: "white" }}>{i + 1}</span><strong>{p.name}</strong></button>)}</div><div className={s.formRow} style={{ marginTop: 22 }}><div className={s.onboardField}><label htmlFor="primary-color">Color principal</label><input id="primary-color" type="color" value={draft.primaryColor} onChange={e => update({ primaryColor: e.target.value })}/></div><div className={s.onboardField}><label htmlFor="secondary-color">Color secundario</label><input id="secondary-color" type="color" value={draft.secondaryColor} onChange={e => update({ secondaryColor: e.target.value })}/></div></div></>}
 {step === 6 && <><p className={s.onboardHint}>{user ? "Se va a crear una temporada inicial vacía. Vos decidís qué equipos y jugadores agregar." : "Esta cuenta será tu acceso como organizador. Los jugadores no necesitan registrarse."}</p>{!user && <div className={s.onboardField}><label htmlFor="organizer-name">Tu nombre</label><input id="organizer-name" required maxLength={80} autoComplete="name" value={displayName} onChange={e => setDisplayName(e.target.value)}/><label htmlFor="email">Correo electrónico</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}/><label htmlFor="password">Contraseña (al menos 10 caracteres)</label><input id="password" type={showPassword ? "text" : "password"} minLength={10} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}/><button type="button" className={s.textButton} style={{ color: "#b8c8a9", justifySelf: "start" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</button></div>}<div className={s.onboardSummary}><div><span>Liga</span><strong>{draft.name}</strong></div><div><span>Modalidad</span><strong>{draft.mode === "teams" ? "Equipos" : "Jugadores"}</strong></div><div><span>Participantes estimados</span><strong>{draft.expectedParticipants}</strong></div><div><span>Organización</span><strong>{formatNames[draft.format]}</strong></div></div></>}
 </div>{error && <Notice error>{error}</Notice>}<div className={s.onboardActions}><button type="button" className={s.textButton} disabled={step === 0 || busy || leaving} onClick={() => move(step - 1)}>← Anterior</button><button type="submit" className={s.buttonLight} disabled={!initialized || busy || leaving}>{busy ? "Guardando…" : step === 6 ? user ? "Crear mi liga" : "Crear cuenta y continuar" : "Continuar"} <Arrow /></button></div></form></section>}
 <footer className={s.onboardFooter}><span>Una configuración que podés cambiar después.</span><span>Sin tarjeta de crédito.</span></footer></main>;
}
