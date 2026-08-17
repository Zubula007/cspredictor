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
  async getPredictions(): Promise<
    Prediction[]
  > {
    return predictionRepository.getAll();
  }

  async getPlayerPredictions(
    playerId: string
  ): Promise<Prediction[]> {
    return predictionRepository.getByPlayer(
      playerId
    );
  }

  async getFixturePredictions(
    fixtureId: string
  ): Promise<Prediction[]> {
    return predictionRepository.getByFixture(
      fixtureId
    );
  }

  async savePrediction(
    prediction: Prediction
  ): Promise<void> {
    await predictionRepository.save(
      prediction
    );
  }

  async savePlayerPrediction(
    playerId: string,
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore:
      Prediction["firstTeamToScore"]
  ): Promise<void> {
    await this.savePrediction({
      id: `${playerId}-${fixtureId}`,

      playerId,

      fixtureId,

      homeScore,

      awayScore,

      firstTeamToScore,

      submittedAt:
        new Date().toISOString(),

      status:
        PredictionStatus.SUBMITTED,

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
      predictedHomeScore:
        prediction.homeScore,

      predictedAwayScore:
        prediction.awayScore,

      predictedFirstTeamToScore:
        prediction.firstTeamToScore,

      officialHomeScore:
        fixture.homeScore ?? 0,

      officialAwayScore:
        fixture.awayScore ?? 0,

      officialFirstTeamToScore:
        fixture.firstTeamToScore!,
    });
  }

  async scoreFixture(
    fixture: Fixture
  ): Promise<ScoreFixtureSummary> {
    const predictions =
      await predictionRepository.getByFixture(
        fixture.id
      );

    let predictionsScored = 0;
    let highestScore = 0;
    let totalPoints = 0;

    for (const prediction of predictions) {
      const result =
        this.scorePrediction(
          prediction,
          fixture
        );

      await predictionRepository.updateScoredPrediction(
        prediction.id,
        result.points,
        result.correctResult,
        result.exactScore,
        result.correctFTTS
      );

      predictionsScored++;

      totalPoints += result.points;

      if (
        result.points >
        highestScore
      ) {
        highestScore =
          result.points;
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

const predictionService =
  new PredictionService();

export default predictionService;