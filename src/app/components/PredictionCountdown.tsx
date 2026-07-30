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
  const [countdown, setCountdown] = useState(
    getCountdownToLock(matchDate, kickOff)
  );

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownToLock(matchDate, kickOff));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [matchDate, kickOff]);

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