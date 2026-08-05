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

class CompetitionService {
  getActiveCompetition(): CompetitionInfo {
    // TEMPORARY QA
    // Force Betway Premiership as the active competition
    return COMPETITIONS[CompetitionIds.BET];
  }

  getCompetition(id: string): CompetitionInfo {
    return COMPETITIONS[id];
  }

  getAllCompetitions(): CompetitionInfo[] {
    return Object.values(COMPETITIONS);
  }
}

const competitionService = new CompetitionService();

export default competitionService;