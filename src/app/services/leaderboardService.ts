import playerRepository from "../repositories/playerRepository";
import predictionRepository from "../repositories/predictionRepository";
import type { Player } from "../types/player";

export interface LeaderboardEntry {
  player: Player;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
  correctFTTS: number;
}

class LeaderboardService {
  getLeaderboard(): LeaderboardEntry[] {
    const players = playerRepository.getActivePlayers();
    const predictions = predictionRepository.getAll();
console.log("Leaderboard predictions:", predictions);

    const leaderboard: LeaderboardEntry[] = players.map((player) => {
      const playerPredictions = predictions.filter(
        (prediction) => prediction.playerId === player.id
      );

      return {
        player,
        totalPoints: playerPredictions.reduce(
          (sum, prediction) => sum + (prediction.points ?? 0),
          0
        ),
        exactScores: playerPredictions.filter(
          (prediction) => prediction.exactScore
        ).length,
        correctResults: playerPredictions.filter(
          (prediction) => prediction.correctResult
        ).length,
        correctFTTS: playerPredictions.filter(
          (prediction) => prediction.correctFTTS
        ).length,
      };
    });

    return leaderboard.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
  }
}

const leaderboardService = new LeaderboardService();

export default leaderboardService;

