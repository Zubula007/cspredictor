import type { Player } from "../types/player";

const players: Player[] = [];

export function getLeaderboard(): Player[] {
  return players.sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
}

export function addPlayer(player: Player) {
  players.push(player);
}