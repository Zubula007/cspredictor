"use client";

import { useEffect, useMemo, useState } from "react";

import fixtureRepository from "../../repositories/fixtureRepository";
import { useCompetition } from "../../context/CompetitionContext";

import type { CompetitionId } from "../../lib/enums";
import type { Fixture } from "../../types/fixture";

import teams from "../../data/teams";

type FixtureStatus =
  | "Scheduled"
  | "Postponed"
  | "Live"
  | "Completed"
  | "Cancelled";

type FixtureForm = {
  competitionId: CompetitionId;
  round: string;
  matchDate: string;
  kickOff: string;
  homeTeam: string;
  awayTeam: string;
  status: FixtureStatus;
};

const emptyForm = (
  competitionId: CompetitionId
): FixtureForm => ({
  competitionId,
  round: "1",
  matchDate: "",
  kickOff: "",
  homeTeam: "",
  awayTeam: "",
  status: "Scheduled",
});

/*
 * Supabase may return matchDate as:
 *
 * 2026-08-14
 *
 * or:
 *
 * 2026-08-14T00:00:00+00:00
 *
 * The HTML date input only accepts:
 *
 * YYYY-MM-DD
 */
const normalizeDateForInput = (
  value: string | null | undefined
): string => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

/*
 * Display date consistently throughout
 * the Manage Fixtures page.
 */
const formatDisplayDate = (
  value: string | null | undefined
): string => {
  const normalized =
    normalizeDateForInput(value);

  if (!normalized) {
    return "Date not set";
  }

  const date = new Date(
    `${normalized}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

export default function ManageFixturesPage() {
  const {
    activeCompetition,
    competitions,
  } = useCompetition();

  const [fixtures, setFixtures] =
    useState<Fixture[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingFixtureId, setEditingFixtureId] =
    useState<string | null>(null);

  const [selectedCompetitionId, setSelectedCompetitionId] =
    useState<CompetitionId>(
      activeCompetition.id as CompetitionId
    );

  const [selectedRound, setSelectedRound] =
    useState<string>("all");

  const [form, setForm] =
    useState<FixtureForm>(
      emptyForm(
        activeCompetition.id as CompetitionId
      )
    );

  /*
   * LOAD FIXTURES
   */
  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await fixtureRepository.getAll();

      setFixtures(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fixtures."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  /*
   * KEEP SELECTED COMPETITION
   * ALIGNED WITH ACTIVE COMPETITION
   */
  useEffect(() => {
    const competitionId =
      activeCompetition.id as CompetitionId;

    setSelectedCompetitionId(
      competitionId
    );

    setSelectedRound("all");

    /*
     * Don't wipe the form while editing.
     */
    if (!editingFixtureId) {
      setForm(
        emptyForm(competitionId)
      );
    }
  }, [
    activeCompetition.id,
    editingFixtureId,
  ]);

  /*
   * FILTER FIXTURES BY COMPETITION
   */
  const competitionFixtures =
    useMemo(() => {
      return fixtures
        .filter(
          (fixture) =>
            fixture.competitionId ===
            selectedCompetitionId
        )
        .sort((a, b) => {
          const dateA =
            `${normalizeDateForInput(
              a.matchDate
            )} ${a.kickOff}`;

          const dateB =
            `${normalizeDateForInput(
              b.matchDate
            )} ${b.kickOff}`;

          return dateA.localeCompare(
            dateB
          );
        });
    }, [
      fixtures,
      selectedCompetitionId,
    ]);

  /*
   * AVAILABLE ROUNDS
   */
  const availableRounds =
    useMemo(() => {
      return Array.from(
        new Set(
          competitionFixtures
            .map(
              (fixture) =>
                fixture.round
            )
            .filter(
              (round): round is number =>
                typeof round ===
                "number"
            )
        )
      ).sort(
        (a, b) => a - b
      );
    }, [
      competitionFixtures,
    ]);

  /*
   * FILTER BY ROUND
   */
  const displayedFixtures =
    useMemo(() => {
      if (
        selectedRound ===
        "all"
      ) {
        return competitionFixtures;
      }

      return competitionFixtures.filter(
        (fixture) =>
          fixture.round ===
          Number(
            selectedRound
          )
      );
    }, [
      competitionFixtures,
      selectedRound,
    ]);

  /*
   * CURRENT COMPETITION
   */
  const selectedCompetition =
    competitions.find(
      (competition) =>
        competition.id ===
        selectedCompetitionId
    );

  /*
   * RESET FORM
   */
  const resetForm = () => {
    setForm(
      emptyForm(
        selectedCompetitionId
      )
    );

    setEditingFixtureId(null);
    setShowForm(false);
  };

  /*
   * SUCCESS MESSAGE
   */
  const showSuccess = (
    text: string
  ) => {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  /*
   * ADD FIXTURE
   */
  const handleAddFixture = () => {
    setEditingFixtureId(null);

    setForm(
      emptyForm(
        selectedCompetitionId
      )
    );

    setShowForm(true);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * EDIT FIXTURE
   */
  const handleEditFixture = (
    fixture: Fixture
  ) => {
    setEditingFixtureId(
      fixture.id
    );

    setForm({
      competitionId:
        fixture.competitionId,

      round:
        String(
          fixture.round
        ),

      /*
       * IMPORTANT:
       * Convert Supabase timestamp
       * into YYYY-MM-DD for
       * the date input.
       */
      matchDate:
        normalizeDateForInput(
          fixture.matchDate
        ),

      kickOff:
        fixture.kickOff,

      homeTeam:
        fixture.homeTeam,

      awayTeam:
        fixture.awayTeam,

      status:
        fixture.status,
    });

    setShowForm(true);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * SAVE FIXTURE
   */
  const handleSaveFixture = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const round =
      Number(form.round);

    if (
      !Number.isInteger(
        round
      ) ||
      round < 1
    ) {
      setError(
        "Round must be a whole number greater than 0."
      );

      return;
    }

    if (
      !form.matchDate
    ) {
      setError(
        "Please select a match date."
      );

      return;
    }

    if (
      !form.kickOff
    ) {
      setError(
        "Please select a kick-off time."
      );

      return;
    }

    if (
      !form.homeTeam ||
      !form.awayTeam
    ) {
      setError(
        "Please select both teams."
      );

      return;
    }

    if (
      form.homeTeam ===
      form.awayTeam
    ) {
      setError(
        "Home and away teams cannot be the same."
      );

      return;
    }

    try {
      /*
       * EDIT EXISTING FIXTURE
       */
      if (
        editingFixtureId
      ) {
        const updated =
          await fixtureRepository.updateFixture(
            editingFixtureId,
            {
              competitionId:
                form.competitionId,

              round,

              /*
               * Always send YYYY-MM-DD.
               */
              matchDate:
                normalizeDateForInput(
                  form.matchDate
                ),

              kickOff:
                form.kickOff,

              homeTeam:
                form.homeTeam,

              awayTeam:
                form.awayTeam,

              status:
                form.status,
            }
          );

        if (!updated) {
          throw new Error(
            "Fixture could not be updated."
          );
        }

        await loadFixtures();

        resetForm();

        showSuccess(
          "✅ Fixture updated successfully."
        );

        return;
      }

      /*
       * CREATE NEW FIXTURE
       */
      const newFixture: Fixture = {
        id:
          crypto.randomUUID(),

        competitionId:
          form.competitionId,

        round,

        streak: 0,

        matchDate:
          normalizeDateForInput(
            form.matchDate
          ),

        kickOff:
          form.kickOff,

        displayDate:
          formatDisplayDate(
            form.matchDate
          ),

        homeTeam:
          form.homeTeam,

        awayTeam:
          form.awayTeam,

        status:
          form.status,

        published: false,
      };

      await fixtureRepository.addFixture(
        newFixture
      );

      await loadFixtures();

      resetForm();

      showSuccess(
        "✅ Fixture added successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save fixture."
      );
    }
  };

  /*
   * DELETE FIXTURE
   */
  const handleDeleteFixture = async (
    fixture: Fixture
  ) => {
    const confirmed =
      window.confirm(
        `Delete fixture?\n\n${fixture.homeTeam} vs ${fixture.awayTeam}\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const deleted =
        await fixtureRepository.deleteFixture(
          fixture.id
        );

      if (!deleted) {
        throw new Error(
          "Fixture could not be deleted."
        );
      }

      await loadFixtures();

      if (
        editingFixtureId ===
        fixture.id
      ) {
        resetForm();
      }

      showSuccess(
        "✅ Fixture deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete fixture."
      );
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-black text-yellow-400 md:text-5xl">
            📅 Manage Fixtures
          </h1>

          <p className="mt-3 text-gray-400">
            Manually create and manage CSPredictor fixtures.
          </p>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-xl border border-green-600 bg-green-900/20 p-4 text-center font-semibold text-green-400">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-600 bg-red-900/20 p-4 text-center font-semibold text-red-400">
            ❌ {error}
          </div>
        )}

        {/* FILTERS */}

        <section className="mb-8 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-5 shadow-xl md:p-8">

          <div className="grid gap-5 md:grid-cols-3">

            {/* COMPETITION */}

            <div>

              <label
                htmlFor="fixture-competition"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Competition
              </label>

              <select
                id="fixture-competition"
                value={
                  selectedCompetitionId
                }
                onChange={(event) => {
                  const value =
                    event.target
                      .value as CompetitionId;

                  setSelectedCompetitionId(
                    value
                  );

                  setSelectedRound(
                    "all"
                  );
                }}
                className="w-full rounded-xl border-2 border-yellow-500 bg-black px-4 py-3 font-bold text-yellow-400 outline-none focus:ring-2 focus:ring-yellow-500/30"
              >
                {competitions.map(
                  (competition) => (
                    <option
                      key={
                        competition.id
                      }
                      value={
                        competition.id
                      }
                      className="bg-black text-white"
                    >
                      {
                        competition.name
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            {/* ROUND */}

            <div>

              <label
                htmlFor="fixture-round-filter"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Round
              </label>

              <select
                id="fixture-round-filter"
                value={
                  selectedRound
                }
                onChange={(event) =>
                  setSelectedRound(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border-2 border-yellow-500 bg-black px-4 py-3 font-bold text-yellow-400 outline-none focus:ring-2 focus:ring-yellow-500/30"
              >
                <option
                  value="all"
                  className="bg-black text-white"
                >
                  All Rounds
                </option>

                {availableRounds.map(
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

            </div>

            {/* ADD */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={
                  handleAddFixture
                }
                className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
              >
                ➕ Add Fixture
              </button>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="mt-6 rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-4 text-center">

            <p className="text-sm text-gray-400">
              Managing
            </p>

            <p className="mt-1 text-xl font-black text-yellow-400">
              {
                selectedCompetition?.name ??
                selectedCompetitionId
              }
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {
                displayedFixtures.length
              }{" "}
              fixture
              {
                displayedFixtures.length ===
                1
                  ? ""
                  : "s"
              }
            </p>

          </div>

        </section>

        {/* ADD / EDIT FORM */}

        {showForm && (
          <section className="mb-10 rounded-3xl border-2 border-yellow-500 bg-zinc-900 p-5 shadow-2xl md:p-8">

            <div className="mb-6 flex items-center justify-between gap-4">

              <div>

                <h2 className="text-2xl font-black text-yellow-400">
                  {
                    editingFixtureId
                      ? "✏️ Edit Fixture"
                      : "➕ Add Fixture"
                  }
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Saved directly to Supabase.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white"
              >
                Cancel
              </button>

            </div>

            <form
              onSubmit={
                handleSaveFixture
              }
              className="grid gap-5 md:grid-cols-2"
            >

              {/* COMPETITION */}

              <div>

                <label
                  htmlFor="form-competition"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Competition
                </label>

                <select
                  id="form-competition"
                  value={
                    form.competitionId
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        competitionId:
                          event.target
                            .value as CompetitionId,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                >
                  {competitions.map(
                    (competition) => (
                      <option
                        key={
                          competition.id
                        }
                        value={
                          competition.id
                        }
                        className="bg-black text-white"
                      >
                        {
                          competition.name
                        }
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* ROUND */}

              <div>

                <label
                  htmlFor="form-round"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Round
                </label>

                <input
                  id="form-round"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.round
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        round:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                />

              </div>

              {/* HOME TEAM */}

              <div>

                <label
                  htmlFor="form-home-team"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Home Team
                </label>

                <select
                  id="form-home-team"
                  value={
                    form.homeTeam
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        homeTeam:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                >
                  <option
                    value=""
                    className="bg-black text-gray-400"
                  >
                    Select home team
                  </option>

                  {teams.map(
                    (team) => (
                      <option
                        key={
                          team.name
                        }
                        value={
                          team.name
                        }
                        className="bg-black text-white"
                      >
                        {
                          team.name
                        }
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* AWAY TEAM */}

              <div>

                <label
                  htmlFor="form-away-team"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Away Team
                </label>

                <select
                  id="form-away-team"
                  value={
                    form.awayTeam
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        awayTeam:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                >
                  <option
                    value=""
                    className="bg-black text-gray-400"
                  >
                    Select away team
                  </option>

                  {teams.map(
                    (team) => (
                      <option
                        key={
                          team.name
                        }
                        value={
                          team.name
                        }
                        disabled={
                          team.name ===
                          form.homeTeam
                        }
                        className="bg-black text-white"
                      >
                        {
                          team.name
                        }
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* MATCH DATE */}

              <div>

                <label
                  htmlFor="form-date"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Match Date
                </label>

                <input
                  id="form-date"
                  type="date"
                  value={
                    form.matchDate
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        matchDate:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                />

              </div>

              {/* KICK-OFF */}

              <div>

                <label
                  htmlFor="form-kickoff"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  ⚽ Kick-off
                </label>

                <input
                  id="form-kickoff"
                  type="time"
                  value={
                    form.kickOff
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        kickOff:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                  required
                />

              </div>

              {/* STATUS */}

              <div>

                <label
                  htmlFor="form-status"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Status
                </label>

                <select
                  id="form-status"
                  value={
                    form.status
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        status:
                          event.target
                            .value as FixtureStatus,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-600 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
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

              {/* SAVE */}

              <div className="flex items-end">

                <button
                  type="submit"
                  className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
                >
                  {
                    editingFixtureId
                      ? "💾 Save Changes"
                      : "💾 Save Fixture"
                  }
                </button>

              </div>

            </form>

          </section>
        )}

        {/* FIXTURES */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-black text-yellow-400">
              Fixtures
            </h2>

            <span className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-4 py-1 text-sm font-bold text-yellow-400">
              {
                displayedFixtures.length
              }
            </span>

          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-10 text-center text-gray-400">
              Loading fixtures...
            </div>
          ) : displayedFixtures.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-yellow-500/50 bg-zinc-900 p-10 text-center">

              <p className="text-4xl">
                📅
              </p>

              <h3 className="mt-4 text-xl font-bold text-white">
                No fixtures found
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Add your first fixture
                for{" "}
                {
                  selectedCompetition?.name ??
                  "this competition"
                }.
              </p>

              <button
                type="button"
                onClick={
                  handleAddFixture
                }
                className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black hover:bg-yellow-300"
              >
                ➕ Add Fixture
              </button>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {displayedFixtures.map(
                (fixture) => (
                  <div
                    key={
                      fixture.id
                    }
                    className="rounded-2xl border border-yellow-500/60 bg-gradient-to-br from-zinc-900 to-black p-5 shadow-lg"
                  >

                    {/* HEADER */}

                    <div className="mb-4 flex items-center justify-between gap-3">

                      <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                        Round{" "}
                        {
                          fixture.round
                        }
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          fixture.status ===
                          "Scheduled"
                            ? "bg-blue-900/40 text-blue-400"
                            : fixture.status ===
                              "Completed"
                            ? "bg-green-900/40 text-green-400"
                            : fixture.status ===
                              "Postponed"
                            ? "bg-orange-900/40 text-orange-400"
                            : fixture.status ===
                              "Cancelled"
                            ? "bg-red-900/40 text-red-400"
                            : "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {
                          fixture.status
                        }
                      </span>

                    </div>

                    {/* TEAMS */}

                    <div className="text-center">

                      <p className="text-lg font-black text-white">
                        {
                          fixture.homeTeam
                        }
                      </p>

                      <p className="my-2 text-sm font-bold text-gray-500">
                        VS
                      </p>

                      <p className="text-lg font-black text-white">
                        {
                          fixture.awayTeam
                        }
                      </p>

                    </div>

                    {/* DATE / KICK-OFF */}

                    <div className="mt-5 border-t border-gray-800 pt-4 text-center">

                      <p className="font-semibold text-yellow-400">
                        {
                          formatDisplayDate(
                            fixture.matchDate
                          )
                        }
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-300">
                        ⚽ Kick-off:{" "}
                        {
                          fixture.kickOff
                        }
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditFixture(
                            fixture
                          )
                        }
                        className="rounded-lg border border-yellow-500 px-3 py-2 text-sm font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteFixture(
                            fixture
                          )
                        }
                        className="rounded-lg border border-red-600 px-3 py-2 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}