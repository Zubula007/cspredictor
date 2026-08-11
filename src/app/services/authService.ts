import playerRepository from "../repositories/playerRepository";
import type { Player } from "../types/player";

const SESSION_KEY = "csp-auth-player";

class AuthService {
  async registerPlayer(
    displayName: string,
    username: string,
    passwordHash: string
  ): Promise<{
    success: boolean;
    player?: Player;
    error?: string;
  }> {
    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanDisplayName) {
      return {
        success: false,
        error: "Please enter your display name.",
      };
    }

    if (!cleanUsername) {
      return {
        success: false,
        error: "Please enter a username.",
      };
    }

    if (!passwordHash) {
      return {
        success: false,
        error: "Please enter a password.",
      };
    }

    /*
     * Check Supabase first for an existing username.
     */
    try {
      const existingUsername =
        await playerRepository.getByUsernameFromSupabase(
          cleanUsername
        );

      if (existingUsername) {
        return {
          success: false,
          error: "That username is already registered.",
        };
      }
    } catch (error) {
      console.error(
        "Supabase username check failed:",
        error
      );

      /*
       * Continue with the local repository as fallback.
       */
    }

    /*
     * Check local repository for an existing username.
     */
    const localExistingUsername =
      playerRepository.getByUsername(cleanUsername);

    if (localExistingUsername) {
      return {
        success: false,
        error: "That username is already registered.",
      };
    }

    /*
     * Check Supabase for an existing display name.
     */
    try {
      const existingDisplayName =
        await playerRepository.getByDisplayNameFromSupabase(
          cleanDisplayName
        );

      if (existingDisplayName) {
        return {
          success: false,
          error: "That display name is already registered.",
        };
      }
    } catch (error) {
      console.error(
        "Supabase display name check failed:",
        error
      );

      /*
       * Continue with the local repository as fallback.
       */
    }

    /*
     * Check local repository for an existing display name.
     */
    const localExistingDisplayName =
      playerRepository.getByDisplayName(
        cleanDisplayName
      );

    if (localExistingDisplayName) {
      return {
        success: false,
        error: "That display name is already registered.",
      };
    }

    /*
     * New registrations always begin as PENDING.
     */
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      displayName: cleanDisplayName,
      username: cleanUsername,
      passwordHash,
      joinedAt: new Date().toISOString(),
      active: false,
      isAdmin: false,
      approvalStatus: "PENDING",
    };

    /*
     * Save locally.
     */
    playerRepository.addPlayer(newPlayer);

    /*
     * Save to Supabase.
     */
    try {
      await playerRepository.syncPlayersToSupabase([
        newPlayer,
      ]);
    } catch (error) {
      console.error(
        "Unable to sync new player to Supabase:",
        error
      );

      /*
       * Local registration has already succeeded.
       */
    }

    return {
      success: true,
      player: newPlayer,
    };
  }

    async login(
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    player?: Player;
    error?: string;
  }> {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      return {
        success: false,
        error: "Please enter your username.",
      };
    }

    if (!password) {
      return {
        success: false,
        error: "Please enter your password.",
      };
    }

        let supabasePlayer: Player | undefined;
    const localPlayer =
      playerRepository.getByUsername(
        cleanUsername
      );

    /*
     * Get the player from Supabase.
     */
    try {
      supabasePlayer =
        await playerRepository.getByUsernameFromSupabase(
          cleanUsername
        );
    } catch (error) {
      console.error(
        "Supabase login lookup failed:",
        error
      );
    }

    /*
     * If either record exists, use it for password
     * verification.
     *
     * Prefer the local approved/active record when
     * the Supabase record has stale approval data.
     */
    let player: Player | undefined;

    if (
      localPlayer &&
      localPlayer.active &&
      localPlayer.approvalStatus === "APPROVED"
    ) {
      player = localPlayer;
    } else if (supabasePlayer) {
      player = supabasePlayer;
    } else {
      player = localPlayer;
    }

    /*
     * Username does not exist.
     */
    if (!player) {
      return {
        success: false,
        error:
          "Username or password is incorrect.",
      };
    }

    /*
     * Check the password against both records.
     *
     * This handles cases where the local and Supabase
     * player records are temporarily different.
     */
    const localPasswordMatches =
      localPlayer?.passwordHash === password;

    const supabasePasswordMatches =
      supabasePlayer?.passwordHash === password;

    if (
      !localPasswordMatches &&
      !supabasePasswordMatches
    ) {
      return {
        success: false,
        error:
          "Username or password is incorrect.",
      };
    }

    /*
     * If the local record has the correct password
     * and is approved/active, use that record.
     */
    if (
      localPasswordMatches &&
      localPlayer
    ) {
      player = localPlayer;
    }

    /*
     * If the Supabase record has the correct password
     * and the local record does not, use Supabase.
     */
    if (
      !localPasswordMatches &&
      supabasePasswordMatches &&
      supabasePlayer
    ) {
      player = supabasePlayer;
    }

    /*
     * Approval check.
     */
    if (
      player.approvalStatus === "PENDING"
    ) {
      return {
        success: false,
        error:
          "Your registration is still awaiting Admin approval.",
      };
    }

    /*
     * Rejected account.
     */
    if (
      player.approvalStatus === "REJECTED"
    ) {
      return {
        success: false,
        error:
          "Your registration was rejected. Please contact the Admin.",
      };
    }

    /*
     * Account must be active.
     */
    if (!player.active) {
      return {
        success: false,
        error:
          "Your account is not active. Please contact the Admin.",
      };
    }

    /*
     * Login successful.
     */
    if (typeof window !== "undefined") {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(player)
      );
    }

    return {
      success: true,
      player,
    };
  }

  getCurrentPlayer(): Player | null {
    if (typeof window === "undefined") {
      return null;
    }

    const saved =
      localStorage.getItem(SESSION_KEY);

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as Player;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentPlayer() !== null;
  }

  logout(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(SESSION_KEY);
  }

  switchPlayer(player: Player): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(player)
    );
  }
}

const authService = new AuthService();

export default authService;


