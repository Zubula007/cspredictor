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

  refreshLeaderboard: () => Promise<void>;

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

  async function refreshLeaderboard() {
    try {
      const updatedLeaderboard =
        await leaderboardService.getLeaderboard(
          competitionId
        );

      setLeaderboard(updatedLeaderboard);
    } catch (error) {
      console.error(
        "Failed to refresh leaderboard:",
        error
      );

      setLeaderboard([]);
    }
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