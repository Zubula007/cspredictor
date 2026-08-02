"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import fixtureService from "../../services/fixtureService";
import predictionService from "../../services/predictionService";

import { useFixtures } from "../../context/FixtureContext";

import {
  FirstTeamToScore,
  type FirstTeamToScoreType,
} from "../../lib/enums";

export default function AdminResultsPage() {
  const router = useRouter();

  const { fixtures, refreshFixtures } = useFixtures();

  const searchParams = useSearchParams();

  const fixtureFromUrl = searchParams.get("fixture");

  const [selectedFixtureId, setSelectedFixtureId] = useState(
    fixtureFromUrl ?? fixtures[0]?.id ?? ""
  );

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const [firstTeamToScore, setFirstTeamToScore] =
    useState<FirstTeamToScoreType | "">("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (fixtureFromUrl) {
      setSelectedFixtureId(fixtureFromUrl);
    }
  }, [fixtureFromUrl]);

  const selectedFixture =
    fixtureService.getById(selectedFixtureId);

  const availableFTTS = useMemo(() => {
    if (homeScore === 0 && awayScore === 0) {
      return [
        {
          value: FirstTeamToScore.NONE,
          label: "No Goal",
        },
      ];
    }

    if (homeScore > 0 && awayScore === 0) {
      return [
        {
          value: FirstTeamToScore.HOME,
          label: "Home Team",
        },
      ];
    }

    if (homeScore === 0 && awayScore > 0) {
      return [
        {
          value: FirstTeamToScore.AWAY,
          label: "Away Team",
        },
      ];
    }

    return [
      {
        value: FirstTeamToScore.HOME,
        label: "Home Team",
      },
      {
        value: FirstTeamToScore.AWAY,
        label: "Away Team",
      },
    ];
  }, [homeScore, awayScore]);

  useEffect(() => {
    if (availableFTTS.length === 1) {
      setFirstTeamToScore(availableFTTS[0].value);
      return;
    }

    setFirstTeamToScore("");
  }, [availableFTTS]);

  function publishResult() {
    if (!selectedFixtureId) return;

    if (!firstTeamToScore) {
      setMessage("Please select the First Team To Score.");
      return;
    }

    const result = fixtureService.publishResult(
      selectedFixtureId,
      homeScore,
      awayScore,
      firstTeamToScore
    );

    if (!result) {
      setMessage("Unable to publish result.");
      return;
    }

    refreshFixtures();

    setMessage(
      `Result published successfully ✅ ${result.summary.predictionsScored} predictions scored`
    );

    setTimeout(() => {
      router.push("/admin");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl rounded-xl border border-yellow-500 bg-zinc-900 p-6">

        <h1 className="mb-6 text-2xl font-bold text-yellow-400">
          Admin Result Review & Publish
        </h1>

        <label className="mb-2 block">
          Select Fixture
        </label>

        <select
          className="mb-6 w-full rounded bg-white p-2 text-black"
          value={selectedFixtureId}
          onChange={(e) => {
            setSelectedFixtureId(e.target.value);
            setMessage("");
          }}
        >
          {fixtures.map((fixture) => (
            <option
              key={fixture.id}
              value={fixture.id}
            >
              {fixture.homeTeam} vs {fixture.awayTeam}
            </option>
          ))}
        </select>

        {selectedFixture && (
          <div className="mb-6 text-center">
            <p className="text-lg">
              {selectedFixture.homeTeam} vs{" "}
              {selectedFixture.awayTeam}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label>Home Score</label>

            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => {
                setHomeScore(Number(e.target.value));
                setMessage("");
              }}
              className="mt-2 w-full rounded bg-white p-2 text-black"
            />
          </div>

          <div>
            <label>Away Score</label>

            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={(e) => {
                setAwayScore(Number(e.target.value));
                setMessage("");
              }}
              className="mt-2 w-full rounded bg-white p-2 text-black"
            />
          </div>

        </div>

        <div className="mt-6">

          <label>
            First Team To Score
          </label>

          <select
            className="mt-2 w-full rounded bg-white p-2 text-black"
            value={firstTeamToScore}
            onChange={(e) => {
              setFirstTeamToScore(
                e.target.value as FirstTeamToScoreType | ""
              );

              setMessage("");
            }}
          >

            {availableFTTS.length > 1 && (
              <option value="">
                Select First Team To Score...
              </option>
            )}

            {availableFTTS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}

          </select>

        </div>

        <button
          onClick={publishResult}
          className="mt-6 w-full rounded bg-yellow-500 p-3 font-bold text-black"
        >
          Publish Result
        </button>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("successfully")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

      </div>
    </main>
  );
}