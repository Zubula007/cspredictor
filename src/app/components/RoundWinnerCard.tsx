"use client";

import type { LeaderboardEntry } from "../services/leaderboardService";

type RoundWinnerCardProps = {
  leaderboard: LeaderboardEntry[];
};

export default function RoundWinnerCard({
  leaderboard,
}: RoundWinnerCardProps) {
  if (leaderboard.length === 0) {
    return null;
  }

  const winner = leaderboard[0];

  return (
    <section className="mb-10">
      <div className="rounded-3xl border border-yellow-400 bg-gradient-to-r from-yellow-500/20 via-zinc-900 to-yellow-500/20 p-8 shadow-xl">

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Round 1 Winner
          </p>

          <h2 className="mt-4 text-5xl">
            🏆
          </h2>

          <h3 className="mt-3 text-4xl font-extrabold text-yellow-400">
            {winner.player.displayName}
          </h3>

          <p className="mt-2 text-xl text-white">
            {winner.totalPoints} Points
          </p>

        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">

          <div className="rounded-xl border border-green-700 bg-green-900/20 p-4 text-center">
            <p className="text-sm text-green-300">
              ✅ Results
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {winner.resultPoints}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4 text-center">
            <p className="text-sm text-yellow-300">
              🎯 Exact
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {winner.exactPoints}
            </p>
          </div>

          <div className="rounded-xl border border-blue-700 bg-blue-900/20 p-4 text-center">
            <p className="text-sm text-blue-300">
              ⚽ FTTS
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {winner.fttsPoints}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}