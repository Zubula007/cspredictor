"use client";

import Image from "next/image";

export type FTTSOption = "HOME" | "AWAY" | "NONE" | null;

type FTTSSelectorProps = {
  homeTeam: string;
  awayTeam: string;

  homeLogo?: string;
  awayLogo?: string;

  homeScore: number;
awayScore: number;
scoreSelected: boolean;

value: FTTSOption;


  onChange: (value: FTTSOption) => void;

  disabled?: boolean;
};

export default function FTTSSelector({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
awayScore,
scoreSelected,
value,
  onChange,
  disabled = false,
}: FTTSSelectorProps) {
  const scoreChosen = scoreSelected;

  const homeEnabled = homeScore > 0;
  const awayEnabled = awayScore > 0;
  const noGoalEnabled = homeScore === 0 && awayScore === 0;

  const optionDisabled = (
    option: Exclude<FTTSOption, null>
  ) => {
    if (disabled) return true;

    switch (option) {
      case "HOME":
        return !homeEnabled;

      case "AWAY":
        return !awayEnabled;

      case "NONE":
        return !noGoalEnabled;

      default:
        return false;
    }
  };

  const cardStyle = (
    selected: boolean,
    unavailable: boolean
  ) =>
    `rounded-xl border p-3 transition-all duration-200 ${
      selected
        ? "border-yellow-400 bg-yellow-500/10 shadow-md shadow-yellow-500/20 scale-105"
        : unavailable
        ? "border-zinc-800 bg-zinc-900 opacity-40 cursor-not-allowed"
        : "border-gray-700 bg-zinc-900 hover:border-yellow-500 hover:scale-105 cursor-pointer"
    }`;

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-center text-base font-bold text-yellow-400">
        ⚽ First Team To Score
      </h3>

      {!scoreChosen && (
        <p className="mb-4 text-center text-sm text-gray-400">
          Please choose the score first.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* HOME */}

        <button
          type="button"
          disabled={optionDisabled("HOME")}
          onClick={() => onChange("HOME")}
          className={cardStyle(
            value === "HOME",
            optionDisabled("HOME")
          )}
        >
          <div className="flex items-center justify-center">
            {homeLogo ? (
              <Image
                src={homeLogo}
                alt={homeTeam}
                width={42}
                height={42}
                className="object-contain"
              />
            ) : (
              <div className="text-3xl">🏠</div>
            )}
          </div>
        </button>

        {/* NO GOAL */}

        <button
          type="button"
          disabled={optionDisabled("NONE")}
          onClick={() => onChange("NONE")}
          className={cardStyle(
            value === "NONE",
            optionDisabled("NONE")
          )}
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="text-3xl">🚫</div>

            <span className="text-xs font-bold text-white">
              No Goal
            </span>
          </div>
        </button>

        {/* AWAY */}

        <button
          type="button"
          disabled={optionDisabled("AWAY")}
          onClick={() => onChange("AWAY")}
          className={cardStyle(
            value === "AWAY",
            optionDisabled("AWAY")
          )}
        >
          <div className="flex items-center justify-center">
            {awayLogo ? (
              <Image
                src={awayLogo}
                alt={awayTeam}
                width={42}
                height={42}
                className="object-contain"
              />
            ) : (
              <div className="text-3xl">🚩</div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

