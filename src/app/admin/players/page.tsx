"use client";

import Link from "next/link";
import { useState } from "react";

import playerRepository from "../../repositories/playerRepository";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState(
    playerRepository.getAll()
  );

  const [search, setSearch] = useState("");

  const activePlayers = players.filter(
    (player) => player.active
  );

  const inactivePlayers = players.filter(
    (player) => !player.active
  );

  const filteredPlayers = players.filter(
    (player) =>
      player.displayName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  function togglePlayerStatus(
    playerId: string,
    currentStatus: boolean
  ) {
    playerRepository.updatePlayer(
      playerId,
      {
        active: !currentStatus,
      }
    );

    setPlayers(
      playerRepository.getAll()
    );
  }

  function deletePlayer(
    playerId: string,
    displayName: string
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${displayName}?`
      );

    if (!confirmed) {
      return;
    }

    playerRepository.deletePlayer(
      playerId
    );

    setPlayers(
      playerRepository.getAll()
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-yellow-400">
            👥 Player Management
          </h1>

          <p className="mt-3 text-gray-400">
            Manage CSPredictor participants
          </p>
        </div>


        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              Total Players
            </p>

            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {players.length}
            </p>
          </div>


          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              Active Players
            </p>

            <p className="mt-2 text-4xl font-bold text-green-400">
              {activePlayers.length}
            </p>
          </div>


          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              Inactive Players
            </p>

            <p className="mt-2 text-4xl font-bold text-red-400">
              {inactivePlayers.length}
            </p>
          </div>

        </div>


        <div className="mt-8 flex justify-between gap-4">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="🔎 Search players..."
            className="w-full rounded-xl bg-zinc-900 border border-yellow-500 p-3 text-white"
          />


          <Link
            href="/admin/players/create"
            className="whitespace-nowrap rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            ➕ Add Player
          </Link>

        </div>


        <div className="mt-8 rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            Registered Players
          </h2>


          {filteredPlayers.length === 0 ? (

            <p className="text-center text-gray-400">
              No players found.
            </p>

          ) : (

            <div className="space-y-4">

              {filteredPlayers.map((player) => (

                <div
                  key={player.id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-black p-5 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <h3 className="text-xl font-bold text-white">
                      {player.displayName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Player ID: {player.id}
                    </p>

                    <p
                      className={`mt-2 font-semibold ${
                        player.active
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {player.active
                        ? "🟢 Active"
                        : "🔴 Inactive"}
                    </p>

                  </div>


                  <div className="flex flex-wrap gap-3">

                    <Link
                      href={`/admin/players/edit?player=${player.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
                    >
                      ✏️ Edit
                    </Link>


                    <button
                      onClick={() =>
                        togglePlayerStatus(
                          player.id,
                          player.active
                        )
                      }
                      className="rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition hover:bg-yellow-500"
                    >
                      {player.active
                        ? "🚫 Deactivate"
                        : "✅ Activate"}
                    </button>


                    <button
                      onClick={() =>
                        deletePlayer(
                          player.id,
                          player.displayName
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500"
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </main>
  );
}