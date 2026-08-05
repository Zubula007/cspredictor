"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import playerRepository from "../../../repositories/playerRepository";

export default function CreatePlayerPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [active, setActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [message, setMessage] = useState("");

  function createPlayer() {
    const name = displayName.trim();

    if (!name) {
      setMessage("Please enter a player name.");
      return;
    }

    const existing =
      playerRepository.getByDisplayName(name);

    if (existing) {
      setMessage("A player with this name already exists.");
      return;
    }

    playerRepository.addPlayer({
      id: `P${Date.now()}`,
      displayName: name,
      joinedAt: new Date().toISOString(),
      active,
      isAdmin,
    });

    setMessage("✅ Player created successfully.");

    setTimeout(() => {
      router.push("/admin/players");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-500 bg-zinc-900 p-8 shadow-xl">

        <h1 className="text-center text-4xl font-extrabold text-yellow-400">
          ➕ Add Player
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Register a new CSPredictor participant
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
              placeholder="Player name"
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

            <span>Active Player</span>

          </label>

          <label className="flex items-center gap-3 rounded-xl border border-yellow-500 bg-black p-4">

            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) =>
                setIsAdmin(e.target.checked)
              }
            />

            <span>Administrator</span>

          </label>

          <button
            onClick={createPlayer}
            className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            Save Player
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