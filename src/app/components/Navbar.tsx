"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCompetition } from "../context/CompetitionContext";

export default function Navbar() {
  const pathname = usePathname();

  const {
    activeCompetition,
    competitions,
    setActiveCompetition,
  } = useCompetition();

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

          <Link
            href="/login"
            className={linkClass("/login")}
          >
            🔐 Login
          </Link>

          <Link
            href="/admin"
            className={linkClass("/admin")}
          >
            ⚙️ Admin
          </Link>

        </div>

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
                setActiveCompetition(event.target.value)
              }
              className="rounded-xl border border-yellow-500 bg-zinc-900 px-4 py-2 text-sm font-bold text-yellow-400 outline-none transition hover:bg-zinc-800 focus:ring-2 focus:ring-yellow-400"
            >
              {competitions.map((competition) => (
                <option
                  key={competition.id}
                  value={competition.id}
                  className="bg-zinc-900 text-white"
                >
                  {competition.name}
                </option>
              ))}
            </select>

          </div>

        </div>

      </div>
    </nav>
  );
}