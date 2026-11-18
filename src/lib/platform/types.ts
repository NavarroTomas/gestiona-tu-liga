export type LeagueMode = "teams" | "players";
export type LeagueFormat = "round_robin" | "double_round_robin" | "friendly";
export type LeaguePurpose = "amateur" | "friends" | "school" | "other";
export type League = {
    id: string;
    slug: string;
    name: string;
    description: string;
    purpose: LeaguePurpose;
    mode: LeagueMode;
    expected_participants: number;
    format: LeagueFormat;
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    points_win: number;
    points_draw: number;
    points_loss: number;
    is_public: boolean;
    created_at: string;
};
export type Team = {
    id: string;
    league_id: string;
    name: string;
    short_name: string;
    logo_url: string | null;
    created_at: string;
};
export type Player = {
    id: string;
    league_id: string;
    team_id: string | null;
    name: string;
    position: string;
    photo_url: string | null;
    created_at: string;
};
export type Match = {
    id: string;
    league_id: string;
    competition_id: string;
    round: number;
    home_team_id: string | null;
    away_team_id: string | null;
    home_label: string;
    away_label: string;
    starts_at: string | null;
    venue: string;
    status: "scheduled" | "completed";
    home_score: number | null;
    away_score: number | null;
    created_at: string;
};
export type MatchPlayer = {
    match_id: string;
    league_id: string;
    player_id: string;
    side: "home" | "away";
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    rating: number | null;
};
export type News = {
    id: string;
    league_id: string;
    title: string;
    body: string;
    image_url: string | null;
    published: boolean;
    created_at: string;
};
export type Season = {
    id: string;
    league_id: string;
    name: string;
    is_active: boolean;
};
export type Division = {
    id: string;
    league_id: string;
    season_id: string;
    name: string;
};
export type Competition = {
    id: string;
    league_id: string;
    season_id: string;
    division_id: string;
    name: string;
    format: LeagueFormat;
};
export type LeagueBundle = {
    league: League;
    teams: Team[];
    players: Player[];
    matches: Match[];
    stats: MatchPlayer[];
    news: News[];
    seasons: Season[];
    divisions: Division[];
    competitions: Competition[];
};
export type LeagueDraft = {
    version: 1;
    requestId: string;
    purpose: LeaguePurpose;
    mode: LeagueMode;
    name: string;
    description: string;
    expectedParticipants: number;
    format: LeagueFormat;
    primaryColor: string;
    secondaryColor: string;
};
