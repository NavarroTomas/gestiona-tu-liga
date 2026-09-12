import type { FixtureMatch } from "@/lib/fixture";
import type { LeagueStanding } from "@/lib/league/types";

export type ClubRecord = {
  club_id?: string | null;
  nombre: string;
  slug?: string | null;
  logo_url?: string | null;
  division?: string | null;
  temporada?: string | null;
  activo?: boolean | null;
  color_principal?: string | null;
};

export type ClubPlayerRow = {
  playerId?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  division?: string | null;
  temporada?: string | null;
};

export type ClubStanding = LeagueStanding & {
  slug?: string | null;
  division?: string | null;
  color_principal?: string | null;
};

export type ClubsSummary = {
  clubs: number;
  players: number;
  matches: number;
  goals: number;
};

export type ClubsViewModel = {
  standings: ClubStanding[];
  leader: ClubStanding | null;
  nextLeaderMatch: FixtureMatch | null;
  summary: ClubsSummary;
};
