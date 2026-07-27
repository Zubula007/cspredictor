import type { CompetitionId } from "../lib/enums";

export interface Competition {
  id: CompetitionId;

  name: string;

  logo: string;

  hasStreaks: boolean;

  totalRounds?: number;
}