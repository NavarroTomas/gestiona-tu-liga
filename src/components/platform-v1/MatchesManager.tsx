"use client";
import { useState } from "react";
import type { LeagueBundle, Match, MatchPlayer, Player } from "@/lib/platform/types";
import { generateFixture, removeEntity, saveEntity, saveResult, updateMatchSchedule } from "@/lib/platform/api";
import { messageFor, platformClient } from "@/lib/platform/client";
import { matchLabel, playerStandings, splitPlayers, validateResult } from "@/lib/platform/domain";
import { Notice } from "./ui";
import { MatchRows } from "./LeagueViews";
import s from "./platform.module.css";
function localDate(iso: string | null) { if (!iso)
    return ""; const date = new Date(iso); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
export default function MatchesManager({ data, onChanged }: {
    data: LeagueBundle;
    onChanged: () => Promise<void>;
}) {
    const [form, setForm] = useState(false), [schedule, setSchedule] = useState<Match | null>(null), [result, setResult] = useState<Match | null>(null), [deleting, setDeleting] = useState<Match | null>(null);
    const [home, setHome] = useState(""), [away, setAway] = useState(""), [when, setWhen] = useState(""), [venue, setVenue] = useState(""), [round, setRound] = useState(1), [homeName, setHomeName] = useState("Equipo A"), [awayName, setAwayName] = useState("Equipo B");
    const [participants, setParticipants] = useState<string[]>(data.players.map(p => p.id)), [balanced, setBalanced] = useState(false), [split, setSplit] = useState<{
        home: Player[];
        away: Player[];
    } | null>(null);
    const [homeScore, setHomeScore] = useState(""), [awayScore, setAwayScore] = useState(""), [stats, setStats] = useState<MatchPlayer[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState("");
    const friends = data.league.mode === "players";
    async function action(fn: () => Promise<void>, message: string) { setBusy(true); setError(""); setSuccess(""); try {
        await fn();
        await onChanged();
        setSuccess(message);
    }
    catch (e) {
        setError(messageFor(e));
    }
    finally {
        setBusy(false);
    } }
    function openForm(m?: Match) { setResult(null); setError(""); setSchedule(m ?? null); setHome(m?.home_team_id ?? data.teams[0]?.id ?? ""); setAway(m?.away_team_id ?? data.teams[1]?.id ?? ""); setWhen(localDate(m?.starts_at ?? null)); setVenue(m?.venue ?? ""); setRound(m?.round ?? 1); setHomeName(m?.home_label ?? "Equipo A"); setAwayName(m?.away_label ?? "Equipo B"); setParticipants(data.players.map(p => p.id)); setSplit(null); setForm(true); }
    function openResult(m: Match) { setForm(false); setError(""); setResult(m); setHomeScore(m.home_score === null ? "" : String(m.home_score)); setAwayScore(m.away_score === null ? "" : String(m.away_score)); setStats(data.stats.filter(s => s.match_id === m.id).map(s => ({ ...s }))); }
    async function submitMatch(e: React.FormEvent) {
        e.preventDefault();
        await action(async () => {
            const starts_at = when ? new Date(when).toISOString() : null;
            if (schedule) {
                await updateMatchSchedule(schedule.id, data.league.id, { starts_at, venue: venue.trim(), round, home_label: homeName.trim(), away_label: awayName.trim() });
            }
            else if (friends) {
                if (!split || !split.home.length || !split.away.length)
                    throw new Error("Seleccioná participantes y repartí los equipos antes de guardar.");
                const { error } = await platformClient().rpc("create_friendly_match", { p_league_id: data.league.id, p_home_label: homeName.trim(), p_away_label: awayName.trim(), p_home_players: split.home.map(p => p.id), p_away_players: split.away.map(p => p.id), p_starts_at: starts_at, p_venue: venue.trim(), p_round: round });
                if (error)
                    throw error;
            }
            else {
                if (!home || !away || home === away)
                    throw new Error("Elegí dos equipos distintos.");
                const competition = data.competitions[0];
                if (!competition)
                    throw new Error("Falta la competencia inicial de la liga.");
                await saveEntity("matches", { id: crypto.randomUUID(), league_id: data.league.id, competition_id: competition.id, round, home_team_id: home, away_team_id: away, starts_at, venue: venue.trim() });
            }
            setForm(false);
        }, schedule ? "La programación quedó actualizada." : "El partido quedó programado.");
    }
    async function submitResult(e: React.FormEvent) { e.preventDefault(); if (!result)
        return; const h = homeScore === "" ? NaN : Number(homeScore), a = awayScore === "" ? NaN : Number(awayScore); const issue = validateResult(result, h, a, stats, data.players, data.league, data.stats); if (issue) {
        setError(issue);
        return;
    } await action(async () => { await saveResult(result.id, h, a, stats); setResult(null); }, "Resultado y estadísticas guardados. Las posiciones ya están actualizadas."); }
    function togglePlayer(player: Player, side: "home" | "away", checked: boolean) { setStats(old => checked ? [...old.filter(x => x.player_id !== player.id), { match_id: result!.id, league_id: data.league.id, player_id: player.id, side, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, rating: null }] : old.filter(x => x.player_id !== player.id)); }
    function changeStat(pid: string, key: keyof MatchPlayer, value: number | null) { setStats(old => old.map(x => x.player_id === pid ? { ...x, [key]: value } : x)); }
    return <section className={s.panel}><div className={s.panelTitle}><h2>Partidos y resultados</h2><div className={s.wrap}>{!friends && data.league.format !== "friendly" && <button className={s.outline} disabled={busy || data.teams.length < 2 || data.matches.length > 0} onClick={() => action(async () => { await generateFixture(data.league.id); }, "El fixture está listo. Completá los días y horarios de cada partido.")}>Generar fixture</button>}<button className={s.buttonSmall} onClick={() => openForm()}>Programar partido +</button></div></div>
 {!friends && data.matches.length === 0 && <p className={s.help}>Para generar el fixture cargá al menos dos equipos. Cada pareja se programa una vez, o dos si elegiste ida y vuelta.</p>}
 {success && <Notice>{success}</Notice>}{error && <Notice error>{error}</Notice>}
 {form && <form className={s.editor} onSubmit={submitMatch}><h3>{schedule ? "Editar programación" : "Programar partido"}</h3>
 {!friends && !schedule && <div className={s.formRow}><label className={s.field}>Equipo local<select required value={home} onChange={e => setHome(e.target.value)}><option value="">Elegir equipo</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label className={s.field}>Equipo visitante<select required value={away} onChange={e => setAway(e.target.value)}><option value="">Elegir equipo</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label></div>}
 {friends && <><div className={s.formRow}><label className={s.field}>Nombre del equipo A<input required maxLength={80} value={homeName} onChange={e => setHomeName(e.target.value)}/></label><label className={s.field}>Nombre del equipo B<input required maxLength={80} value={awayName} onChange={e => setAwayName(e.target.value)}/></label></div>{!schedule && <><p className={s.help}>Marcá quiénes van a jugar. Si son impares, el equipo A tendrá un jugador más.</p><div className={s.wrap} style={{ marginBlock: 16 }}>{data.players.map(p => <label key={p.id} className={s.wrap} style={{ fontSize: 12, padding: "8px 12px", border: "1px solid #ced9c0", borderRadius: 5 }}><input type="checkbox" checked={participants.includes(p.id)} onChange={e => { setParticipants(old => e.target.checked ? [...old, p.id] : old.filter(id => id !== p.id)); setSplit(null); }}/>{p.name}</label>)}</div><div className={s.wrap}><label className={s.wrap}><input type="radio" name="split" checked={!balanced} onChange={() => { setBalanced(false); setSplit(null); }}/>Aleatorio</label><label className={s.wrap}><input type="radio" name="split" checked={balanced} onChange={() => { setBalanced(true); setSplit(null); }}/>Equilibrado por nota</label><button type="button" className={s.outline} disabled={participants.length < 2} onClick={() => { const ratings = new Map(playerStandings(data).filter(p => p.rating !== null).map(p => [p.id, p.rating!])); setSplit(splitPlayers(data.players.filter(p => participants.includes(p.id)), balanced, ratings)); }}>Repartir equipos</button></div><p className={s.help}>El reparto equilibrado usa la nota media de partidos anteriores. Sin historial se toma 5. Las posiciones todavía no intervienen.</p>{split && <div className={s.twoColumns} style={{ marginBlock: 20 }}>{(["home", "away"] as const).map(side => <div key={side}><h4>{side === "home" ? homeName : awayName}</h4>{split[side].map(p => <p className={s.help} key={p.id}>{p.name}</p>)}</div>)}</div>}</>}
 </>}
 <div className={s.formRow} style={{ marginTop: 16 }}><label className={s.field}>Día y hora (opcional)<input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}/></label><label className={s.field}>Cancha (opcional)<input maxLength={160} value={venue} onChange={e => setVenue(e.target.value)}/></label><label className={s.field}>Número de fecha<input type="number" required min={1} max={10000} value={round} onChange={e => setRound(Number(e.target.value))}/></label></div><p className={s.help}>Los horarios se muestran en hora de Argentina.</p><div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy ? "Guardando…" : "Guardar partido"}</button><button type="button" className={s.textButton} onClick={() => setForm(false)}>Cancelar</button></div></form>}
 {result && <form className={s.editor} onSubmit={submitResult}><h3>{matchLabel(result, "home", data)} vs. {matchLabel(result, "away", data)}</h3><div className={s.formRow}><label className={s.field}>Goles de {matchLabel(result, "home", data)}<input type="number" required min={0} max={999} value={homeScore} onChange={e => setHomeScore(e.target.value)}/></label><label className={s.field}>Goles de {matchLabel(result, "away", data)}<input type="number" required min={0} max={999} value={awayScore} onChange={e => setAwayScore(e.target.value)}/></label></div><p className={s.help}>Marcá solamente a quienes jugaron. Cada participante suma un partido jugado. La nota es opcional y va de 1 a 10. Una participación guardada conserva el lado del partido aunque el jugador cambie de equipo.</p>
 {(["home", "away"] as const).map(side => { const players = data.players.filter(p => friends || (p.team_id === (side === "home" ? result.home_team_id : result.away_team_id) && !data.stats.some(old => old.match_id === result.id && old.player_id === p.id && old.side !== side)) || data.stats.some(old => old.match_id === result.id && old.player_id === p.id && old.side === side)); return <div key={side}><h4>{matchLabel(result, side, data)}</h4><div className={s.tableWrap}>{players.map(p => { const stat = stats.find(x => x.player_id === p.id && x.side === side), otherSide = stats.some(x => x.player_id === p.id && x.side !== side); return <div className={s.statInputs} key={p.id}><label><input type="checkbox" checked={!!stat} disabled={otherSide} onChange={e => togglePlayer(p, side, e.target.checked)}/>{p.name}</label>{(["goals", "assists", "yellow_cards", "red_cards", "rating"] as const).map((key, i) => <label key={key}>{["Goles", "Asist.", "Amar.", "Rojas", "Nota"][i]}<input type="number" aria-label={`${["Goles", "Asistencias", "Amarillas", "Rojas", "Nota"][i]} de ${p.name} (${side === "home" ? "local" : "visitante"})`} disabled={!stat} min={key === "rating" ? 1 : 0} max={key === "rating" ? 10 : key === "yellow_cards" ? 2 : key === "red_cards" ? 1 : 999} step={key === "rating" ? "0.1" : "1"} value={stat?.[key] ?? ""} onChange={e => changeStat(p.id, key, key === "rating" && e.target.value === "" ? null : Number(e.target.value))}/></label>)}</div>; })}</div></div>; })}
 <div className={s.editorActions}><button className={s.buttonSmall} disabled={busy}>{busy ? "Guardando…" : "Guardar resultado"}</button><button type="button" className={s.textButton} onClick={() => setResult(null)}>Cancelar</button></div></form>}
 {deleting && <div className={s.confirmation}><p>¿Eliminar {matchLabel(deleting, "home", data)} vs. {matchLabel(deleting, "away", data)}? También se eliminarán sus estadísticas y se recalcularán las posiciones.</p><div className={s.wrap}><button className={s.danger} disabled={busy} onClick={() => action(async () => { await removeEntity("matches", deleting.id, data.league.id); setDeleting(null); }, "Partido eliminado.")}>Eliminar partido</button><button className={s.textButton} onClick={() => setDeleting(null)}>Cancelar</button></div></div>}
 <MatchRows data={data} actions={m => <><button onClick={() => openForm(m)}>Programación</button><button onClick={() => openResult(m)}>{m.status === "completed" ? "Editar resultado" : "Cargar resultado"}</button>{m.status === "completed" && <button disabled={busy} onClick={() => action(async () => { await saveResult(m.id, null, null, []); }, "El resultado fue anulado y sus estadísticas se retiraron.")}>Anular resultado</button>}<button onClick={() => setDeleting(m)}>Eliminar</button></>}/>
 </section>;
}
