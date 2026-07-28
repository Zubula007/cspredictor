"use client";

import Image from "next/image";
import FTTSSelector, {
  FTTSOption,
} from "./FTTSSelector";

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

      <div className="grid grid-cols-3 items-center gap-6">

        {/* HOME */}

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

        </div>

        {/* SCORE */}

        <div className="flex items-center justify-center gap-8">

          <div className="flex flex-col items-center gap-2">

            <button
              onClick={increaseHome}
              disabled={locked}
              className="h-10 w-10 rounded-full bg-yellow-500 text-2xl font-bold text-black transition hover:scale-105 disabled:opacity-40"
            >
              +
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-yellow-500 bg-white text-2xl font-bold text-black">
              {userPrediction.homeScore}
            </div>

            <button
              onClick={decreaseHome}
              disabled={locked}
              className="h-10 w-10 rounded-full bg-yellow-500 text-2xl font-bold text-black transition hover:scale-105 disabled:opacity-40"
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
              disabled={locked}
              className="h-10 w-10 rounded-full bg-yellow-500 text-2xl font-bold text-black transition hover:scale-105 disabled:opacity-40"
            >
              +
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-yellow-500 bg-white text-2xl font-bold text-black">
              {userPrediction.awayScore}
            </div>

            <button
              onClick={decreaseAway}
              disabled={locked}
              className="h-10 w-10 rounded-full bg-yellow-500 text-2xl font-bold text-black transition hover:scale-105 disabled:opacity-40"
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
              className="mb-3"
            />

          )}

          <p className="text-center font-semibold text-white">
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

        disabled={locked}

      />

      {/* STATUS */}

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





