export function calculatePredictionPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
) {
  let points = 0;

  const predictedResult =
    predictedHome > predictedAway
      ? "home"
      : predictedHome < predictedAway
      ? "away"
      : "draw";

  const actualResult =
    actualHome > actualAway
      ? "home"
      : actualHome < actualAway
      ? "away"
      : "draw";

  if (predictedResult === actualResult) {
    points += 3;
  }

  if (
    predictedHome === actualHome &&
    predictedAway === actualAway
  ) {
    points += 2;
  }

  return points;
}