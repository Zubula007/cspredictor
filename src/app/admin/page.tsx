"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import playerRepository from "../repositories/playerRepository";

import { useFixtures } from "../context/FixtureContext";
import { useLeaderboard } from "../context/LeaderboardContext";
import { useCompetition } from "../context/CompetitionContext";

import competitionService from "../services/competitionService";

const adminCards = [
  {
    title: "📢 Publish Results",
    description:
      "Publish match results and score predictions.",
    href: "/admin/results",
  },
  {
    title: "📥 PSL Import Centre",
    description:
      "Import official PSL fixtures and results for admin review.",
    href: "/admin/psl-imports",
  },
  {
    title: "📅 Manage Fixtures",
    description:
      "Create, edit and manage fixtures.",
    href: "/admin/fixtures",
  },
  {
    title: "👥 Players",
    description:
      "Manage league participants.",
    href: "/admin/players",
  },
  {
    title: "🏆 Leaderboard",
    description:
      "View championship standings.",
    href: "/leaderboard",
  },
  {
    title: "🧪 QA Toolkit",
    description:
      "Reset test data for end-to-end QA.",
    href: "/admin/qa",
  },
  {
    title: "⚙️ Settings",
    description:
      "League configuration and preferences.",
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);

  const [activeRound, setActiveRound] =
    useState(1);

  const players =
    playerRepository.getActivePlayers();

  const { fixtures } = useFixtures();

  const { leaderboard } =
    useLeaderboard();

  const {
    activeCompetition,
    competitions,
    setActiveCompetition,
  } = useCompetition();

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Load the active round whenever
   * the active competition changes.
   */
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const round =
      competitionService.getActiveRound(
        activeCompetition.id
      );

    setActiveRound(round);
  }, [
    activeCompetition.id,
    mounted,
  ]);

  /*
   * Fixtures belonging to the
   * selected competition.
   */
  const competitionFixtures =
    fixtures.filter(
      (fixture) =>
        fixture.competitionId ===
        activeCompetition.id
    );

  /*
   * Find available rounds for the
   * selected competition.
   */
  const availableRounds =
    Array.from(
      new Set(
        competitionFixtures
          .map(
            (fixture) =>
              fixture.round
          )
          .filter(
            (round): round is number =>
              typeof round === "number"
          )
      )
    ).sort(
      (a, b) => a - b
    );

  /*
   * Default to Round 1 if no
   * fixtures have been imported.
   */
  const rounds =
    availableRounds.length > 0
      ? availableRounds
      : [1];

  const pendingResults =
    fixtures.filter(
      (fixture) =>
        fixture.status ===
          "Completed" &&
        !fixture.published &&
        fixture.competitionId ===
          activeCompetition.id
    ).length;

  const publishedResults =
    fixtures.filter(
      (fixture) =>
        fixture.published &&
        fixture.competitionId ===
          activeCompetition.id
    ).length;

  const handleCompetitionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setActiveCompetition(
      event.target.value
    );
  };

  const handleRoundChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const round = Number(
      event.target.value
    );

    /*
     * IMPORTANT:
     * Competition ID first.
     * Round second.
     */
    const savedRound =
      competitionService.setActiveRound(
        activeCompetition.id,
        round
      );

    setActiveRound(savedRound);
  };

  if (!mounted) {
    return null;
  }

  const activeRoundFixtures =
    competitionFixtures.filter(
      (fixture) =>
        fixture.round === activeRound
    );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* HEADER */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
            ⚙️ Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Championship Score Predictor Administration
          </p>
        </div>

        {/* ACTIVE COMPETITION */}

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-xl md:p-8">

          <h2 className="text-center text-xl font-bold text-yellow-400 md:text-2xl">
            🏆 Active Competition
          </h2>

          {/* Competition Selector */}

          <div className="mx-auto mt-5 max-w-md">
            <label
              htmlFor="admin-competition-selector"
              className="mb-2 block text-center text-sm font-semibold text-gray-300"
            >
              Select Competition
            </label>

            <select
              id="admin-competition-selector"
              value={activeCompetition.id}
              onChange={
                handleCompetitionChange
              }
              className="w-full rounded-xl border-2 border-yellow-500 bg-black px-4 py-3 text-center font-bold text-yellow-400 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-500/30"
            >
              {competitions.map(
                (competition) => (
                  <option
                    key={competition.id}
                    value={competition.id}
                    className="bg-black text-white"
                  >
                    {competition.name}
                  </option>
                )
              )}
            </select>
          </div>

          <p className="mt-5 text-center text-lg font-bold text-white">
            {activeCompetition.name}
          </p>

          {/* ACTIVE ROUND */}

          <div className="mx-auto mt-8 max-w-md">
            <label
              htmlFor="admin-round-selector"
              className="mb-2 block text-center text-sm font-semibold text-gray-300"
            >
              Select Active Round
            </label>

            <select
              id="admin-round-selector"
              value={activeRound}
              onChange={handleRoundChange}
              className="w-full rounded-xl border-2 border-yellow-500 bg-black px-4 py-3 text-center text-lg font-bold text-yellow-400 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-500/30"
            >
              {rounds.map(
                (round) => (
                  <option
                    key={round}
                    value={round}
                    className="bg-black text-white"
                  >
                    Round {round}
                  </option>
                )
              )}
            </select>

            <p className="mt-3 text-center text-sm text-gray-400">
              The home page will display only
              this round.
            </p>
          </div>

          {/* ACTIVE ROUND SUMMARY */}

          <div className="mt-6 rounded-xl border border-green-600 bg-green-900/20 p-4 text-center">

            <p className="text-sm text-gray-400">
              Current Active Round
            </p>

            <p className="mt-1 text-2xl font-black text-green-400">
              Round {activeRound}
            </p>

            <p className="mt-1 text-sm text-gray-300">
              {activeRoundFixtures.length} fixture
              {activeRoundFixtures.length === 1
                ? ""
                : "s"}{" "}
              displayed on the home page
            </p>

          </div>

          {/* COMPETITION RULES */}

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

        {/* DASHBOARD STATISTICS */}

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
                ? leaderboard[0]
                    .player.displayName
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

        {/* ADMIN NAVIGATION */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {adminCards.map(
            (card) => (
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
            )
          )}

        </div>

      </div>
    </main>
  );
}