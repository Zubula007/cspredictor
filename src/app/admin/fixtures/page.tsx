"use client";

import { useEffect, useState } from "react";

import fixtureRepository from "../../repositories/fixtureRepository";
import AdminFixtureCard from "../../components/AdminFixtureCard";

export default function ManageFixturesPage() {
  const [fixtures, setFixtures] = useState<
    ReturnType<typeof fixtureRepository.getAll>
  >([]);

  useEffect(() => {
    setFixtures(fixtureRepository.getAll());
  }, []);

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
            />
          ))}

        </div>

      </div>
    </main>
  );
}