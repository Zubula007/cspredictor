"use client";

import Image from "next/image";
import FTTSSelector, {
  FTTSOption,
} from "./FTTSSelector";

import PredictionCountdown from "./PredictionCountdown";
type FixtureCardProps = {
  competition: string;
  competitionLogo?: string;

matchDate: string;
displayDate: string;
  kickOff?: string;

  status: string;

  homeTeam: string;
  awayTeam: string;

  homeLogo?: string;
  awayLogo?: string;
userPrediction: {
  homeScore: number;
  awayScore: number;
  scoreSelected: boolean;
  firstTeamToScore: FTTSOption;
};

onPredictionChange: (
  homeScore: number,
  awayScore: number,
  scoreSelected: boolean,
  firstTeamToScore: FTTSOption
) => void;

locked?: boolean;
incomplete?: boolean;
};

export default function FixtureCard({
  competition,
  competitionLogo,
  matchDate,
displayDate,
  kickOff,
  status,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  userPrediction,
onPredictionChange,
locked = false,
incomplete = false,
}: FixtureCardProps) {

 const updateScore = (
  homeScore: number,
  awayScore: number
) => {
  let firstTeamToScore = userPrediction.firstTeamToScore;

  // The player has now intentionally selected a score
  const scoreSelected = true;

  // Automatically remove invalid FTTS selections

  if (homeScore === 0 && awayScore === 0) {
    if (firstTeamToScore !== "NONE") {
      firstTeamToScore = null;
    }
  } else if (homeScore === 0) {
    if (firstTeamToScore === "HOME" || firstTeamToScore === "NONE") {
      firstTeamToScore = null;
    }
  } else if (awayScore === 0) {
    if (firstTeamToScore === "AWAY" || firstTeamToScore === "NONE") {
      firstTeamToScore = null;
    }
  } else {
    if (firstTeamToScore === "NONE") {
      firstTeamToScore = null;
    }
  }

  onPredictionChange(
    homeScore,
    awayScore,
    scoreSelected,
    firstTeamToScore
  );
};
const interactionLocked =
  locked ||
  status === "Postponed" ||
  status === "Live" ||
  status === "Completed" ||
  status === "Cancelled";
 

  const increaseHome = () => {
    if (locked) return;

    updateScore(
      userPrediction.homeScore + 1,
      userPrediction.awayScore
    );
  };

  const decreaseHome = () => {
    if (locked) return;

    updateScore(
      Math.max(0, userPrediction.homeScore - 1),
      userPrediction.awayScore
    );
  };

  const increaseAway = () => {
    if (locked) return;

    updateScore(
      userPrediction.homeScore,
      userPrediction.awayScore + 1
    );
  };

  const decreaseAway = () => {
    if (locked) return;

    updateScore(
      userPrediction.homeScore,
      Math.max(0, userPrediction.awayScore - 1)
    );
  };

  const handleFTTSChange = (value: FTTSOption) => {

    const homeScore = userPrediction.homeScore;
    const awayScore = userPrediction.awayScore;

    // 🚫 No Goal can only happen with 0-0

    if (

      value === "NONE" &&

      (
        homeScore !== 0 ||
        awayScore !== 0
      )

    ) {

      alert(
        "⚠️ No Goal is only possible when the predicted score is 0-0."
      );

      return;

    }

    // 🏠 Home can only score first if they predicted to score

    if (

      value === "HOME" &&

      homeScore === 0

    ) {

      alert(
        "⚠️ Home Team cannot be First Team To Score because your prediction has them scoring 0 goals."
      );

      return;

    }

    // 🏳️ Away can only score first if they predicted to score

    if (

      value === "AWAY" &&

      awayScore === 0

    ) {

      alert(
        "⚠️ Away Team cannot be First Team To Score because your prediction has them scoring 0 goals."
      );

      return;

    }

    onPredictionChange(
  homeScore,
  awayScore,
  userPrediction.scoreSelected,
  value
);

  };

  return (

    <div
  className={`rounded-2xl border p-6 shadow-xl ${
    incomplete
      ? "border-red-500 bg-red-950/20"
      : "border-yellow-500 bg-black"
  }`}
>

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
          📅 {displayDate}
        </p>

      {kickOff && (
  <>
    <p className="text-sm text-gray-300">
      🕒 Kick-off: {kickOff}
    </p>

    <PredictionCountdown
      matchDate={matchDate}
      kickOff={kickOff}
    />
  </>
)}
<div className="mt-3 flex justify-center">
  <span
    className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide ${
      status === "Scheduled"
        ? "bg-green-600 text-white"
        : status === "Postponed"
        ? "bg-yellow-500 text-black"
        : status === "Live"
        ? "bg-red-600 text-white"
        : status === "Completed"
        ? "bg-blue-600 text-white"
        : status === "Cancelled"
        ? "bg-gray-600 text-white"
        : "bg-zinc-700 text-white"
    }`}
  >
    {status === "Scheduled" && "🟢 Scheduled"}
    {status === "Postponed" && "🟡 Postponed"}
    {status === "Live" && "🔴 Live"}
    {status === "Completed" && "✅ Full Time"}
    {status === "Cancelled" && "⚫ Cancelled"}
  </span>
</div>

      </div>

      <div className="grid grid-cols-3 items-center gap-3 md:gap-6">

        {/* HOME */}

        <div className="flex flex-col items-center">

          {homeLogo && (

            <Image
  src={homeLogo}
  alt={homeTeam}
  width={72}
  height={72}
  className="mb-1 h-12 w-12 object-contain md:mb-2 md:h-[72px] md:w-[72px]"
/>

          )}

          <p className="text-center text-xs font-semibold text-white md:text-base">
            {homeTeam}
          </p>

        </div>

        {/* SCORE */}

        <div className="flex items-center justify-center gap-3 md:gap-8">

          <div className="flex flex-col items-center gap-2">

            <button
              onClick={increaseHome}
              disabled={interactionLocked}
              className="h-8 w-8 rounded-full bg-yellow-500 text-lg font-bold text-black transition hover:scale-105 md:h-10 md:w-10 md:text-2xl disabled:opacity-40"
            >
              +
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-yellow-500 bg-white text-xl font-bold text-black md:h-14 md:w-14 md:text-2xl">
              {userPrediction.homeScore}
            </div>

            <button
              onClick={decreaseHome}
              disabled={interactionLocked}
              className="h-8 w-8 rounded-full bg-yellow-500 text-lg font-bold text-black transition hover:scale-105 md:h-10 md:w-10 md:text-2xl disabled:opacity-40"
            >
              −
            </button>

          </div>

          <p className="text-2xl font-extrabold text-yellow-400">
            VS
          </p>

          <div className="flex flex-col items-center gap-2">

            <button
              onClick={increaseAway}
              disabled={interactionLocked}
              className="h-8 w-8 rounded-full bg-yellow-500 text-lg font-bold text-black transition hover:scale-105 md:h-10 md:w-10 md:text-2xl disabled:opacity-40"
            >
              +
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-yellow-500 bg-white text-xl font-bold text-black md:h-14 md:w-14 md:text-2xl">
              {userPrediction.awayScore}
            </div>

            <button
              onClick={decreaseAway}
              disabled={interactionLocked}
              className="h-8 w-8 rounded-full bg-yellow-500 text-lg font-bold text-black transition hover:scale-105 md:h-10 md:w-10 md:text-2xl disabled:opacity-40"
            >
              −
            </button>

          </div>

        </div>

        {/* AWAY */}

        <div className="flex flex-col items-center">

          {awayLogo && (

           <Image
  src={awayLogo}
  alt={awayTeam}
  width={72}
  height={72}
  className="mb-1 h-12 w-12 object-contain md:mb-2 md:h-[72px] md:w-[72px]"
/> 

          )}

          <p className="text-center text-xs font-semibold text-white md:text-base">
            {awayTeam}
          </p>

        </div>

      </div>

      {/* FTTS */}

     <FTTSSelector
  homeTeam={homeTeam}
  awayTeam={awayTeam}

  homeLogo={homeLogo}
  awayLogo={awayLogo}

  homeScore={userPrediction.homeScore}
awayScore={userPrediction.awayScore}
scoreSelected={userPrediction.scoreSelected}

value={userPrediction.firstTeamToScore} 

        onChange={handleFTTSChange}

        disabled={interactionLocked}

      />

      {/* STATUS */}

<div className="mt-6 border-t border-yellow-500/20 pt-4 text-center">

  {status === "Postponed" ? (

    <p className="text-sm font-semibold text-yellow-400">
      🟡 Predictions Unavailable
    </p>

  ) : status === "Cancelled" ? (

    <p className="text-sm font-semibold text-gray-400">
      ⚫ Predictions Closed
    </p>

  ) : locked || status === "Live" || status === "Completed" ? (

    <p className="text-sm font-semibold text-red-400">
      🔒 Editing Disabled
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

















