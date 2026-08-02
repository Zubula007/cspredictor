"use client";

import { useLeaderboard } from "../context/LeaderboardContext";

export default function LeaderboardPage() {
  const { leaderboard } = useLeaderboard();

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";

    return rank;
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl rounded-xl border border-yellow-500 bg-zinc-900 p-6">

        <h1 className="mb-8 text-center text-3xl font-bold text-yellow-400">
          🏆 CSPredictor Championship Table
        </h1>

        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b border-yellow-500 text-yellow-400">
              <th className="p-3 text-left">Rank</th>

              <th className="p-3 text-left">Player</th>

              <th className="p-3 text-center">
                Total Points
              </th>

              <th className="p-3 text-center">
                ⚽ Result Points
              </th>

              <th className="p-3 text-center">
                🎯 Exact Points
              </th>

              <th className="p-3 text-center">
                🔥 FTTS Points
              </th>
            </tr>
          </thead>


          <tbody>
            {leaderboard.map((entry) => {

              const resultPoints =
                entry.correctResults * 3;

              const exactPoints =
                entry.exactScores * 2;

              const fttsPoints =
                entry.correctFTTS * 1;


              return (
                <tr
                  key={entry.player.id}
                  className="
                    border-b
                    border-zinc-700
                    transition
                    hover:bg-zinc-800
                  "
                >

                  <td className="p-4 text-xl font-bold">
                    {getMedal(entry.rank)}
                  </td>


                  <td className="p-4 font-semibold">
                    {entry.player.displayName}
                  </td>


                  <td
                    className="
                      p-4
                      text-center
                      text-xl
                      font-bold
                      text-yellow-400
                    "
                  >
                    {entry.totalPoints} pts
                  </td>


                  <td className="p-4 text-center">
                    ⚽ {resultPoints} pts
                  </td>


                  <td className="p-4 text-center">
                    🎯 {exactPoints} pts
                  </td>


                  <td className="p-4 text-center">
                    🔥 {fttsPoints} pts
                  </td>

                </tr>
              );
            })}
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