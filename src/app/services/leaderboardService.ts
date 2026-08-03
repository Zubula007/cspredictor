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

    console.log("🏆 Building leaderboard");


    const players =
      playerRepository.getActivePlayers();


    console.log(
      "👥 Active players:",
      players
    );


    const predictions =
      predictionRepository.getAll();


    console.log(
      "📊 Stored predictions:",
      predictions
    );


    const leaderboard = players.map((player) => {


      const playerPredictions =
        predictions.filter(
          (prediction) =>
            prediction.playerId === player.id
        );


      console.log(
        "👤 Player:",
        player.displayName,
        "Predictions:",
        playerPredictions
      );


      console.table(
        playerPredictions.map((p) => ({
          fixture: p.fixtureId,
          prediction: `${p.homeScore}-${p.awayScore}`,
          points: p.points,
          correctResult: p.correctResult,
          exactScore: p.exactScore,
          correctFTTS: p.correctFTTS,
          scored: p.scored,
        }))
      );


      const correctResults =
        playerPredictions.filter(
          (prediction) =>
            prediction.correctResult
        ).length;


      const exactScores =
        playerPredictions.filter(
          (prediction) =>
            prediction.exactScore
        ).length;


      const correctFTTS =
        playerPredictions.filter(
          (prediction) =>
            prediction.correctFTTS
        ).length;


      const predictionPoints =
        playerPredictions.reduce(
          (sum, prediction) =>
            sum + (prediction.points ?? 0),
          0
        );


      console.log(
        "📈",
        player.displayName,
        "Points:",
        predictionPoints
      );


      return {

        rank: 0,

        player,

        totalPoints:
          predictionPoints,


        resultPoints:
          correctResults * 3,


        exactPoints:
          exactScores * 2,


        fttsPoints:
          correctFTTS,


        bonusPoints:
          0,


        correctResults,

        exactScores,

        correctFTTS,


        movement:
          "SAME" as const,

      };

    });



    /*
      Temporary Round Winner Bonus
      We will remove this after verification
    */

    const highestScore =
      Math.max(
        ...leaderboard.map(
          (entry) =>
            entry.totalPoints
        ),
        0
      );


    const winners =
      leaderboard.filter(
        (entry) =>
          entry.totalPoints === highestScore
      );


    if (
      highestScore > 0 &&
      winners.length === 1
    ) {

      winners[0].bonusPoints +=
        ROUND_WINNER_BONUS;


      winners[0].totalPoints +=
        ROUND_WINNER_BONUS;

    }



    const finalLeaderboard =
      leaderboard
        .sort(
          (a, b) =>
            b.totalPoints -
            a.totalPoints
        )
        .map(
          (entry, index) => ({
            ...entry,
            rank: index + 1,
          })
        );


    console.log(
      "🏆 Final leaderboard:",
      finalLeaderboard
    );


    return finalLeaderboard;

  }

}


const leaderboardService =
  new LeaderboardService();


export default leaderboardService;