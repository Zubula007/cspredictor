"use client";

import { Suspense } from "react";
import EditFixtureClient from "./EditFixtureClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <EditFixtureClient />
    </Suspense>
  );
}