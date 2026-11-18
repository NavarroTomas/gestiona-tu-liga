"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { canManage, loadLeague } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { formatNames, inkFor } from "@/lib/platform/domain";
import type { LeagueBundle } from "@/lib/platform/types";
import { Arrow, Header, Loading, Notice, usePlatformSession } from "./ui";
import { MatchRows, PlayersTable, StandingsTable } from "./LeagueViews";
import Entities from "./Entities";
import NewsManager from "./NewsManager";
import Settings from "./Settings";
import MatchesManager from "./MatchesManager";
import s from "./platform.module.css";
export default function Manager({ leagueId }: {
    leagueId: string;
}) {
    const router = useRouter(), { user, ready, error: sessionError } = usePlatformSession(), [data, setData] = useState<LeagueBundle | null>(null), [error, setError] = useState(""), [tab, setTab] = useState("Resumen"), [copied, setCopied] = useState(false);
    const refresh = useCallback(async () => { const d = await loadLeague(leagueId); setData(d); }, [leagueId]);
    useEffect(() => { if (!ready)
        return; if (!user) {
        if (!sessionError)
            router.replace("/login");
        return;
    } let active = true; (async () => { try {
        if (!await canManage(leagueId))
            throw new Error("No tenés permisos para administrar esta liga.");
        const d = await loadLeague(leagueId);
        if (active) {
            setData(d);
            setError("");
        }
    }
    catch (e) {
        if (active)
            setError(messageFor(e));
    } })(); return () => { active = false; }; }, [ready, user, sessionError, leagueId, router]);
    if (error || sessionError)
        return <><Header /><main className={s.page}><Notice error>{error || sessionError}</Notice><Link href="/mis-ligas" className={s.outline}>Volver a mis ligas</Link></main></>;
    if (!data)
        return <><Header account/><Loading text="Abriendo tu administración…"/></>;
    const l = data.league, played = data.matches.filter(m => m.status === "completed").length, tabs = ["Resumen", ...(l.mode === "teams" ? ["Equipos"] : []), "Jugadores", "Partidos", "Estadísticas", "Noticias", "Configuración"];
    const checklist = [{ done: l.mode === "teams" ? data.teams.length >= 2 : data.players.length >= 2, label: l.mode === "teams" ? "Cargar los equipos" : "Cargar los jugadores", tab: l.mode === "teams" ? "Equipos" : "Jugadores" }, { done: data.players.length > 0, label: "Completar los participantes", tab: "Jugadores" }, { done: data.matches.length > 0, label: "Preparar los primeros partidos", tab: "Partidos" }, { done: played > 0, label: "Registrar un resultado", tab: "Partidos" }];
    return <div style={{ "--league-primary": l.primary_color, "--league-ink": inkFor(l.primary_color) } as CSSProperties}><Header account/><div className={s.workspace}><aside className={s.sidebar}><Link href="/mis-ligas">← Mis ligas</Link><span className={s.sidebarLabel}>Administración</span>{tabs.map(t => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>{t}</button>)}<span className={s.sidebarLabel}>Vista pública</span><Link href={`/l/${l.slug}`}>Ver mi liga <Arrow /></Link></aside><main className={s.workspaceMain}><div className={s.workspaceTitle}><div><h1>{l.name}</h1><p>{data.seasons.find(x => x.is_active)?.name ?? "Temporada 1"} · {formatNames[l.format]}</p></div><Link href={`/l/${l.slug}`} className={s.outline}>Ver mi liga <Arrow /></Link></div>
    {tab === "Resumen" && <><span className={s.eyebrow}>Tu competencia, en orden</span><div className={s.statsGrid}>{[["Equipos", data.teams.length], ["Jugadores", data.players.length], ["Partidos jugados", played], ["Próximos partidos", data.matches.length - played]].map(([label, value]) => <div key={label} className={s.stat}><span>{label}</span><strong>{String(value).padStart(2, "0")}</strong></div>)}</div><div className={s.twoColumns}><section className={s.panel}><h2>Prepará tu liga</h2><div className={s.checklist}>{checklist.map((c, i) => <div className={s.checkItem} key={c.label}><span>{c.done ? "✓" : i + 1}</span><span>{c.label}</span><button onClick={() => setTab(c.tab)}>{c.done ? "Revisar" : "Empezar"} →</button></div>)}</div></section><section className={s.panel}><h2>Compartí la competencia</h2><p>Este enlace permite consultar la liga sin crear una cuenta.</p><p className={s.linkBox}>{typeof window !== "undefined" ? window.location.origin : ""}/l/{l.slug}</p><button className={s.outline} onClick={async () => { try {
        await navigator.clipboard.writeText(`${window.location.origin}/l/${l.slug}`);
        setCopied(true);
    }
    catch {
        setCopied(false);
    } }}>{copied ? "Enlace copiado" : "Copiar enlace"}</button></section></div><section className={s.panel}><div className={s.panelTitle}><h2>Partidos</h2><button className={s.textButton} onClick={() => setTab("Partidos")}>Administrar partidos</button></div><MatchRows data={data} items={data.matches.slice(0, 4)}/></section></>}
    {tab === "Equipos" && <Entities data={data} kind="teams" onChanged={refresh}/>}
    {tab === "Jugadores" && <Entities data={data} kind="players" onChanged={refresh}/>}
    {tab === "Partidos" && <MatchesManager data={data} onChanged={refresh}/>}
    {tab === "Estadísticas" && <>{l.mode === "teams" && <section className={s.panel}><h2>Posiciones de equipos</h2><StandingsTable data={data}/></section>}<section className={s.panel}><h2>{l.mode === "players" ? "Ranking individual" : "Estadísticas de jugadores"}</h2><PlayersTable data={data}/></section></>}
    {tab === "Noticias" && <NewsManager data={data} onChanged={refresh}/>}
    {tab === "Configuración" && <Settings key={l.id} data={data} onChanged={refresh}/>}
    </main></div></div>;
}
