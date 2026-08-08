import playerRepository from "../repositories/playerRepository";
import type { Player } from "../types/player";

const SESSION_KEY = "csp-auth-player";

class AuthService {
  registerPlayer(
    displayName: string,
    username: string,
    passwordHash: string
  ): {
    success: boolean;
    player?: Player;
    error?: string;
  } {
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

    const existingUsername =
      playerRepository.getByUsername(cleanUsername);

    if (existingUsername) {
      return {
        success: false,
        error: "That username is already registered.",
      };
    }

    const existingDisplayName =
      playerRepository.getByDisplayName(cleanDisplayName);

    if (existingDisplayName) {
      return {
        success: false,
        error: "That display name is already registered.",
      };
    }

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

    playerRepository.addPlayer(newPlayer);

    return {
      success: true,
      player: newPlayer,
    };
  }

  login(
    username: string,
    passwordHash: string
  ): {
    success: boolean;
    player?: Player;
    error?: string;
  } {
    const cleanUsername = username.trim().toLowerCase();

    const player =
      playerRepository.getByUsername(cleanUsername);

    if (!player) {
      return {
        success: false,
        error: "Username or password is incorrect.",
      };
    }

    if (player.approvalStatus === "PENDING") {
      return {
        success: false,
        error:
          "Your registration is still awaiting Admin approval.",
      };
    }

    if (player.approvalStatus === "REJECTED") {
      return {
        success: false,
        error:
          "Your registration was rejected. Please contact the Admin.",
      };
    }

    if (!player.active) {
      return {
        success: false,
        error:
          "Your account is not active. Please contact the Admin.",
      };
    }

    if (player.passwordHash !== passwordHash) {
      return {
        success: false,
        error: "Username or password is incorrect.",
      };
    }

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