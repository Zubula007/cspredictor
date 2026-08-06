"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useFixtures } from "../../../context/FixtureContext";

import competitions from "../../../data/competitions";
import teams from "../../../data/teams";

import type { CompetitionId } from "../../../types/fixture";

export default function EditFixtureClient() { 
  const router = useRouter();

  const searchParams = useSearchParams();

  const {
    fixtures,
    updateFixture,
  } = useFixtures();

  const fixtureId =
    searchParams.get("fixture");

  const fixture =
    fixtures.find(
      (item) =>
        item.id === fixtureId
    );

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

  const [status, setStatus] =
    useState("Scheduled");

  const [published, setPublished] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (!fixture) return;

    setCompetitionId(
      fixture.competitionId
    );

    setHomeTeam(
      fixture.homeTeam
    );

    setAwayTeam(
      fixture.awayTeam
    );

    setMatchDate(
      fixture.matchDate
    );

    setKickOff(
      fixture.kickOff
    );

    setRound(
      fixture.round
    );

    setStatus(
      fixture.status
    );

    setPublished(
      fixture.published
    );

  }, [fixture]);

  if (!fixture) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">

        <div className="mx-auto max-w-xl rounded-2xl border border-red-500 bg-zinc-900 p-8 text-center">

          <h1 className="text-3xl font-bold text-red-400">
            Fixture Not Found
          </h1>

          <p className="mt-4 text-gray-300">
            The selected fixture could not be found.
          </p>

        </div>

      </main>
    );
  }

  // ✅ TypeScript now knows the fixture exists
  const currentFixture = fixture;

  function saveChanges() {

    if (homeTeam === awayTeam) {

      setMessage(
        "Home Team and Away Team cannot be the same."
      );

      return;

    }

    updateFixture(
      currentFixture.id,
      {
        competitionId,

        homeTeam,

        awayTeam,

        round,

        streak: round,

        matchDate,

        kickOff,

        displayDate:
          new Date(matchDate).toLocaleDateString(
            "en-ZA",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          ),

        status:
          status as typeof currentFixture.status,

        published,
      }
    );

    setMessage(
      "✅ Fixture updated successfully."
    );

    setTimeout(() => {

      router.push(
        "/admin/fixtures"
      );

    }, 1200);

  }

  return (

    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-500 bg-zinc-900 p-8 shadow-xl">

        <h1 className="text-center text-4xl font-extrabold text-yellow-400">
          ✏️ Edit Fixture
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
              setHomeTeam(
                e.target.value
              )
            }
            className="w-full rounded-xl bg-black p-3"
          >

            {teams.map(
              (team) => (

                <option
                  key={team.name}
                  value={team.name}
                >
                  {team.name}
                </option>

              )
            )}

          </select>

          <select
            value={awayTeam}
            onChange={(e) =>
              setAwayTeam(
                e.target.value
              )
            }
            className="w-full rounded-xl bg-black p-3"
          >

            {teams.map(
              (team) => (

                <option
                  key={team.name}
                  value={team.name}
                >
                  {team.name}
                </option>

              )
            )}

          </select>          <div className="grid grid-cols-2 gap-4">

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
            min={1}
            value={round}
            onChange={(e) =>
              setRound(
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl bg-black p-3"
            placeholder="Round"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="w-full rounded-xl bg-black p-3"
          >

            <option value="Scheduled">
              Scheduled
            </option>

            <option value="Live">
              Live
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Postponed">
              Postponed
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

          </select>

          <label className="flex items-center gap-3 rounded-xl border border-yellow-500 bg-black p-4">

            <input
              type="checkbox"
              checked={published}
              onChange={(e) =>
                setPublished(
                  e.target.checked
                )
              }
            />

            <span className="font-medium">
              Fixture Published
            </span>

          </label>

          <button
            onClick={saveChanges}
            className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            💾 Save Changes
          </button>

          {message && (

            <div className="rounded-xl border border-green-500 bg-green-900/20 p-4 text-center">

              <p className="font-semibold text-green-300">
                {message}
              </p>

            </div>

          )}

        </div>

      </div>

    </main>

  );

}

