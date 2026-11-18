import type { League, LeagueBundle, LeagueDraft, Match, MatchPlayer, Player } from "./types";
export const DRAFT_KEY = "gtl:onboarding:v1";
export const formatNames = { round_robin: "Todos contra todos", double_round_robin: "Todos contra todos · ida y vuelta", friendly: "Partidos libres" };
export const purposeNames = { amateur: "Una liga amateur", friends: "Partidos entre amigos", school: "Un torneo de una institución", other: "Otra competencia" };
// Browser storage is untrusted and may contain an older or damaged draft.
export function restoreDraft(value: unknown, defaults: LeagueDraft): LeagueDraft {
    if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1)
        return defaults;
    const saved = value as Record<string, unknown>;
    const draft = { ...defaults };
    for (const key of ["name", "description"] as const)
        if (typeof saved[key] === "string")
            draft[key] = saved[key];
    if (typeof saved.requestId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved.requestId))
        draft.requestId = saved.requestId;
    if (typeof saved.purpose === "string" && Object.hasOwn(purposeNames, saved.purpose))
        draft.purpose = saved.purpose as LeagueDraft["purpose"];
    if (saved.mode === "teams" || saved.mode === "players")
        draft.mode = saved.mode;
    if (typeof saved.format === "string" && Object.hasOwn(formatNames, saved.format))
        draft.format = saved.format as LeagueDraft["format"];
    if (draft.mode === "players")
        draft.format = "friendly";
    if (typeof saved.expectedParticipants === "number" && Number.isInteger(saved.expectedParticipants) && saved.expectedParticipants >= 2 && saved.expectedParticipants <= 128)
        draft.expectedParticipants = saved.expectedParticipants;
    for (const key of ["primaryColor", "secondaryColor"] as const)
        if (typeof saved[key] === "string" && /^#[0-9a-f]{6}$/i.test(saved[key]))
            draft[key] = saved[key];
    return draft;
}
export function slugify(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55).replace(/-$/, "") || "liga";
}
export function validateDraft(d: LeagueDraft): string | null {
    if (!d.name.trim() || d.name.trim().length > 80)
        return "Escribí un nombre de hasta 80 caracteres.";
    if (!Object.hasOwn(purposeNames, d.purpose))
        return "Elegí para qué vas a usar la liga.";
    if (!["teams", "players"].includes(d.mode))
        return "Elegí una modalidad válida.";
    if (!Number.isInteger(d.expectedParticipants) || d.expectedParticipants < 2 || d.expectedParticipants > 128)
        return "Ingresá una cantidad entre 2 y 128.";
    if (!Object.hasOwn(formatNames, d.format))
        return "Elegí un formato válido.";
    if (d.mode === "players" && d.format !== "friendly")
        return "Los grupos de jugadores se organizan con partidos libres.";
    if (d.description.length > 1000)
        return "La descripción puede tener hasta 1000 caracteres.";
    if (![d.primaryColor, d.secondaryColor].every(c => /^#[0-9a-f]{6}$/i.test(c)))
        return "Revisá los colores de la liga.";
    return null;
}
// WCAG relative luminance: custom colors must never make labels unreadable.
export function inkFor(hex: string): "#ffffff" | "#172018" {
    const rgb = hex.replace("#", "").match(/../g)?.map(v => parseInt(v, 16) / 255) ?? [0, 0, 0];
    const l = rgb.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const lum = .2126 * l[0] + .7152 * l[1] + .0722 * l[2];
    return (lum + .05) / .05 > 1.05 / (lum + .05) ? "#172018" : "#ffffff";
}
export function fixtures(ids: string[], doubleRound = false) {
    if (ids.length < 2 || ids.length > 128 || new Set(ids).size !== ids.length)
        throw new Error("Se necesitan entre 2 y 128 equipos distintos.");
    const ring: (string | null)[] = [...ids];
    if (ring.length % 2)
        ring.push(null);
    const result: {
        round: number;
        home: string;
        away: string;
    }[] = [];
    for (let r = 1; r < ring.length; r++) {
        for (let i = 0; i < ring.length / 2; i++) {
            const a = ring[i], b = ring[ring.length - 1 - i];
            if (a && b)
                result.push({ round: r, home: r % 2 ? a : b, away: r % 2 ? b : a });
        }
        ring.splice(1, 0, ring.pop()!);
    }
    return doubleRound ? [...result, ...result.map(m => ({ round: m.round + ring.length - 1, home: m.away, away: m.home }))] : result;
}
export function standings(data: LeagueBundle) {
    const rows = new Map(data.teams.map(t => [t.id, { id: t.id, name: t.name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, difference: 0, points: 0 }]));
    for (const m of data.matches.filter(m => m.status === "completed" && m.home_score !== null && m.away_score !== null)) {
        for (const side of ["home", "away"] as const) {
            const row = rows.get((side === "home" ? m.home_team_id : m.away_team_id) ?? "");
            if (!row)
                continue;
            const own = side === "home" ? m.home_score! : m.away_score!, other = side === "home" ? m.away_score! : m.home_score!;
            row.played++;
            row.goalsFor += own;
            row.goalsAgainst += other;
            row.difference = row.goalsFor - row.goalsAgainst;
            if (own > other) {
                row.won++;
                row.points += data.league.points_win;
            }
            else if (own === other) {
                row.drawn++;
                row.points += data.league.points_draw;
            }
            else {
                row.lost++;
                row.points += data.league.points_loss;
            }
        }
    }
    return [...rows.values()].sort((a, b) => b.points - a.points || b.difference - a.difference || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));
}
export function playerStandings(data: LeagueBundle) {
    const rows = new Map(data.players.map(p => [p.id, { id: p.id, name: p.name, played: 0, points: 0, goals: 0, assists: 0, yellow: 0, red: 0, rating: null as number | null, ratingSum: 0, rated: 0 }]));
    const matches = new Map(data.matches.filter(m => m.status === "completed").map(m => [m.id, m]));
    for (const s of data.stats) {
        const row = rows.get(s.player_id), m = matches.get(s.match_id);
        if (!row || !m || m.home_score === null || m.away_score === null)
            continue;
        const own = s.side === "home" ? m.home_score : m.away_score, other = s.side === "home" ? m.away_score : m.home_score;
        row.played++;
        row.points += own > other ? data.league.points_win : own === other ? data.league.points_draw : data.league.points_loss;
        row.goals += s.goals;
        row.assists += s.assists;
        row.yellow += s.yellow_cards;
        row.red += s.red_cards;
        if (s.rating !== null) {
            row.ratingSum += s.rating;
            row.rated++;
            row.rating = row.ratingSum / row.rated;
        }
    }
    return [...rows.values()].sort((a, b) => b.points - a.points || b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name));
}
/** Saved participation preserves the player's historical side after a transfer.
 * The server checks its own stored rows; this argument is only client validation.
 */
export function validateResult(match: Match, home: number, away: number, stats: MatchPlayer[], players: Player[], league: League, previousStats: MatchPlayer[] = []): string | null {
    if (![home, away].every(n => Number.isInteger(n) && n >= 0 && n <= 999))
        return "El marcador debe contener goles enteros entre 0 y 999.";
    const seen = new Set<string>();
    for (const s of stats) {
        const p = players.find(p => p.id === s.player_id);
        if (!p || seen.has(s.player_id) || !["home", "away"].includes(s.side))
            return "Revisá los participantes: cada jugador puede aparecer una sola vez.";
        if (s.match_id !== match.id || s.league_id !== league.id || p.league_id !== league.id)
            return "Los datos no pertenecen a esta liga o partido.";
        const historical = previousStats.find(old => old.match_id === match.id && old.league_id === league.id && old.player_id === p.id);
        if (league.mode === "teams" && (historical ? historical.side !== s.side : p.team_id !== (s.side === "home" ? match.home_team_id : match.away_team_id)))
            return "Un jugador no pertenece al equipo seleccionado.";
        if (![s.goals, s.assists, s.yellow_cards, s.red_cards].every(n => Number.isInteger(n) && n >= 0) || s.yellow_cards > 2 || s.red_cards > 1)
            return "Revisá goles, asistencias y tarjetas.";
        if (s.rating !== null && (!Number.isFinite(s.rating) || s.rating < 1 || s.rating > 10))
            return "La nota debe estar entre 1 y 10, o quedar vacía.";
        seen.add(s.player_id);
    }
    for (const side of ["home", "away"] as const) {
        const group = stats.filter(s => s.side === side), score = side === "home" ? home : away;
        if (group.reduce((n, s) => n + s.goals, 0) > score || group.reduce((n, s) => n + s.assists, 0) > score)
            return "Los goles o asistencias individuales superan el marcador del equipo.";
    }
    return null;
}
export function splitPlayers(players: Player[], balanced: boolean, ratings: Map<string, number>, random: () => number = Math.random) {
    const order = [...players];
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    if (balanced)
        order.sort((a, b) => (ratings.get(b.id) ?? 5) - (ratings.get(a.id) ?? 5));
    const home: Player[] = [], away: Player[] = [];
    let a = 0, b = 0;
    for (const p of order) {
        const homeFull = home.length >= Math.ceil(players.length / 2), awayFull = away.length >= Math.floor(players.length / 2);
        if (!homeFull && (awayFull || !balanced && home.length <= away.length || balanced && a <= b)) {
            home.push(p);
            a += ratings.get(p.id) ?? 5;
        }
        else {
            away.push(p);
            b += ratings.get(p.id) ?? 5;
        }
    }
    return { home, away };
}
export function matchLabel(m: Match, side: "home" | "away", data: LeagueBundle) {
    return data.teams.find(t => t.id === (side === "home" ? m.home_team_id : m.away_team_id))?.name ?? (side === "home" ? m.home_label : m.away_label);
}
