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

export function CompetitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * ============================================================
   * ACTIVE COMPETITION
   * ============================================================
   *
   * Always start with Betway on the first render.
   * This keeps server and client HTML identical.
   */

  const [activeCompetition, setActiveCompetitionState] =
    useState<CompetitionInfo>(() =>
      competitionService.getCompetition("BET")
    );

  /*
   * ============================================================
   * AVAILABLE COMPETITIONS
   * ============================================================
   */

  const [competitions] =
    useState<CompetitionInfo[]>(() =>
      competitionService.getAllCompetitions()
    );

  /*
   * ============================================================
   * ACTIVE ROUND
   * ============================================================
   *
   * Round 1 is only the safe initial render value.
   *
   * After hydration, the real active round is loaded
   * from Supabase through competitionService.
   *
   * IMPORTANT:
   *
   * We no longer use localStorage for active rounds.
   *
   * Supabase competitions.active_round is now the
   * single source of truth for ALL users.
   */

  const [activeRound, setActiveRoundState] =
    useState<number>(1);

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const savedCompetition =
        competitionService.getActiveCompetition();

      if (cancelled) {
        return;
      }

      setActiveCompetitionState(
        savedCompetition
      );

      /*
       * Load the GLOBAL active round from Supabase.
       */

      const savedRound =
        await competitionService.getActiveRound(
          savedCompetition.id
        );

      if (cancelled) {
        return;
      }

      setActiveRoundState(
        Number.isInteger(savedRound) &&
          savedRound >= 1
          ? savedRound
          : 1
      );
    }

    loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * CHANGE ACTIVE COMPETITION
   * ============================================================
   *
   * Competition selection remains local to the user's
   * current app session.
   *
   * When competition changes, we then load that competition's
   * GLOBAL active round from Supabase.
   */

  async function changeActiveCompetition(
    competitionId: string
  ) {
    const competition =
      competitionService.setActiveCompetition(
        competitionId
      );

    setActiveCompetitionState(
      competition
    );

    /*
     * Load the active round belonging to
     * the newly selected competition.
     */

    const round =
      await competitionService.getActiveRound(
        competition.id
      );

    setActiveRoundState(
      Number.isInteger(round) &&
        round >= 1
        ? round
        : 1
    );
  }

  /*
   * ============================================================
   * SET ACTIVE ROUND
   * ============================================================
   *
   * This is primarily used by Admin.
   *
   * The selected round is written to Supabase.
   *
   * Once saved, every user reading the competition
   * receives the same active round.
   */

  async function setActiveRound(
    round: number
  ) {
    if (
      !Number.isInteger(round) ||
      round < 1
    ) {
      return;
    }

    const savedRound =
      await competitionService.setActiveRound(
        activeCompetition.id,
        round
      );

    setActiveRoundState(
      Number.isInteger(savedRound) &&
        savedRound >= 1
        ? savedRound
        : round
    );
  }

  /*
   * ============================================================
   * CONTEXT
   * ============================================================
   */

  return (
    <CompetitionContext.Provider
      value={{
        activeCompetition,
        competitions,
        setActiveCompetition:
          changeActiveCompetition,
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