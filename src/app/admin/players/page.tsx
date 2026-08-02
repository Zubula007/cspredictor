"use client";

import playerRepository from "../../repositories/playerRepository";

export default function AdminPlayersPage() {
  const players = playerRepository.getAll();

  return (
    <main className="min-h-screen bg-black p-8 text-white">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-center text-4xl font-extrabold text-yellow-400">
          👥 Player Management
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Manage CSPredictor participants
        </p>


        <div className="mt-8 rounded-xl border border-yellow-500 bg-zinc-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            Registered Players
          </h2>


          {players.map((player) => (

            <div
              key={player.id}
              className="mb-4 flex items-center justify-between rounded-lg bg-black p-4"
            >

              <div>

                <p className="text-lg font-bold">
                  {player.displayName}
                </p>

                <p
                  className={
                    player.active
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {player.active
                    ? "🟢 Active"
                    : "🔴 Disabled"}
                </p>

              </div>


              <div className="text-sm text-gray-400">
                Player ID: {player.id}
              </div>


            </div>

          ))}


          {players.length === 0 && (
            <p className="text-center text-gray-400">
              No players available.
            </p>
          )}


        </div>


      </div>

    </main>
  );
}