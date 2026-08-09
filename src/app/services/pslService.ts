import type { CompetitionId } from "../types/fixture";

import type {
  PSLImport,
  PSLImportType,
} from "../types/pslImport";

const PSL_SOURCE_URL =
  "https://www.psl.co.za/tournament/betway-premiership";

interface PSLSourceMatch {
  id?: string;

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

  source: "PSL";

  importType: PSLImportType;
}

interface PSLApiResponse {
  source: "PSL";

  sourceUrl?: string;

  competitionId: CompetitionId;

  matches: PSLSourceMatch[];
}

class PSLService {
  private createStableId(
    match: PSLSourceMatch
  ): string {
    if (match.id) {
      return `psl-${match.id}`;
    }

    const fingerprint = [
      match.competitionId,
      match.round,
      match.matchDate,
      match.homeTeam,
      match.awayTeam,
    ]
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `psl-${fingerprint}`;
  }

  private convertMatch(
    match: PSLSourceMatch
  ): PSLImport {
    return {
      id: this.createStableId(
        match
      ),

      competitionId:
        match.competitionId,

      round:
        match.round,

      matchDate:
        match.matchDate,

      kickOff:
        match.kickOff,

      displayDate:
        match.displayDate,

      homeTeam:
        match.homeTeam,

      awayTeam:
        match.awayTeam,

      status:
        match.status,

      homeScore:
        match.homeScore,

      awayScore:
        match.awayScore,

      firstTeamToScore:
        match.firstTeamToScore,

      source:
        "PSL",

      sourceUrl:
        PSL_SOURCE_URL,

      importType:
        match.importType,

      importedAt:
        new Date().toISOString(),

      reviewStatus:
        "Pending",
    };
  }

  async fetchMatches(
    competitionId: CompetitionId
  ): Promise<PSLImport[]> {
    const response =
      await fetch(
        `/api/psl?competition=${encodeURIComponent(
          String(competitionId)
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    if (!response.ok) {
      let message =
        `PSL request failed with status ${response.status}`;

      try {
        const errorData =
          (await response.json()) as {
            error?: string;
          };

        if (errorData.error) {
          message =
            errorData.error;
        }
      } catch {
        // Keep the default error message.
      }

      throw new Error(
        message
      );
    }

    const data =
      (await response.json()) as PSLApiResponse;

    if (
      !data ||
      !Array.isArray(
        data.matches
      )
    ) {
      throw new Error(
        "Invalid PSL response."
      );
    }

    return data.matches.map(
      (match) =>
        this.convertMatch(
          match
        )
    );
  }

  async fetchFixtures(
    competitionId: CompetitionId
  ): Promise<PSLImport[]> {
    const matches =
      await this.fetchMatches(
        competitionId
      );

    return matches.filter(
      (match) =>
        match.importType ===
        "Fixture"
    );
  }

  async fetchResults(
    competitionId: CompetitionId
  ): Promise<PSLImport[]> {
    const matches =
      await this.fetchMatches(
        competitionId
      );

    return matches.filter(
      (match) =>
        match.importType ===
        "Result"
    );
  }
}

const pslService =
  new PSLService();

export default pslService;