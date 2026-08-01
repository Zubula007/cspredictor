import type { Prediction } from "../types/prediction";

const predictions: Prediction[] = [
  {
    id: "p1",

    playerId: "P001",

    fixtureId: "1",

    homeScore: 2,

    awayScore: 1,

    firstTeamToScore: "Home",

    submittedAt: new Date().toISOString(),

    status: "Scored",

    locked: true,

    points: 6,

    exactScore: true,

    correctResult: true,

    correctFTTS: true,

    scored: true,
  },
];

export default predictions;