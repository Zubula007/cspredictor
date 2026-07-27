import players from "../data/players";
import type { Player } from "../types/player";

class PlayerRepository {
  getAll(): Player[] {
    return players;
  }

  getById(id: string): Player | undefined {
    return players.find((player) => player.id === id);
  }

  getByDisplayName(displayName: string): Player | undefined {
    return players.find(
      (player) =>
        player.displayName.toLowerCase() === displayName.toLowerCase()
    );
  }

  getActivePlayers(): Player[] {
    return players.filter((player) => player.active);
  }
}

const playerRepository = new PlayerRepository();

export default playerRepository;