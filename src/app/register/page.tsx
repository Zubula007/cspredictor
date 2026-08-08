"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import playerRepository from "../repositories/playerRepository";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanDisplayName || !cleanUsername || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingPlayers = playerRepository.getAll();

    const usernameExists = existingPlayers.some(
      (player) =>
        player.username?.toLowerCase() === cleanUsername
    );

    if (usernameExists) {
      setError(
        "That username is already registered. Please choose another."
      );
      return;
    }

    const displayNameExists = existingPlayers.some(
      (player) =>
        player.displayName.toLowerCase() ===
        cleanDisplayName.toLowerCase()
    );

    if (displayNameExists) {
      setError(
        "That player name is already registered."
      );
      return;
    }

    const newPlayer = {
      id: `player-${Date.now()}`,
      displayName: cleanDisplayName,
      joinedAt: new Date().toISOString(),
      active: false,
      isAdmin: false,
      username: cleanUsername,

      /*
       * Temporary prototype storage.
       *
       * This will be replaced by proper authentication
       * before production deployment.
       */
      passwordHash: password,

      approvalStatus: "PENDING" as const,
    };

    playerRepository.addPlayer(newPlayer);

    setSuccess(true);

    setDisplayName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  if (success) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 text-center shadow-2xl md:p-10">

            <div className="text-6xl">
              🏆
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-yellow-400 md:text-4xl">
              Registration Submitted
            </h1>

            <p className="mt-5 text-gray-300">
              Welcome to the Championship Score Predictor.
            </p>

            <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5">

              <p className="font-semibold text-yellow-300">
                ⏳ Your account is awaiting Admin approval.
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Once your registration has been approved,
                you will be able to log in and participate
                in CSPredictor.
              </p>

            </div>

            <div className="mt-8 flex flex-col gap-3">

              <Link
                href="/login"
                className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                Go to Login
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
              >
                Back to Home
              </Link>

            </div>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-xl">

        <div className="mb-8 text-center">

          <div className="text-5xl">
            🏆
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-yellow-400 md:text-4xl">
            Join CSPredictor
          </h1>

          <p className="mt-3 text-gray-400">
            Create your player profile
          </p>

        </div>

        <div className="rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl md:p-8">

          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">

            <p className="text-sm leading-6 text-blue-200">
              ℹ️ New players require Admin approval before
              they can log in and participate.
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Display Name */}

            <div>

              <label
                htmlFor="displayName"
                className="text-sm font-semibold text-gray-300"
              >
                Player Name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="e.g. Sandile"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
              />

            </div>

            {/* Username */}

            <div>

              <label
                htmlFor="username"
                className="text-sm font-semibold text-gray-300"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Choose a username"
                autoComplete="username"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
              />

            </div>

            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-300"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
              />

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-500 bg-red-950/40 p-4 text-center">

                <p className="font-semibold text-red-300">
                  ❌ {error}
                </p>

              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              className="w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-black transition hover:bg-yellow-300"
            >
              Create Player Profile
            </button>

          </form>

          <div className="mt-8 border-t border-zinc-800 pt-6 text-center">

            <p className="text-sm text-gray-400">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-2 inline-block font-bold text-yellow-400 hover:text-yellow-300"
            >
              Login →
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}