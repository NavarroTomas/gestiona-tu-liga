"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { loadLeague } from "@/lib/platform/api";
import { messageFor } from "@/lib/platform/client";
import { inkFor, matchLabel } from "@/lib/platform/domain";
import type { LeagueBundle } from "@/lib/platform/types";
import { Arrow, Brand, Loading, Monogram, Notice } from "./ui";
import { dateLabel, MatchRows, NewsCards, PlayersTable, StandingsTable } from "./LeagueViews";
import s from "./platform.module.css";
export default function PublicLeague({ slug, example }: {
    slug?: string;
    example?: LeagueBundle;
}) {
    const [data, setData] = useState<LeagueBundle | null>(example ?? null), [tab, setTab] = useState("Inicio"), [error, setError] = useState(""), [retry, setRetry] = useState(0);
    useEffect(() => { if (example || !slug)
        return; let active = true; loadLeague(slug, true).then(d => { if (active) {
        setData(d);
        setError("");
    } }).catch(e => { if (active)
        setError(messageFor(e)); }); return () => { active = false; }; }, [slug, example, retry]);
    if (error)
        return <main className={s.page}><Brand /><Notice error>{error}</Notice><button className={s.outline} onClick={() => setRetry(n => n + 1)}>Volver a intentar</button></main>;
    if (!data)
        return <Loading />;
    const l = data.league, next = [...data.matches].filter(m => m.status === "scheduled").sort((a, b) => String(a.starts_at ?? "9999").localeCompare(String(b.starts_at ?? "9999")))[0];
    return <div style={{ "--league-primary": l.primary_color, "--league-ink": inkFor(l.primary_color), "--league-secondary": l.secondary_color } as CSSProperties}>
    <header className={s.publicHeader}><Link href={example ? "/demo" : `/l/${l.slug}`} className={s.publicIdentity}><Monogram name={l.name} image={l.logo_url}/><div><strong>{l.name}</strong><small>{data.seasons.find(x => x.is_active)?.name ?? "Temporada 1"} · {l.mode === "teams" ? "Liga por equipos" : "Grupo de jugadores"}</small></div></Link><nav className={s.publicNav} aria-label="Acceso a la plataforma"><Link href="/">Inicio</Link><Link href="/registro" className={s.buttonSmall}>Crear mi liga <Arrow /></Link></nav></header>
    <main>{example && <div style={{ maxWidth: 1240, margin: "20px auto 0", padding: "0 20px" }}><Notice>Liga ficticia de ejemplo. Estos datos muestran cómo se verá una competencia; no se agregan a tu liga.</Notice></div>}<section className={s.publicHero}><div><span className={s.eyebrow}>{l.mode === "teams" ? "La competencia, fecha a fecha" : "Cada partido cuenta"}</span><h1>{l.name}</h1><p>{l.description || "Toda la información de nuestra competencia, en un mismo lugar."}</p><span className={s.badge}>{data.teams.length} equipos · {data.players.length} jugadores · {data.matches.filter(m => m.status === "completed").length} partidos jugados</span></div><aside className={s.publicHeroAside}><span>Próximo encuentro</span>{next ? <><h2>{matchLabel(next, "home", data)}<br />vs. {matchLabel(next, "away", data)}</h2><p>{dateLabel(next.starts_at)}{next.venue ? ` · ${next.venue}` : ""}</p></> : <><h2>Esperando la próxima fecha.</h2><p>Los partidos aparecerán cuando el organizador los programe.</p></>}</aside></section>
    <nav className={s.publicTabs} aria-label="Secciones de la liga">{["Inicio", "Partidos", l.mode === "teams" ? "Posiciones" : "Ranking", "Jugadores", "Equipos", "Noticias"].filter(x => l.mode === "teams" || x !== "Equipos").map(t => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>{t}</button>)}</nav>
    <div className={s.page}>
    {tab === "Inicio" && <><div className={s.twoColumns}><section className={s.panel}><div className={s.panelTitle}><h2>Partidos recientes</h2><button className={s.textButton} onClick={() => setTab("Partidos")}>Ver todos</button></div><MatchRows data={data} items={[...data.matches].filter(m => m.status === "completed").reverse().slice(0, 3)}/></section><section className={s.panel}><h2>{l.mode === "teams" ? "Tabla de posiciones" : "Ranking de jugadores"}</h2>{l.mode === "teams" ? <StandingsTable data={data}/> : <PlayersTable data={data}/>}</section></div><section style={{ marginTop: 35 }}><h2 style={{ fontSize: 27, fontWeight: 550 }}>Noticias recientes</h2><NewsCards data={{ ...data, news: data.news.slice(-2) }}/></section></>}
    {tab === "Partidos" && <section className={s.panel}><h2>Calendario y resultados</h2><MatchRows data={data}/></section>}
    {tab === "Posiciones" && <section className={s.panel}><h2>Tabla de posiciones</h2><StandingsTable data={data}/></section>}
    {(tab === "Jugadores" || tab === "Ranking") && <section className={s.panel}><h2>{tab === "Ranking" ? "Ranking individual" : "Estadísticas de jugadores"}</h2><PlayersTable data={data}/></section>}
    {tab === "Equipos" && <div className={s.leagueGrid}>{data.teams.map(t => <article key={t.id} className={s.leagueCard}><Monogram name={t.name} image={t.logo_url} large/><h2>{t.name}</h2><p className={s.muted}>{data.players.filter(p => p.team_id === t.id).length} jugadores</p><div>{data.players.filter(p => p.team_id === t.id).map(p => <div key={p.id} className={s.checkItem}><Monogram name={p.name} image={p.photo_url}/><span>{p.name}</span><span className={s.small}>{p.position}</span></div>)}</div></article>)}</div>}
    {tab === "Noticias" && <><h2 style={{ fontSize: 30, fontWeight: 550 }}>Noticias de la liga</h2><NewsCards data={data}/></>}
    </div></main><footer className={s.footer}><Brand /><p>Organizado con una plataforma para ligas de fútbol.</p><Link href="/registro">Crear una liga <Arrow /></Link></footer></div>;
}
