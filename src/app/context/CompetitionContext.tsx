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
  setActiveCompetition: (competitionId: string) => void;

  activeRound: number;
  setActiveRound: (round: number) => void;
};

const CompetitionContext =
  createContext<CompetitionContextType | null>(null);

const ACTIVE_ROUNDS_KEY = "csp-active-rounds";

function getSavedRounds(): Record<string, number> {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = localStorage.getItem(ACTIVE_ROUNDS_KEY);

  if (!saved) {
    return {};
  }

  try {
    const parsed = JSON.parse(saved);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function saveRounds(rounds: Record<string, number>) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACTIVE_ROUNDS_KEY,
    JSON.stringify(rounds)
  );
}

export function CompetitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Always start with Betway on the first render.
  // This keeps server and client HTML identical.
  const [activeCompetition, setActiveCompetitionState] =
    useState(() =>
      competitionService.getCompetition("BET")
    );

  const [competitions] = useState<CompetitionInfo[]>(
    () => competitionService.getAllCompetitions()
  );

  // Round 1 is the safe initial value.
  const [activeRound, setActiveRoundState] =
    useState<number>(1);

  // After hydration, load saved competition and round.
  useEffect(() => {
    const savedCompetition =
      competitionService.getActiveCompetition();

    setActiveCompetitionState(savedCompetition);

    const savedRounds = getSavedRounds();

    const savedRound =
      savedRounds[savedCompetition.id];

    setActiveRoundState(
      typeof savedRound === "number" &&
        savedRound >= 1
        ? savedRound
        : 1
    );
  }, []);

  function setActiveCompetition(
    competitionId: string
  ) {
    const competition =
      competitionService.setActiveCompetition(
        competitionId
      );

    setActiveCompetitionState(competition);

    const savedRounds = getSavedRounds();

    const savedRound =
      savedRounds[competition.id];

    setActiveRoundState(
      typeof savedRound === "number" &&
        savedRound >= 1
        ? savedRound
        : 1
    );
  }

  function setActiveRound(round: number) {
    if (!Number.isInteger(round) || round < 1) {
      return;
    }

    const rounds = getSavedRounds();

    rounds[activeCompetition.id] = round;

    saveRounds(rounds);

    setActiveRoundState(round);
  }

  return (
    <CompetitionContext.Provider
      value={{
        activeCompetition,
        competitions,
        setActiveCompetition,
        activeRound,
        setActiveRound,
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