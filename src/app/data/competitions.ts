import type { Competition } from "../types/competition";

const competitions: Competition[] = [
  {
    id: "BET",
    name: "Betway Premiership",
    logo: "/competitions/betway.png",
    hasStreaks: true,
    totalRounds: 30,
  },
  {
    id: "MTN",
    name: "MTN8",
    logo: "/competitions/mtn8.png",
    hasStreaks: false,
  },
  {
    id: "NED",
    name: "Nedbank Cup",
    logo: "/competitions/nedbank.png",
    hasStreaks: false,
  },
  {
    id: "CAR",
    name: "Carling Knockout",
    logo: "/competitions/carling.png",
    hasStreaks: false,
  },
];

export default competitions;