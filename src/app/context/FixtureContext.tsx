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
};

const FixtureContext =
  createContext<FixtureContextType | null>(null);

export function FixtureProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fixtures, setFixtures] = useState(
    fixtureRepository.getAll()
  );

  function refreshFixtures() {
    setFixtures([
      ...fixtureRepository.getAll(),
    ]);
  }

  return (
    <FixtureContext.Provider
      value={{
        fixtures,
        refreshFixtures,
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