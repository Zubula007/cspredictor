"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import fixtureRepository from "../repositories/fixtureRepository";
import type { Fixture } from "../types/fixture";

type FixtureContextType = {
  fixtures: Fixture[];

  refreshFixtures: () => Promise<void>;

  updateFixture: (
    fixtureId: string,
    updates: Partial<Fixture>
  ) => Promise<void>;
};

const FixtureContext =
  createContext<FixtureContextType | null>(null);

export function FixtureProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fixtures, setFixtures] =
    useState<Fixture[]>([]);

  /**
   * Load fixtures from Supabase
   */
  async function refreshFixtures() {
    try {
      const updatedFixtures =
        await fixtureRepository.getAll();

      setFixtures(updatedFixtures);
    } catch (error) {
      console.error(
        "Failed to load fixtures:",
        error
      );
    }
  }

  /**
   * Initial fixture load
   */
  useEffect(() => {
    refreshFixtures();
  }, []);

  /**
   * Update one fixture and immediately
   * refresh the global fixture state.
   */
  async function updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ) {
    await fixtureRepository.updateFixture(
      fixtureId,
      updates
    );

    await refreshFixtures();
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
  const context =
    useContext(FixtureContext);

  if (!context) {
    throw new Error(
      "useFixtures must be used inside FixtureProvider"
    );
  }

  return context;
}