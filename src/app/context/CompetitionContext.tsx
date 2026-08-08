"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import competitionService, {
  type CompetitionInfo,
} from "../services/competitionService";

type CompetitionContextType = {
  activeCompetition: CompetitionInfo;
  competitions: CompetitionInfo[];
  setActiveCompetition: (
    competitionId: string
  ) => void;
};

const CompetitionContext =
  createContext<CompetitionContextType | null>(null);

export function CompetitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Always start with Betway on the first render.
  // This keeps the server and client HTML identical.
  const [activeCompetition, setActiveCompetitionState] =
    useState<CompetitionInfo>(() =>
      competitionService.getCompetition("BET")
    );

  const [competitions] = useState<CompetitionInfo[]>(
    () => competitionService.getAllCompetitions()
  );

  // After hydration, load the competition saved in localStorage.
  useEffect(() => {
    const savedCompetition =
      competitionService.getActiveCompetition();

    setActiveCompetitionState(savedCompetition);
  }, []);

  function setActiveCompetition(
    competitionId: string
  ) {
    const competition =
      competitionService.setActiveCompetition(
        competitionId
      );

    setActiveCompetitionState(competition);
  }

  return (
    <CompetitionContext.Provider
      value={{
        activeCompetition,
        competitions,
        setActiveCompetition,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const context = useContext(
    CompetitionContext
  );

  if (!context) {
    throw new Error(
      "useCompetition must be used inside CompetitionProvider"
    );
  }

  return context;
}