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

  matchDate: string;

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