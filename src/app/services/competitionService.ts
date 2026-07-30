import type { Fixture } from "../types/fixture";
import type { Prediction } from "../types/prediction";

class CompetitionService {
  calculatePrediction(
    prediction: Prediction,
    fixture: Fixture
  ): Prediction {
    let points = 0;

    let correctResult = false;
    let exactScore = false;
    let correctFTTS = false;

    const predictedDifference =
      prediction.homeScore - prediction.awayScore;

    const actualDifference =
      (fixture.homeScore ?? 0) - (fixture.awayScore ?? 0);

    if (
      (predictedDifference > 0 && actualDifference > 0) ||
      (predictedDifference < 0 && actualDifference < 0) ||
      (predictedDifference === 0 && actualDifference === 0)
    ) {
      correctResult = true;
      points += 3;
    }

    if (
      prediction.homeScore === fixture.homeScore &&
      prediction.awayScore === fixture.awayScore
    ) {
      exactScore = true;
      points += 2;
    }

    if (
      prediction.firstTeamToScore === fixture.firstTeamToScore
    ) {
      correctFTTS = true;
      points += 1;
    }

    return {
      ...prediction,
      points,
      correctResult,
      exactScore,
      correctFTTS,
    };
  }

  calculateFixturePredictions(
    predictions: Prediction[],
    fixture: Fixture
  ): Prediction[] {
    return predictions.map((prediction) =>
      this.calculatePrediction(prediction, fixture)
    );
  }
}

const competitionService = new CompetitionService();

export default competitionService;