import { CompetitionIds } from "../lib/enums";

export interface CompetitionInfo {
  id: string;
  name: string;
  logo: string;
  roundWinnerEnabled: boolean;
  monthlyWinnerEnabled: boolean;
}

const COMPETITIONS: Record<string, CompetitionInfo> = {
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

const ACTIVE_ROUND_KEY =
  "csp-active-round";

class CompetitionService {
  getActiveCompetition(): CompetitionInfo {
    if (typeof window !== "undefined") {
      const savedCompetition =
        localStorage.getItem(
          ACTIVE_COMPETITION_KEY
        );

      if (
        savedCompetition &&
        COMPETITIONS[savedCompetition]
      ) {
        return COMPETITIONS[savedCompetition];
      }
    }

    return COMPETITIONS[CompetitionIds.BET];
  }

  setActiveCompetition(
    competitionId: string
  ): CompetitionInfo {
    const competition =
      COMPETITIONS[competitionId];

    if (!competition) {
      return this.getActiveCompetition();
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        ACTIVE_COMPETITION_KEY,
        competitionId
      );
    }

    return competition;
  }

  getCompetition(
    id: string
  ): CompetitionInfo {
    return COMPETITIONS[id];
  }

  getAllCompetitions(): CompetitionInfo[] {
    return Object.values(COMPETITIONS);
  }

  /*
   * ============================================================
   * ACTIVE ROUND
   * ============================================================
   *
   * The active round belongs to a competition.
   *
   * Round 1 is used automatically until Admin
   * selects another round.
   */

  getActiveRound(
    competitionId: string | number
  ): number {
    const key =
      `${ACTIVE_ROUND_KEY}-${String(
        competitionId
      )}`;

    if (typeof window !== "undefined") {
      const savedRound =
        localStorage.getItem(key);

      if (savedRound !== null) {
        const round =
          Number(savedRound);

        if (
          Number.isInteger(round) &&
          round > 0
        ) {
          return round;
        }
      }
    }

    return 1;
  }

  setActiveRound(
    competitionId: string | number,
    round: number
  ): number {
    if (
      !Number.isInteger(round) ||
      round < 1
    ) {
      return this.getActiveRound(
        competitionId
      );
    }

    const key =
      `${ACTIVE_ROUND_KEY}-${String(
        competitionId
      )}`;

    if (typeof window !== "undefined") {
      localStorage.setItem(
        key,
        String(round)
      );
    }

    return round;
  }
}

const competitionService =
  new CompetitionService();

export default competitionService;