"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import playerRepository from "../../../repositories/playerRepository";

export default function EditPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const playerId = searchParams.get("player");

  const [displayName, setDisplayName] = useState("");
  const [active, setActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!playerId) {
      setMessage("Player not found.");
      return;
    }

    const player =
      playerRepository.getById(playerId);

    if (!player) {
      setMessage("Player not found.");
      return;
    }

    setDisplayName(player.displayName);
    setActive(player.active);
    setIsAdmin(player.isAdmin);
  }, [playerId]);

  function saveChanges() {
    if (!playerId) {
      setMessage("Invalid player.");
      return;
    }

    const name = displayName.trim();

    if (!name) {
      setMessage("Please enter a player name.");
      return;
    }

    const existing =
      playerRepository.getByDisplayName(name);

    if (
      existing &&
      existing.id !== playerId
    ) {
      setMessage(
        "A player with this name already exists."
      );
      return;
    }

    playerRepository.updatePlayer(
      playerId,
      {
        displayName: name,
        active,
        isAdmin,
      }
    );

    setMessage(
      "✅ Player updated successfully."
    );

    setTimeout(() => {
      router.push("/admin/players");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-500 bg-zinc-900 p-8 shadow-xl">

        <h1 className="text-center text-4xl font-extrabold text-yellow-400">
          ✏️ Edit Player
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Update CSPredictor participant details
        </p>

        <div className="mt-8 space-y-6">

          <div>
            <label className="mb-2 block font-semibold">
              Display Name
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value)
              }
              className="w-full rounded-xl bg-black p-3"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-yellow-500 bg-black p-4">

            <input
              type="checkbox"
              checked={active}
              onChange={(e) =>
                setActive(e.target.checked)
              }
            />

            <span>
              Active Player
            </span>

          </label>

          <label className="flex items-center gap-3 rounded-xl border border-yellow-500 bg-black p-4">

            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) =>
                setIsAdmin(e.target.checked)
              }
            />

            <span>
              Administrator
            </span>

          </label>

          <button
            onClick={saveChanges}
            className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            Save Changes
          </button>

          {message && (
            <div className="rounded-xl border border-green-500 bg-green-900/20 p-4 text-center">
              
              <p className="font-semibold text-green-300">
                {message}
              </p>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

