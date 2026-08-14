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
     * ============================================================
     * CHECK SUPABASE USERNAME
     * ============================================================
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

      return {
        success: false,
        error:
          "Unable to verify your username. Please try again.",
      };
    }

    /*
     * ============================================================
     * CHECK SUPABASE DISPLAY NAME
     * ============================================================
     */

    try {
      const existingDisplayName =
        await playerRepository.getByDisplayNameFromSupabase(
          cleanDisplayName
        );

      if (existingDisplayName) {
        return {
          success: false,
          error:
            "That display name is already registered.",
        };
      }
    } catch (error) {
      console.error(
        "Supabase display name check failed:",
        error
      );

      return {
        success: false,
        error:
          "Unable to verify your display name. Please try again.",
      };
    }

    /*
     * ============================================================
     * CREATE PENDING PLAYER
     * ============================================================
     *
     * Every new registration starts as:
     *
     * PENDING
     * active = false
     * isAdmin = false
     */

    const newPlayer: Player = {
      id: crypto.randomUUID(),

      displayName: cleanDisplayName,

      username: cleanUsername,

      passwordHash,

      joinedAt:
        new Date().toISOString(),

      active: false,

      isAdmin: false,

      approvalStatus: "PENDING",
    };

    /*
     * ============================================================
     * SAVE DIRECTLY TO SUPABASE
     * ============================================================
     */

    try {
      await playerRepository.syncPlayersToSupabase([
        newPlayer,
      ]);
    } catch (error) {
      console.error(
        "Unable to save new player to Supabase:",
        error
      );

      return {
        success: false,
        error:
          "Registration could not be completed. Please try again.",
      };
    }

    /*
     * ============================================================
     * OPTIONAL LOCAL CACHE
     * ============================================================
     *
     * Keep the local repository updated for compatibility
     * with existing parts of CSPredictor.
     *
     * Supabase remains the source of truth.
     */

    try {
      playerRepository.addPlayer(
        newPlayer
      );
    } catch (error) {
      console.warn(
        "Unable to update local player cache:",
        error
      );
    }

    return {
      success: true,
      player: newPlayer,
    };
  }

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  async login(
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    player?: Player;
    error?: string;
  }> {
    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanUsername) {
      return {
        success: false,
        error:
          "Please enter your username.",
      };
    }

    if (!password) {
      return {
        success: false,
        error:
          "Please enter your password.",
      };
    }

    /*
     * ============================================================
     * GET PLAYER FROM SUPABASE
     * ============================================================
     */

    let player: Player | undefined;

    try {
      player =
        await playerRepository.getByUsernameFromSupabase(
          cleanUsername
        );
    } catch (error) {
      console.error(
        "Supabase login lookup failed:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the authentication service. Please try again.",
      };
    }

    /*
     * ============================================================
     * USERNAME NOT FOUND
     * ============================================================
     */

    if (!player) {
      return {
        success: false,
        error:
          "Username or password is incorrect.",
      };
    }

    /*
     * ============================================================
     * PASSWORD CHECK
     * ============================================================
     */

    if (
      player.passwordHash !==
      password
    ) {
      return {
        success: false,
        error:
          "Username or password is incorrect.",
      };
    }

    /*
     * ============================================================
     * APPROVAL CHECK
     * ============================================================
     */

    if (
      player.approvalStatus ===
      "PENDING"
    ) {
      return {
        success: false,
        error:
          "Your registration is still awaiting Admin approval.",
      };
    }

    /*
     * ============================================================
     * REJECTED ACCOUNT
     * ============================================================
     */

    if (
      player.approvalStatus ===
      "REJECTED"
    ) {
      return {
        success: false,
        error:
          "Your registration was rejected. Please contact the Admin.",
      };
    }

    /*
     * ============================================================
     * ACTIVE ACCOUNT CHECK
     * ============================================================
     */

    if (!player.active) {
      return {
        success: false,
        error:
          "Your account is not active. Please contact the Admin.",
      };
    }

    /*
     * ============================================================
     * LOGIN SUCCESS
     * ============================================================
     */

    if (
      typeof window !==
      "undefined"
    ) {
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

  /*
   * ============================================================
   * CURRENT PLAYER
   * ============================================================
   */

  getCurrentPlayer(): Player | null {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    const saved =
      localStorage.getItem(
        SESSION_KEY
      );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(
        saved
      ) as Player;
    } catch {
      localStorage.removeItem(
        SESSION_KEY
      );

      return null;
    }
  }

  /*
   * ============================================================
   * LOGIN STATUS
   * ============================================================
   */

  isLoggedIn(): boolean {
    return (
      this.getCurrentPlayer() !==
      null
    );
  }

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  logout(): void {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.removeItem(
      SESSION_KEY
    );
  }

  /*
   * ============================================================
   * SWITCH PLAYER
   * ============================================================
   *
   * Kept for existing QA/admin compatibility.
   */

  switchPlayer(
    player: Player
  ): void {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(player)
    );
  }
}

const authService =
  new AuthService();

export default authService;