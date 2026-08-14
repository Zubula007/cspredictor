import players from "../data/players";
import type { Player } from "../types/player";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "cspredictor-players";

class PlayerRepository {
  private players: Player[];

  constructor() {
    this.players = this.loadPlayers();
  }

  /* =========================================================
     LOCAL STORAGE
     ========================================================= */

  private loadPlayers(): Player[] {
    if (typeof window === "undefined") {
      return [...players];
    }

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved) as Player[];
      } catch {
        console.error(
          "Unable to load saved players."
        );

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

  /* =========================================================
     LOCAL PLAYER METHODS
     ========================================================= */

  getAll(): Player[] {
    this.refreshPlayers();

    return [...this.players];
  }

  getById(
    id: string
  ): Player | undefined {
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
        player.approvalStatus ===
          "APPROVED"
    );
  }

  getPendingPlayers(): Player[] {
    this.refreshPlayers();

    return this.players.filter(
      (player) =>
        player.approvalStatus ===
        "PENDING"
    );
  }

  addPlayer(
    player: Player
  ): Player {
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

    const player =
      this.players.find(
        (item) =>
          item.id === playerId
      );

    if (!player) {
      return undefined;
    }

    Object.assign(
      player,
      updates
    );

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
        approvalStatus:
          "APPROVED",
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
        approvalStatus:
          "REJECTED",
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

  /* =========================================================
     SUPABASE HELPERS
     ========================================================= */

  private mapSupabasePlayer(
    row: {
      id: string;
      display_name: string;
      joined_at: string | null;
      active: boolean;
      is_admin: boolean;
      username: string | null;
      approval_status: string | null;
      password_hash: string | null;
    }
  ): Player {
    const approvalStatus =
      row.approval_status ===
        "PENDING" ||
      row.approval_status ===
        "APPROVED" ||
      row.approval_status ===
        "REJECTED"
        ? row.approval_status
        : undefined;

    return {
      id: row.id,

      displayName:
        row.display_name,

      joinedAt:
        row.joined_at ?? "",

      active:
        row.active,

      isAdmin:
        row.is_admin,

      username:
        row.username ??
        undefined,

      passwordHash:
        row.password_hash ??
        undefined,

      approvalStatus,
    };
  }

  private readonly playerSelect =
    "id, display_name, joined_at, active, is_admin, username, approval_status, password_hash";

  /* =========================================================
     SUPABASE READ METHODS
     ========================================================= */

  async getAllFromSupabase(): Promise<Player[]> {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .select(
        this.playerSelect
      )
      .order(
        "joined_at",
        {
          ascending: false,
        }
      );

    if (error) {
      throw new Error(
        `Unable to load players from Supabase: ${error.message}`
      );
    }

    return (
      data ?? []
    ).map((row) =>
      this.mapSupabasePlayer(
        row
      )
    );
  }

  async getActivePlayersFromSupabase(): Promise<Player[]> {
    const allPlayers =
      await this.getAllFromSupabase();

    return allPlayers.filter(
      (player) =>
        player.active
    );
  }

  async getByIdFromSupabase(
    id: string
  ): Promise<
    Player | undefined
  > {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .select(
        this.playerSelect
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to find player in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabasePlayer(
      data
    );
  }

  async getByDisplayNameFromSupabase(
    displayName: string
  ): Promise<
    Player | undefined
  > {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .select(
        this.playerSelect
      )
      .ilike(
        "display_name",
        displayName
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to find player in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabasePlayer(
      data
    );
  }

  async getByUsernameFromSupabase(
    username: string
  ): Promise<
    Player | undefined
  > {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .select(
        this.playerSelect
      )
      .ilike(
        "username",
        username
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to find player in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabasePlayer(
      data
    );
  }

  /* =========================================================
     SUPABASE REGISTRATION
     ========================================================= */

  /**
   * Creates a new player in Supabase.
   *
   * IMPORTANT:
   *
   * This is used by player registration only.
   *
   * Registration creates a new row using INSERT.
   * Admin approval does NOT use this method.
   */

  async syncPlayersToSupabase(
    sourcePlayers: Player[]
  ): Promise<void> {
    if (
      !sourcePlayers ||
      sourcePlayers.length === 0
    ) {
      return;
    }

    const rows =
      sourcePlayers.map(
        (player) => ({
          id: player.id,

          display_name:
            player.displayName,

          joined_at:
            player.joinedAt ||
            null,

          active:
            player.active,

          is_admin:
            player.isAdmin,

          username:
            player.username ??
            null,

          approval_status:
            player.approvalStatus ??
            "PENDING",

          password_hash:
            player.passwordHash ??
            null,
        })
      );

    const {
      error,
    } = await supabase
      .from("players")
      .insert(rows);

    if (error) {
      console.error(
        "Supabase registration error:",
        error
      );

      throw new Error(
        `Unable to sync players to Supabase: ${error.message}`
      );
    }
  }

  /* =========================================================
     SUPABASE ADMIN OPERATIONS
     ========================================================= */

  /**
   * Approve player.
   *
   * IMPORTANT:
   * Uses UPDATE, NOT UPSERT.
   *
   * This avoids the INSERT RLS policy that caused
   * the previous "new row violates row-level security"
   * error.
   */

  async approvePlayerInSupabase(
    playerId: string
  ): Promise<Player> {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .update({
        active: true,

        approval_status:
          "APPROVED",
      })
      .eq(
        "id",
        playerId
      )
      .select(
        this.playerSelect
      )
      .single();

    if (error) {
      console.error(
        "Supabase approval error:",
        error
      );

      throw new Error(
        `Unable to approve player in Supabase: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Player approval returned no player."
      );
    }

    const approvedPlayer =
      this.mapSupabasePlayer(
        data
      );

    this.updatePlayer(
      playerId,
      approvedPlayer
    );

    return approvedPlayer;
  }

  /**
   * Reject player.
   *
   * Uses UPDATE.
   */

  async rejectPlayerInSupabase(
    playerId: string
  ): Promise<Player> {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .update({
        active: false,

        approval_status:
          "REJECTED",
      })
      .eq(
        "id",
        playerId
      )
      .select(
        this.playerSelect
      )
      .single();

    if (error) {
      console.error(
        "Supabase rejection error:",
        error
      );

      throw new Error(
        `Unable to reject player in Supabase: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Player rejection returned no player."
      );
    }

    const rejectedPlayer =
      this.mapSupabasePlayer(
        data
      );

    this.updatePlayer(
      playerId,
      rejectedPlayer
    );

    return rejectedPlayer;
  }

  /**
   * Activate / deactivate player.
   *
   * Uses UPDATE.
   */

  async setPlayerActiveInSupabase(
    playerId: string,
    active: boolean
  ): Promise<Player> {
    const {
      data,
      error,
    } = await supabase
      .from("players")
      .update({
        active,
      })
      .eq(
        "id",
        playerId
      )
      .select(
        this.playerSelect
      )
      .single();

    if (error) {
      console.error(
        "Supabase status update error:",
        error
      );

      throw new Error(
        `Unable to update player status in Supabase: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Player status update returned no player."
      );
    }

    const updatedPlayer =
      this.mapSupabasePlayer(
        data
      );

    this.updatePlayer(
      playerId,
      updatedPlayer
    );

    return updatedPlayer;
  }

  /**
   * Delete player.
   *
   * Uses DELETE.
   */

  async deletePlayerFromSupabase(
    playerId: string
  ): Promise<void> {
    const {
      error,
    } = await supabase
      .from("players")
      .delete()
      .eq(
        "id",
        playerId
      );

    if (error) {
      console.error(
        "Supabase delete error:",
        error
      );

      throw new Error(
        `Unable to delete player from Supabase: ${error.message}`
      );
    }

    this.deletePlayer(
      playerId
    );
  }
}

const playerRepository =
  new PlayerRepository();

export default playerRepository;