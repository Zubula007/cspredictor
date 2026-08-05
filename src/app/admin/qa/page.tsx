"use client";

import { useEffect, useState } from "react";

import playerRepository from "../../repositories/playerRepository";
import fixtureRepository from "../../repositories/fixtureRepository";
import predictionRepository from "../../repositories/predictionRepository";
import bonusRepository from "../../repositories/bonusRepository";
import competitionService from "../../services/competitionService";

export default function QAToolkitPage() {
  const [players, setPlayers] = useState(0);
  const [fixtures, setFixtures] = useState(0);
  const [predictions, setPredictions] = useState(0);
  const [publishedResults, setPublishedResults] =
    useState(0);
  const [bonuses, setBonuses] = useState(0);

  const [message, setMessage] = useState("");
const [qaMode, setQaMode] =
  useState(false);

const [ignoreValidation, setIgnoreValidation] =
  useState(false);

const [ignoreLock, setIgnoreLock] =
  useState(false);

  useEffect(() => {
  refreshStats();

  setQaMode(
    localStorage.getItem("csp-qa-mode") === "true"
  );

  setIgnoreValidation(
    localStorage.getItem(
      "csp-ignore-validation"
    ) === "true"
  );

  setIgnoreLock(
    localStorage.getItem(
      "csp-ignore-lock"
    ) === "true"
  );
}, []);

  function refreshStats() {
  setPlayers(
    playerRepository.getAll().length
  );

  const allFixtures =
    fixtureRepository.getAll();

  setFixtures(allFixtures.length);

  setPublishedResults(
    allFixtures.filter(
      (fixture) => fixture.published
    ).length
  );

  setPredictions(
    predictionRepository.getAll().length
  );

  setBonuses(
    bonusRepository.getAll().length
  );
}

function toggleQAMode() {
  const value = !qaMode;

  setQaMode(value);

  localStorage.setItem(
    "csp-qa-mode",
    String(value)
  );
}

function toggleValidation() {
  const value = !ignoreValidation;

  setIgnoreValidation(value);

  localStorage.setItem(
    "csp-ignore-validation",
    String(value)
  );
}

function toggleLock() {
  const value = !ignoreLock;

  setIgnoreLock(value);

  localStorage.setItem(
    "csp-ignore-lock",
    String(value)
  );
}

function fullReset() {
  if (
    !window.confirm(
      "Reset the entire QA environment?"
    )
  ) {
    return;
  }

  predictionRepository.reset();

  bonusRepository.reset();

  fixtureRepository.resetFixtures();

  localStorage.removeItem(
    "csp-ui-predictions"
  );

  localStorage.removeItem(
    "csp-submitted"
  );

  localStorage.removeItem(
    "csp-submittedAt"
  );

  refreshStats();

  setMessage(
    "✅ QA Environment Reset Successfully."
  );
}

  const competition =
    competitionService.getActiveCompetition();

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-500 bg-zinc-900 p-8 shadow-xl">

        <h1 className="text-center text-4xl font-extrabold text-yellow-400">
          🧪 QA Toolkit
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Development tools for end-to-end testing
        </p>

        <div className="mt-10 rounded-2xl border border-yellow-500 bg-black p-6">

          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            📊 Current Environment
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>👥 Players</span>
              <span>{players}</span>
            </div>

            <div className="flex justify-between">
              <span>⚽ Fixtures</span>
              <span>{fixtures}</span>
            </div>

            <div className="flex justify-between">
              <span>📝 Predictions</span>
              <span>{predictions}</span>
            </div>

            <div className="flex justify-between">
              <span>📢 Published Results</span>
              <span>{publishedResults}</span>
            </div>

            <div className="flex justify-between">
              <span>🏅 Bonus Records</span>
              <span>{bonuses}</span>
            </div>

            <hr className="border-zinc-700" />

            <div className="flex justify-between font-semibold">
              <span>🏆 Competition</span>
              <span>{competition.name}</span>
            </div>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-blue-600 bg-blue-950/20 p-6">

  <h2 className="mb-5 text-2xl font-bold text-blue-400">
    🛠 QA Controls
  </h2>

  <div className="space-y-4">

    <button
      onClick={toggleQAMode}
      className={`w-full rounded-xl py-3 font-bold ${
        qaMode
          ? "bg-green-600 text-white"
          : "bg-zinc-700 text-white"
      }`}
    >
      QA Mode: {qaMode ? "ON" : "OFF"}
    </button>

    <button
      onClick={toggleValidation}
      disabled={!qaMode}
      className={`w-full rounded-xl py-3 font-bold ${
        ignoreValidation
          ? "bg-green-600 text-white"
          : "bg-zinc-700 text-white"
      } disabled:opacity-40`}
    >
      Ignore Prediction Validation:{" "}
      {ignoreValidation ? "ON" : "OFF"}
    </button>

    <button
      onClick={toggleLock}
      disabled={!qaMode}
      className={`w-full rounded-xl py-3 font-bold ${
        ignoreLock
          ? "bg-green-600 text-white"
          : "bg-zinc-700 text-white"
      } disabled:opacity-40`}
    >
      Ignore Prediction Lock:{" "}
      {ignoreLock ? "ON" : "OFF"}
    </button>

  </div>

</div>
<div className="mt-8 space-y-4">

          <button
            disabled
            className="w-full rounded-xl bg-red-600 py-4 font-bold text-white opacity-60"
          >
            🗑 Reset Predictions
          </button>

          <button
            disabled
            className="w-full rounded-xl bg-red-600 py-4 font-bold text-white opacity-60"
          >
            🗑 Reset Fixture Results
          </button>

          <button
            disabled
            className="w-full rounded-xl bg-red-600 py-4 font-bold text-white opacity-60"
          >
            🗑 Reset Bonus Points
          </button>

          <button
            disabled
            className="w-full rounded-xl bg-red-600 py-4 font-bold text-white opacity-60"
          >
            🗑 Reset Submission Status
          </button>

          <hr className="border-zinc-700" />

          <button
            onClick={fullReset}
            className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            🚀 Full QA Reset
          </button>

          {message && (
            <div className="rounded-xl border border-green-600 bg-green-900/20 p-4 text-center font-semibold text-green-300">
              {message}
            </div>
          )}

        </div>

      </div>

    </main>
  );
}

