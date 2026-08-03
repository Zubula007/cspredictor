import type { Prediction } from "../types/prediction";

const STORAGE_KEY = "csp-predictions";

class PredictionRepository {
  private getStoredPredictions(): Prediction[] {
    if (typeof window === "undefined") {
      return [];
    }

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveStoredPredictions(
    predictions: Prediction[]
  ): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(predictions)
    );
  }

  getAll(): Prediction[] {
    return this.getStoredPredictions();
  }

  getByPlayer(playerId: string): Prediction[] {
    return this.getAll().filter(
      (prediction) =>
        prediction.playerId === playerId
    );
  }

  getByFixture(fixtureId: string): Prediction[] {
    return this.getAll().filter(
      (prediction) =>
        prediction.fixtureId === fixtureId
    );
  }

  save(prediction: Prediction): void {
  const predictions =
    this.getStoredPredictions();

  console.log("=================================");
  console.log("Saving:", prediction.id);

  console.log(
    "Existing IDs:",
    predictions.map((p) => p.id)
  );

  const existingIndex =
    predictions.findIndex(
      (item) =>
        item.id === prediction.id
    );

  console.log("Found index:", existingIndex);

  if (existingIndex >= 0) {
    predictions[existingIndex] =
      prediction;

    console.log("UPDATED");
  } else {
    predictions.push(prediction);

    console.log("CREATED");
  }

  this.saveStoredPredictions(
    predictions
  );
}

  updateScoredPrediction(
    predictionId: string,
    points: number,
    correctResult: boolean,
    exactScore: boolean,
    correctFTTS: boolean
  ): Prediction | undefined {
    const predictions =
      this.getStoredPredictions();

    const prediction =
      predictions.find(
        (item) =>
          item.id === predictionId
      );

    if (!prediction) {
      return undefined;
    }

    prediction.points = points;
    prediction.correctResult =
      correctResult;
    prediction.exactScore =
      exactScore;
    prediction.correctFTTS =
      correctFTTS;
    prediction.scored = true;

    this.saveStoredPredictions(
      predictions
    );

    return prediction;
  }
}

const predictionRepository =
  new PredictionRepository();

export default predictionRepository;


