"use client";

import { useEffect, useState } from "react";

import { useLeaderboard } from "../context/LeaderboardContext";

export default function LeaderboardPage() {
  const { leaderboard } = useLeaderboard();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";

    return `#${rank}`;
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-gray-400">
            Loading leaderboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">

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

                </tr>
              </thead>

              <tbody>

                {leaderboard.map((entry) => (
                  <tr
                    key={entry.player.id}
                    className="border-b border-zinc-700 hover:bg-zinc-800"
                  >

                    <td className="p-3 text-lg font-bold whitespace-nowrap">
                      {getMedal(entry.rank)}
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