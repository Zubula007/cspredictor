"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import playerRepository from "../repositories/playerRepository";
import competitionService from "../services/competitionService";

import { useFixtures } from "../context/FixtureContext";
import { useLeaderboard } from "../context/LeaderboardContext";

const adminCards = [
  {
    title: "📢 Publish Results",
    description: "Publish match results and score predictions.",
    href: "/admin/results",
  },
  {
    title: "📅 Manage Fixtures",
    description: "Create, edit and manage fixtures.",
    href: "/admin/fixtures",
  },
  {
    title: "👥 Players",
    description: "Manage league participants.",
    href: "/admin/players",
  },
  {
    title: "🏆 Leaderboard",
    description: "View championship standings.",
    href: "/leaderboard",
  },
  {
    title: "🧪 QA Toolkit",
    description: "Reset test data for end-to-end QA.",
    href: "/admin/qa",
  },
  {
    title: "⚙️ Settings",
    description: "League configuration and preferences.",
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);
  const players = playerRepository.getActivePlayers();

  const { fixtures } = useFixtures();

  const { leaderboard } = useLeaderboard();

  const activeCompetition =
    competitionService.getActiveCompetition();

  const pendingResults = fixtures.filter(
    (fixture) =>
      fixture.status === "Completed" &&
      !fixture.published &&
      fixture.competitionId === activeCompetition.id
  ).length;

  const publishedResults = fixtures.filter(
    (fixture) =>
      fixture.published &&
      fixture.competitionId === activeCompetition.id
  ).length;

  const competitionFixtures = fixtures.filter(
    (fixture) =>
      fixture.competitionId === activeCompetition.id
  );
if (!mounted) {
  return null;
}

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10 text-center">

          <h1 className="text-3xl font-bold text-yellow-400 md:text-4xl">
  ⚙️ Admin Dashboard
</h1>

          <p className="mt-2 text-sm text-gray-400">
  Championship Score Predictor Administration
</p>

        </div>

        {/* Active Competition */}

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">

         <h2 className="text-center text-xl font-bold text-yellow-400 md:text-2xl">
  🏆 Active Competition
</h2> 

          <p className="mt-3 text-center text-lg font-bold">
  {activeCompetition.name}
</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">

            <div
              className={`rounded-xl border p-5 text-center ${
                activeCompetition.roundWinnerEnabled
                  ? "border-green-600 bg-green-900/20"
                  : "border-red-600 bg-red-900/20"
              }`}
            >
              <p className="font-semibold">
                Round Winner
              </p>

              <p className="mt-2 text-2xl">
                {activeCompetition.roundWinnerEnabled
                  ? "✅"
                  : "❌"}
              </p>
            </div>

            <div
              className={`rounded-xl border p-5 text-center ${
                activeCompetition.monthlyWinnerEnabled
                  ? "border-green-600 bg-green-900/20"
                  : "border-red-600 bg-red-900/20"
              }`}
            >
              <p className="font-semibold">
                Monthly Winner
              </p>

              <p className="mt-2 text-2xl">
                {activeCompetition.monthlyWinnerEnabled
                  ? "✅"
                  : "❌"}
              </p>
            </div>

            <div
              className={`rounded-xl border p-5 text-center ${
                activeCompetition.monthlyWinnerEnabled
                  ? "border-green-600 bg-green-900/20"
                  : "border-red-600 bg-red-900/20"
              }`}
            >
              <p className="font-semibold">
                Bonus Points
              </p>

              <p className="mt-2 text-2xl">
                {activeCompetition.monthlyWinnerEnabled
                  ? "✅"
                  : "❌"}
              </p>
            </div>

          </div>

        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              👥 Active Players
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {players.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              ⚽ Fixtures
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {competitionFixtures.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              🏆 Competition Leader
            </p>

            <p className="mt-2 text-lg font-bold text-yellow-400">
              {leaderboard.length > 0
                ? leaderboard[0].player.displayName
                : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              📢 Pending Results
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {pendingResults}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              ✅ Published Results
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {publishedResults}
            </p>
          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {adminCards.map((card) => (

            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-yellow-500 bg-gradient-to-br from-zinc-900 to-black p-6 shadow-lg transition hover:scale-105 hover:border-yellow-400"
            >

              <h2 className="text-lg font-bold text-yellow-400">
                {card.title}
              </h2>

              <p className="mt-2 text-sm text-gray-300">
                {card.description}
              </p>

            </Link>

          ))}

        </div>

      </div>
    </main>
  );
}

