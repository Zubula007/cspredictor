import type { CompetitionIds } from "../lib/enums";

export type CompetitionId =
  typeof CompetitionIds[keyof typeof CompetitionIds];

export interface Fixture {
  id: string;

  competitionId: CompetitionId;

  round: number;

  streak: number;

  matchDate: string;

  kickOff: string;

  displayDate: string;

  homeTeam: string;

  awayTeam: string;

  status:
    | "Scheduled"
    | "Postponed"
    | "Live"
    | "Completed"
    | "Cancelled";

  homeScore?: number;

  awayScore?: number;

  firstTeamToScore?: 
    | "Home"
    | "Away"
    | "None"
    | null;

  published: boolean;
}