export const CompetitionIds = {
  BET: "BET",
  MTN: "MTN",
  NED: "NED",
  CAR: "CAR",
} as const;

export const FixtureStatus = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
} as const;

export const FirstTeamToScore = {
  HOME: "Home",
  AWAY: "Away",
  NONE: "None",
} as const;

export type CompetitionId =
  typeof CompetitionIds[keyof typeof CompetitionIds];

export type FixtureStatusType =
  typeof FixtureStatus[keyof typeof FixtureStatus];

export type FirstTeamToScoreType =
  typeof FirstTeamToScore[keyof typeof FirstTeamToScore];