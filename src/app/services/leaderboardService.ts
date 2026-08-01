import playerRepository from "../repositories/playerRepository";
import predictionRepository from "../repositories/predictionRepository";

import type { Player } from "../types/player";

const ROUND_WINNER_BONUS = 1;

export interface LeaderboardEntry {
  rank: number;
  player: Player;

  totalPoints: number;

  resultPoints: number;
  exactPoints: number;
  fttsPoints: number;
  bonusPoints: number;

  correctResults: number;
  exactScores: number;
  correctFTTS: number;

  movement: "UP" | "DOWN" | "SAME";
}

class LeaderboardService {
  getLeaderboard(): LeaderboardEntry[] {
    const players = playerRepository.getActivePlayers();
    const predictions = predictionRepository.getAll();

    const leaderboard = players.map((player) => {
      const playerPredictions = predictions.filter(
        (prediction) => prediction.playerId === player.id
      );

      const correctResults = playerPredictions.filter(
        (prediction) => prediction.correctResult
      ).length;

      const exactScores = playerPredictions.filter(
        (prediction) => prediction.exactScore
      ).length;

      const correctFTTS = playerPredictions.filter(
        (prediction) => prediction.correctFTTS
      ).length;

      const predictionPoints = playerPredictions.reduce(
        (sum, prediction) => sum + (prediction.points ?? 0),
        0
      );

      return {
        rank: 0,

        player,

        totalPoints: predictionPoints,

        resultPoints: correctResults * 3,

        exactPoints: exactScores * 2,

        fttsPoints: correctFTTS,

        bonusPoints: 0,

        correctResults,

        exactScores,

        correctFTTS,

        movement: "SAME" as const,
      };
    });

    // Find the highest score
    const highestScore = Math.max(
      ...leaderboard.map((entry) => entry.totalPoints),
      0
    );

    // Players sharing the highest score
    const winners = leaderboard.filter(
      (entry) => entry.totalPoints === highestScore
    );

    // Award bonus only if there is a unique winner
    if (highestScore > 0 && winners.length === 1) {
      winners[0].bonusPoints += ROUND_WINNER_BONUS;
      winners[0].totalPoints += ROUND_WINNER_BONUS;
    }

    return leaderboard
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }
}

const leaderboardService = new LeaderboardService();

export default leaderboardService;