import bonusRepository from "../repositories/bonusRepository";
import predictionRepository from "../repositories/predictionRepository";
import fixtureRepository from "../repositories/fixtureRepository";

class BonusService {
  async recalculateRound(
    round: number
  ): Promise<void> {
    // Remove any existing bonus for this round
    bonusRepository.removeRoundBonus(round);

    // Get all fixtures in this round
    const fixtures =
      await fixtureRepository.getByRound(
        round
      );

    // Only continue if every fixture has been published
    const allPublished =
      fixtures.length > 0 &&
      fixtures.every(
        (fixture) =>
          fixture.published
      );

    if (!allPublished) {
      return;
    }

    // Calculate each player's points for this round
    const totals =
      new Map<string, number>();

    for (const fixture of fixtures) {
      const predictions =
        await predictionRepository.getByFixture(
          fixture.id
        );

      for (const prediction of predictions) {
        const current =
          totals.get(
            prediction.playerId
          ) ?? 0;

        totals.set(
          prediction.playerId,
          current +
            (prediction.points ?? 0)
        );
      }
    }

    if (totals.size === 0) {
      return;
    }

    // Highest round score
    const highestScore =
      Math.max(
        ...Array.from(
          totals.values()
        )
      );

    // Players sharing highest score
    const winners =
      Array.from(
        totals.entries()
      ).filter(
        ([, points]) =>
          points ===
          highestScore
      );

    // No bonus if tied
    if (winners.length !== 1) {
      return;
    }

    const winner = winners[0];

    bonusRepository.save({
      id: `ROUND-${round}`,

      playerId:
        winner[0],

      type: "ROUND",

      round,

      points: 1,
    });

    console.log(
      `🏆 Round ${round} winner: ${winner[0]} (+1)`
    );
  }
}

const bonusService =
  new BonusService();

export default bonusService;