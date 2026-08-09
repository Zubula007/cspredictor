"use client";

import { useEffect, useState } from "react";

import { useCompetition } from "../../context/CompetitionContext";
import { type CompetitionId } from "../../lib/enums";

import pslImportRepository from "../../repositories/pslImportRepository";
import pslService from "../../services/pslService";
import pslApprovalService from "../../services/pslApprovalService";

import type { PSLImport } from "../../types/pslImport";

type ImportType = "Fixture" | "Result";

type EditForm = {
  round: string;
  matchDate: string;
  kickOff: string;
  displayDate: string;
  homeTeam: string;
  awayTeam: string;
  status:
    | "Scheduled"
    | "Postponed"
    | "Live"
    | "Completed"
    | "Cancelled";
  homeScore: string;
  awayScore: string;
  firstTeamToScore: "Home" | "Away" | "None";
};

const PSL_SOURCE_URL =
  "https://www.psl.co.za/tournament/betway-premiership";

export default function PSLImportPage() {
  const { activeCompetition } = useCompetition();

  const [imports, setImports] = useState<PSLImport[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [importType, setImportType] =
    useState<ImportType>("Fixture");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm | null>(null);

  const competitionId =
    activeCompetition.id as CompetitionId;

  const loadStoredImports = () => {
    const stored =
      pslImportRepository.getAll();

    setImports(stored);
  };

  useEffect(() => {
    loadStoredImports();
  }, [activeCompetition.id]);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const matches =
        importType === "Fixture"
          ? await pslService.fetchFixtures(
              competitionId
            )
          : await pslService.fetchResults(
              competitionId
            );

      if (matches.length === 0) {
        setMessage(
          `No ${importType.toLowerCase()} information was found for ${activeCompetition.name}.`
        );

        return;
      }

      pslImportRepository.addMany(matches);

      loadStoredImports();

      setMessage(
        `${matches.length} ${importType.toLowerCase()}${
          matches.length === 1 ? "" : "s"
        } imported from PSL and placed in Pending review.`
      );
    } catch (err) {
      console.error(
        "PSL import failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to import PSL information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setError(null);
    setMessage(null);

    const importItem =
      pslImportRepository.getById(id);

    if (!importItem) {
      setError(
        "Unable to find the PSL import."
      );

      return;
    }

    try {
      pslApprovalService.approveImport(
        importItem
      );

      const updated =
        pslImportRepository.approve(
          id,
          "Zweli"
        );

      if (!updated) {
        setError(
          "Fixture was created, but the PSL import could not be marked as approved."
        );

        return;
      }

      loadStoredImports();

      setMessage(
        "PSL item approved and added to CSPredictor successfully."
      );
    } catch (err) {
      console.error(
        "PSL approval failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve PSL information."
      );
    }
  };

  const handleReject = (id: string) => {
    setError(null);
    setMessage(null);

    const updated =
      pslImportRepository.reject(
        id,
        "Zweli",
        "Rejected by admin."
      );

    if (updated) {
      loadStoredImports();

      setMessage(
        "PSL item rejected."
      );
    } else {
      setError(
        "Unable to reject the PSL item."
      );
    }
  };

  const startAmend = (item: PSLImport) => {
    setError(null);
    setMessage(null);

    setEditingId(item.id);

    setEditForm({
      round: String(item.round),
      matchDate: item.matchDate,
      kickOff: item.kickOff,
      displayDate: item.displayDate,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      status: item.status,
      homeScore:
        item.homeScore !== undefined
          ? String(item.homeScore)
          : "",
      awayScore:
        item.awayScore !== undefined
          ? String(item.awayScore)
          : "",
      firstTeamToScore:
        item.firstTeamToScore ?? "None",
    });
  };

  const cancelAmend = () => {
    setEditingId(null);
    setEditForm(null);
    setError(null);
  };

  const saveAmendment = () => {
    if (!editingId || !editForm) {
      return;
    }

    setError(null);
    setMessage(null);

    if (
      !editForm.round.trim() ||
      !editForm.matchDate ||
      !editForm.homeTeam.trim() ||
      !editForm.awayTeam.trim()
    ) {
      setError(
        "Please complete the round, date, home team and away team."
      );

      return;
    }

    const parsedRound =
      Number(editForm.round);

    if (
      Number.isNaN(parsedRound) ||
      parsedRound < 1
    ) {
      setError(
        "Round must be a valid number greater than zero."
      );

      return;
    }

    const homeScore =
      editForm.homeScore.trim() === ""
        ? undefined
        : Number(editForm.homeScore);

    const awayScore =
      editForm.awayScore.trim() === ""
        ? undefined
        : Number(editForm.awayScore);

    if (
      homeScore !== undefined &&
      (Number.isNaN(homeScore) ||
        homeScore < 0)
    ) {
      setError(
        "Home score must be a valid number greater than or equal to zero."
      );

      return;
    }

    if (
      awayScore !== undefined &&
      (Number.isNaN(awayScore) ||
        awayScore < 0)
    ) {
      setError(
        "Away score must be a valid number greater than or equal to zero."
      );

      return;
    }

    const updated =
      pslImportRepository.update(
        editingId,
        {
          round: parsedRound,
          matchDate:
            editForm.matchDate,
          kickOff:
            editForm.kickOff.trim(),
          displayDate:
            editForm.displayDate.trim(),
          homeTeam:
            editForm.homeTeam.trim(),
          awayTeam:
            editForm.awayTeam.trim(),
          status:
            editForm.status,
          homeScore,
          awayScore,
          firstTeamToScore:
            editForm.firstTeamToScore,

          reviewStatus: "Pending",
          reviewedAt: undefined,
          reviewedBy: undefined,
          rejectionReason: undefined,
        }
      );

    if (!updated) {
      setError(
        "Unable to save the amendment."
      );

      return;
    }

    loadStoredImports();

    setEditingId(null);
    setEditForm(null);

    setMessage(
      "PSL information amended successfully. It remains Pending until approved."
    );
  };

  const updateEditField = <
    K extends keyof EditForm
  >(
    field: K,
    value: EditForm[K]
  ) => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  };

  const pendingImports =
    imports.filter(
      (item) =>
        item.reviewStatus === "Pending"
    );

  const approvedImports =
    imports.filter(
      (item) =>
        item.reviewStatus === "Approved"
    );

  const rejectedImports =
    imports.filter(
      (item) =>
        item.reviewStatus === "Rejected"
    );

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
            PSL Data Import
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-yellow-400 md:text-5xl">
            PSL Import Centre
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
            Import fixtures and results from the PSL
            for admin verification before anything is
            made public.
          </p>

          <div className="mt-4 inline-flex rounded-full border border-yellow-500/40 bg-yellow-500/10 px-5 py-2">
            <span className="text-sm font-bold text-yellow-300">
              Competition:{" "}
              {activeCompetition.name}
            </span>
          </div>

          <div className="mt-3">
            <a
              href={PSL_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-green-400 underline hover:text-green-300"
            >
              Verify information on official PSL
              website ↗
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
            <p className="font-bold text-red-400">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center">
            <p className="font-bold text-green-400">
              {message}
            </p>
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Import from PSL
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-white">
              Retrieve Official Information
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Imported information is never published
              automatically. Every item enters the
              Pending queue for admin review.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold text-gray-300">
                Information Type
              </label>

              <select
                value={importType}
                onChange={(event) =>
                  setImportType(
                    event.target.value as ImportType
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 font-bold text-white outline-none focus:border-yellow-400"
              >
                <option value="Fixture">
                  Fixtures
                </option>

                <option value="Result">
                  Results
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="rounded-xl bg-yellow-400 px-6 py-3 font-extrabold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Importing..."
                : `Import ${importType}s from PSL`}
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
            <p className="text-xs font-bold uppercase text-yellow-300">
              Pending
            </p>

            <p className="mt-2 text-2xl font-extrabold text-yellow-400">
              {pendingImports.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
            <p className="text-xs font-bold uppercase text-green-300">
              Approved
            </p>

            <p className="mt-2 text-2xl font-extrabold text-green-400">
              {approvedImports.length}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-xs font-bold uppercase text-red-300">
              Rejected
            </p>

            <p className="mt-2 text-2xl font-extrabold text-red-400">
              {rejectedImports.length}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                Admin Review Queue
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Pending PSL Information
              </h2>
            </div>

            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-black">
              {pendingImports.length} Pending
            </span>
          </div>

          {pendingImports.length === 0 ? (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-10 text-center">
              <p className="text-4xl">
                📭
              </p>

              <h3 className="mt-4 text-xl font-bold text-white">
                Nothing Pending
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Import PSL fixtures or results above
                and they will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pendingImports.map((item) => {
                const isEditing =
                  editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-yellow-500/40 bg-zinc-900 p-5 shadow-xl"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-black">
                        PENDING
                      </span>

                      <span className="text-xs font-semibold text-gray-500">
                        {item.importType}
                      </span>
                    </div>

                    {!isEditing ? (
                      <>
                        <div className="mt-5 text-center">
                          <p className="text-xs uppercase tracking-widest text-gray-500">
                            Round {item.round}
                          </p>

                          <h3 className="mt-3 text-lg font-extrabold text-white">
                            {item.homeTeam}
                          </h3>

                          <p className="my-2 text-sm font-bold text-yellow-400">
                            VS
                          </p>

                          <h3 className="text-lg font-extrabold text-white">
                            {item.awayTeam}
                          </h3>
                        </div>

                        <div className="mt-5 rounded-xl bg-black p-4 text-center">
                          <p className="text-sm text-gray-300">
                            📅 {item.displayDate}
                          </p>

                          {item.kickOff && (
                            <p className="mt-1 text-sm text-gray-400">
                              🕒 {item.kickOff}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-500">
                            Status: {item.status}
                          </p>

                          {item.importType ===
                            "Result" && (
                            <p className="mt-3 text-2xl font-extrabold text-yellow-400">
                              {item.homeScore ?? 0}{" "}
                              -{" "}
                              {item.awayScore ?? 0}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startAmend(item)
                            }
                            className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 py-3 text-sm font-extrabold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
                          >
                            ✏️ Amend
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(item.id)
                            }
                            className="rounded-xl bg-green-600 py-3 text-sm font-extrabold text-white transition hover:bg-green-500"
                          >
                            ✓ Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(item.id)
                            }
                            className="rounded-xl bg-red-600 py-3 text-sm font-extrabold text-white transition hover:bg-red-500"
                          >
                            ✕ Reject
                          </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-gray-500">
                          Imported from PSL
                        </p>
                      </>
                    ) : (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                            Amend Before Approval
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Changes will remain Pending.
                          </p>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Round
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              editForm?.round ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "round",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Match Date
                          </label>

                          <input
                            type="date"
                            value={
                              editForm?.matchDate ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "matchDate",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Kick-off
                          </label>

                          <input
                            type="text"
                            value={
                              editForm?.kickOff ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "kickOff",
                                event.target.value
                              )
                            }
                            placeholder="e.g. 19:30"
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Display Date
                          </label>

                          <input
                            type="text"
                            value={
                              editForm?.displayDate ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "displayDate",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Saturday, 15 August 2026"
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Home Team
                          </label>

                          <input
                            type="text"
                            value={
                              editForm?.homeTeam ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "homeTeam",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Away Team
                          </label>

                          <input
                            type="text"
                            value={
                              editForm?.awayTeam ?? ""
                            }
                            onChange={(event) =>
                              updateEditField(
                                "awayTeam",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-gray-400">
                            Status
                          </label>

                          <select
                            value={
                              editForm?.status ??
                              "Scheduled"
                            }
                            onChange={(event) =>
                              updateEditField(
                                "status",
                                event.target.value as EditForm["status"]
                              )
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm font-bold text-white outline-none focus:border-yellow-400"
                          >
                            <option value="Scheduled">
                              Scheduled
                            </option>

                            <option value="Postponed">
                              Postponed
                            </option>

                            <option value="Live">
                              Live
                            </option>

                            <option value="Completed">
                              Completed
                            </option>

                            <option value="Cancelled">
                              Cancelled
                            </option>
                          </select>
                        </div>

                        {item.importType ===
                          "Result" && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs font-bold text-gray-400">
                                  Home Score
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    editForm?.homeScore ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    updateEditField(
                                      "homeScore",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-bold text-gray-400">
                                  Away Score
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    editForm?.awayScore ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    updateEditField(
                                      "awayScore",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-400">
                                First Team To Score
                              </label>

                              <select
                                value={
                                  editForm?.firstTeamToScore ??
                                  "None"
                                }
                                onChange={(event) =>
                                  updateEditField(
                                    "firstTeamToScore",
                                    event.target.value as EditForm["firstTeamToScore"]
                                  )
                                }
                                className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm font-bold text-white outline-none focus:border-yellow-400"
                              >
                                <option value="Home">
                                  Home
                                </option>

                                <option value="Away">
                                  Away
                                </option>

                                <option value="None">
                                  No Goal
                                </option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            onClick={saveAmendment}
                            className="rounded-xl bg-yellow-400 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-300"
                          >
                            💾 Save Amendment
                          </button>

                          <button
                            type="button"
                            onClick={cancelAmend}
                            className="rounded-xl border border-zinc-600 bg-zinc-800 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}