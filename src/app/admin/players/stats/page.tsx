"use client";

import { useEffect, useState } from "react";

import leaderboardService from "../../../services/leaderboardService";
import type { LeaderboardEntry } from "../../../services/leaderboardService";

export default function PlayerStatsPage() {
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data =
          await leaderboardService.getLeaderboard();

        setLeaderboard(data);
      } catch (error) {
        console.error(
          "Failed to load player statistics:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        <div className="text-center">

          <h1 className="text-5xl font-extrabold text-yellow-400">
            📊 Player Statistics
          </h1>

          <p className="mt-3 text-gray-400">
            CSPredictor performance overview
          </p>

        </div>

        {loading ? (

          <div className="mt-10 rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">
            <p className="text-gray-400">
              Loading player statistics...
            </p>
          </div>

        ) : leaderboard.length === 0 ? (

          <div className="mt-10 rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">
            <p className="text-gray-400">
              No player statistics available.
            </p>
          </div>

        ) : (

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {leaderboard.map((entry) => (

              <div
                key={entry.player.id}
                className="rounded-3xl border border-yellow-500 bg-zinc-900 p-6 shadow-xl"
              >

                <div className="flex items-center justify-between">

                  <h2 className="text-2xl font-bold text-yellow-400">
                    👤 {entry.player.displayName}
                  </h2>

                  <span className="rounded-full bg-yellow-400 px-4 py-2 font-bold text-black">
                    #{entry.rank}
                  </span>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">

                  <div className="rounded-xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Total Points
                    </p>

                    <p className="text-3xl font-bold text-yellow-400">
                      {entry.totalPoints}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Correct Results
                    </p>

                    <p className="text-3xl font-bold">
                      {entry.correctResults}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Exact Scores
                    </p>

                    <p className="text-3xl font-bold">
                      {entry.exactScores}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black p-4">
                    <p className="text-sm text-gray-400">
                      Correct FTTS
                    </p>

                    <p className="text-3xl font-bold">
                      {entry.correctFTTS}
                    </p>
                  </div>

                </div>

                <div className="mt-6 border-t border-zinc-700 pt-4">

                  <p className="text-sm text-gray-400">
                    Points Breakdown
                  </p>

                  <div className="mt-3 space-y-2">

                    <p>
                      🎯 Result Points:
                      <span className="ml-2 font-bold">
                        {entry.resultPoints}
                      </span>
                    </p>

                    <p>
                      ⚽ Exact Score Points:
                      <span className="ml-2 font-bold">
                        {entry.exactPoints}
                      </span>
                    </p>

                    <p>
                      🚩 FTTS Points:
                      <span className="ml-2 font-bold">
                        {entry.fttsPoints}
                      </span>
                    </p>

                    <p>
                      🏆 Bonus Points:
                      <span className="ml-2 font-bold">
                        {entry.bonusPoints}
                      </span>
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}