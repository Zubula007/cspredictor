import predictions from "../data/predictions";
import type { Prediction } from "../types/prediction";

class PredictionRepository {
  getAll(): Prediction[] {
    return predictions;
  }

  getByPlayer(playerId: string): Prediction[] {
    return predictions.filter(
      (prediction) => prediction.playerId === playerId
    );
  }

  getByFixture(fixtureId: string): Prediction[] {
    return predictions.filter(
      (prediction) => prediction.fixtureId === fixtureId
    );
  }

  save(prediction: Prediction): void {
    predictions.push(prediction);
  }
}

const predictionRepository = new PredictionRepository();

export default predictionRepository;