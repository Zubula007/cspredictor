"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCompetition } from "../context/CompetitionContext";
import fixtureRepository from "../repositories/fixtureRepository";
import predictionRepository from "../repositories/predictionRepository";
import playerRepository from "../repositories/playerRepository";
import authService from "../services/authService";
import badges from "../data/badges";

import type { Fixture } from "../types/fixture";
import type { Prediction } from "../types/prediction";

type MatchFilter =
  | "ALL"
  | "UPCOMING"
  | "LIVE"
  | "PREDICTIONS"
  | "RESULTS";

export default function MatchCentrePage() {
  const router = useRouter();

  const { activeCompetition } = useCompetition();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | "ALL">("ALL");
  const [filter, setFilter] = useState<MatchFilter>("ALL");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string | null>(
    null
  );
  const [loggedInPlayerName, setLoggedInPlayerName] = useState<string | null>(
    null
  );

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareIds, setSelectedShareIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedFixtures = (
  await fixtureRepository.getByCompetition(
    activeCompetition.id
  )
).sort((a, b) => { 
          if (a.round !== b.round) {
            return a.round - b.round;
          }

          return `${a.matchDate}${a.kickOff ?? ""}`.localeCompare(
            `${b.matchDate}${b.kickOff ?? ""}`
          );
        });

      setFixtures(loadedFixtures);

const loadedPredictions =
  await predictionRepository.getAll();

setPredictions(loadedPredictions);

const currentPlayer =
  authService.getCurrentPlayer();

      if (currentPlayer) {
        setLoggedInPlayerId(currentPlayer.id);
        setLoggedInPlayerName(currentPlayer.displayName);
      } else {
        setLoggedInPlayerId(null);
        setLoggedInPlayerName(null);
      }
    };

    loadData();
  }, [activeCompetition.id]);

  const isZweliLoggedIn =
    loggedInPlayerName?.trim().toLowerCase() === "zweli";

  const getPlayerName = (playerId: string) => {
    const player = playerRepository
      .getAll()
      .find((item) => item.id === playerId);

    return player?.displayName ?? playerId;
  };

  const rounds = useMemo(() => {
    return Array.from(
      new Set(
        fixtures
          .map((fixture) => fixture.round)
          .filter(
            (round): round is number => typeof round === "number"
          )
      )
    ).sort((a, b) => a - b);
  }, [fixtures]);

  const allMatchFixtures = useMemo(() => {
    return fixtures.filter((fixture) => {
      const roundMatches =
        selectedRound === "ALL" ||
        fixture.round === selectedRound;

      if (!roundMatches) {
        return false;
      }

      return fixture.status !== "Completed";
    });
  }, [fixtures, selectedRound]);

  const filteredFixtures = useMemo(() => {
    if (filter === "ALL") {
      return allMatchFixtures;
    }

    return allMatchFixtures.filter((fixture) => {
      if (filter === "UPCOMING") {
        return fixture.status === "Scheduled";
      }

      if (filter === "LIVE") {
        return fixture.status === "Live";
      }

      return true;
    });
  }, [allMatchFixtures, filter]);

  const resultsFixtures = useMemo(() => {
    return fixtures.filter((fixture) => {
      const roundMatches =
        selectedRound === "ALL" ||
        fixture.round === selectedRound;

      return roundMatches && fixture.status === "Completed";
    });
  }, [fixtures, selectedRound]);

  const predictionFixtures = useMemo(() => {
    return fixtures.filter((fixture) => {
      const roundMatches =
        selectedRound === "ALL" ||
        fixture.round === selectedRound;

      if (!roundMatches) {
        return false;
      }

      return predictions.some(
        (prediction) =>
          prediction.fixtureId === fixture.id
      );
    });
  }, [fixtures, predictions, selectedRound]);

  const upcomingFixtures = filteredFixtures.filter(
    (fixture) => fixture.status === "Scheduled"
  );

  const liveFixtures = filteredFixtures.filter(
    (fixture) => fixture.status === "Live"
  );

  const postponedFixtures = filteredFixtures.filter(
    (fixture) => fixture.status === "Postponed"
  );

  const cancelledFixtures = filteredFixtures.filter(
    (fixture) => fixture.status === "Cancelled"
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "Upcoming";

      case "Live":
        return "Live";

      case "Completed":
        return "Full Time";

      case "Postponed":
        return "Postponed";

      case "Cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-green-600 text-white";

      case "Live":
        return "bg-red-600 text-white";

      case "Completed":
        return "bg-blue-600 text-white";

      case "Postponed":
        return "bg-yellow-500 text-black";

      case "Cancelled":
        return "bg-gray-600 text-white";

      default:
        return "bg-zinc-700 text-white";
    }
  };

  const getOfficialFTTS = (fixture: Fixture) => {
    if (fixture.firstTeamToScore === "Home") {
      return fixture.homeTeam;
    }

    if (fixture.firstTeamToScore === "Away") {
      return fixture.awayTeam;
    }

    return "No Goal";
  };

  const getPredictionFTTS = (
    prediction: Prediction,
    fixture: Fixture
  ) => {
    if (prediction.firstTeamToScore === "Home") {
      return fixture.homeTeam;
    }

    if (prediction.firstTeamToScore === "Away") {
      return fixture.awayTeam;
    }

    return "No Goal";
  };

  const getPredictionPointsBreakdown = (
    prediction: Prediction
  ) => {
    const breakdown: string[] = [];

    if (prediction.correctResult) {
      breakdown.push("Result +3");
    }

    if (prediction.exactScore) {
      breakdown.push("Exact Score +2");
    }

    if (prediction.correctFTTS) {
      breakdown.push("FTTS +1");
    }

    return breakdown;
  };

  const predictionsForFixture = (fixtureId: string) => {
    return predictions.filter(
      (prediction) =>
        prediction.fixtureId === fixtureId
    );
  };

  const handleEditPrediction = (fixtureId: string) => {
    if (!loggedInPlayerId) {
      router.push("/login");
      return;
    }

    localStorage.setItem(
      "csp-edit-fixture",
      fixtureId
    );

    router.push("/");
  };

  const handleLogout = () => {
    authService.logout();

    setLoggedInPlayerId(null);
    setLoggedInPlayerName(null);

    router.push("/login");
  };

  /*
   * ---------------------------------------------------------
   * WHATSAPP SHARING
   * ---------------------------------------------------------
   */

  const shareableItems = useMemo(() => {
    if (filter === "PREDICTIONS") {
      return predictionFixtures;
    }

    if (filter === "RESULTS") {
      return resultsFixtures;
    }

    if (filter === "LIVE") {
      return liveFixtures;
    }

    if (filter === "UPCOMING") {
      return upcomingFixtures;
    }

    return [
      ...liveFixtures,
      ...upcomingFixtures,
      ...postponedFixtures,
      ...cancelledFixtures,
    ];
  }, [
    filter,
    predictionFixtures,
    resultsFixtures,
    liveFixtures,
    upcomingFixtures,
    postponedFixtures,
    cancelledFixtures,
  ]);

  const getShareItemLabel = (fixture: Fixture) => {
    return `${fixture.homeTeam} vs ${fixture.awayTeam}`;
  };

  const toggleShareSelection = (fixtureId: string) => {
    setSelectedShareIds((current) => {
      if (current.includes(fixtureId)) {
        return current.filter(
          (id) => id !== fixtureId
        );
      }

      return [...current, fixtureId];
    });
  };

  const selectAllShareItems = () => {
    setSelectedShareIds(
      shareableItems.map(
        (fixture) => fixture.id
      )
    );
  };

  const clearShareSelection = () => {
    setSelectedShareIds([]);
  };

  const getWhatsAppMessage = (
    selectedFixtures: Fixture[]
  ) => {
    const lines: string[] = [];

    lines.push(
      `CSPREDICTOR - ${activeCompetition.name}`
    );

    lines.push("");
    lines.push("CSP26 | SEASON ONE");
    lines.push("");
    lines.push(
      "=============================="
    );

    selectedFixtures.forEach(
      (fixture, index) => {
        lines.push("");

        lines.push(
          `${index + 1}. ${fixture.homeTeam} vs ${fixture.awayTeam}`
        );

        lines.push(
          `Date: ${fixture.displayDate}`
        );

        if (fixture.kickOff) {
          lines.push(
            `Kick-off: ${fixture.kickOff}`
          );
        }

        if (
          typeof fixture.round === "number"
        ) {
          lines.push(
            `Round: ${fixture.round}`
          );
        }

        /*
         * PREDICTIONS
         */
        if (filter === "PREDICTIONS") {
          const fixturePredictions =
            predictionsForFixture(
              fixture.id
            );

          lines.push("");
          lines.push("PREDICTIONS");

          if (
            fixturePredictions.length === 0
          ) {
            lines.push(
              "No predictions submitted."
            );
          } else {
            fixturePredictions.forEach(
              (prediction) => {
                const playerName =
                  getPlayerName(
                    prediction.playerId
                  );

                lines.push(
                  `${playerName}: ${prediction.homeScore} - ${prediction.awayScore}`
                );

                lines.push(
                  `FTTS: ${getPredictionFTTS(
                    prediction,
                    fixture
                  )}`
                );

                if (
                  fixture.status ===
                    "Completed" &&
                  prediction.scored === true
                ) {
                  lines.push(
                    `Points: ${
                      prediction.points ?? 0
                    }`
                  );
                }
              }
            );
          }

          lines.push("");

          lines.push(
            `Predictions: ${
              fixture.status === "Scheduled"
                ? "OPEN"
                : "LOCKED"
            }`
          );
        }

        /*
         * RESULTS
         */
        else if (
          fixture.status === "Completed"
        ) {
          lines.push("");
          lines.push("FULL TIME");

          lines.push(
            `${fixture.homeTeam} ${
              fixture.homeScore ?? 0
            } - ${
              fixture.awayScore ?? 0
            } ${fixture.awayTeam}`
          );

          lines.push("");

          lines.push(
            "First Team To Score"
          );

          lines.push(
            getOfficialFTTS(fixture)
          );

          lines.push("");

          lines.push(
            "Result published on CSPredictor."
          );
        }

        /*
         * LIVE
         */
        else if (
          fixture.status === "Live"
        ) {
          lines.push("");
          lines.push("LIVE MATCH");

          lines.push(
            `Score: ${
              fixture.homeScore ?? 0
            } - ${
              fixture.awayScore ?? 0
            }`
          );

          lines.push("");

          lines.push(
            "Live match update from CSPredictor."
          );
        }

        /*
         * POSTPONED
         */
        else if (
          fixture.status === "Postponed"
        ) {
          lines.push("");
          lines.push("MATCH POSTPONED");

          lines.push(
            "This fixture has been postponed."
          );
        }

        /*
         * CANCELLED
         */
        else if (
          fixture.status === "Cancelled"
        ) {
          lines.push("");
          lines.push("MATCH CANCELLED");

          lines.push(
            "This fixture has been cancelled."
          );
        }

        /*
         * UPCOMING
         */
        else {
          lines.push("");
          lines.push("UPCOMING MATCH");

          lines.push("");

          lines.push(
            `Predictions: ${
              fixture.status === "Scheduled"
                ? "OPEN"
                : "LOCKED"
            }`
          );

          lines.push(
            "Get your prediction in on CSPredictor."
          );
        }

        lines.push("");
        lines.push(
          "=============================="
        );
      }
    );

    lines.push("");
    lines.push(
      "Betway Championship Score Predictor"
    );
    lines.push("CSP26 | Season One");

    return lines.join("\n");
  };

  const handleWhatsAppShare = () => {
    if (!isZweliLoggedIn) {
      return;
    }

    const selectedFixtures =
      shareableItems.filter((fixture) =>
        selectedShareIds.includes(
          fixture.id
        )
      );

    if (
      selectedFixtures.length === 0
    ) {
      return;
    }

    const message =
      getWhatsAppMessage(
        selectedFixtures
      );

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setShowShareModal(false);
    setSelectedShareIds([]);
  };

  const openShareModal = () => {
    if (!isZweliLoggedIn) {
      return;
    }

    setSelectedShareIds([]);
    setShowShareModal(true);
  };

  /*
   * ---------------------------------------------------------
   * WHATSAPP SHARE MODAL
   * ---------------------------------------------------------
   */

  const ShareModal = () => {
    if (
      !showShareModal ||
      !isZweliLoggedIn
    ) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-green-500/50 bg-zinc-950 shadow-2xl">
          {/* Header */}
          <div className="border-b border-zinc-800 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  WhatsApp Sharing
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-yellow-400">
                  Select fixtures
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Select one or more fixtures to
                  share in a single WhatsApp message.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedShareIds([]);
                }}
                className="rounded-full bg-zinc-800 px-3 py-2 text-lg text-gray-300 transition hover:bg-red-600 hover:text-white"
                aria-label="Close sharing panel"
              >
                X
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
              <span className="text-sm font-semibold text-gray-400">
                Selected
              </span>

              <span className="text-lg font-extrabold text-yellow-400">
                {selectedShareIds.length}
              </span>
            </div>
          </div>

          {/* Fixture selection */}
          <div className="flex-1 overflow-y-auto p-5">
            {shareableItems.length === 0 ? (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-center">
                <p className="text-3xl">
                  No fixtures
                </p>

                <p className="mt-3 font-bold text-white">
                  Nothing available to share
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  There are no shareable fixtures
                  in this Match Centre tab.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shareableItems.map(
                  (fixture) => {
                    const selected =
                      selectedShareIds.includes(
                        fixture.id
                      );

                    const predictionCountForFixture =
                      predictionsForFixture(
                        fixture.id
                      ).length;

                    return (
                      <button
                        key={fixture.id}
                        type="button"
                        onClick={() =>
                          toggleShareSelection(
                            fixture.id
                          )
                        }
                        className={`relative w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/10"
                            : "border-zinc-700 bg-zinc-900 hover:border-yellow-500/50 hover:bg-zinc-800"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div
                          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-extrabold ${
                            selected
                              ? "border-yellow-400 bg-yellow-400 text-black"
                              : "border-zinc-600 bg-black text-gray-500"
                          }`}
                        >
                          {selected
                            ? "✓"
                            : ""}
                        </div>

                        {/* Round / status */}
                        <div className="flex items-center justify-between gap-2 pr-9">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            Round{" "}
                            {fixture.round}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                              getStatusClass(
                                fixture.status
                              )
                            }`}
                          >
                            {getStatusLabel(
                              fixture.status
                            )}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <div className="flex flex-col items-center">
                            {badges[
                              fixture.homeTeam
                            ] && (
                              <img
                                src={
                                  badges[
                                    fixture.homeTeam
                                  ]
                                }
                                alt={
                                  fixture.homeTeam
                                }
                                className="mb-2 h-14 w-14 object-contain"
                              />
                            )}

                            <p className="text-center text-xs font-bold text-white">
                              {
                                fixture.homeTeam
                              }
                            </p>
                          </div>

                          <div className="text-center">
                            {fixture.status ===
                              "Completed" ||
                            fixture.status ===
                              "Live" ? (
                              <div className="rounded-lg bg-black px-3 py-2">
                                <p className="text-lg font-extrabold text-yellow-400">
                                  {fixture.homeScore ??
                                    0}{" "}
                                  -{" "}
                                  {fixture.awayScore ??
                                    0}
                                </p>

                                <p className="mt-0.5 text-[9px] font-bold uppercase text-gray-500">
                                  {fixture.status ===
                                  "Live"
                                    ? "Live"
                                    : "FT"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm font-extrabold text-yellow-400">
                                VS
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-center">
                            {badges[
                              fixture.awayTeam
                            ] && (
                              <img
                                src={
                                  badges[
                                    fixture.awayTeam
                                  ]
                                }
                                alt={
                                  fixture.awayTeam
                                }
                                className="mb-2 h-14 w-14 object-contain"
                              />
                            )}

                            <p className="text-center text-xs font-bold text-white">
                              {
                                fixture.awayTeam
                              }
                            </p>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="mt-4 border-t border-zinc-800 pt-3 text-center">
                          <p className="text-xs text-gray-400">
                            {fixture.displayDate}
                            {fixture.kickOff
                              ? `  |  ${fixture.kickOff}`
                              : ""}
                          </p>

                          {filter ===
                            "PREDICTIONS" && (
                            <p className="mt-2 text-xs font-bold text-yellow-400">
                              {
                                predictionCountForFixture
                              }{" "}
                              prediction
                              {predictionCountForFixture ===
                              1
                                ? ""
                                : "s"}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={
                  selectAllShareItems
                }
                disabled={
                  shareableItems.length ===
                  0
                }
                className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={
                  clearShareSelection
                }
                disabled={
                  selectedShareIds.length ===
                  0
                }
                className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-bold text-gray-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              onClick={
                handleWhatsAppShare
              }
              disabled={
                selectedShareIds.length ===
                0
              }
              className="w-full rounded-xl bg-green-600 py-4 font-extrabold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Share{" "}
              {selectedShareIds.length > 0
                ? `${selectedShareIds.length} Fixture${
                    selectedShareIds.length ===
                    1
                      ? ""
                      : "s"
                  }`
                : "Selected"}{" "}
              to WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MATCH CARD
   * ---------------------------------------------------------
   */

  const MatchCard = ({
    fixture,
  }: {
    fixture: Fixture;
  }) => {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-black p-5 shadow-xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Round {fixture.round}
          </p>

          <p className="mt-2 text-sm text-gray-300">
            {fixture.displayDate}
          </p>

          {fixture.kickOff && (
            <p className="text-sm text-gray-300">
              {fixture.kickOff}
            </p>
          )}

          <div className="mt-3 flex justify-center">
            <span
              className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClass(
                fixture.status
              )}`}
            >
              {getStatusLabel(
                fixture.status
              )}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center">
            {badges[fixture.homeTeam] && (
              <img
                src={
                  badges[
                    fixture.homeTeam
                  ]
                }
                alt={fixture.homeTeam}
                className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
              />
            )}

            <p className="text-center text-sm font-bold text-white md:text-base">
              {fixture.homeTeam}
            </p>
          </div>

          <div className="text-center">
            {fixture.status ===
              "Completed" ||
            fixture.status === "Live" ? (
              <div className="rounded-xl bg-zinc-900 px-4 py-2">
                <p className="text-2xl font-extrabold text-yellow-400">
                  {fixture.homeScore ??
                    0}
                  {" - "}
                  {fixture.awayScore ??
                    0}
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-400">
                  {fixture.status ===
                  "Live"
                    ? "LIVE"
                    : "FULL TIME"}
                </p>
              </div>
            ) : (
              <span className="text-lg font-extrabold text-yellow-400 md:text-2xl">
                VS
              </span>
            )}
          </div>

          <div className="flex flex-col items-center">
            {badges[fixture.awayTeam] && (
              <img
                src={
                  badges[
                    fixture.awayTeam
                  ]
                }
                alt={fixture.awayTeam}
                className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
              />
            )}

            <p className="text-center text-sm font-bold text-white md:text-base">
              {fixture.awayTeam}
            </p>
          </div>
        </div>

        {fixture.status === "Live" && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
            <p className="text-sm font-extrabold text-red-400">
              LIVE MATCH
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {fixture.homeTeam}{" "}
              {fixture.homeScore ?? 0}{" "}
              -{" "}
              {fixture.awayScore ?? 0}{" "}
              {fixture.awayTeam}
            </p>
          </div>
        )}

        {fixture.status ===
          "Postponed" && (
          <div className="mt-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
            <p className="text-sm font-semibold text-yellow-300">
              Match postponed
            </p>
          </div>
        )}

        {fixture.status ===
          "Cancelled" && (
          <div className="mt-5 rounded-xl border border-gray-500/30 bg-gray-800/30 p-3 text-center">
            <p className="text-sm font-semibold text-gray-400">
              Match cancelled
            </p>
          </div>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * RESULT CARD
   * ---------------------------------------------------------
   */

  const ResultCard = ({
    fixture,
  }: {
    fixture: Fixture;
  }) => {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-black p-5 shadow-xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Round {fixture.round}
          </p>

          <p className="mt-2 text-sm text-gray-300">
            {fixture.displayDate}
          </p>

          <div className="mt-3">
            <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase text-white">
              Full Time
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center">
            {badges[fixture.homeTeam] && (
              <img
                src={
                  badges[
                    fixture.homeTeam
                  ]
                }
                alt={fixture.homeTeam}
                className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
              />
            )}

            <p className="text-center text-sm font-bold md:text-base">
              {fixture.homeTeam}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900 px-5 py-3 text-center">
            <p className="text-3xl font-extrabold text-yellow-400">
              {fixture.homeScore ??
                0}
              {" - "}
              {fixture.awayScore ??
                0}
            </p>

            <p className="mt-1 text-xs font-semibold text-gray-400">
              FINAL SCORE
            </p>
          </div>

          <div className="flex flex-col items-center">
            {badges[fixture.awayTeam] && (
              <img
                src={
                  badges[
                    fixture.awayTeam
                  ]
                }
                alt={fixture.awayTeam}
                className="mb-3 h-16 w-16 object-contain md:h-20 md:w-20"
              />
            )}

            <p className="text-center text-sm font-bold md:text-base">
              {fixture.awayTeam}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-blue-500/20 pt-5">
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              First Team To Score
            </p>

            <p className="mt-2 font-bold text-blue-300">
              {getOfficialFTTS(
                fixture
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * PREDICTION CARD
   * ---------------------------------------------------------
   */

  const PredictionCard = ({
    fixture,
    prediction,
  }: {
    fixture: Fixture;
    prediction: Prediction;
  }) => {
    const isOwnPrediction =
      loggedInPlayerId ===
      prediction.playerId;

    const hasPublishedResult =
      fixture.status ===
        "Completed" &&
      prediction.scored === true;

    const breakdown =
      getPredictionPointsBreakdown(
        prediction
      );

    const displayPlayerName =
      isOwnPrediction
        ? loggedInPlayerName ??
          getPlayerName(
            prediction.playerId
          )
        : getPlayerName(
            prediction.playerId
          );

    return (
      <div
        className={`rounded-2xl border bg-black p-5 shadow-xl ${
          isOwnPrediction
            ? "border-yellow-400"
            : "border-zinc-700"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Player Prediction
            </p>

            <h3 className="mt-1 text-xl font-extrabold text-yellow-400">
              {displayPlayerName}
            </h3>
          </div>

          {isOwnPrediction ? (
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-black">
              YOUR PREDICTION
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-gray-300">
              VIEW ONLY
            </span>
          )}
        </div>

        <div className="mt-5 rounded-xl bg-zinc-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center">
              <p className="text-sm font-bold">
                {fixture.homeTeam}
              </p>
            </div>

            <div className="rounded-lg bg-black px-4 py-2">
              <p className="text-2xl font-extrabold text-yellow-400">
                {prediction.homeScore}
                {" - "}
                {prediction.awayScore}
              </p>
            </div>

            <div className="flex-1 text-center">
              <p className="text-sm font-bold">
                {fixture.awayTeam}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-zinc-700 pt-3 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              First Team To Score
            </p>

            <p className="mt-1 font-bold text-yellow-300">
              {getPredictionFTTS(
                prediction,
                fixture
              )}
            </p>
          </div>
        </div>

        {hasPublishedResult && (
          <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-300">
              Official Result
            </p>

            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="text-sm font-bold">
                {fixture.homeTeam}
              </span>

              <span className="rounded-lg bg-black px-4 py-2 text-xl font-extrabold text-blue-300">
                {fixture.homeScore ??
                  0}
                {" - "}
                {fixture.awayScore ??
                  0}
              </span>

              <span className="text-sm font-bold">
                {fixture.awayTeam}
              </span>
            </div>

            <div className="mt-4 border-t border-blue-500/20 pt-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                First Team To Score
              </p>

              <p className="mt-1 font-bold text-blue-300">
                {getOfficialFTTS(
                  fixture
                )}
              </p>
            </div>
          </div>
        )}

        {hasPublishedResult && (
          <div className="mt-5 rounded-xl border border-green-500/40 bg-green-950/20 p-4">
            <p className="text-center text-xs uppercase tracking-widest text-gray-400">
              Points Earned
            </p>

            <p className="mt-2 text-center text-3xl font-extrabold text-green-400">
              {prediction.points ??
                0}{" "}
              Points
            </p>

            {breakdown.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {breakdown.map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-green-300"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            )}

            {breakdown.length ===
              0 && (
              <p className="mt-2 text-center text-xs text-gray-500">
                No points earned
              </p>
            )}
          </div>
        )}

        <div className="mt-5">
          {isOwnPrediction &&
          fixture.status !==
            "Completed" &&
          fixture.status !== "Live" &&
          fixture.status !==
            "Postponed" &&
          fixture.status !==
            "Cancelled" ? (
            <button
              type="button"
              onClick={() =>
                handleEditPrediction(
                  fixture.id
                )
              }
              className="w-full rounded-xl bg-yellow-400 py-3 font-extrabold text-black transition hover:bg-yellow-300"
            >
              Edit Prediction
            </button>
          ) : (
            <div className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-center">
              <span className="text-sm font-semibold text-gray-400">
                {isOwnPrediction
                  ? fixture.status ===
                    "Completed"
                    ? "Prediction Locked - Match Completed"
                    : fixture.status ===
                      "Live"
                    ? "Prediction Locked - Match Live"
                    : "Prediction Locked"
                  : "View Only"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const predictionCount =
    predictionFixtures.reduce(
      (total, fixture) =>
        total +
        predictionsForFixture(
          fixture.id
        ).length,
      0
    );

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            Match Centre
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-5xl">
            {activeCompetition.name}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
            Fixtures, predictions, live matches and
            official results - all in one place.
          </p>
        </div>

        {/* Round selector */}
        {rounds.length > 0 && (
          <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Round
              </span>

              <select
                value={selectedRound}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSelectedRound(
                    value === "ALL"
                      ? "ALL"
                      : Number(value)
                  );
                }}
                className="rounded-xl border border-yellow-500 bg-black px-5 py-3 text-sm font-bold text-yellow-400 outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="ALL">
                  All Rounds
                </option>

                {rounds.map(
                  (round) => (
                    <option
                      key={round}
                      value={round}
                    >
                      Round {round}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {(
            [
              ["ALL", "All Matches"],
              ["UPCOMING", "Upcoming"],
              ["LIVE", "Live"],
              ["PREDICTIONS", "Predictions"],
              ["RESULTS", "Results"],
            ] as const
          ).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(value)
                }
                className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                  filter === value
                    ? "bg-yellow-400 text-black shadow-lg"
                    : "bg-zinc-900 text-white hover:bg-yellow-500 hover:text-black"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* CENTRAL WHATSAPP BUTTON - ZWELI ONLY */}
        {isZweliLoggedIn && (
          <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  WhatsApp Sharing
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  Select multiple fixtures and
                  share them in one clean message.
                </p>
              </div>

              <button
                type="button"
                onClick={openShareModal}
                className="w-full rounded-xl bg-green-600 px-6 py-3 font-extrabold text-white transition hover:bg-green-500 md:w-auto"
              >
                Share to WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Logged in player */}
        {loggedInPlayerId && (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-yellow-300">
              Logged In
            </p>

            <p className="mt-1 text-lg font-extrabold text-yellow-400">
              {loggedInPlayerName}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your predictions are editable while
              fixtures remain unlocked.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 rounded-xl border border-red-500/40 bg-red-600/10 px-5 py-3 text-sm font-extrabold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              Logout / Switch Player
            </button>
          </div>
        )}

        {/* Statistics */}
        {filter !== "PREDICTIONS" &&
          filter !== "RESULTS" && (
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-center">
                <p className="text-xs uppercase text-gray-400">
                  Matches
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {filteredFixtures.length}
                </p>
              </div>

              <div className="rounded-xl border border-green-700 bg-green-900/20 p-4 text-center">
                <p className="text-xs uppercase text-green-300">
                  Upcoming
                </p>

                <p className="mt-2 text-2xl font-bold text-green-400">
                  {upcomingFixtures.length}
                </p>
              </div>

              <div className="rounded-xl border border-red-700 bg-red-900/20 p-4 text-center">
                <p className="text-xs uppercase text-red-300">
                  Live
                </p>

                <p className="mt-2 text-2xl font-bold text-red-400">
                  {liveFixtures.length}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-700 bg-yellow-900/20 p-4 text-center">
                <p className="text-xs uppercase text-yellow-300">
                  Predictions
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {predictionCount}
                </p>
              </div>
            </div>
          )}

        {/* Predictions */}
        {filter === "PREDICTIONS" ? (
          predictionFixtures.length ===
          0 ? (
            <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-10 text-center">
              <p className="text-4xl">
                🎯
              </p>

              <h2 className="mt-4 text-xl font-bold text-yellow-400">
                No Predictions Available
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                No player predictions have been
                submitted for the selected round.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {predictionFixtures.map(
                (fixture) => {
                  const fixturePredictions =
                    predictionsForFixture(
                      fixture.id
                    );

                  return (
                    <section
                      key={fixture.id}
                    >
                      <div className="mb-5 rounded-2xl border border-yellow-500 bg-gradient-to-r from-yellow-500/10 via-zinc-900 to-yellow-500/10 p-5">
                        <div className="text-center">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Round{" "}
                            {fixture.round}
                          </p>

                          <h2 className="mt-2 text-2xl font-extrabold text-yellow-400">
                            {fixture.homeTeam}

                            <span className="mx-3 text-gray-500">
                              vs
                            </span>

                            {fixture.awayTeam}
                          </h2>

                          <p className="mt-2 text-sm text-gray-400">
                            {fixture.displayDate}

                            {fixture.kickOff &&
                              `  |  ${fixture.kickOff}`}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {fixturePredictions.map(
                          (
                            prediction
                          ) => (
                            <PredictionCard
                              key={
                                prediction.id
                              }
                              fixture={
                                fixture
                              }
                              prediction={
                                prediction
                              }
                            />
                          )
                        )}
                      </div>
                    </section>
                  );
                }
              )}
            </div>
          )
        ) : filter === "RESULTS" ? (
          resultsFixtures.length ===
          0 ? (
            <div className="rounded-2xl border border-blue-500 bg-zinc-900 p-10 text-center">
              <p className="text-4xl">
                ✅
              </p>

              <h2 className="mt-4 text-xl font-bold text-blue-400">
                No Results Available
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                There are currently no published
                results for the selected round.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {resultsFixtures.map(
                (fixture) => (
                  <ResultCard
                    key={fixture.id}
                    fixture={fixture}
                  />
                )
              )}
            </div>
          )
        ) : filteredFixtures.length ===
          0 ? (
          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-10 text-center">
            <p className="text-4xl">
              ⚽
            </p>

            <h2 className="mt-4 text-xl font-bold text-yellow-400">
              No Matches Available
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              There are currently no matches
              matching your selection.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Live */}
            {liveFixtures.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-2xl">
                    🔴
                  </span>

                  <h2 className="text-2xl font-extrabold text-red-400">
                    Live Matches
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {liveFixtures.map(
                    (fixture) => (
                      <MatchCard
                        key={fixture.id}
                        fixture={fixture}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcomingFixtures.length >
              0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-2xl">
                    🟢
                  </span>

                  <h2 className="text-2xl font-extrabold text-green-400">
                    Upcoming Matches
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {upcomingFixtures.map(
                    (fixture) => (
                      <MatchCard
                        key={fixture.id}
                        fixture={fixture}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* Postponed */}
            {postponedFixtures.length >
              0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-2xl">
                    🟡
                  </span>

                  <h2 className="text-2xl font-extrabold text-yellow-400">
                    Postponed
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {postponedFixtures.map(
                    (fixture) => (
                      <MatchCard
                        key={fixture.id}
                        fixture={fixture}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* Cancelled */}
            {cancelledFixtures.length >
              0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-2xl">
                    ⚫
                  </span>

                  <h2 className="text-2xl font-extrabold text-gray-400">
                    Cancelled
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {cancelledFixtures.map(
                    (fixture) => (
                      <MatchCard
                        key={fixture.id}
                        fixture={fixture}
                      />
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <ShareModal />
    </main>
  );
}


