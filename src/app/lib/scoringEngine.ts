import type { FirstTeamToScoreType } from "./enums";

export type ScorePredictionInput = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedFirstTeamToScore: FirstTeamToScoreType;

  officialHomeScore: number;
  officialAwayScore: number;
  officialFirstTeamToScore: FirstTeamToScoreType;
};

export type ScorePredictionResult = {
  points: number;

  correctResult: boolean;
  exactScore: boolean;
  correctFTTS: boolean;
};

function getMatchOutcome(
  homeScore: number,
  awayScore: number
): "HOME" | "DRAW" | "AWAY" {
  if (homeScore > awayScore) {
    return "HOME";
  }

  if (awayScore > homeScore) {
    return "AWAY";
  }

  return "DRAW";
}

export function scorePrediction(
  prediction: ScorePredictionInput
): ScorePredictionResult {
  let points = 0;

  const officialOutcome = getMatchOutcome(
    prediction.officialHomeScore,
    prediction.officialAwayScore
  );

  const predictedOutcome = getMatchOutcome(
    prediction.predictedHomeScore,
    prediction.predictedAwayScore
  );

  const correctResult =
    officialOutcome === predictedOutcome;

  if (correctResult) {
    points += 3;
  }

  const exactScore =
    prediction.predictedHomeScore === prediction.officialHomeScore &&
    prediction.predictedAwayScore === prediction.officialAwayScore;

  if (exactScore) {
    points += 2;
  }

  const correctFTTS =
    correctResult &&
    prediction.predictedFirstTeamToScore ===
      prediction.officialFirstTeamToScore;

  if (correctFTTS) {
    points += 1;
  }

  return {
    points,
    correctResult,
    exactScore,
    correctFTTS,
  };
}