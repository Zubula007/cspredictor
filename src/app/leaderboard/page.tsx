"use client";

import { useEffect, useState } from "react";

import competitionService from "../services/competitionService";
import { useLeaderboard } from "../context/LeaderboardContext";

export default function LeaderboardPage() {
  const { leaderboard } = useLeaderboard();

  const activeCompetition =
    competitionService.getActiveCompetition();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRank = (rank: number) => {
    return `#${rank}`;
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center text-gray-400">
            Loading leaderboard...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-6 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
          🏆 CSPredictor Championship Table
        </h1>

        {leaderboard.length === 0 ? (
          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center text-gray-400">
            No leaderboard data available yet.
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

                {leaderboard.map((entry) => (
                  <tr
                    key={entry.player.id}
                    className="border-b border-zinc-700 hover:bg-zinc-800"
                  >

                    <td className="p-3 text-lg font-bold whitespace-nowrap">
                      {getRank(entry.rank)}
                    </td>

                    <td className="p-3 font-semibold whitespace-nowrap">
                      {entry.player.displayName}
                    </td>

                    <td className="p-3 text-center text-lg font-bold text-yellow-400">
                      {entry.totalPoints}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {entry.resultPoints}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {entry.exactPoints}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {entry.fttsPoints}
                    </td>

                    {activeCompetition.monthlyWinnerEnabled && (
                      <td className="p-3 text-center whitespace-nowrap">
                        {entry.bonusPoints}
                      </td>
                    )}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </main>
  );
}