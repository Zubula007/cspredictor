"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import fixtureRepository from "../repositories/fixtureRepository";
import type { Fixture } from "../types/fixture";

type FixtureContextType = {
  fixtures: Fixture[];

  refreshFixtures: () => void;

  updateFixture: (
    fixtureId: string,
    updates: Partial<Fixture>
  ) => void;
};

const FixtureContext =
  createContext<FixtureContextType | null>(null);

export function FixtureProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fixtures, setFixtures] = useState<Fixture[]>(
    () => fixtureRepository.getAll()
  );

  /**
   * Reload fixtures from the repository
   * Used after:
   * - publishing results
   * - editing fixtures
   * - changing fixture status
   */
  function refreshFixtures() {
    const updatedFixtures =
      fixtureRepository.getAll();

    setFixtures([
      ...updatedFixtures,
    ]);
  }

  /**
   * Update one fixture and immediately
   * refresh the global fixture state
   */
  function updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ) {
    fixtureRepository.updateFixture(
      fixtureId,
      updates
    );

    refreshFixtures();
  }

  return (
    <FixtureContext.Provider
      value={{
        fixtures,
        refreshFixtures,
        updateFixture,
      }}
    >
      {children}
    </FixtureContext.Provider>
  );
}

export function useFixtures() {
  const context = useContext(FixtureContext);

  if (!context) {
    throw new Error(
      "useFixtures must be used inside FixtureProvider"
    );
  }

  return context;
}