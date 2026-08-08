"use client";

import { useEffect, useState } from "react";

import { useLeaderboard } from "../context/LeaderboardContext";
import { useCompetition } from "../context/CompetitionContext";

export default function LeaderboardPage() {
  const {
    leaderboard,
    setCompetitionId,
  } = useLeaderboard();

  const { activeCompetition } =
    useCompetition();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeCompetition?.id) {
      return;
    }

    setCompetitionId(
      activeCompetition.id
    );
  }, [
    activeCompetition?.id,
    setCompetitionId,
  ]);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";

    return `#${rank}`;
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">
            <p className="text-yellow-400">
              Loading leaderboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-center gap-3">

          <img
            src={activeCompetition.logo}
            alt={activeCompetition.name}
            className="h-12 w-12 object-contain"
          />

          <h1 className="text-center text-2xl font-bold text-yellow-400 md:text-3xl">
            🏆 {activeCompetition.name} Championship Table
          </h1>

        </div>

        {leaderboard.length === 0 ? (

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center text-gray-400">
            No leaderboard data available for{" "}
            {activeCompetition.name} yet.
          </div>

        ) : (

          <div className="overflow-x-auto rounded-2xl border border-yellow-500 bg-zinc-900 shadow-lg">

            <table className="min-w-full border-collapse">

              <thead>

                <tr className="border-b border-yellow-500 bg-black text-yellow-400">

                  <th className="p-3 text-left text-sm">
                    Rank
                  </th>

                  <th className="p-3 text-left text-sm">
                    Player
                  </th>

                  <th className="p-3 text-center text-sm">
                    Total
                  </th>

                  <th className="p-3 text-center text-sm">
                    Result
                  </th>

                  <th className="p-3 text-center text-sm">
                    Exact
                  </th>

                  <th className="p-3 text-center text-sm">
                    FTTS
                  </th>

                  {activeCompetition.monthlyWinnerEnabled && (
                    <th className="p-3 text-center text-sm">
                      Bonus
                    </th>
                  )}

                </tr>

              </thead>

              <tbody>

                {leaderboard.map(
                  (entry) => (

                    <tr
                      key={entry.player.id}
                      className="border-b border-zinc-700 hover:bg-zinc-800"
                    >

                      <td className="whitespace-nowrap p-3 text-lg font-bold">
                        {getMedal(entry.rank)}
                      </td>

                      <td className="whitespace-nowrap p-3 font-semibold">
                        {entry.player.displayName}
                      </td>

                      <td className="p-3 text-center text-lg font-bold text-yellow-400">
                        {entry.totalPoints}
                      </td>

                      <td className="whitespace-nowrap p-3 text-center">
                        {entry.resultPoints}
                      </td>

                      <td className="whitespace-nowrap p-3 text-center">
                        {entry.exactPoints}
                      </td>

                      <td className="whitespace-nowrap p-3 text-center">
                        {entry.fttsPoints}
                      </td>

                      {activeCompetition.monthlyWinnerEnabled && (
                        <td className="whitespace-nowrap p-3 text-center">
                          {entry.bonusPoints}
                        </td>
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
}