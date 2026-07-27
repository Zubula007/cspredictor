"use client";

import { useState } from "react";

import PlayerForm from "./components/PlayerForm";
import FixtureCard from "./components/FixtureCard";
import ConfirmationModal from "./components/ConfirmationModal";

import fixtures from "./data/fixtures";
import badges from "./data/badges";
import competitions from "./data/competitions";

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
};

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const [predictions, setPredictions] = useState<Prediction[]>(
    fixtures.map((fixture) => ({
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeScore: 0,
      awayScore: 0,
    }))
  );

  const updatePrediction = (
    index: number,
    homeScore: number,
    awayScore: number
  ) => {
    setPredictions((current) =>
      current.map((prediction, i) =>
        i === index
          ? {
              ...prediction,
              homeScore,
              awayScore,
            }
          : prediction
      )
    );
  };

  const handleSubmit = () => {
    if (!playerName.trim()) {
      setError("Please enter your name before submitting.");
      return;
    }

    setError("");
    setShowConfirmation(true);
  };

  const confirmSubmission = () => {
    setSubmitted(true);
    setShowConfirmation(false);
  };

  const completedPredictions = predictions.filter(
    (prediction) =>
      prediction.homeScore !== 0 ||
      prediction.awayScore !== 0
  ).length;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="mx-auto max-w-5xl">

        {/* ===== Premium Header ===== */}

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl">

          <h1 className="text-center text-5xl font-extrabold text-yellow-400">
            🏆 Championship Score Predictor
          </h1>

          <p className="mt-3 text-center text-xl text-gray-300">
            Predict. Compete. Conquer.
          </p>

          <p className="mt-2 text-center text-yellow-500 font-semibold">
            Season One • Founders Edition
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">

            <div className="rounded-xl bg-zinc-900 p-4 text-center">
              <p className="text-xs uppercase text-gray-400">
                League Code
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-400">
                CSP26
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">
              <p className="text-xs uppercase text-gray-400">
                Competition
              </p>

              <p className="mt-2 font-bold text-white">
                Betway Premiership
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">
              <p className="text-xs uppercase text-gray-400">
                Round
              </p>

              <p className="mt-2 font-bold text-white">
                Round 1
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">
              <p className="text-xs uppercase text-gray-400">
                Predictions
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                {completedPredictions}/{fixtures.length}
              </p>
            </div>

          </div>

        </div>

        <PlayerForm
          playerName={playerName}
          setPlayerName={setPlayerName}
        />

        <div className="mt-8 space-y-6">

          {fixtures.map((fixture, index) => (

            <FixtureCard
              key={`${fixture.homeTeam}-${fixture.awayTeam}`}
              competition={fixture.competition}
              competitionLogo={
                competitions[fixture.competition]
              }
              date={fixture.matchDate}
              kickOff={fixture.kickOff}
              homeTeam={fixture.homeTeam}
              awayTeam={fixture.awayTeam}
              homeLogo={badges[fixture.homeTeam]}
              awayLogo={badges[fixture.awayTeam]}
              userPrediction={{
                homeScore: predictions[index].homeScore,
                awayScore: predictions[index].awayScore,
              }}
              onPredictionChange={(
                homeScore,
                awayScore
              ) =>
                updatePrediction(
                  index,
                  homeScore,
                  awayScore
                )
              }            />

          ))}

        </div>

        <button
          onClick={handleSubmit}
          className="mt-8 w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-black transition hover:bg-yellow-300"
        >
          Submit All Predictions
        </button>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500 bg-red-900 p-3 text-center">
            <p className="font-semibold text-red-200">
              {error}
            </p>
          </div>
        )}

        {submitted && (
          <div className="mt-6 rounded-2xl border border-green-500 bg-zinc-900 p-6">

            <h2 className="text-center text-2xl font-bold text-green-400">
              ✅ Predictions Submitted
            </h2>

            <p className="mt-4 text-center">
              Thank you,
              <span className="font-bold text-yellow-400">
                {" "}{playerName}
              </span>
            </p>

            <div className="mt-6 space-y-3">

              {predictions.map((prediction, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-black p-3"
                >
                  <span className="font-medium">
                    {prediction.homeTeam}
                  </span>

                  <span className="rounded bg-yellow-400 px-3 py-1 font-bold text-black">
                    {prediction.homeScore} - {prediction.awayScore}
                  </span>

                  <span className="font-medium">
                    {prediction.awayTeam}
                  </span>

                </div>

              ))}

            </div>

          </div>
        )}

        <section className="mt-12">

          <h2 className="mb-4 text-2xl font-bold text-yellow-400">
            🏆 Leaderboard
          </h2>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

            <div className="flex justify-between border-b border-zinc-700 pb-3">
              <span>🥇 Player 1</span>
              <span className="font-bold text-yellow-400">
                15 pts
              </span>
            </div>

            <div className="mt-3 flex justify-between border-b border-zinc-700 pb-3">
              <span>🥈 Player 2</span>
              <span className="font-bold text-gray-300">
                12 pts
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span>🥉 Player 3</span>
              <span className="font-bold text-orange-400">
                10 pts
              </span>
            </div>

          </div>

        </section>

        <ConfirmationModal
          isOpen={showConfirmation}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={confirmSubmission}
        />

      </div>

    </main>
  );
}