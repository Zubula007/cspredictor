import { CompetitionIds } from "../lib/enums";
import competitionRepository from "./competitionRepository";

export interface CompetitionInfo {
  id: string;
  name: string;
  logo: string;
  roundWinnerEnabled: boolean;
  monthlyWinnerEnabled: boolean;
}

const COMPETITIONS: Record<
  string,
  CompetitionInfo
> = {
  [CompetitionIds.BET]: {
    id: CompetitionIds.BET,
    name: "Betway Premiership",
    logo: "/competitions/betway.png",
    roundWinnerEnabled: true,
    monthlyWinnerEnabled: true,
  },

  [CompetitionIds.MTN]: {
    id: CompetitionIds.MTN,
    name: "MTN8",
    logo: "/competitions/mtn8.png",
    roundWinnerEnabled: false,
    monthlyWinnerEnabled: false,
  },

  [CompetitionIds.NED]: {
    id: CompetitionIds.NED,
    name: "Nedbank Cup",
    logo: "/competitions/nedbank.png",
    roundWinnerEnabled: false,
    monthlyWinnerEnabled: false,
  },

  [CompetitionIds.CAR]: {
    id: CompetitionIds.CAR,
    name: "Carling Knockout",
    logo: "/competitions/carling.png",
    roundWinnerEnabled: false,
    monthlyWinnerEnabled: false,
  },
};

const ACTIVE_COMPETITION_KEY =
  "csp-active-competition";

class CompetitionService {
  /*
   * ============================================================
   * COMPETITIONS
   * ============================================================
   */

  getCompetition(
    id: string
  ): CompetitionInfo {
    return (
      COMPETITIONS[id] ??
      COMPETITIONS[CompetitionIds.BET]
    );
  }

  getAllCompetitions(): CompetitionInfo[] {
    return Object.values(
      COMPETITIONS
    );
  }

  getActiveCompetition(): CompetitionInfo {
    if (
      typeof window !== "undefined"
    ) {
      const saved =
        localStorage.getItem(
          ACTIVE_COMPETITION_KEY
        );

      if (
        saved &&
        COMPETITIONS[saved]
      ) {
        return COMPETITIONS[saved];
      }
    }

    return COMPETITIONS[
      CompetitionIds.BET
    ];
  }

  setActiveCompetition(
    competitionId: string
  ): CompetitionInfo {
    const competition =
      COMPETITIONS[competitionId];

    if (!competition) {
      return this.getActiveCompetition();
    }

    if (
      typeof window !== "undefined"
    ) {
      localStorage.setItem(
        ACTIVE_COMPETITION_KEY,
        competitionId
      );
    }

    return competition;
  }

  /*
   * ============================================================
   * ACTIVE ROUND
   * ============================================================
   *
   * Active round is controlled centrally by
   * the Supabase competitions table.
   *
   * competitions.active_round is the
   * single source of truth.
   */

  async getActiveRound(
    competitionId: string | number
  ): Promise<number> {
    return competitionRepository
      .getActiveRound(
        String(competitionId)
      );
  }

  async setActiveRound(
    competitionId: string | number,
    round: number
  ): Promise<number> {
    return competitionRepository
      .setActiveRound(
        String(competitionId),
        round
      );
  }
}

const competitionService =
  new CompetitionService();

export default competitionService;