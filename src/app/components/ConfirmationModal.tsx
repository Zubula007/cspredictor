"use client";

import Image from "next/image";

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  firstTeamToScore: "HOME" | "AWAY" | "NONE" | null;
};

type ConfirmationModalProps = {
  isOpen: boolean;
  playerName: string;
  round: string;
  predictions: Prediction[];
  badges: Record<string, string>;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmationModal({
  isOpen,
  playerName,
  round,
  predictions,
  badges,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getFTTS = (prediction: Prediction) => {
    switch (prediction.firstTeamToScore) {
      case "HOME":
        return prediction.homeTeam;
      case "AWAY":
        return prediction.awayTeam;
      case "NONE":
        return "No Goal";
      default:
        return "-";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-yellow-500 bg-zinc-900 shadow-2xl">

        {/* Header */}
        <div className="border-b border-yellow-500/30 p-6">

          <h2 className="text-center text-3xl font-bold text-yellow-400">
            🏆 Review Your Predictions
          </h2>

          <p className="mt-2 text-center text-gray-300">
            Please review your selections before submitting.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

            <div className="rounded-xl bg-black p-3 text-center">
              <p className="text-xs uppercase text-gray-400">
                Player
              </p>

              <p className="mt-1 font-bold text-yellow-400">
                {playerName}
              </p>
            </div>

            <div className="rounded-xl bg-black p-3 text-center">
              <p className="text-xs uppercase text-gray-400">
                League
              </p>

              <p className="mt-1 font-bold text-yellow-400">
                CSP26
              </p>
            </div>

            <div className="rounded-xl bg-black p-3 text-center">
              <p className="text-xs uppercase text-gray-400">
                Round
              </p>

              <p className="mt-1 font-bold text-yellow-400">
                {round}
              </p>
            </div>

            <div className="rounded-xl bg-black p-3 text-center">
              <p className="text-xs uppercase text-gray-400">
                Fixtures
              </p>

              <p className="mt-1 font-bold text-yellow-400">
                {predictions.length}
              </p>
            </div>

          </div>

        </div>

        {/* Fixture Review */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {predictions.map((prediction, index) => (

            <div
              key={index}
              className="rounded-xl border border-yellow-500/20 bg-black p-5"
            >

              <div className="grid grid-cols-3 items-center">

                {/* Home */}
                <div className="flex flex-col items-center">

                  {badges[prediction.homeTeam] && (
                    <Image
                      src={badges[prediction.homeTeam]}
                      alt={prediction.homeTeam}
                      width={46}
                      height={46}
                    />
                  )}

                  <p className="mt-2 text-center font-semibold text-white">
                    {prediction.homeTeam}
                  </p>

                </div>

                {/* Score */}
                <div className="text-center">

                  <p className="text-3xl font-extrabold text-yellow-400">
                    {prediction.homeScore} - {prediction.awayScore}
                  </p>

                </div>

                {/* Away */}
                <div className="flex flex-col items-center">

                  {badges[prediction.awayTeam] && (
                    <Image
                      src={badges[prediction.awayTeam]}
                      alt={prediction.awayTeam}
                      width={46}
                      height={46}
                    />
                  )}

                  <p className="mt-2 text-center font-semibold text-white">
                    {prediction.awayTeam}
                  </p>

                </div>

              </div>

              <div className="mt-5 rounded-xl bg-zinc-900 p-3 text-center">

                <p className="text-xs uppercase tracking-wide text-gray-400">
                  First Team To Score
                </p>

                <p className="mt-2 font-bold text-yellow-400">
                  ⚽ {getFTTS(prediction)}
                </p>

              </div>

            </div>

          ))}

        </div>

        {/* Footer */}
        <div className="border-t border-yellow-500/30 p-6">

          <div className="mb-5 rounded-xl border border-green-700 bg-green-900/20 p-3 text-center text-sm text-green-300">
            Your predictions look good. You can continue editing them until the prediction deadline.
          </div>

          <div className="flex justify-end gap-4">

            <button
              onClick={onCancel}
              className="rounded-xl bg-gray-700 px-6 py-3 font-semibold text-white hover:bg-gray-600"
            >
              ← Continue Editing
            </button>

            <button
              onClick={onConfirm}
              className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300"
            >
              ✅ Confirm & Submit
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}