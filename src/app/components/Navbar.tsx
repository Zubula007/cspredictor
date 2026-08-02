"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

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
    <nav className="sticky top-0 z-50 mb-8 rounded-2xl border border-yellow-500 bg-black/95 p-4 shadow-2xl backdrop-blur">

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
          ⚽ Fixtures
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
          href="/admin"
          className={linkClass("/admin")}
        >
          ⚙️ Admin
        </Link>

      </div>

    </nav>
  );
}