"use client";

import { useEffect, useState } from "react";

import playerRepository from "../repositories/playerRepository";
import authService from "../services/authService";

type PlayerFormProps = {
  playerName: string;
  setPlayerName: (name: string) => void;
};

export default function PlayerForm({
  playerName,
  setPlayerName,
}: PlayerFormProps) {
  const [players, setPlayers] = useState<
    ReturnType<typeof playerRepository.getAll>
  >([]);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const activePlayers =
          await playerRepository.getActivePlayersFromSupabase();

        setPlayers(activePlayers);
      } catch (error) {
        console.error(
          "Unable to load active players from Supabase:",
          error
        );

        setPlayers(
          playerRepository.getActivePlayers()
        );
      }
    };

    loadPlayers();
  }, []);

  const handlePlayerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const name = event.target.value;

    setPlayerName(name);

    if (!name) {
      authService.logout();
      return;
    }

    const player =
      playerRepository.getByDisplayName(name);

    if (!player) {
      authService.logout();
      return;
    }

    authService.switchPlayer(player);
  };

  return (
    <div className="rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-5 shadow-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">👤</span>

        <div className="flex-1">
          <p className="font-bold text-yellow-400">
            Player
          </p>

          <select
            value={playerName}
            onChange={handlePlayerChange}
            className="mt-3 w-full rounded-xl border border-yellow-400 bg-black p-3 text-white outline-none focus:border-yellow-300"
          >
            <option value="">
              Select your name
            </option>

            {players.map((player) => (
              <option
                key={player.id}
                value={player.displayName}
              >
                {player.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}