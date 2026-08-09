import type { CompetitionId } from "../lib/enums";

export type PSLImportStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export type PSLImportType =
  | "Fixture"
  | "Result";

export interface PSLImport {
  id: string;

  source: "PSL";

  sourceUrl: string;

  importType: PSLImportType;

  competitionId: CompetitionId;

  round: number;

  matchDate: string;

  kickOff: string;

  displayDate: string;

  homeTeam: string;

  awayTeam: string;

  status:
    | "Scheduled"
    | "Postponed"
    | "Live"
    | "Completed"
    | "Cancelled";

  homeScore?: number;

  awayScore?: number;

  firstTeamToScore?:
    | "Home"
    | "Away"
    | "None"
    | null;

  importedAt: string;

  reviewStatus: PSLImportStatus;

  reviewedAt?: string;

  reviewedBy?: string;

  rejectionReason?: string;
}