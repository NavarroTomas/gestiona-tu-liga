"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isPlatformConfigured, messageFor, platformClient } from "@/lib/platform/client";
import s from "./platform.module.css";
export function Brand({ light = false }: {
    light?: boolean;
}) {
    return <Link href="/" className={`${s.brand} ${light ? s.brandLight : ""}`} aria-label="Plataforma de ligas, inicio"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" stroke="currentColor" strokeWidth="2"/><path d="M16 3v26M3 11h5v10H3m26-10h-5v10h5" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/></svg><span>Tu liga<span className={s.brandCaption}>FÚTBOL ORGANIZADO</span></span></Link>;
}
export function Arrow() { return <span aria-hidden="true">↗</span>; }
export function Header({ account = false }: {
    account?: boolean;
}) {
    const router = useRouter(), [error, setError] = useState("");
    return <><header className={s.header}><Brand /><nav aria-label="Navegación principal">{account ? <><Link href="/mis-ligas">Mis ligas</Link><button className={s.textButton} onClick={async () => { try {
        const { error } = await platformClient().auth.signOut();
        if (error)
            throw error;
        router.replace("/login");
    }
    catch (e) {
        setError(messageFor(e));
    } }}>Cerrar sesión</button></> : <><Link href="/demo" className={s.hideMobile}>Ver ejemplo</Link><Link href="/login">Ingresar</Link><Link href="/registro" className={s.buttonSmall}>Crear mi liga <Arrow /></Link></>}</nav></header>{error && <Notice error>{error}</Notice>}</>;
}
export function usePlatformSession() {
    const configured = isPlatformConfigured();
    const [user, setUser] = useState<User | null>(null), [ready, setReady] = useState(!configured), [error, setError] = useState(configured ? "" : "La conexión con Supabase todavía no está configurada.");
    useEffect(() => {
        if (!configured)
            return;
        let active = true;
        const db = platformClient();
        db.auth.getSession().then(({ data, error }) => { if (active) {
            setUser(data.session?.user ?? null);
            if (error)
                setError(messageFor(error));
            setReady(true);
        } }).catch(e => { if (active) {
            setError(messageFor(e));
            setReady(true);
        } });
        const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => { if (active) {
            setUser(session?.user ?? null);
            setReady(true);
        } });
        return () => { active = false; subscription.unsubscribe(); };
    }, [configured]);
    return { user, ready, error };
}
export function Notice({ children, error = false }: {
    children: React.ReactNode;
    error?: boolean;
}) { return <p role={error ? "alert" : "status"} className={error ? s.error : s.notice}>{children}</p>; }
export function Loading({ text = "Cargando la liga…" }: {
    text?: string;
}) { return <div className={s.loading} role="status"><span className={s.spinner}/><p>{text}</p></div>; }
export function Monogram({ name, image, large = false }: {
    name: string;
    image?: string | null;
    large?: boolean;
}) {
    return <span className={`${s.monogram} ${large ? s.monogramLarge : ""}`}>{image ? <Image src={image} alt="" width={large ? 64 : 36} height={large ? 64 : 36} unoptimized/> : name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase()}</span>;
}
export function Footer() { return <footer className={s.footer}><Brand /><p>Partidos, equipos y resultados en un mismo lugar.</p><Link href="/registro">Crear mi liga <Arrow /></Link></footer>; }
