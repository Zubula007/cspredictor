import predictionRepository from "../repositories/predictionRepository";

import { scorePrediction } from "../lib/scoringEngine";
import { PredictionStatus } from "../lib/enums";

import type { Prediction } from "../types/prediction";
import type { Fixture } from "../types/fixture";

export type ScoreFixtureSummary = {
  predictionsScored: number;
  highestScore: number;
  averageScore: number;
};

class PredictionService {
  getPredictions(): Prediction[] {
    return predictionRepository.getAll();
  }

  getPlayerPredictions(playerId: string): Prediction[] {
    return predictionRepository.getByPlayer(playerId);
  }

  getFixturePredictions(fixtureId: string): Prediction[] {
    return predictionRepository.getByFixture(fixtureId);
  }

  savePrediction(prediction: Prediction): void {
    predictionRepository.save(prediction);
  }

  savePlayerPrediction(
    playerId: string,
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: Prediction["firstTeamToScore"]
  ): void {
    this.savePrediction({
      id: `${playerId}-${fixtureId}`,

      playerId,

      fixtureId,

      homeScore,

      awayScore,

      firstTeamToScore,

      submittedAt: new Date().toISOString(),

      status: PredictionStatus.SUBMITTED,

      locked: false,

      points: 0,

      exactScore: false,

      correctResult: false,

      correctFTTS: false,

      scored: false,
    });
  }

  scorePrediction(
    prediction: Prediction,
    fixture: Fixture
  ) {
    return scorePrediction({
      predictedHomeScore: prediction.homeScore,

      predictedAwayScore: prediction.awayScore,

      predictedFirstTeamToScore:
        prediction.firstTeamToScore,

      officialHomeScore: fixture.homeScore ?? 0,

      officialAwayScore: fixture.awayScore ?? 0,

      officialFirstTeamToScore:
        fixture.firstTeamToScore!,
    });
  }

  scoreFixture(
    fixture: Fixture
  ): ScoreFixtureSummary {

    const predictions =
      predictionRepository.getByFixture(fixture.id);

    let predictionsScored = 0;
    let highestScore = 0;
    let totalPoints = 0;

    for (const prediction of predictions) {

      const result = this.scorePrediction(
        prediction,
        fixture
      );

      predictionRepository.updateScoredPrediction(
        prediction.id,
        result.points,
        result.correctResult,
        result.exactScore,
        result.correctFTTS
      );

      predictionsScored++;

      totalPoints += result.points;

      if (result.points > highestScore) {
        highestScore = result.points;
      }
    }

    return {
      predictionsScored,

      highestScore,

      averageScore:
        predictionsScored === 0
          ? 0
          : Number(
              (
                totalPoints /
                predictionsScored
              ).toFixed(2)
            ),
    };
  }
}

const predictionService = new PredictionService();

export default predictionService;