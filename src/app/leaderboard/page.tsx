"use client";

import { useEffect, useState } from "react";
import leaderboardService, {
  type LeaderboardEntry,
} from "../services/leaderboardService";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);

  useEffect(() => {
    setLeaderboard(
      leaderboardService.getLeaderboard()
    );
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-3xl rounded-xl border border-yellow-500 bg-zinc-900 p-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          🏆 Leaderboard
        </h1>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-yellow-500 text-yellow-400">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Player</th>
              <th className="p-3 text-center">Points</th>
              <th className="p-3 text-center">Results</th>
              <th className="p-3 text-center">Exact Score</th>
              <th className="p-3 text-center">FTTS</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.player.id}
                className="border-b border-zinc-700 hover:bg-zinc-800"
              >
                <td className="p-3 font-bold">
                  {index + 1}
                </td>

                <td className="p-3">
                  {entry.player.displayName}
                </td>

                <td className="p-3 text-center font-bold text-yellow-400">
                  {entry.totalPoints}
                </td>

                <td className="p-3 text-center">
                  {entry.correctResults}
                </td>

                <td className="p-3 text-center">
                  {entry.exactScores}
                </td>

                <td className="p-3 text-center">
                  {entry.correctFTTS}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="py-8 text-center text-zinc-400">
            No leaderboard data available yet.
          </div>
        )}
      </div>
    </main>
  );
}