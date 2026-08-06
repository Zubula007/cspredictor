"use client";

import { Suspense } from "react";
import EditPlayer from "./EditPlayer";

export default function EditPlayerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPlayer />
    </Suspense>
  );
}