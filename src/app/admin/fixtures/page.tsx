"use client";

import { useEffect, useState } from "react";

import fixtureRepository from "../../repositories/fixtureRepository";
import AdminFixtureCard from "../../components/AdminFixtureCard";

import type { Fixture } from "../../types/fixture";

export default function ManageFixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  const [message, setMessage] = useState("");

  const loadFixtures = async () => {
    const data = await fixtureRepository.getAll();

    setFixtures(data);
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  const deleteFixture = async (
    fixtureId: string,
    fixtureName: string
  ) => {
    const confirmed = window.confirm(
      `Delete fixture?\n\n${fixtureName}\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const deleted =
      await fixtureRepository.deleteFixture(
        fixtureId
      );

    if (deleted) {
      await loadFixtures();

      setMessage(
        "✅ Fixture deleted successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } else {
      setMessage(
        "❌ Unable to delete fixture."
      );
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">

          <h1 className="text-5xl font-extrabold text-yellow-400">
            📅 Manage Fixtures
          </h1>

          <p className="mt-3 text-gray-400">
            View and manage all league fixtures.
          </p>

        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-yellow-500 bg-zinc-900 p-4 text-center font-semibold text-yellow-400">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {fixtures.map((fixture) => (

            <AdminFixtureCard
              key={fixture.id}

              id={fixture.id}

              homeTeam={fixture.homeTeam}

              awayTeam={fixture.awayTeam}

              displayDate={fixture.displayDate}

              kickOff={fixture.kickOff}

              status={fixture.status}

              competition={fixture.competitionId}

              onDelete={() =>
                deleteFixture(
                  fixture.id,
                  `${fixture.homeTeam} vs ${fixture.awayTeam}`
                )
              }
            />

          ))}

        </div>

      </div>
    </main>
  );
}