import players from "../data/players";
import type { Player } from "../types/player";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "cspredictor-players";

/*
 * ============================================================
 * LEGACY PLAYERS
 * ============================================================
 *
 * These players already exist in CSPredictor and already have
 * prediction / leaderboard history attached to their IDs.
 *
 * Registration must NEVER create a new ID for them.
 */
const LEGACY_PLAYER_IDS = new Set([
  "P001",
  "P002",
  "P003",
  "P004",
  "P005",
]);

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

  private refreshPlayers(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.players = this.loadPlayers();
  }

  private savePlayers(): void {
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
    const cleanDisplayName =
      displayName.trim();

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
        cleanDisplayName
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
    const cleanUsername =
      username.trim().toLowerCase();

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
        cleanUsername
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
   * Register a player.
   *
   * LEGACY PLAYER:
   *
   * If the display name belongs to one of the existing
   * P001-P005 players, UPDATE that existing record.
   *
   * The existing ID is preserved.
   *
   * Existing prediction / leaderboard history therefore
   * remains attached to the same player.
   *
   * The account becomes PENDING until Admin approval.
   *
   * NEW PLAYER:
   *
   * If there is no existing display name, a brand-new
   * player is inserted using the supplied ID.
   */

  async registerPlayerToSupabase(
    player: Player
  ): Promise<Player> {
    const cleanDisplayName =
      player.displayName.trim();

    const cleanUsername =
      player.username
        ?.trim()
        .toLowerCase();

    /*
     * ---------------------------------------------------------
     * CHECK FOR EXISTING DISPLAY NAME
     * ---------------------------------------------------------
     */

    const existingPlayer =
      await this.getByDisplayNameFromSupabase(
        cleanDisplayName
      );

    /*
     * ---------------------------------------------------------
     * TEMPORARY DIAGNOSTIC
     * ---------------------------------------------------------
     *
     * This confirms exactly what Supabase returned for the
     * display name and whether the returned ID is recognised
     * as a legacy CSPredictor player.
     */

    console.log(
      "CSP LEGACY REGISTRATION CHECK:",
      {
        cleanDisplayName,

        existingPlayerId:
          existingPlayer?.id,

        existingPlayerName:
          existingPlayer?.displayName,

        existingPlayerUsername:
          existingPlayer?.username,

        isLegacy:
          existingPlayer
            ? LEGACY_PLAYER_IDS.has(
                existingPlayer.id
              )
            : false,
      }
    );

    /*
     * ---------------------------------------------------------
     * LEGACY PLAYER LINK
     * ---------------------------------------------------------
     */

    if (
      existingPlayer &&
      LEGACY_PLAYER_IDS.has(
        existingPlayer.id
      )
    ) {
      console.log(
        "CSP LEGACY PLAYER MATCH FOUND:",
        existingPlayer.id
      );

      /*
       * IMPORTANT:
       *
       * Preserve:
       * - existing ID
       * - existing joinedAt
       * - existing isAdmin
       * - existing prediction history
       * - existing leaderboard history
       *
       * Only authentication / registration fields change.
       */

      const {
        data,
        error,
      } = await supabase
        .from("players")
        .update({
          username:
            cleanUsername ??
            null,

          password_hash:
            player.passwordHash ??
            null,

          active: false,

          approval_status:
            "PENDING",
        })
        .eq(
          "id",
          existingPlayer.id
        )
        .select(
          this.playerSelect
        )
        .single();

      if (error) {
        console.error(
          "Supabase legacy player linking error:",
          error
        );

        throw new Error(
          `Unable to link legacy player: ${error.message}`
        );
      }

      if (!data) {
        throw new Error(
          "Legacy player linking returned no player."
        );
      }

      const linkedPlayer =
        this.mapSupabasePlayer(
          data
        );

      /*
       * Update local compatibility cache
       * using the ORIGINAL legacy ID.
       */

      this.updatePlayer(
        existingPlayer.id,
        linkedPlayer
      );

      console.log(
        "CSP LEGACY PLAYER LINKED SUCCESSFULLY:",
        {
          id:
            linkedPlayer.id,

          displayName:
            linkedPlayer.displayName,

          username:
            linkedPlayer.username,

          active:
            linkedPlayer.active,

          approvalStatus:
            linkedPlayer.approvalStatus,
        }
      );

      return linkedPlayer;
    }

    /*
     * ---------------------------------------------------------
     * EXISTING NON-LEGACY DISPLAY NAME
     * ---------------------------------------------------------
     *
     * We do not allow a new registration to take over
     * another existing player's display name.
     */

    if (existingPlayer) {
      console.error(
        "CSP NON-LEGACY DISPLAY NAME CONFLICT:",
        {
          id:
            existingPlayer.id,

          displayName:
            existingPlayer.displayName,

          expectedLegacyIds:
            Array.from(
              LEGACY_PLAYER_IDS
            ),
        }
      );

      throw new Error(
        "That display name is already registered. Please choose another display name."
      );
    }

    /*
     * ---------------------------------------------------------
     * NEW PLAYER
     * ---------------------------------------------------------
     */

    const newPlayer: Player = {
      ...player,

      username:
        cleanUsername,

      active: false,

      isAdmin: false,

      approvalStatus:
        "PENDING",
    };

    const {
      data,
      error,
    } = await supabase
      .from("players")
      .insert({
        id: newPlayer.id,

        display_name:
          newPlayer.displayName,

        joined_at:
          newPlayer.joinedAt ||
          null,

        active: false,

        is_admin: false,

        username:
          newPlayer.username ??
          null,

        approval_status:
          "PENDING",

        password_hash:
          newPlayer.passwordHash ??
          null,
      })
      .select(
        this.playerSelect
      )
      .single();

    if (error) {
      console.error(
        "Supabase new player registration error:",
        error
      );

      throw new Error(
        `Unable to register new player: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "New player registration returned no player."
      );
    }

    const registeredPlayer =
      this.mapSupabasePlayer(
        data
      );

    /*
     * Keep local cache compatible.
     */

    try {
      const existingLocal =
        this.getById(
          registeredPlayer.id
        );

      if (existingLocal) {
        this.updatePlayer(
          registeredPlayer.id,
          registeredPlayer
        );
      } else {
        this.addPlayer(
          registeredPlayer
        );
      }
    } catch (error) {
      console.warn(
        "Unable to update local player cache:",
        error
      );
    }

    return registeredPlayer;
  }

  /**
   * Existing compatibility method.
   *
   * This remains available for existing code.
   *
   * It performs INSERT only.
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
   * Uses UPDATE, NOT UPSERT.
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