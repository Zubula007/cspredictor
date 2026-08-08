"use client";

import Link from "next/link";
import { useState } from "react";

import playerRepository from "../../repositories/playerRepository";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState(
    playerRepository.getAll()
  );

  const [search, setSearch] = useState("");

  const pendingPlayers = players.filter(
    (player) =>
      player.approvalStatus === "PENDING"
  );

  const approvedPlayers = players.filter(
    (player) =>
      player.approvalStatus === "APPROVED" &&
      player.active
  );

  const rejectedPlayers = players.filter(
    (player) =>
      player.approvalStatus === "REJECTED"
  );

  const inactivePlayers = players.filter(
    (player) =>
      !player.active &&
      player.approvalStatus !== "PENDING" &&
      player.approvalStatus !== "REJECTED"
  );

  const filteredPlayers = players.filter(
    (player) =>
      player.displayName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      player.username
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  function refreshPlayers() {
    setPlayers(playerRepository.getAll());
  }

  function approvePlayer(playerId: string) {
    playerRepository.approvePlayer(playerId);

    refreshPlayers();
  }

  function rejectPlayer(playerId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to reject this registration?"
    );

    if (!confirmed) {
      return;
    }

    playerRepository.rejectPlayer(playerId);

    refreshPlayers();
  }

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

    refreshPlayers();
  }

  function deletePlayer(
    playerId: string,
    displayName: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${displayName}?`
    );

    if (!confirmed) {
      return;
    }

    playerRepository.deletePlayer(playerId);

    refreshPlayers();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-yellow-400 md:text-5xl">
            👥 Player Management
          </h1>

          <p className="mt-3 text-gray-400">
            Manage CSPredictor participants and registration approvals
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-10 grid gap-4 md:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-center">
            <p className="text-sm uppercase text-gray-400">
              Total Players
            </p>

            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {players.length}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-yellow-500 bg-yellow-500/10 p-6 text-center">
            <p className="text-sm uppercase text-yellow-300">
              Pending Approval
            </p>

            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {pendingPlayers.length}
            </p>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-green-600 bg-green-900/20 p-6 text-center">
            <p className="text-sm uppercase text-green-300">
              Approved Players
            </p>

            <p className="mt-2 text-4xl font-bold text-green-400">
              {approvedPlayers.length}
            </p>
          </div>

          {/* Rejected */}
          <div className="rounded-2xl border border-red-600 bg-red-900/20 p-6 text-center">
            <p className="text-sm uppercase text-red-300">
              Rejected
            </p>

            <p className="mt-2 text-4xl font-bold text-red-400">
              {rejectedPlayers.length}
            </p>
          </div>

        </div>

        {/* Search + Add */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-between">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="🔎 Search by player name or username..."
            className="w-full rounded-xl border border-yellow-500 bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <Link
            href="/admin/players/create"
            className="whitespace-nowrap rounded-xl bg-yellow-400 px-6 py-3 text-center font-bold text-black transition hover:bg-yellow-300"
          >
            ➕ Add Player
          </Link>

        </div>

        {/* Pending Registrations */}
        {pendingPlayers.length > 0 && (
          <div className="mt-8 rounded-2xl border border-yellow-500 bg-zinc-900 p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  🟡 Pending Registrations
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  These players are waiting for Admin approval.
                </p>
              </div>

              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                {pendingPlayers.length} Pending
              </span>

            </div>

            <div className="space-y-4">

              {pendingPlayers
                .filter(
                  (player) =>
                    player.displayName
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    player.username
                      ?.toLowerCase()
                      .includes(search.toLowerCase())
                )
                .map((player) => (

                  <div
                    key={player.id}
                    className="flex flex-col gap-5 rounded-xl border border-yellow-500/40 bg-black p-5 md:flex-row md:items-center md:justify-between"
                  >

                    <div>

                      <h3 className="text-xl font-bold text-white">
                        {player.displayName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        Username:{" "}
                        <span className="font-semibold text-yellow-400">
                          {player.username}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Registered:{" "}
                        {new Date(
                          player.joinedAt
                        ).toLocaleString("en-ZA")}
                      </p>

                      <p className="mt-2 font-semibold text-yellow-400">
                        🟡 Awaiting Admin Approval
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                      <button
                        onClick={() =>
                          approvePlayer(player.id)
                        }
                        className="rounded-lg bg-green-600 px-5 py-2 font-bold text-white transition hover:bg-green-500"
                      >
                        ✅ Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectPlayer(player.id)
                        }
                        className="rounded-lg bg-red-600 px-5 py-2 font-bold text-white transition hover:bg-red-500"
                      >
                        ❌ Reject
                      </button>

                    </div>

                  </div>

                ))}

            </div>

          </div>
        )}

        {/* No Pending Registrations */}
        {pendingPlayers.length === 0 && (
          <div className="mt-8 rounded-2xl border border-green-700 bg-green-900/10 p-6 text-center">

            <p className="text-2xl">
              ✅
            </p>

            <h2 className="mt-2 text-xl font-bold text-green-400">
              No Pending Registrations
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              All player registrations have been processed.
            </p>

          </div>
        )}

        {/* Registered Players */}
        <div className="mt-8 rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                Registered Players
              </h2>

              <p className="text-sm text-gray-400">
                Approved, rejected and inactive player accounts.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Active:{" "}
              <span className="font-bold text-green-400">
                {approvedPlayers.length}
              </span>
              {" • "}
              Inactive:{" "}
              <span className="font-bold text-red-400">
                {inactivePlayers.length}
              </span>
            </div>

          </div>

          {filteredPlayers.length === 0 ? (

            <p className="py-10 text-center text-gray-400">
              No players found.
            </p>

          ) : (

            <div className="space-y-4">

              {filteredPlayers.map((player) => (

                <div
                  key={player.id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-black p-5 md:flex-row md:items-center md:justify-between"
                >

                  {/* Player Information */}
                  <div>

                    <h3 className="text-xl font-bold text-white">
                      {player.displayName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Username:{" "}
                      <span className="text-yellow-400">
                        {player.username}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Player ID: {player.id}
                    </p>

                    {/* Status */}
                    <div className="mt-3 flex flex-wrap gap-2">

                      {player.approvalStatus ===
                        "APPROVED" && (
                        <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs font-bold text-green-400">
                          ✅ APPROVED
                        </span>
                      )}

                      {player.approvalStatus ===
                        "PENDING" && (
                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400">
                          🟡 PENDING
                        </span>
                      )}

                      {player.approvalStatus ===
                        "REJECTED" && (
                        <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold text-red-400">
                          ❌ REJECTED
                        </span>
                      )}

                      {player.active ? (
                        <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs font-bold text-green-400">
                          🟢 ACTIVE
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-bold text-gray-400">
                          ⚫ INACTIVE
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">

                    <Link
                      href={`/admin/players/edit?player=${player.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
                    >
                      ✏️ Edit
                    </Link>

                    {player.approvalStatus ===
                      "PENDING" ? (

                      <>
                        <button
                          onClick={() =>
                            approvePlayer(
                              player.id
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500"
                        >
                          ✅ Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectPlayer(
                              player.id
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500"
                        >
                          ❌ Reject
                        </button>
                      </>

                    ) : (

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

                    )}

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

        {/* Rejected Players */}
        {rejectedPlayers.length > 0 && (
          <div className="mt-8 rounded-2xl border border-red-700 bg-red-900/10 p-6">

            <h2 className="text-xl font-bold text-red-400">
              ❌ Rejected Registrations
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              These registrations have been rejected and cannot log in.
            </p>

            <div className="mt-5 space-y-3">

              {rejectedPlayers
                .filter(
                  (player) =>
                    player.displayName
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    player.username
                      ?.toLowerCase()
                      .includes(search.toLowerCase())
                )
                .map((player) => (

                  <div
                    key={player.id}
                    className="flex flex-col gap-3 rounded-xl border border-red-900 bg-black p-4 md:flex-row md:items-center md:justify-between"
                  >

                    <div>
                      <p className="font-bold text-white">
                        {player.displayName}
                      </p>

                      <p className="text-sm text-gray-400">
                        Username:{" "}
                        <span className="text-red-300">
                          {player.username}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          approvePlayer(
                            player.id
                          )
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500"
                      >
                        ✅ Approve
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

          </div>
        )}

      </div>
    </main>
  );
}