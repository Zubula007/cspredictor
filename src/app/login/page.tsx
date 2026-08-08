"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import authService from "../services/authService";

type Mode = "LOGIN" | "REGISTER";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] =
    useState<Mode>("LOGIN");

  const [displayName, setDisplayName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);

    setDisplayName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");

    resetMessages();
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    resetMessages();

    if (!username.trim()) {
      setError(
        "Please enter your username."
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);

    if (mode === "REGISTER") {
      if (!displayName.trim()) {
        setError(
          "Please enter your display name."
        );

        setLoading(false);

        return;
      }

      if (password.length < 6) {
        setError(
          "Password must be at least 6 characters."
        );

        setLoading(false);

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        setLoading(false);

        return;
      }

      const result =
        authService.registerPlayer(
          displayName,
          username,
          password
        );

      setLoading(false);

      if (!result.success) {
        setError(
          result.error ??
            "Unable to create your profile."
        );

        return;
      }

      setMessage(
        "✅ Profile created successfully. Your registration is now awaiting Admin approval."
      );

      setDisplayName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      return;
    }

    const result =
      authService.login(
        username,
        password
      );

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ??
          "Unable to log in."
      );

      return;
    }

    setMessage(
      `Welcome back, ${result.player?.displayName}!`
    );

    setTimeout(() => {
      router.push("/");
    }, 700);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-6">

      <div className="mx-auto max-w-md">

        {/* Header */}

        <div className="mb-8 text-center">

          <div className="text-6xl">
            🏆
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-yellow-400 md:text-4xl">
            CSPredictor
          </h1>

          <p className="mt-2 text-gray-400">
            Predict. Compete. Conquer.
          </p>

        </div>

        {/* Card */}

        <div className="rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl md:p-8">

          {/* Tabs */}

          <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-black p-1">

            <button
              type="button"
              onClick={() =>
                switchMode("LOGIN")
              }
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                mode === "LOGIN"
                  ? "bg-yellow-400 text-black"
                  : "text-gray-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              🔐 Login
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode("REGISTER")
              }
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                mode === "REGISTER"
                  ? "bg-yellow-400 text-black"
                  : "text-gray-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              👤 Create Profile
            </button>

          </div>

          {/* Heading */}

          <div className="mb-6 text-center">

            <h2 className="text-2xl font-extrabold text-white">
              {mode === "LOGIN"
                ? "Welcome Back"
                : "Create Your Profile"}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {mode === "LOGIN"
                ? "Log in to access your CSPredictor account."
                : "Create your player profile to join CSPredictor."}
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Display Name */}

            {mode === "REGISTER" && (
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Display Name
                </label>

                <input
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Sandile"
                  autoComplete="name"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />

              </div>
            )}

            {/* Username */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Enter username"
                autoComplete="username"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />

            </div>

            {/* Password */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete={
                  mode === "LOGIN"
                    ? "current-password"
                    : "new-password"
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />

            </div>

            {/* Confirm Password */}

            {mode === "REGISTER" && (
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />

              </div>
            )}

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-500 bg-red-950/30 p-4 text-center">

                <p className="text-sm font-semibold text-red-300">
                  ❌ {error}
                </p>

              </div>
            )}

            {/* Success */}

            {message && (
              <div className="rounded-xl border border-green-500 bg-green-950/30 p-4 text-center">

                <p className="text-sm font-semibold text-green-300">
                  {message}
                </p>

              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 py-4 text-base font-extrabold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "LOGIN"
                ? "🔐 Login"
                : "👤 Create Profile"}
            </button>

          </form>

          {/* Registration Notice */}

          {mode === "REGISTER" && (
            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">

              <p className="text-center text-xs leading-relaxed text-yellow-200">

                ℹ️ New profiles require{" "}
                <span className="font-bold text-yellow-400">
                  Admin approval
                </span>{" "}
                before you can log in and participate.

              </p>

            </div>
          )}

          {/* Login/Register Switch */}

          <div className="mt-6 text-center">

            <p className="text-sm text-gray-400">

              {mode === "LOGIN"
                ? "Don't have a profile?"
                : "Already have a profile?"}

              <button
                type="button"
                onClick={() =>
                  switchMode(
                    mode === "LOGIN"
                      ? "REGISTER"
                      : "LOGIN"
                  )
                }
                className="ml-2 font-bold text-yellow-400 hover:text-yellow-300"
              >
                {mode === "LOGIN"
                  ? "Create one"
                  : "Login"}
              </button>

            </p>

          </div>

        </div>

        {/* Back */}

        <div className="mt-6 text-center">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="text-sm font-semibold text-gray-400 transition hover:text-yellow-400"
          >
            ← Back to CSPredictor
          </button>

        </div>

      </div>

    </main>
  );
}