"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useFixtures } from "../../../context/FixtureContext";

export default function EditFixturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    fixtures,
    updateFixture,
  } = useFixtures();

  const fixtureId = searchParams.get("fixture");

  const fixture = fixtures.find(
    (item) => item.id === fixtureId
  );

  const [matchDate, setMatchDate] = useState("");
  const [kickOff, setKickOff] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (!fixture) return;

    setMatchDate(fixture.matchDate);
    setKickOff(fixture.kickOff ?? "");
    setStatus(fixture.status);
    setPublished(fixture.published);
  }, [fixture]);

  if (!fixture) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-xl rounded-xl border border-red-500 bg-zinc-900 p-6 text-center">
          <h1 className="text-2xl font-bold text-red-400">
            Fixture Not Found
          </h1>

          <p className="mt-3 text-gray-300">
            Please select a valid fixture to edit.
          </p>
        </div>
      </main>
    );
  }

  const currentFixture = fixture;

  function saveChanges() {
    updateFixture(currentFixture.id, {
      matchDate,
      kickOff,
      status: status as typeof currentFixture.status,
      published,
    });

    alert("Fixture updated successfully ✅");

    router.push("/admin/fixtures");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          ✏️ Edit Fixture
        </h1>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold">
            {currentFixture.homeTeam}
          </h2>

          <p className="my-2 font-bold text-yellow-400">
            VS
          </p>

          <h2 className="text-xl font-bold">
            {currentFixture.awayTeam}
          </h2>
        </div>

        <label className="mb-2 block">
          Match Date
        </label>

        <input
          type="date"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="mb-5 w-full rounded bg-white p-2 text-black"
        />

        <label className="mb-2 block">
          Kick-off Time
        </label>

        <input
          type="time"
          value={kickOff}
          onChange={(e) => setKickOff(e.target.value)}
          className="mb-5 w-full rounded bg-white p-2 text-black"
        />

        <label className="mb-2 block">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mb-5 w-full rounded bg-white p-2 text-black"
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

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) =>
              setPublished(e.target.checked)
            }
          />

          <span>
            Fixture Published
          </span>
        </label>

        <button
          onClick={saveChanges}
          className="mt-8 w-full rounded-xl bg-yellow-500 p-3 font-bold text-black hover:bg-yellow-400"
        >
          💾 Save Changes
        </button>

      </div>
    </main>
  );
}