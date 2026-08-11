import players from "../data/players";
import type { Player } from "../types/player";
import { supabase } from "../lib/supabase";

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

  private mapSupabasePlayer(row: {
    id: string;
    display_name: string;
    joined_at: string | null;
    active: boolean;
    is_admin: boolean;
    username: string | null;
    approval_status: string | null;
    password_hash: string | null;
  }): Player {
    const approvalStatus =
      row.approval_status === "PENDING" ||
      row.approval_status === "APPROVED" ||
      row.approval_status === "REJECTED"
        ? row.approval_status
        : undefined;

    return {
      id: row.id,
      displayName: row.display_name,
      joinedAt: row.joined_at ?? "",
      active: row.active,
      isAdmin: row.is_admin,
      username: row.username ?? undefined,
      passwordHash:
        row.password_hash ?? undefined,
      approvalStatus,
    };
  }

  async getAllFromSupabase(): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select(
        "id, display_name, joined_at, active, is_admin, username, approval_status, password_hash"
      )
      .order("id");

    if (error) {
      throw new Error(
        `Unable to load players from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map((row) =>
      this.mapSupabasePlayer(row)
    );
  }
async getActivePlayersFromSupabase(): Promise<Player[]> {
  const players =
    await this.getAllFromSupabase();

  return players.filter(
    (player) => player.active
  );
}
  async syncPlayersToSupabase(
    sourcePlayers: Player[]
  ): Promise<void> {
    const rows = sourcePlayers.map((player) => ({
      id: player.id,
      display_name: player.displayName,
      joined_at: player.joinedAt || null,
      active: player.active,
      is_admin: player.isAdmin,
      username: player.username ?? null,
      approval_status:
        player.approvalStatus ?? null,
      password_hash:
        player.passwordHash ?? null,
    }));

    const { error } = await supabase
      .from("players")
      .upsert(rows, {
        onConflict: "id",
      });

    if (error) {
      throw new Error(
        `Unable to sync players to Supabase: ${error.message}`
      );
    }
  }
}

const playerRepository =
  new PlayerRepository();

export default playerRepository;
