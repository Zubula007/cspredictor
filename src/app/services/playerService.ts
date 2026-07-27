import playerRepository from "../repositories/playerRepository";
import type { Player } from "../types/player";

class PlayerService {
  getPlayers(): Player[] {
    return playerRepository.getActivePlayers();
  }

  getPlayer(id: string): Player | undefined {
    return playerRepository.getById(id);
  }

  getPlayerByName(displayName: string): Player | undefined {
    return playerRepository.getByDisplayName(displayName);
  }
}

const playerService = new PlayerService();

export default playerService;