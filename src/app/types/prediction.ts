import type { FirstTeamToScoreType } from "../lib/enums";

export interface Prediction {
  id: string;

  playerId: string;

  fixtureId: string;

  homeScore: number;

  awayScore: number;

  firstTeamToScore: FirstTeamToScoreType;

  submittedAt: string;

  locked: boolean;

  points?: number;

  exactScore?: boolean;

  correctResult?: boolean;

  correctFTTS?: boolean;
}