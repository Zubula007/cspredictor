"use client";

import Link from "next/link";

type AdminFixtureCardProps = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  displayDate: string;
  kickOff?: string;
  status: string;
  competition: string;
  onDelete: () => void;
};

export default function AdminFixtureCard({
  id,
  homeTeam,
  awayTeam,
  displayDate,
  kickOff,
  status,
  competition,
  onDelete,
}: AdminFixtureCardProps) {
  const statusStyle =
    status === "Scheduled"
      ? "bg-green-600 text-white"
      : status === "Live"
      ? "bg-red-600 text-white"
      : status === "Completed"
      ? "bg-blue-600 text-white"
      : status === "Postponed"
      ? "bg-yellow-500 text-black"
      : "bg-gray-600 text-white";

  return (
    <div className="rounded-2xl border border-yellow-500 bg-gradient-to-br from-zinc-900 to-black p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-bold text-yellow-400">
          {id}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle}`}
        >
          {status}
        </span>

      </div>

      <p className="mt-2 text-sm text-gray-400">
        {competition}
      </p>

      <div className="my-6 text-center">

        <h3 className="text-xl font-bold text-white">
          {homeTeam}
        </h3>

        <p className="my-2 font-bold text-yellow-400">
          VS
        </p>

        <h3 className="text-xl font-bold text-white">
          {awayTeam}
        </h3>

      </div>

      <div className="rounded-xl bg-black p-4">

        <p className="text-sm text-gray-400">
          📅 {displayDate}
        </p>

        <p className="mt-2 text-sm text-gray-400">
          🕒 {kickOff}
        </p>

      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">

        <Link
          href={`/admin/fixtures/edit?fixture=${id}`}
          className="rounded-xl bg-yellow-500 py-3 text-center font-bold text-black transition hover:bg-yellow-400"
        >
          ✏️ Edit
        </Link>

        <Link
          href={`/admin/results?fixture=${id}`}
          className="rounded-xl bg-green-600 py-3 text-center font-bold text-white transition hover:bg-green-500"
        >
          📢 Publish
        </Link>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl bg-red-600 py-3 text-center font-bold text-white transition hover:bg-red-500"
        >
          🗑 Delete
        </button>

      </div>

    </div>
  );
}