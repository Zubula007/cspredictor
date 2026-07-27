import predictionRepository from "../repositories/predictionRepository";
import type { Prediction } from "../types/prediction";

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
}

const predictionService = new PredictionService();

export default predictionService;