"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `rounded-lg px-4 py-2 font-semibold transition ${
      pathname === path
        ? "bg-yellow-400 text-black"
        : "text-white hover:bg-zinc-800"
    }`;

  return (
    <nav className="mb-8 rounded-2xl border border-yellow-500 bg-zinc-900 p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={linkClass("/")}>
          🏠 Home
        </Link>

        <Link href="/player" className={linkClass("/player")}>
          👤 Profile
        </Link>

        <Link href="/leaderboard" className={linkClass("/leaderboard")}>
          🏆 Leaderboard
        </Link>

        <Link href="/admin" className={linkClass("/admin")}>
          ⚙️ Admin
        </Link>
      </div>
    </nav>
  );
}