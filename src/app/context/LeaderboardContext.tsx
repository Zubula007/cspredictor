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


type LeaderboardContextType = {
  leaderboard: LeaderboardEntry[];

  refreshLeaderboard: () => void;
};


const LeaderboardContext =
  createContext<LeaderboardContextType | null>(null);



export function LeaderboardProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);


  function refreshLeaderboard() {

    const updatedLeaderboard =
      leaderboardService.getLeaderboard();

    setLeaderboard([
      ...updatedLeaderboard,
    ]);

  }


  useEffect(() => {
    refreshLeaderboard();
  }, []);



  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        refreshLeaderboard,
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