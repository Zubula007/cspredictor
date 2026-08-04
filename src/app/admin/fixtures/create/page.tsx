"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import fixtureRepository from "../../../repositories/fixtureRepository";
import teams from "../../../data/teams";
import competitions from "../../../data/competitions";

import { FixtureStatus } from "../../../lib/enums";
import type { CompetitionId } from "../../../types/fixture";

export default function CreateFixturePage() {
  const router = useRouter();

  const [competitionId, setCompetitionId] =
    useState<CompetitionId>("BET");

  const [homeTeam, setHomeTeam] =
    useState("");

  const [awayTeam, setAwayTeam] =
    useState("");

  const [matchDate, setMatchDate] =
    useState("");

  const [kickOff, setKickOff] =
    useState("");

  const [round, setRound] =
    useState(1);

  const [message, setMessage] =
    useState("");

  const createFixture = () => {
    if (
      !homeTeam ||
      !awayTeam ||
      !matchDate ||
      !kickOff
    ) {
      setMessage(
        "Please complete all fixture details."
      );

      return;
    }

    if (homeTeam === awayTeam) {
      setMessage(
        "Home and Away teams cannot be the same."
      );

      return;
    }

    fixtureRepository.addFixture({
      id: `${competitionId}-${Date.now()}`,

      competitionId,

      round,

      streak: round,

      matchDate,

      kickOff,

      displayDate: new Date(
        matchDate
      ).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),

      homeTeam,

      awayTeam,

      status: FixtureStatus.SCHEDULED,

      homeScore: undefined,

      awayScore: undefined,

      firstTeamToScore: undefined,

      published: false,
    });

    setMessage(
      "✅ Fixture created successfully."
    );

    setTimeout(() => {
      router.push("/admin/fixtures");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-yellow-500 bg-zinc-900 p-8 shadow-xl">
          <h1 className="text-center text-4xl font-extrabold text-yellow-400">
            ➕ Create Fixture
          </h1>

          <div className="mt-8 space-y-5">

            <select
              value={competitionId}
              onChange={(e) =>
                setCompetitionId(
                  e.target.value as CompetitionId
                )
              }
              className="w-full rounded-xl bg-black p-3"
            >
              {competitions.map(
                (competition) => (
                  <option
                    key={competition.id}
                    value={competition.id}
                  >
                    {competition.name}
                  </option>
                )
              )}
            </select>

            <select
              value={homeTeam}
              onChange={(e) =>
                setHomeTeam(e.target.value)
              }
              className="w-full rounded-xl bg-black p-3"
            >
              <option value="">
                Select Home Team
              </option>

              {teams.map((team) => (
                <option
                  key={team.name}
                  value={team.name}
                >
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={awayTeam}
              onChange={(e) =>
                setAwayTeam(e.target.value)
              }
              className="w-full rounded-xl bg-black p-3"
            >
              <option value="">
                Select Away Team
              </option>

              {teams.map((team) => (
                <option
                  key={team.name}
                  value={team.name}
                >
                  {team.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={matchDate}
                onChange={(e) =>
                  setMatchDate(
                    e.target.value
                  )
                }
                className="rounded-xl bg-black p-3"
              />

              <input
                type="time"
                value={kickOff}
                onChange={(e) =>
                  setKickOff(
                    e.target.value
                  )
                }
                className="rounded-xl bg-black p-3"
              />
            </div>

            <input
              type="number"
              value={round}
              min={1}
              onChange={(e) =>
                setRound(
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl bg-black p-3"
              placeholder="Round"
            />

            <button
              onClick={createFixture}
              className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
            >
              Create Fixture
            </button>

            {message && (
              <p className="text-center font-semibold text-yellow-400">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}