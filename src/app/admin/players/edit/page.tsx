"use client";

import { Suspense } from "react";
import EditPlayer from "./EditPlayer";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <EditPlayer />
    </Suspense>
  );
}