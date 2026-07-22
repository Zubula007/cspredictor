"use client";

import { useState } from "react";
import FixtureCard from "./components/FixtureCard";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-400">
          🏆 Championship Score Predictor
        </h1>

        <p className="mt-3 text-xl">
          Predict. Compete. Conquer.
        </p>

        <p className="mt-2 text-gray-400">
          Season One – Founders Edition
        </p>

        <p className="mt-4 text-gray-400">
          League Code
        </p>

        <h2 className="text-3xl font-bold text-yellow-400">
          CSP26
        </h2>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-yellow-400">
          ⚽ Upcoming Fixtures
        </h2>

        <FixtureCard
          homeTeam="Kaizer Chiefs"
          awayTeam="Orlando Pirates"
        />

        <FixtureCard
          homeTeam="Mamelodi Sundowns"
          awayTeam="Stellenbosch FC"
        />

        <FixtureCard
          homeTeam="Cape Town City"
          awayTeam="Sekhukhune United"
        />
      </section>

      <button
        onClick={() => setSubmitted(true)}
        className="mt-10 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl"
      >
        Submit All Predictions
      </button>

      {submitted && (
        <div className="mt-6 bg-gray-900 rounded-xl p-4 text-center">
          <p className="text-gray-400">
            Predictions submitted successfully!
          </p>

          <p className="text-yellow-400 font-bold mt-2">
            Good luck this round! ⚽🏆
          </p>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-yellow-400">
          🏆 Leaderboard
        </h2>

        <div className="mt-4 bg-gray-900 rounded-xl p-4">
          <p>🥇 Player 1 ........ 15 pts</p>
          <p>🥈 Player 2 ........ 12 pts</p>
          <p>🥉 Player 3 ........ 10 pts</p>
        </div>
      </section>

    </main>
  );
}

