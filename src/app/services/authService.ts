import playerRepository from "../repositories/playerRepository";
import type { Player } from "../types/player";

const SESSION_KEY = "csp-auth-player";

class AuthService {
  /*
   * ============================================================
   * REGISTER PLAYER
   * ============================================================
   *
   * EXISTING PLAYER:
   *
   * Example:
   * P002 → Sam
   *
   * If Sam registers, we UPDATE P002.
   *
   * We NEVER create a new UUID for an existing player.
   *
   * NEW PLAYER:
   *
   * If no existing display name is found,
   * a new UUID player is created.
   * ============================================================
   */

  async registerPlayer(
    displayName: string,
    username: string,
    passwordHash: string
  ): Promise<{
    success: boolean;
    player?: Player;
    error?: string;
  }> {
    const cleanDisplayName =
      displayName.trim();

    const cleanUsername =
      username.trim().toLowerCase();

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
     * STEP 1
     * FIND EXISTING PLAYER BY DISPLAY NAME
     * ============================================================
     */

    let existingPlayer:
      | Player
      | undefined;

    try {
      existingPlayer =
        await playerRepository.getByDisplayNameFromSupabase(
          cleanDisplayName
        );
    } catch (error) {
      console.error(
        "Supabase display name lookup failed:",
        error
      );

      return {
        success: false,
        error:
          "Unable to verify your CSPredictor profile. Please try again.",
      };
    }

    /*
     * ============================================================
     * STEP 2
     * CHECK USERNAME
     * ============================================================
     */

    try {
      const existingUsername =
        await playerRepository.getByUsernameFromSupabase(
          cleanUsername
        );

      /*
       * Username belongs to another player.
       */

      if (
        existingUsername &&
        (
          !existingPlayer ||
          existingUsername.id !==
            existingPlayer.id
        )
      ) {
        return {
          success: false,
          error:
            "That username is already registered.",
        };
      }

      /*
       * Same player + same username means
       * the account is already registered.
       */

      if (
        existingUsername &&
        existingPlayer &&
        existingUsername.id ===
          existingPlayer.id
      ) {
        return {
          success: false,
          error:
            "This player profile is already registered. Please use the Login option.",
        };
      }
    } catch (error) {
      console.error(
        "Supabase username lookup failed:",
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
     * STEP 3
     * LINK EXISTING PLAYER
     * ============================================================
     *
     * THIS IS THE IMPORTANT FIX.
     *
     * DO NOT use syncPlayersToSupabase() here.
     *
     * syncPlayersToSupabase() performs INSERT.
     *
     * registerPlayerToSupabase() performs:
     *
     * EXISTING PLAYER → UPDATE
     * NEW PLAYER      → INSERT
     *
     * Example:
     *
     * P002 → Sam
     *
     * Sam registers with:
     *
     * username = samtest2
     *
     * Result:
     *
     * P002 → Sam → samtest2
     *
     * NOT:
     *
     * UUID → Sam
     */

    if (existingPlayer) {
      try {
        const linkedPlayer =
          await playerRepository.registerPlayerToSupabase({
            ...existingPlayer,

            /*
             * NEVER replace the existing ID.
             */

            id: existingPlayer.id,

            /*
             * Preserve original player identity.
             */

            displayName:
              existingPlayer.displayName,

            /*
             * Attach login credentials.
             */

            username:
              cleanUsername,

            passwordHash:
              passwordHash,

            /*
             * Require Admin approval.
             */

            active: false,

            approvalStatus:
              "PENDING",

            /*
             * Preserve original join date.
             */

            joinedAt:
              existingPlayer.joinedAt,

            /*
             * Preserve Admin status.
             */

            isAdmin:
              existingPlayer.isAdmin,
          });

        /*
         * Keep local compatibility cache updated.
         */

        try {
          playerRepository.updatePlayer(
            linkedPlayer.id,
            linkedPlayer
          );
        } catch (error) {
          console.warn(
            "Unable to update local player cache:",
            error
          );
        }

        return {
          success: true,
          player: linkedPlayer,
        };
      } catch (error) {
        console.error(
          "Unable to link existing player:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "";

        return {
          success: false,
          error:
            message ||
            "Your existing CSPredictor profile could not be linked. Please try again.",
        };
      }
    }

    /*
     * ============================================================
     * STEP 4
     * CREATE BRAND NEW PLAYER
     * ============================================================
     */

    const newPlayer: Player = {
      id: crypto.randomUUID(),

      displayName:
        cleanDisplayName,

      username:
        cleanUsername,

      passwordHash:
        passwordHash,

      joinedAt:
        new Date().toISOString(),

      active: false,

      isAdmin: false,

      approvalStatus:
        "PENDING",
    };

    /*
     * ============================================================
     * SAVE NEW PLAYER
     * ============================================================
     */

    try {
      const registeredPlayer =
        await playerRepository.registerPlayerToSupabase(
          newPlayer
        );

      return {
        success: true,
        player: registeredPlayer,
      };
    } catch (error) {
      console.error(
        "Unable to save new player to Supabase:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      return {
        success: false,
        error:
          message ||
          "Registration could not be completed. Please try again.",
      };
    }
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

    let player:
      | Player
      | undefined;

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
     * PENDING APPROVAL
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

  getCurrentPlayer():
    | Player
    | null {
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
   * ============================================================
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