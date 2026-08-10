"use client";

import { useEffect, useRef, useState } from "react";

import PlayerForm from "./components/PlayerForm";
import FixtureCard from "./components/FixtureCard";
import ConfirmationModal from "./components/ConfirmationModal";
import CompetitionSelector from "./components/CompetitionSelector";

import { useFixtures } from "./context/FixtureContext";
import { useCompetition } from "./context/CompetitionContext";

import badges from "./data/badges";
import predictionService from "./services/predictionService";
import leaderboardService, {
  type LeaderboardEntry,
} from "./services/leaderboardService";

import competitionService from "./services/competitionService";

import authService from "./services/authService";
import { isFixtureLocked } from "./lib/predictionLock";

type FTTSOption =
  | "HOME"
  | "AWAY"
  | "NONE"
  | null;

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scoreSelected: boolean;
  firstTeamToScore: FTTSOption;
};

const UI_PREDICTIONS_KEY =
  "csp-ui-predictions";

export default function Home() {
  const { activeCompetition } =
    useCompetition();

  const { fixtures } = useFixtures();

  const [playerName, setPlayerName] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [submittedAt, setSubmittedAt] =
    useState<string | null>(null);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showIncomplete, setShowIncomplete] =
    useState(false);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [qaMode, setQaMode] =
    useState(false);

  const [ignoreLock, setIgnoreLock] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [activeRound, setActiveRound] =
    useState(1);

  const fixtureRefs =
    useRef<(HTMLDivElement | null)[]>(
      []
    );

  /*
   * ============================================================
   * ACTIVE ROUND
   * ============================================================
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
   * ============================================================
   * CURRENT ROUND FIXTURES
   * ============================================================
   *
   * IMPORTANT:
   *
   * We filter by:
   *
   * 1. Active competition
   * 2. Admin-selected active round
   *
   * Therefore the home page will NEVER display
   * all imported fixtures.
   */

  const competitionFixtures =
    fixtures.filter(
      (fixture) =>
        fixture.competitionId ===
          activeCompetition.id &&
        fixture.round === activeRound
    );

  const [predictions, setPredictions] =
    useState<Prediction[]>([]);

  /*
   * Keep predictions aligned with
   * the active competition AND active round.
   */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const newPredictions: Prediction[] =
      competitionFixtures.map(
        (fixture) => ({
          homeTeam:
            fixture.homeTeam,

          awayTeam:
            fixture.awayTeam,

          homeScore: 0,

          awayScore: 0,

          scoreSelected: false,

          firstTeamToScore: null,
        })
      );

    setPredictions(
      newPredictions
    );
  }, [
    activeCompetition.id,
    activeRound,
    mounted,
  ]);

  const updatePrediction = (
    index: number,
    homeScore: number,
    awayScore: number,
    scoreSelected: boolean,
    firstTeamToScore: FTTSOption
  ) => {
    setPredictions(
      (current) =>
        current.map(
          (prediction, i) =>
            i === index
              ? {
                  ...prediction,
                  homeScore,
                  awayScore,
                  scoreSelected,
                  firstTeamToScore,
                }
              : prediction
        )
    );
  };

  /*
   * ============================================================
   * SUBMISSION VALIDATION
   * ============================================================
   */

  const handleSubmit = () => {
    if (!playerName.trim()) {
      setError(
        "Please enter your name before submitting."
      );

      return;
    }

    const incompletePrediction =
      predictions.some(
        (prediction, index) => {
          const fixture =
            competitionFixtures[index];

          if (!fixture) {
            return false;
          }

          if (
            fixture.status ===
              "Postponed" ||
            fixture.status ===
              "Cancelled"
          ) {
            return false;
          }

          return (
            !prediction.scoreSelected ||
            prediction.firstTeamToScore ===
              null
          );
        }
      );

    const currentQaMode =
      localStorage.getItem(
        "csp-qa-mode"
      ) === "true";

    const ignoreValidation =
      localStorage.getItem(
        "csp-ignore-validation"
      ) === "true";

    if (
      incompletePrediction &&
      !(currentQaMode && ignoreValidation)
    ) {
      setShowIncomplete(true);

      setError(
        "Please complete all scheduled fixtures before submitting your predictions."
      );

      return;
    }

    setShowIncomplete(false);
    setError("");
    setShowConfirmation(true);
  };

  /*
   * ============================================================
   * CONFIRM SUBMISSION
   * ============================================================
   */

  const confirmSubmission = () => {
    const player =
      authService.getCurrentPlayer();

    if (!player) {
      setError(
        "Player not found. Please contact the league administrator."
      );

      setShowConfirmation(false);

      return;
    }

    predictions.forEach(
      (prediction, index) => {
        const fixture =
          competitionFixtures[index];

        if (!fixture) {
          return;
        }

        if (
          !prediction.scoreSelected
        ) {
          return;
        }

        if (
          fixture.status ===
            "Postponed" ||
          fixture.status ===
            "Cancelled"
        ) {
          return;
        }

        predictionService.savePlayerPrediction(
          player.id,
          fixture.id,
          prediction.homeScore,
          prediction.awayScore,
          prediction.firstTeamToScore ===
            "HOME"
            ? "Home"
            : prediction.firstTeamToScore ===
              "AWAY"
            ? "Away"
            : "None"
        );
      }
    );

    const now = new Date();

    const formatted =
      now.toLocaleString(
        "en-ZA",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    setSubmitted(true);
    setSubmittedAt(formatted);

    localStorage.setItem(
      "csp-submitted",
      "true"
    );

    localStorage.setItem(
      "csp-submittedAt",
      formatted
    );

    setShowConfirmation(false);
  };

  /*
   * ============================================================
   * FIXTURE COUNTS
   * ============================================================
   */

  const availableFixtures =
    competitionFixtures.filter(
      (fixture) =>
        fixture.status !==
          "Postponed" &&
        fixture.status !==
          "Cancelled"
    ).length;

  const completedPredictions =
    predictions.filter(
      (prediction, index) => {
        const fixture =
          competitionFixtures[index];

        if (!fixture) {
          return false;
        }

        if (
          fixture.status ===
            "Postponed" ||
          fixture.status ===
            "Cancelled"
        ) {
          return false;
        }

        return (
          prediction.scoreSelected &&
          prediction.firstTeamToScore !==
            null
        );
      }
    ).length;

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    const savedPlayer =
      localStorage.getItem(
        "csp-player"
      );

    const savedPredictions =
      localStorage.getItem(
        UI_PREDICTIONS_KEY
      );

    const savedSubmitted =
      localStorage.getItem(
        "csp-submitted"
      );

    const savedSubmittedAt =
      localStorage.getItem(
        "csp-submittedAt"
      );

    setQaMode(
      localStorage.getItem(
        "csp-qa-mode"
      ) === "true"
    );

    setIgnoreLock(
      localStorage.getItem(
        "csp-ignore-lock"
      ) === "true"
    );

    if (savedPlayer) {
      setPlayerName(
        savedPlayer
      );
    }

    if (savedPredictions) {
      try {
        setPredictions(
          JSON.parse(
            savedPredictions
          )
        );
      } catch {
        console.error(
          "Unable to load saved predictions."
        );
      }
    }

    if (
      savedSubmitted ===
      "true"
    ) {
      setSubmitted(true);
    }

    if (savedSubmittedAt) {
      setSubmittedAt(
        savedSubmittedAt
      );
    }

    setMounted(true);
  }, []);

  /*
   * ============================================================
   * LOCAL STORAGE
   * ============================================================
   */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    localStorage.setItem(
      "csp-player",
      playerName
    );

    localStorage.setItem(
      UI_PREDICTIONS_KEY,
      JSON.stringify(
        predictions
      )
    );
  }, [
    playerName,
    predictions,
    mounted,
  ]);

  /*
   * ============================================================
   * LEADERBOARD
   * ============================================================
   */

  useEffect(() => {
    setLeaderboard(
      leaderboardService.getLeaderboard(
        activeCompetition.id
      )
    );
  }, [
    playerName,
    predictions,
    activeCompetition.id,
    submitted,
  ]);

  /*
   * ============================================================
   * RESET UI WHEN SWITCHING COMPETITION
   * ============================================================
   */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setShowIncomplete(false);
    setError("");
    setSubmitted(false);
    setSubmittedAt(null);
  }, [
    activeCompetition.id,
    activeRound,
    mounted,
  ]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl">

          <h1 className="text-center text-3xl font-extrabold text-yellow-400 sm:text-4xl md:text-5xl">
            🏆 Championship Score Predictor
          </h1>

          <p className="mt-3 text-center text-xl text-gray-300">
            Predict. Compete. Conquer.
          </p>

          <p className="mt-2 text-center font-semibold text-yellow-500">
            Season One • Founders Edition
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">
              <p className="text-xs uppercase text-gray-400">
                League Code
              </p>

              <p className="mt-2 text-xl font-bold text-yellow-400 md:text-2xl">
                CSP26
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <div className="flex items-center justify-center">

                <img
                  src={
                    activeCompetition.logo
                  }
                  alt={
                    activeCompetition.name
                  }
                  className="h-10 w-10 object-contain"
                />

                <p className="ml-3 hidden font-bold md:block">
                  {
                    activeCompetition.name
                  }
                </p>

              </div>

            </div>

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <p className="text-xs uppercase text-gray-400">
                Round
              </p>

              <p className="mt-2 font-bold text-yellow-400">
                Round {activeRound}
              </p>

            </div>

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <p className="text-xs uppercase text-gray-400">
                Predictions
              </p>

              <p className="mt-2 text-xl font-bold text-green-400 md:text-2xl">
                {completedPredictions}/
                {availableFixtures}
              </p>

            </div>

          </div>
        </div>

        {/* COMPETITION SELECTOR */}

        <div className="mb-8">
          <CompetitionSelector />
        </div>

        {/* PLAYER FORM */}

        <PlayerForm
          playerName={playerName}
          setPlayerName={
            setPlayerName
          }
        />

        {/* CURRENT ROUND */}

        <div className="mt-8">

          <div className="mb-6 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
              Current Round
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Round {activeRound}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {competitionFixtures.length} fixture
              {competitionFixtures.length ===
              1
                ? ""
                : "s"} available
            </p>

          </div>

          {/* FIXTURES */}

          <div className="space-y-6">

            {competitionFixtures.length ===
            0 ? (
              <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">

                <p className="text-lg font-bold text-yellow-400">
                  No fixtures available
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  There are currently no fixtures
                  configured for Round{" "}
                  {activeRound}.
                </p>

              </div>
            ) : (
              competitionFixtures.map(
                (
                  fixture,
                  index
                ) => {

                  const locked =
                    fixture.status ===
                      "Completed"
                      ? true
                      : qaMode &&
                        ignoreLock
                      ? false
                      : isFixtureLocked(
                          fixture.matchDate,
                          fixture.kickOff
                        );

                  return (
                    <div
                      key={
                        fixture.id
                      }
                      ref={(
                        element
                      ) => {
                        fixtureRefs.current[
                          index
                        ] =
                          element;
                      }}
                    >

                      <FixtureCard
                        competition={
                          activeCompetition.name
                        }

                        competitionLogo={
                          activeCompetition.logo
                        }

                        matchDate={
                          fixture.matchDate
                        }

                        displayDate={
                          fixture.displayDate
                        }

                        kickOff={
                          fixture.kickOff
                        }

                        status={
                          fixture.status
                        }

                        result={{
                          homeScore:
                            fixture.homeScore ??
                            0,

                          awayScore:
                            fixture.awayScore ??
                            0,

                          firstTeamToScore:
                            fixture.firstTeamToScore ??
                            "None",
                        }}

                        locked={
                          locked
                        }

                        homeTeam={
                          fixture.homeTeam
                        }

                        awayTeam={
                          fixture.awayTeam
                        }

                        homeLogo={
                          badges[
                            fixture.homeTeam
                          ]
                        }

                        awayLogo={
                          badges[
                            fixture.awayTeam
                          ]
                        }

                        userPrediction={{
                          homeScore:
                            predictions[
                              index
                            ]?.homeScore ??
                            0,

                          awayScore:
                            predictions[
                              index
                            ]?.awayScore ??
                            0,

                          scoreSelected:
                            predictions[
                              index
                            ]?.scoreSelected ??
                            false,

                          firstTeamToScore:
                            predictions[
                              index
                            ]?.firstTeamToScore ??
                            null,
                        }}

                        incomplete={
                          showIncomplete &&
                          fixture.status !==
                            "Postponed" &&
                          fixture.status !==
                            "Cancelled" &&
                          (
                            !predictions[
                              index
                            ]
                              ?.scoreSelected ||
                            predictions[
                              index
                            ]
                              ?.firstTeamToScore ===
                              null
                          )
                        }

                        onPredictionChange={(
                          homeScore,
                          awayScore,
                          scoreSelected,
                          firstTeamToScore
                        ) =>
                          updatePrediction(
                            index,
                            homeScore,
                            awayScore,
                            scoreSelected,
                            firstTeamToScore
                          )
                        }
                      />

                    </div>
                  );
                }
              )
            )}

          </div>
        </div>

        {/* SUBMIT */}

        {competitionFixtures.length >
          0 && (
          <button
            onClick={
              handleSubmit
            }
            className="mt-8 w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-black transition hover:bg-yellow-300"
          >
            Submit All Predictions
          </button>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500 bg-red-900 p-3 text-center">

            <p className="font-semibold text-red-200">
              {error}
            </p>

          </div>
        )}

        {/* SUBMITTED */}

        {submitted && (
          <div className="mt-8 rounded-2xl border border-green-500 bg-green-950/20 p-6">

            <h2 className="text-center text-xl font-bold text-green-400 md:text-3xl">
              🏆 Predictions Submitted!
            </h2>

            <p className="mt-5 text-center text-base md:text-xl">
              Good luck{" "}
              <span className="font-bold text-yellow-400">
                {playerName}
              </span>
              ! ⚽
            </p>

            <p className="mt-4 text-center text-sm text-gray-300 md:text-base">
              Your{" "}
              <span className="font-semibold text-yellow-400">
                Round {activeRound}
              </span>{" "}
              predictions have been successfully recorded.
            </p>

            {submittedAt && (
              <div className="mt-6 rounded-xl bg-black p-4 text-center">

                <p className="text-sm uppercase tracking-wide text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 text-sm font-bold text-yellow-400 md:text-base">
                  📅{" "}
                  {submittedAt}
                </p>

              </div>
            )}

          </div>
        )}

        {/* ROUND LEADER */}

        {activeCompetition.roundWinnerEnabled &&
          leaderboard.length > 0 && (
            <div className="mt-12">

              <div className="text-center">

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                  🏆{" "}
                  {
                    activeCompetition.name
                  }{" "}
                  Leader
                </p>

                <h2 className="mt-4 text-5xl">
                  🏆
                </h2>

                <h3 className="mt-3 text-3xl font-extrabold text-yellow-400 md:text-4xl">
                  {
                    leaderboard[0]
                      .player
                      .displayName
                  }
                </h3>

                <p className="mt-2 text-xl text-white">
                  {
                    leaderboard[0]
                      .totalPoints
                  }{" "}
                  Points
                </p>

              </div>

              <div
                className={`mt-6 grid grid-cols-2 gap-4 ${
                  activeCompetition.monthlyWinnerEnabled
                    ? "md:grid-cols-4"
                    : "md:grid-cols-3"
                }`}
              >

                <div className="rounded-xl border border-green-700 bg-green-900/20 p-4 text-center">
                  <p className="text-sm text-green-300">
                    ✅ Results
                  </p>

                  <p className="mt-2 text-2xl font-bold text-green-400 md:text-3xl">
                    {
                      leaderboard[0]
                        .resultPoints
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4 text-center">
                  <p className="text-sm text-yellow-300">
                    🎯 Exact
                  </p>

                  <p className="mt-2 text-3xl font-bold text-yellow-400">
                    {
                      leaderboard[0]
                        .exactPoints
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-blue-700 bg-blue-900/20 p-4 text-center">
                  <p className="text-sm text-blue-300">
                    ⚽ FTTS
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-400">
                    {
                      leaderboard[0]
                        .fttsPoints
                    }
                  </p>
                </div>

                {activeCompetition.monthlyWinnerEnabled && (
                  <div className="rounded-xl border border-purple-700 bg-purple-900/20 p-4 text-center">
                    <p className="text-sm text-purple-300">
                      🏅 Bonus
                    </p>

                    <p className="mt-2 text-3xl font-bold text-purple-400">
                      {
                        leaderboard[0]
                          .bonusPoints
                      }
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

        {/* TOP 3 LEADERBOARD */}

        <div className="mt-12">

          <div className="mb-6 flex items-center justify-center gap-3">

            <img
              src={
                activeCompetition.logo
              }
              alt={
                activeCompetition.name
              }
              className="h-12 w-12 object-contain"
            />

            <h2 className="text-2xl font-bold text-yellow-400 md:text-3xl">
              Top 3 Leaderboard
            </h2>

          </div>

          {leaderboard.length ===
          0 ? (
            <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">

              <p className="text-gray-400">
                No scores available yet.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-yellow-500">

              <table className="min-w-full border-collapse">

                <thead>
                  <tr className="border-b border-yellow-500 bg-black text-yellow-400">

                    <th className="p-3 text-left text-sm">
                      Rank
                    </th>

                    <th className="p-3 text-left text-sm">
                      Player
                    </th>

                    <th className="p-3 text-center text-sm">
                      Total
                    </th>

                    <th className="p-3 text-center text-sm">
                      Result
                    </th>

                    <th className="p-3 text-center text-sm">
                      Exact
                    </th>

                    <th className="p-3 text-center text-sm">
                      FTTS
                    </th>

                    {activeCompetition.monthlyWinnerEnabled && (
                      <th className="p-3 text-center text-sm">
                        Bonus
                      </th>
                    )}

                  </tr>
                </thead>

                <tbody>

                  {leaderboard
                    .slice(0, 3)
                    .map(
                      (
                        entry
                      ) => (
                        <tr
                          key={
                            entry
                              .player
                              .id
                          }
                          className="border-b border-zinc-700 hover:bg-zinc-800"
                        >

                          <td className="whitespace-nowrap p-3 font-bold">
                            {entry.rank ===
                            1
                              ? "🥇"
                              : entry.rank ===
                                2
                              ? "🥈"
                              : "🥉"}
                          </td>

                          <td className="whitespace-nowrap p-3 font-semibold">
                            {
                              entry
                                .player
                                .displayName
                            }
                          </td>

                          <td className="p-3 text-center text-lg font-bold text-yellow-400">
                            {
                              entry.totalPoints
                            }
                          </td>

                          <td className="p-3 text-center">
                            {
                              entry.resultPoints
                            }
                          </td>

                          <td className="p-3 text-center">
                            {
                              entry.exactPoints
                            }
                          </td>

                          <td className="p-3 text-center">
                            {
                              entry.fttsPoints
                            }
                          </td>

                          {activeCompetition.monthlyWinnerEnabled && (
                            <td className="p-3 text-center">
                              {
                                entry.bonusPoints
                              }
                            </td>
                          )}

                        </tr>
                      )
                    )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* CONFIRMATION MODAL */}

        <ConfirmationModal
          isOpen={
            showConfirmation
          }
          playerName={
            playerName
          }
          round={`Round ${activeRound}`}
          predictions={predictions.filter(
            (prediction) =>
              prediction.scoreSelected
          )}
          badges={badges}
          onCancel={() =>
            setShowConfirmation(
              false
            )
          }
          onConfirm={
            confirmSubmission
          }
        />

      </div>
    </main>
  );
}