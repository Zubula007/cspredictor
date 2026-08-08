"use client";

import { useState } from "react";

import Image from "next/image";

import type { Fixture } from "../types/fixture";

type PredictionViewCardProps = {
  fixture: Fixture;

  playerName: string;
  loggedInPlayerName: string;

  prediction: {
    homeScore: number;
    awayScore: number;
    firstTeamToScore: "HOME" | "AWAY" | "NONE" | null;
  };

  points?: number;

  onEdit?: () => void;

  canEdit?: boolean;
};

export default function PredictionViewCard({
  fixture,
  playerName,
  loggedInPlayerName,
  prediction,
  points,
  onEdit,
  canEdit = false,
}: PredictionViewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isOwnPrediction =
    playerName === loggedInPlayerName;

  const getPredictionFTTS = () => {
    if (prediction.firstTeamToScore === "HOME") {
      return fixture.homeTeam;
    }

    if (prediction.firstTeamToScore === "AWAY") {
      return fixture.awayTeam;
    }

    return "No Goal";
  };

  const getResultFTTS = () => {
    if (fixture.firstTeamToScore === "Home") {
      return fixture.homeTeam;
    }

    if (fixture.firstTeamToScore === "Away") {
      return fixture.awayTeam;
    }

    return "No Goal";
  };

  const hasResult =
    fixture.status === "Completed" &&
    fixture.homeScore !== undefined &&
    fixture.awayScore !== undefined;

  const getPointBreakdown = () => {
    if (!hasResult) {
      return null;
    }

    const homeScore = fixture.homeScore ?? 0;
    const awayScore = fixture.awayScore ?? 0;

    const predictionHome =
      prediction.homeScore;

    const predictionAway =
      prediction.awayScore;

    const correctResult =
      (homeScore > awayScore &&
        predictionHome > predictionAway) ||
      (awayScore > homeScore &&
        predictionAway > predictionHome) ||
      (homeScore === awayScore &&
        predictionHome === predictionAway);

    const exactScore =
      homeScore === predictionHome &&
      awayScore === predictionAway;

    const correctFTTS =
      (fixture.firstTeamToScore === "Home" &&
        prediction.firstTeamToScore === "HOME") ||
      (fixture.firstTeamToScore === "Away" &&
        prediction.firstTeamToScore === "AWAY") ||
      (fixture.firstTeamToScore === "None" &&
        prediction.firstTeamToScore === "NONE");

    const resultPoints =
      correctResult ? 3 : 0;

    const exactPoints =
      exactScore ? 2 : 0;

    const fttsPoints =
      correctFTTS && correctResult ? 1 : 0;

    return {
      correctResult,
      exactScore,
      correctFTTS,
      resultPoints,
      exactPoints,
      fttsPoints,
      totalPoints:
        resultPoints +
        exactPoints +
        fttsPoints,
    };
  };

  const breakdown = getPointBreakdown();

  return (
    <div className="rounded-2xl border border-yellow-500 bg-black shadow-xl">

      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            {fixture.homeTeam &&
              fixture.awayTeam && (
                <div className="flex items-center gap-2">

                  <Image
                    src={
                      fixture.homeTeam
                        ? `/badges/${fixture.homeTeam}.png`
                        : ""
                    }
                    alt={fixture.homeTeam}
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />

                  <span className="text-xs font-bold text-gray-400">
                    VS
                  </span>

                  <Image
                    src={
                      fixture.awayTeam
                        ? `/badges/${fixture.awayTeam}.png`
                        : ""
                    }
                    alt={fixture.awayTeam}
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />

                </div>
              )}

          </div>

          <div className="flex-1 text-center">

            <p className="font-bold text-white">
              {fixture.homeTeam}
            </p>

            <p className="text-xs text-gray-500">
              vs
            </p>

            <p className="font-bold text-white">
              {fixture.awayTeam}
            </p>

          </div>

          <div className="text-right">

            <p className="font-bold text-yellow-400">
              {playerName}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {expanded
                ? "▲ Close"
                : "▼ View"}
            </p>

          </div>

        </div>

      </button>

      {/* Details */}
      {expanded && (
        <div className="border-t border-yellow-500/20 p-5">

          {/* Prediction */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">

            <div className="mb-4 flex items-center justify-between">

              <h3 className="font-bold text-yellow-400">
                🎯 Prediction
              </h3>

              {isOwnPrediction &&
                canEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
                  >
                    ✏️ Edit Prediction
                  </button>
                )}

              {!isOwnPrediction && (
                <span className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-gray-400">
                  👁️ View Only
                </span>
              )}

            </div>

            <div className="text-center">

              <p className="text-2xl font-extrabold text-white md:text-3xl">
                {fixture.homeTeam}{" "}
                <span className="text-yellow-400">
                  {prediction.homeScore}
                  {" - "}
                  {prediction.awayScore}
                </span>{" "}
                {fixture.awayTeam}
              </p>

              <p className="mt-3 text-sm text-gray-400">
                ⚽ First Team To Score
              </p>

              <p className="mt-1 font-bold text-blue-400">
                {getPredictionFTTS()}
              </p>

            </div>

          </div>

          {/* Result */}
          {hasResult ? (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-950/20 p-5">

              <h3 className="mb-4 font-bold text-green-400">
                ✅ Result
              </h3>

              <div className="text-center">

                <p className="text-2xl font-extrabold text-white md:text-3xl">
                  {fixture.homeTeam}{" "}
                  <span className="text-green-400">
                    {fixture.homeScore}
                    {" - "}
                    {fixture.awayScore}
                  </span>{" "}
                  {fixture.awayTeam}
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  ⚽ First Team To Score
                </p>

                <p className="mt-1 font-bold text-blue-400">
                  {getResultFTTS()}
                </p>

              </div>

            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-center">

              <p className="font-semibold text-gray-400">
                🕒 Result not available yet
              </p>

            </div>
          )}

          {/* Points */}
          {hasResult && breakdown && (
            <div className="mt-5 rounded-xl border border-green-500 bg-green-950/10 p-5">

              <div className="text-center">

                <p className="text-sm uppercase tracking-wide text-gray-400">
                  Points Earned
                </p>

                <p className="mt-2 text-4xl font-extrabold text-green-400">
                  +{points ?? breakdown.totalPoints}
                </p>

              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">

                {breakdown.correctResult && (
                  <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white">
                    🟢 Correct Result +3
                  </span>
                )}

                {breakdown.exactScore && (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                    🎯 Exact Score +2
                  </span>
                )}

                {breakdown.correctFTTS &&
                  breakdown.correctResult && (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                      ⚽ FTTS +1
                    </span>
                  )}

                {!breakdown.correctResult && (
                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                    ❌ Incorrect Result
                  </span>
                )}

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}