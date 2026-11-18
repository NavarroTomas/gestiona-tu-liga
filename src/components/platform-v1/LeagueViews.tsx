"use client";
import Image from "next/image";
import type { LeagueBundle, Match } from "@/lib/platform/types";
import { matchLabel, playerStandings, standings } from "@/lib/platform/domain";
import { Monogram } from "./ui";
import s from "./platform.module.css";
export function dateLabel(value: string | null) { return value ? new Date(value).toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Fecha a confirmar"; }
export function MatchRows({ data, items, actions }: {
    data: LeagueBundle;
    items?: Match[];
    actions?: (m: Match) => React.ReactNode;
}) { const matches = items ?? [...data.matches].sort((a, b) => a.round - b.round || String(a.starts_at ?? "9999").localeCompare(String(b.starts_at ?? "9999"))); return matches.length ? <div>{matches.map(m => <article className={s.matchCard} key={m.id}><div className={s.matchDate}><span>FECHA {m.round}</span><br /><span>{dateLabel(m.starts_at)}</span></div><div><div className={s.matchTeams}><span>{matchLabel(m, "home", data)}</span><b>{m.status === "completed" ? `${m.home_score} — ${m.away_score}` : "VS"}</b><span>{matchLabel(m, "away", data)}</span></div>{m.venue && <p className={s.help} style={{ textAlign: "center" }}>{m.venue}</p>}</div>{actions && <div className={s.matchActions}>{actions(m)}</div>}</article>)}</div> : <p className={s.muted}>Todavía no hay partidos programados.</p>; }
export function StandingsTable({ data }: {
    data: LeagueBundle;
}) { const rows = standings(data); return rows.length ? <div className={s.tableWrap}><table className={s.table}><caption className={s.help}>Puntos: victoria {data.league.points_win}, empate {data.league.points_draw}, derrota {data.league.points_loss}. Desempate: diferencia de gol y goles a favor.</caption><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead><tbody>{rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td><strong><Monogram name={r.name} image={data.teams.find(t => t.id === r.id)?.logo_url}/>{r.name}</strong></td><td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td><td>{r.goalsFor}</td><td>{r.goalsAgainst}</td><td>{r.difference}</td><td><b>{r.points}</b></td></tr>)}</tbody></table></div> : <p className={s.muted}>La tabla se prepara cuando se cargan los equipos.</p>; }
export function PlayersTable({ data }: {
    data: LeagueBundle;
}) { const rows = playerStandings(data); return rows.length ? <div className={s.tableWrap}><table className={s.table}><thead><tr><th>#</th><th>Jugador</th>{data.league.mode === "players" && <th>PTS</th>}<th>PJ</th><th>Goles</th><th>Asist.</th><th>Amarillas</th><th>Rojas</th><th>Nota media</th></tr></thead><tbody>{rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td><strong><Monogram name={r.name} image={data.players.find(p => p.id === r.id)?.photo_url}/>{r.name}</strong></td>{data.league.mode === "players" && <td><b>{r.points}</b></td>}<td>{r.played}</td><td>{r.goals}</td><td>{r.assists}</td><td>{r.yellow}</td><td>{r.red}</td><td>{r.rating === null ? "—" : r.rating.toFixed(1)}</td></tr>)}</tbody></table></div> : <p className={s.muted}>Las estadísticas aparecen al sumar jugadores y registrar sus partidos.</p>; }
export function NewsCards({ data }: {
    data: LeagueBundle;
}) { const news = [...data.news].filter(n => n.published).reverse(); return news.length ? <div className={s.newsGrid}>{news.map(n => <article key={n.id} className={s.newsCard}>{n.image_url && <Image src={n.image_url} alt="" width={600} height={200} unoptimized/>}<div><small>{new Date(n.created_at).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Cordoba", day: "numeric", month: "long" })}</small><h3>{n.title}</h3><p>{n.body}</p></div></article>)}</div> : <p className={s.muted}>Todavía no se publicaron novedades.</p>; }
