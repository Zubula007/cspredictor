import type {
  FirstTeamToScoreType,
  PredictionStatusType,
} from "../lib/enums";

interface Prediction {
  id: string;

  playerId: string;

  fixtureId: string;

  homeScore: number;

  awayScore: number;

  firstTeamToScore: FirstTeamToScoreType;

  submittedAt: string;

  status: PredictionStatusType;

  locked: boolean;

  points?: number;

  exactScore?: boolean;

  correctResult?: boolean;

  correctFTTS?: boolean;

  scored?: boolean;
}

export default Prediction;
export type { Prediction };