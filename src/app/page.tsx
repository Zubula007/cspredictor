"use client";

import { useEffect, useState } from "react"; 

import PlayerForm from "./components/PlayerForm";
import FixtureCard from "./components/FixtureCard";
import ConfirmationModal from "./components/ConfirmationModal";

import fixtures from "./data/fixtures";
import badges from "./data/badges";
import competitions from "./data/competitions";

type FTTSOption = "HOME" | "AWAY" | "NONE" | null;

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scoreSelected: boolean;
  firstTeamToScore: FTTSOption;
};

export default function Home() {

  const [playerName, setPlayerName] = useState("");
 const [submitted, setSubmitted] = useState(false);

const [submittedAt, setSubmittedAt] = useState<string | null>(null); 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const [predictions, setPredictions] = useState<Prediction[]>(

    fixtures.map((fixture) => ({
  homeTeam: fixture.homeTeam,
  awayTeam: fixture.awayTeam,

  homeScore: 0,
  awayScore: 0,
  scoreSelected: false,

  firstTeamToScore: null,
}

    ))

  );

  const updatePrediction = (

  index: number,

  homeScore: number,

  awayScore: number,

  scoreSelected: boolean,

  firstTeamToScore: FTTSOption

) => {

  setPredictions((current) =>

    current.map((prediction, i) =>

      i === index

        ? {

            ...prediction,

            homeScore,
            awayScore,
            scoreSelected,
            firstTeamToScore,

          }

        : prediction

    )

  );

};

  const getFTTSName = (prediction: Prediction) => {

    if (prediction.firstTeamToScore === "HOME") {
      return prediction.homeTeam;
    }

    if (prediction.firstTeamToScore === "AWAY") {
      return prediction.awayTeam;
    }

    return "No Goal";

  };

  const handleSubmit = () => {

    if (!playerName.trim()) {

      setError(
        "Please enter your name before submitting."
      );

      return;

    }

   const incompletePrediction = predictions.some(
  (prediction) =>
    !prediction.scoreSelected ||
    prediction.firstTeamToScore === null
); 

    if (incompletePrediction) {

      setError(
        "Please complete all scores and select First Team To Score for every fixture."
      );

      return;

    }

    setError("");

    setShowConfirmation(true);

  };

  const confirmSubmission = () => {

  const now = new Date();

  const formatted = now.toLocaleString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  setSubmitted(true);

  setSubmittedAt(formatted);

  localStorage.setItem("csp-submitted", "true");

  localStorage.setItem("csp-submittedAt", formatted);

  setShowConfirmation(false);

};

 const completedPredictions = predictions.filter(
  (prediction) =>
    prediction.scoreSelected &&
    prediction.firstTeamToScore !== null
).length; 
useEffect(() => {
  const savedPlayer = localStorage.getItem("csp-player");
  const savedPredictions = localStorage.getItem("csp-predictions");
  const savedSubmitted = localStorage.getItem("csp-submitted");
  const savedSubmittedAt = localStorage.getItem("csp-submittedAt");

  if (savedPlayer) {
    setPlayerName(savedPlayer);
  }

  if (savedPredictions) {
    try {
      setPredictions(JSON.parse(savedPredictions));
    } catch {
      console.error("Unable to load saved predictions.");
    }
  }

  if (savedSubmitted === "true") {
    setSubmitted(true);
  }

  if (savedSubmittedAt) {
    setSubmittedAt(savedSubmittedAt);
  }
}, []);

useEffect(() => {
  localStorage.setItem("csp-player", playerName);

  localStorage.setItem(
    "csp-predictions",
    JSON.stringify(predictions)
  );
}, [playerName, predictions]);

  return (

    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl">

          <h1 className="text-center text-5xl font-extrabold text-yellow-400">

            🏆 Championship Score Predictor

          </h1>

          <p className="mt-3 text-center text-xl text-gray-300">

            Predict. Compete. Conquer.

          </p>

          <p className="mt-2 text-center font-semibold text-yellow-500">

            Season One • Founders Edition

          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">

            <div className="rounded-xl bg-zinc-900 p-4 text-center">

              <p className="text-xs uppercase text-gray-400">
                League Code
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-400">
                CSP26
              </p>

            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">

              <p className="text-xs uppercase text-gray-400">
                Competition
              </p>

              <p className="mt-2 font-bold">
                Betway Premiership
              </p>

            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">

              <p className="text-xs uppercase text-gray-400">
                Round
              </p>

              <p className="mt-2 font-bold">
                Round 1
              </p>

            </div>

            <div className="rounded-xl bg-zinc-900 p-4 text-center">

              <p className="text-xs uppercase text-gray-400">
                Predictions
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">

                {completedPredictions}/{fixtures.length}

              </p>

            </div>

          </div>

        </div>

        <PlayerForm

          playerName={playerName}

          setPlayerName={setPlayerName}

        />

        <div className="mt-8 space-y-6">

          {fixtures.map((fixture, index) => {

            const competition = competitions.find(

              (item) =>
                item.id === fixture.competitionId

            );

            return (

              <FixtureCard

                key={fixture.id}

                competition={
                  competition?.name ??
                  fixture.competitionId
                }

                competitionLogo={
                  competition?.logo
                }

                date={fixture.matchDate}

                kickOff={fixture.kickOff}

                homeTeam={fixture.homeTeam}

                awayTeam={fixture.awayTeam}

                homeLogo={
                  badges[fixture.homeTeam]
                }

                awayLogo={
                  badges[fixture.awayTeam]
                }

               userPrediction={{

  homeScore:
    predictions[index].homeScore,

  awayScore:
    predictions[index].awayScore,

  scoreSelected:
    predictions[index].scoreSelected,

  firstTeamToScore:
    predictions[index].firstTeamToScore,

}} 

                onPredictionChange={

  (
    homeScore,
    awayScore,
    scoreSelected,
    firstTeamToScore

  ) =>

    updatePrediction(

      index,

      homeScore,

      awayScore,

      scoreSelected,

      firstTeamToScore

    )

}


              />

            );

          })}

        </div>

        <button

          onClick={handleSubmit}

          className="mt-8 w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-black transition hover:bg-yellow-300"

        >

          Submit All Predictions

        </button>

        {error && (

          <div className="mt-4 rounded-xl border border-red-500 bg-red-900 p-3 text-center">

            <p className="font-semibold text-red-200">

              {error}

            </p>

          </div>

        )}

       {submitted && (

  <div className="mt-6 rounded-2xl border border-green-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">

    <h2 className="text-center text-3xl font-bold text-green-400">

      🏆 Predictions Submitted!

    </h2>

    <p className="mt-5 text-center text-xl">

      Good luck,{" "}

      <span className="font-bold text-yellow-400">

        {playerName}

      </span>

      ! ⚽

    </p>

    <p className="mt-4 text-center text-gray-300">

      Your <span className="font-semibold text-yellow-400">Round 1</span> predictions
      have been successfully recorded.

    </p>

    {submittedAt && (

      <div className="mt-6 rounded-xl bg-black p-4 text-center">

        <p className="text-sm uppercase tracking-wide text-gray-400">

          Submitted

        </p>

        <p className="mt-1 font-bold text-yellow-400">

          📅 {submittedAt}

        </p>

      </div>

    )}

    <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">

      <p className="text-center text-sm text-yellow-200">

        ✏️ You may continue editing your predictions until the prediction deadline.
        Any changes you make will be saved automatically.

      </p>

    </div>

  </div>

)} 

        <section className="mt-12">

          <h2 className="mb-4 text-2xl font-bold text-yellow-400">

            🏆 Leaderboard

          </h2>

          <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

            <div className="flex justify-between">

              <span>🥇 Player 1</span>

              <span className="font-bold text-yellow-400">
                15 pts
              </span>

            </div>

          </div>

        </section>

<ConfirmationModal
  isOpen={showConfirmation}
  playerName={playerName}
  round="Round 1"
  predictions={predictions}
  badges={badges}
  onCancel={() => setShowConfirmation(false)}
  onConfirm={confirmSubmission}
/>

      </div>

    </main>

  );

}
