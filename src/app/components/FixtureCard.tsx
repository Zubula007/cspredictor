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

  result?: {
    homeScore: number;
    awayScore: number;
  };
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
  result,
}: FixtureCardProps) {
  const updateScore = (
    homeScore: number,
    awayScore: number
  ) => {
    let firstTeamToScore =
      userPrediction.firstTeamToScore;

    const scoreSelected = true;

    if (homeScore === 0 && awayScore === 0) {
      if (firstTeamToScore !== "NONE") {
        firstTeamToScore = null;
      }
    } else if (homeScore === 0) {
      if (
        firstTeamToScore === "HOME" ||
        firstTeamToScore === "NONE"
      ) {
        firstTeamToScore = null;
      }
    } else if (awayScore === 0) {
      if (
        firstTeamToScore === "AWAY" ||
        firstTeamToScore === "NONE"
      ) {
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
    if (interactionLocked) return;

    updateScore(
      userPrediction.homeScore + 1,
      userPrediction.awayScore
    );
  };

  const decreaseHome = () => {
    if (interactionLocked) return;

    updateScore(
      Math.max(
        0,
        userPrediction.homeScore - 1
      ),
      userPrediction.awayScore
    );
  };

  const increaseAway = () => {
    if (interactionLocked) return;

    updateScore(
      userPrediction.homeScore,
      userPrediction.awayScore + 1
    );
  };

  const decreaseAway = () => {
    if (interactionLocked) return;

    updateScore(
      userPrediction.homeScore,
      Math.max(
        0,
        userPrediction.awayScore - 1
      )
    );
  };
    const handleFTTSChange = (value: FTTSOption) => {
    const homeScore = userPrediction.homeScore;
    const awayScore = userPrediction.awayScore;

    if (
      value === "NONE" &&
      (homeScore !== 0 || awayScore !== 0)
    ) {
      alert(
        "⚠️ No Goal is only possible when the predicted score is 0-0."
      );
      return;
    }

    if (
      value === "HOME" &&
      homeScore === 0
    ) {
      alert(
        "⚠️ Home Team cannot be First Team To Score because your prediction has them scoring 0 goals."
      );
      return;
    }

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
  const correctResult =
    result &&
    (
      (result.homeScore > result.awayScore &&
        userPrediction.homeScore > userPrediction.awayScore) ||
      (result.awayScore > result.homeScore &&
        userPrediction.awayScore > userPrediction.homeScore) ||
      (result.homeScore === result.awayScore &&
        userPrediction.homeScore === userPrediction.awayScore)
    );

  const exactScore =
    result &&
    result.homeScore === userPrediction.homeScore &&
    result.awayScore === userPrediction.awayScore;

  const correctFTTS =
    result &&
    correctResult &&
    userPrediction.firstTeamToScore !== null &&
    userPrediction.firstTeamToScore !== "NONE";

const totalPoints =
    exactScore
      ? 5 + (correctFTTS ? 1 : 0)
      : correctResult
      ? 3 + (correctFTTS ? 1 : 0)
      : 0;

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
            {/* RESULTS CENTRE */}

      {status === "Completed" && result && (
        <div className="mt-6 rounded-xl border border-green-500 bg-green-950/20 p-4">

          <h3 className="mb-4 text-center text-lg font-bold text-green-400">
            ✅ Full Time Result
          </h3>

          <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
            <span>{homeTeam}</span>

            <span className="rounded-lg bg-black px-3 py-1 text-yellow-400">
              {result.homeScore} - {result.awayScore}
            </span>

            <span>{awayTeam}</span>
          </div>

          <div className="mt-5 border-t border-green-800 pt-4">

  <h4 className="mb-2 text-center font-semibold text-yellow-400">
    Your Prediction
  </h4>

  <div className="text-center text-xl font-bold text-white">
    {userPrediction.homeScore} - {userPrediction.awayScore}
  </div>


  <div className="mt-5 rounded-xl bg-black p-4">

    <p className="text-center text-2xl font-bold text-yellow-400">
     🏅 {totalPoints} Points
    </p>


    <div className="mt-3 flex flex-wrap justify-center gap-2">

  {correctResult && (
    <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white">
      🟢 Correct Result
    </span>
  )}

  {exactScore && (
    <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
      🎯 Exact Score
    </span>
  )}

  {correctFTTS && (
    <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
      ⚽ FTTS Correct +1
    </span>
  )}

  {!correctResult && (
    <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
      ❌ Incorrect
    </span>
  )}

</div>

  </div>

</div>

        </div>
      )}

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

        ) : locked ||
          status === "Live" ||
          status === "Completed" ? (
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

