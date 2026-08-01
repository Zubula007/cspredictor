"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import playerRepository from "../repositories/playerRepository";
import fixtureRepository from "../repositories/fixtureRepository";
import leaderboardService from "../services/leaderboardService";

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
    title: "⚙️ Settings",
    description: "League configuration and preferences.",
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {

  const players = playerRepository.getActivePlayers();

  const [fixtures, setFixtures] = useState(
    fixtureRepository.getAll()
  );


  useEffect(() => {

    const refreshFixtures = () => {

      setFixtures(
        fixtureRepository.getAll()
      );

    };


    refreshFixtures();


    window.addEventListener(
      "focus",
      refreshFixtures
    );


    return () => {

      window.removeEventListener(
        "focus",
        refreshFixtures
      );

    };


  }, []);



  const leaderboard =
    leaderboardService.getLeaderboard();



  const pendingResults = fixtures.filter(
    (fixture) =>
      fixture.status === "Completed" &&
      !fixture.published
  ).length;



  const publishedResults = fixtures.filter(
    (fixture) =>
      fixture.published
  ).length;



  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-6xl">


        <div className="mb-10 text-center">

          <h1 className="text-5xl font-extrabold text-yellow-400">
            ⚙️ Admin Dashboard
          </h1>


          <p className="mt-3 text-gray-400">
            Championship Score Predictor Administration
          </p>

        </div>



        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-5">


          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">

            <p className="text-sm uppercase text-gray-400">
              👥 Active Players
            </p>


            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {players.length}
            </p>

          </div>



          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">

            <p className="text-sm uppercase text-gray-400">
              ⚽ Fixtures
            </p>


            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {fixtures.length}
            </p>

          </div>



          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">

            <p className="text-sm uppercase text-gray-400">
              🏆 League Leader
            </p>


            <p className="mt-2 text-xl font-bold text-yellow-400">
              {leaderboard.length > 0
                ? leaderboard[0].player.displayName
                : "-"}
            </p>

          </div>



          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">

            <p className="text-sm uppercase text-gray-400">
              📢 Pending Results
            </p>


            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {pendingResults}
            </p>

          </div>



          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">

            <p className="text-sm uppercase text-gray-400">
              ✅ Published Results
            </p>


            <p className="mt-2 text-4xl font-bold text-yellow-400">
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

              <h2 className="text-2xl font-bold text-yellow-400">
                {card.title}
              </h2>


              <p className="mt-3 text-gray-300">
                {card.description}
              </p>

            </Link>

          ))}


        </div>


      </div>

    </main>
  );
}