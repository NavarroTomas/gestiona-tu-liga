import { platformClient } from "./client";
import { slugify, validateDraft } from "./domain";
import type { League, LeagueBundle, LeagueDraft, Match, MatchPlayer } from "./types";
const columns = "id,slug,name,description,purpose,mode,expected_participants,format,primary_color,secondary_color,logo_url,points_win,points_draw,points_loss,is_public,created_at";
export async function myLeagues(): Promise<League[]> {
    const { data: { user }, error: authError } = await platformClient().auth.getUser();
    if (authError)
        throw authError;
    if (!user)
        return [];
    const { data, error } = await platformClient().from("league_members").select(`league:leagues(${columns})`).eq("user_id", user.id);
    if (error)
        throw error;
    return (data ?? []).flatMap(row => Array.isArray(row.league) ? row.league : row.league ? [row.league] : []) as League[];
}
export async function createLeague(d: LeagueDraft): Promise<{
    id: string;
    slug: string;
}> {
    const issue = validateDraft(d);
    if (issue)
        throw new Error(issue);
    const { data, error } = await platformClient().rpc("create_league", { p_request_id: d.requestId, p_name: d.name.trim(), p_slug: slugify(d.name), p_mode: d.mode, p_purpose: d.purpose, p_description: d.description.trim(), p_expected: d.expectedParticipants, p_format: d.format, p_primary: d.primaryColor, p_secondary: d.secondaryColor });
    if (error)
        throw error;
    if (!data?.id || !data?.slug)
        throw new Error("La liga no devolvió una confirmación válida. Podés reintentar sin duplicarla.");
    return data;
}
export async function loadLeague(idOrSlug: string, bySlug = false): Promise<LeagueBundle> {
    const db = platformClient();
    const { data: league, error } = await db.from("leagues").select(columns).eq(bySlug ? "slug" : "id", idOrSlug).maybeSingle();
    if (error)
        throw error;
    if (!league)
        throw new Error("No encontramos esa liga o no está disponible.");
    const names = ["teams", "players", "matches", "match_players", "news", "seasons", "divisions", "competitions"] as const;
    const results = await Promise.all(names.map(name => db.from(name).select("*").eq("league_id", league.id).order(name === "match_players" ? "player_id" : "created_at", { ascending: true })));
    for (const result of results)
        if (result.error)
            throw result.error;
    return { league, teams: results[0].data ?? [], players: results[1].data ?? [], matches: results[2].data ?? [], stats: results[3].data ?? [], news: results[4].data ?? [], seasons: results[5].data ?? [], divisions: results[6].data ?? [], competitions: results[7].data ?? [] } as LeagueBundle;
}
export async function canManage(leagueId: string): Promise<boolean> {
    const { data: { user } } = await platformClient().auth.getUser();
    if (!user)
        return false;
    const { data, error } = await platformClient().from("league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).maybeSingle();
    if (error)
        throw error;
    return !!data;
}
export async function saveEntity(table: "teams" | "players" | "matches" | "news", value: Record<string, unknown>, operation: "create" | "update" = "create") {
    // Editing must never recreate a row deleted by another administrator.
    const { id, league_id, ...changes } = value;
    if (operation === "update" && (typeof id !== "string" || typeof league_id !== "string"))
        throw new Error("Falta identificar el registro y su liga.");
    const query = operation === "update"
        ? platformClient().from(table).update(changes).eq("id", id).eq("league_id", league_id)
        : platformClient().from(table).insert(value);
    const { error } = await query.select("id").single();
    if (error)
        throw error;
}
export async function removeEntity(table: "teams" | "players" | "matches" | "news", id: string, leagueId: string) {
    // RLS can hide rows without returning a permission error. Require a readback
    // so a missing or inaccessible row is never displayed as successfully deleted.
    const { error } = await platformClient().from(table).delete().eq("id", id).eq("league_id", leagueId).select("id").single();
    if (error)
        throw error;
}
export async function updateMatchSchedule(matchId: string, leagueId: string, changes: Pick<Match, "starts_at" | "venue" | "round" | "home_label" | "away_label">) {
    const { error } = await platformClient().from("matches").update(changes).eq("id", matchId).eq("league_id", leagueId).select("id").single();
    if (error) throw error;
}
export async function saveResult(matchId: string, home: number | null, away: number | null, stats: MatchPlayer[]) {
    const { error } = await platformClient().rpc("save_match_result", { p_match_id: matchId, p_home: home, p_away: away, p_players: stats.map(({ player_id, side, goals, assists, yellow_cards, red_cards, rating }) => ({ player_id, side, goals, assists, yellow_cards, red_cards, rating })) });
    if (error)
        throw error;
}
export async function generateFixture(leagueId: string) {
    const { error } = await platformClient().rpc("generate_league_fixture", { p_league_id: leagueId });
    if (error)
        throw error;
}
export async function uploadImage(leagueId: string, file: File): Promise<string> {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("Usá una imagen JPG, PNG o WebP.");
    if (file.size > 2 * 1024 * 1024)
        throw new Error("La imagen puede pesar hasta 2 MB.");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${leagueId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await platformClient().storage.from("league-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error)
        throw error;
    return platformClient().storage.from("league-images").getPublicUrl(path).data.publicUrl;
}
