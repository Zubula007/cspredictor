export const CompetitionIds = {
  BET: "BET",
  MTN: "MTN",
  NED: "NED",
  CAR: "CAR",
} as const;

export const FixtureStatus = {
  SCHEDULED: "Scheduled",
  POSTPONED: "Postponed",
  LIVE: "Live",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export const FirstTeamToScore = {
  HOME: "Home",
  AWAY: "Away",
  NONE: "None",
} as const;

export const PredictionStatus = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  LOCKED: "Locked",
  SCORED: "Scored",
} as const;

export type CompetitionId =
  typeof CompetitionIds[keyof typeof CompetitionIds];

export type FixtureStatusType =
  typeof FixtureStatus[keyof typeof FixtureStatus];

export type FirstTeamToScoreType =
  typeof FirstTeamToScore[keyof typeof FirstTeamToScore];

export type PredictionStatusType =
  typeof PredictionStatus[keyof typeof PredictionStatus];

