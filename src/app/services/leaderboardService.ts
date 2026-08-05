import playerRepository from "../repositories/playerRepository";
import predictionRepository from "../repositories/predictionRepository";
import bonusRepository from "../repositories/bonusRepository";
import fixtureRepository from "../repositories/fixtureRepository";

import type { Player } from "../types/player";

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
  getLeaderboard(
    competitionId?: string
  ): LeaderboardEntry[] {
    console.log("🏆 Building leaderboard");

    const players =
      playerRepository.getActivePlayers();

    let predictions =
      predictionRepository.getAll();

    const fixtures =
      fixtureRepository.getAll();

    /*
      Filter predictions by active competition
    */

    if (competitionId) {
      const competitionFixtureIds =
        fixtures
          .filter(
            (fixture) =>
              fixture.competitionId === competitionId
          )
          .map(
            (fixture) =>
              fixture.id
          );

      predictions =
        predictions.filter(
          (prediction) =>
            competitionFixtureIds.includes(
              prediction.fixtureId
            )
        );
    }

    /*
      Cup competitions do not use bonuses

      BET = Betway Premiership
      MTN = MTN8
      NED = Nedbank Cup
      CAR = Carling Knockout
    */

    const isCupCompetition =
      competitionId &&
      competitionId !== "BET";

    const bonuses =
      bonusRepository.getAll();

    const leaderboard =
      players.map((player) => {
        const playerPredictions =
          predictions.filter(
            (prediction) =>
              prediction.playerId === player.id
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

        const bonusPoints =
          isCupCompetition
            ? 0
            : bonuses
                .filter(
                  (bonus) =>
                    bonus.playerId === player.id
                )
                .reduce(
                  (sum, bonus) =>
                    sum + bonus.points,
                  0
                );

        return {
          rank: 0,

          player,

          totalPoints:
            predictionPoints +
            bonusPoints,

          resultPoints:
            correctResults * 3,

          exactPoints:
            exactScores * 2,

          fttsPoints:
            correctFTTS,

          bonusPoints,

          correctResults,

          exactScores,

          correctFTTS,

          movement:
            "SAME" as const,
        };
      });

    const finalLeaderboard =
      leaderboard
        .sort((a, b) => {
          // 1. Total Points
          if (
            b.totalPoints !==
            a.totalPoints
          ) {
            return (
              b.totalPoints -
              a.totalPoints
            );
          }

          // 2. Exact Score Points
          if (
            b.exactPoints !==
            a.exactPoints
          ) {
            return (
              b.exactPoints -
              a.exactPoints
            );
          }

          // 3. FTTS Bonus Points
          if (
            b.fttsPoints !==
            a.fttsPoints
          ) {
            return (
              b.fttsPoints -
              a.fttsPoints
            );
          }

          // 4. Bonus Points
          if (
            b.bonusPoints !==
            a.bonusPoints
          ) {
            return (
              b.bonusPoints -
              a.bonusPoints
            );
          }

          // 5. Alphabetical
          return a.player.displayName.localeCompare(
            b.player.displayName
          );
        })
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