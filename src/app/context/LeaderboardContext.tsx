"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import leaderboardService from "../services/leaderboardService";

import type { LeaderboardEntry } from "../services/leaderboardService";

import competitionService from "../services/competitionService";

type LeaderboardContextType = {
  leaderboard: LeaderboardEntry[];

  refreshLeaderboard: () => void;

  competitionId: string;

  setCompetitionId: (competitionId: string) => void;
};

const LeaderboardContext =
  createContext<LeaderboardContextType | null>(null);

export function LeaderboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const activeCompetition =
    competitionService.getActiveCompetition();

  const [competitionId, setCompetitionId] =
    useState<string>(activeCompetition.id);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  function refreshLeaderboard() {
    const updatedLeaderboard =
      leaderboardService.getLeaderboard(
        competitionId
      );

    setLeaderboard([
      ...updatedLeaderboard,
    ]);
  }

  useEffect(() => {
    refreshLeaderboard();
  }, [competitionId]);

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        refreshLeaderboard,
        competitionId,
        setCompetitionId,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context =
    useContext(LeaderboardContext);

  if (!context) {
    throw new Error(
      "useLeaderboard must be used inside LeaderboardProvider"
    );
  }

  return context;
}