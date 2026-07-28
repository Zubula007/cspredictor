import predictionRepository from "../repositories/predictionRepository";

import { scorePrediction } from "../lib/scoringEngine";

import type { Prediction } from "../types/prediction";
import type { Fixture } from "../types/fixture";

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

  scorePrediction(
    prediction: Prediction,
    fixture: Fixture
  ) {
    return scorePrediction({
      predictedHomeScore: prediction.homeScore,
      predictedAwayScore: prediction.awayScore,
      predictedFirstTeamToScore: prediction.firstTeamToScore,

      officialHomeScore: fixture.homeScore ?? 0,
      officialAwayScore: fixture.awayScore ?? 0,
      officialFirstTeamToScore:
        fixture.firstTeamToScore!,
    });
  }
}

const predictionService = new PredictionService();

export default predictionService;