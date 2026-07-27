"use client";

import Image from "next/image";

type FixtureCardProps = {
  competition: string;
  competitionLogo?: string;

  date: string;
  kickOff?: string;

  homeTeam: string;
  awayTeam: string;

  homeLogo?: string;
  awayLogo?: string;

  userPrediction: {
    homeScore: number;
    awayScore: number;
  };

  onPredictionChange: (
    homeScore: number,
    awayScore: number
  ) => void;

  locked?: boolean;
};

export default function FixtureCard({
  competition,
  competitionLogo,
  date,
  kickOff,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  userPrediction,
  onPredictionChange,
  locked = false,
}: FixtureCardProps) {

  const handleHomeChange = (
    value: number
  ) => {
    onPredictionChange(
      value,
      userPrediction.awayScore
    );
  };

  const handleAwayChange = (
    value: number
  ) => {
    onPredictionChange(
      userPrediction.homeScore,
      value
    );
  };

  return (
    <div className="rounded-2xl border border-yellow-500 bg-black p-6 shadow-xl">

      {/* Competition */}

      <div className="mb-6 text-center">

        {competitionLogo && (
          <Image
            src={competitionLogo}
            alt={competition}
            width={150}
            height={60}
            className="mx-auto mb-3 object-contain"
          />
        )}

        <h2 className="text-xl font-bold text-yellow-400">
          {competition}
        </h2>

        <p className="mt-2 text-sm text-gray-300">
          📅 {date}
        </p>

        {kickOff && (
          <p className="text-sm text-gray-300">
            🕒 Kick-off: {kickOff}
          </p>
        )}

      </div>

      {/* Teams */}

      <div className="grid grid-cols-3 items-center gap-6">

        {/* Home Team */}

        <div className="flex flex-col items-center">

          {homeLogo && (
            <Image
              src={homeLogo}
              alt={homeTeam}
              width={72}
              height={72}
              className="mb-3"
            />
          )}

          <p className="text-center font-semibold text-white">
            {homeTeam}
          </p>

        </div>        {/* Score Section */}

        <div className="flex flex-col items-center justify-center">

          <div className="flex items-center gap-3">

            <input
              type="number"
              min="0"
              disabled={locked}
              value={userPrediction.homeScore}
              onChange={(e) =>
                handleHomeChange(Number(e.target.value))
              }
              className="h-12 w-12 rounded-lg border border-yellow-500 bg-white text-center text-xl font-bold text-black"
            />

            <span className="text-2xl font-bold text-yellow-400">
              VS
            </span>

            <input
              type="number"
              min="0"
              disabled={locked}
              value={userPrediction.awayScore}
              onChange={(e) =>
                handleAwayChange(Number(e.target.value))
              }
              className="h-12 w-12 rounded-lg border border-yellow-500 bg-white text-center text-xl font-bold text-black"
            />

          </div>

        </div>

        {/* Away Team */}

        <div className="flex flex-col items-center">

          {awayLogo && (
            <Image
              src={awayLogo}
              alt={awayTeam}
              width={72}
              height={72}
              className="mb-3"
            />
          )}

          <p className="text-center font-semibold text-white">
            {awayTeam}
          </p>

        </div>

      </div>

      <div className="mt-6 border-t border-yellow-500/20 pt-4 text-center">

        {locked ? (
          <p className="text-sm font-semibold text-red-400">
            🔒 Prediction Locked
          </p>
        ) : (
          <p className="text-sm font-semibold text-green-400">
            ✅ Predictions Open
          </p>
        )}

      </div>

    </div>
  );
}