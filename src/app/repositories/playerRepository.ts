import players from "../data/players";
import type { Player } from "../types/player";

const STORAGE_KEY = "cspredictor-players";

class PlayerRepository {
  private players: Player[];

  constructor() {
    this.players = this.loadPlayers();
  }

  private loadPlayers(): Player[] {
    if (typeof window === "undefined") {
      return [...players];
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.error("Unable to load saved players.");
        return [...players];
      }
    }

    return [...players];
  }

  private refreshPlayers() {
    if (typeof window === "undefined") {
      return;
    }

    this.players = this.loadPlayers();
  }

  private savePlayers() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.players)
    );
  }

  getAll(): Player[] {
    this.refreshPlayers();

    return this.players;
  }

  getById(id: string): Player | undefined {
    this.refreshPlayers();

    return this.players.find(
      (player) => player.id === id
    );
  }

  getByDisplayName(
    displayName: string
  ): Player | undefined {
    this.refreshPlayers();

    return this.players.find(
      (player) =>
        player.displayName.toLowerCase() ===
        displayName.toLowerCase()
    );
  }

  getByUsername(
    username: string
  ): Player | undefined {
    this.refreshPlayers();

    return this.players.find(
      (player) =>
        player.username?.toLowerCase() ===
        username.toLowerCase()
    );
  }

  getActivePlayers(): Player[] {
    this.refreshPlayers();

    return this.players.filter(
      (player) => player.active
    );
  }

  getApprovedPlayers(): Player[] {
    this.refreshPlayers();

    return this.players.filter(
      (player) =>
        player.active &&
        player.approvalStatus === "APPROVED"
    );
  }

  getPendingPlayers(): Player[] {
    this.refreshPlayers();

    return this.players.filter(
      (player) =>
        player.approvalStatus === "PENDING"
    );
  }

  addPlayer(player: Player): Player {
    this.refreshPlayers();

    this.players.push(player);

    this.savePlayers();

    return player;
  }

  updatePlayer(
    playerId: string,
    updates: Partial<Player>
  ): Player | undefined {
    this.refreshPlayers();

    const player = this.players.find(
      (item) => item.id === playerId
    );

    if (!player) {
      return undefined;
    }

    Object.assign(player, updates);

    this.savePlayers();

    return player;
  }

  approvePlayer(
    playerId: string
  ): Player | undefined {
    return this.updatePlayer(
      playerId,
      {
        active: true,
        approvalStatus: "APPROVED",
      }
    );
  }

  rejectPlayer(
    playerId: string
  ): Player | undefined {
    return this.updatePlayer(
      playerId,
      {
        active: false,
        approvalStatus: "REJECTED",
      }
    );
  }

  deletePlayer(
    playerId: string
  ): boolean {
    this.refreshPlayers();

    const originalLength =
      this.players.length;

    this.players =
      this.players.filter(
        (player) =>
          player.id !== playerId
      );

    if (
      this.players.length ===
      originalLength
    ) {
      return false;
    }

    this.savePlayers();

    return true;
  }
}

const playerRepository =
  new PlayerRepository();

export default playerRepository;