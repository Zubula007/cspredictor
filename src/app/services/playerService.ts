import playerRepository from "../repositories/playerRepository";
import type { Player } from "../types/player";

class PlayerService {
  getActivePlayers(): Player[] {
    return playerRepository.getActivePlayers();
  }

  getById(id: string): Player | undefined {
    return playerRepository.getById(id);
  }

  getByDisplayName(
    displayName: string
  ): Player | undefined {
    return playerRepository.getByDisplayName(
      displayName
    );
  }

  async getAllFromSupabase(): Promise<Player[]> {
    return playerRepository.getAllFromSupabase();
  }
}

const playerService = new PlayerService();

export default playerService;