import type {
  CompetitionId,
  FixtureStatusType,
  FirstTeamToScoreType,
} from "../lib/enums";

export interface Fixture {
  id: string;

  competitionId: CompetitionId;

  round: number;

  streak: number;

  /**
   * ISO date used by the application.
   * Example: 2026-08-01
   */
  matchDate: string;

  /**
   * Friendly date shown to players.
   * Example: Saturday, 1 August 2026
   */
  displayDate: string;

  /**
   * 24-hour kick-off time.
   * Example: 18:00
   */
  kickOff: string;

  homeTeam: string;

  awayTeam: string;

  homeBadge?: string;

  awayBadge?: string;

  status: FixtureStatusType;

  homeScore?: number;

  awayScore?: number;

  firstTeamToScore?: FirstTeamToScoreType;

  predictionDeadline?: string;

  published: boolean;
}