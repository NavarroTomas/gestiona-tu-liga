"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DRAFT_KEY } from "@/lib/platform/domain";
import { messageFor, platformClient } from "@/lib/platform/client";
import { Arrow, Header, Notice } from "./ui";
import s from "./platform.module.css";
export default function Access() {
    const router = useRouter(), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [show, setShow] = useState(false), [recovery, setRecovery] = useState(false), [sent, setSent] = useState(false);
    async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try {
        if (recovery) {
            const { error } = await platformClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/recuperar` });
            if (error)
                throw error;
            setSent(true);
        }
        else {
            const { error } = await platformClient().auth.signInWithPassword({ email: email.trim(), password });
            if (error)
                throw error;
            setPassword("");
            let draft = false;
            try {
                draft = !!localStorage.getItem(DRAFT_KEY);
            }
            catch { }
            router.replace(draft ? "/crear-liga" : "/mis-ligas");
        }
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    return <><Header /><main className={s.auth}><section><span className={s.eyebrow}>Tu próxima fecha empieza acá</span><h1>Volvé a tu liga.</h1><p>Ingresá para organizar los partidos, actualizar los resultados y publicar las novedades de tu competencia.</p><p>¿Todavía no tenés una cuenta?</p><Link href="/registro" className={s.backLink}>Crear mi liga <Arrow /></Link></section><section className={s.authBox}><h2>{recovery ? "Recuperar acceso" : "Iniciar sesión"}</h2>{sent ? <Notice>Si el correo corresponde a una cuenta, vas a recibir las instrucciones para recuperar el acceso.</Notice> : <form onSubmit={submit} className={s.form}><label className={s.field}>Correo electrónico<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}/></label>{!recovery && <><label className={s.field}>Contraseña<input type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}/></label><button type="button" className={s.textButton} style={{ justifySelf: "start" }} onClick={() => setShow(!show)}>{show ? "Ocultar contraseña" : "Mostrar contraseña"}</button></>}{error && <Notice error>{error}</Notice>}<button className={s.button} disabled={busy}>{busy ? "Un momento…" : recovery ? "Enviar instrucciones" : "Ingresar"} <Arrow /></button></form>}<button type="button" className={s.textButton} style={{ marginTop: 22 }} onClick={() => { setRecovery(!recovery); setError(""); setSent(false); }}>{recovery ? "Volver al inicio de sesión" : "Olvidé mi contraseña"}</button><p>Los visitantes pueden consultar una liga pública sin iniciar sesión.</p></section></main></>;
}
