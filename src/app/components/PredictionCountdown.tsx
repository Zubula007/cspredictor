"use client";

import { useEffect, useState } from "react";
import { getCountdownToLock } from "../lib/countdown";

type PredictionCountdownProps = {
  matchDate: string;
  kickOff?: string;
};

export default function PredictionCountdown({
  matchDate,
  kickOff,
}: PredictionCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateCountdown = () => {
      setCountdown(getCountdownToLock(matchDate, kickOff));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [mounted, matchDate, kickOff]);

  if (!mounted) {
    return (
      <div className="mt-2 text-center">
        <p className="font-semibold text-yellow-400">
          ⏳ Loading...
        </p>
      </div>
    );
  }

  const locked = countdown === "Locked";

  return (
    <div className="mt-2 text-center">
      {locked ? (
        <p className="font-semibold text-red-400">
          🔒 Predictions Locked
        </p>
      ) : (
        <p className="font-semibold text-yellow-400">
          ⏳ Locks in: {countdown}
        </p>
      )}
    </div>
  );
}