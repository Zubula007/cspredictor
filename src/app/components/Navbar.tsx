"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCompetition } from "../context/CompetitionContext";
import authService from "../services/authService";
import type { Player } from "../types/player";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    activeCompetition,
    competitions,
    setActiveCompetition,
  } = useCompetition();

  const [player, setPlayer] =
    useState<Player | null>(null);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setPlayer(
      authService.getCurrentPlayer()
    );

    setMounted(true);
  }, [pathname]);

  function linkClass(path: string) {
    const active =
      path === "/"
        ? pathname === "/"
        : pathname.startsWith(path);

    return `
      flex items-center justify-center
      rounded-xl
      px-5
      py-3
      text-sm
      font-bold
      transition-all
      duration-200
      ${
        active
          ? "bg-yellow-400 text-black shadow-lg"
          : "bg-zinc-900 text-white hover:bg-yellow-500 hover:text-black"
      }
    `;
  }

  function handleLogout() {
    authService.logout();

    setPlayer(null);

    router.replace("/login");
  }

  /*
   * Do not render navigation while the
   * browser session is being checked.
   */
  if (!mounted) {
    return null;
  }

  return (
    <nav className="mb-8">
      <div className="flex flex-col items-center justify-center gap-4">

        {/* Navigation */}

        <div className="flex flex-wrap items-center justify-center gap-3">

          <Link
            href="/"
            className={linkClass("/")}
          >
            🏠 Home
          </Link>

          <Link
            href="/fixtures"
            className={linkClass("/fixtures")}
          >
            ⚽ Match Centre
          </Link>

          <Link
            href="/player"
            className={linkClass("/player")}
          >
            👤 Players
          </Link>

          <Link
            href="/leaderboard"
            className={linkClass("/leaderboard")}
          >
            🏆 Leaderboard
          </Link>

          {player?.isAdmin && (
            <Link
              href="/admin"
              className={linkClass("/admin")}
            >
              ⚙️ Admin
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex items-center justify-center
              rounded-xl
              bg-zinc-900
              px-5
              py-3
              text-sm
              font-bold
              text-white
              transition-all
              duration-200
              hover:bg-red-600
              hover:text-white
            "
          >
            🚪 Logout
          </button>

        </div>

        {/* Logged-in player */}

        {player && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Logged in as
            </p>

            <p className="mt-1 font-bold text-yellow-400">
              {player.displayName}
              {player.isAdmin && " • Admin"}
            </p>
          </div>
        )}

        {/* Competition Selector */}

        <div className="flex flex-col items-center gap-2 sm:flex-row">

          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Competition
          </span>

          <div className="flex items-center gap-2">

            <img
              src={activeCompetition.logo}
              alt={activeCompetition.name}
              className="h-8 w-8 object-contain"
            />

            <select
              value={activeCompetition.id}
              onChange={(event) =>
                setActiveCompetition(
                  event.target.value
                )
              }
              className="
                rounded-xl
                border
                border-yellow-500
                bg-zinc-900
                px-4
                py-2
                text-sm
                font-bold
                text-yellow-400
                outline-none
                transition
                hover:bg-zinc-800
                focus:ring-2
                focus:ring-yellow-400
              "
            >
              {competitions.map(
                (competition) => (
                  <option
                    key={competition.id}
                    value={competition.id}
                    className="bg-zinc-900 text-white"
                  >
                    {competition.name}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

      </div>
    </nav>
  );
}