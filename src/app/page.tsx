"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react"; 

import PlayerForm from "./components/PlayerForm";
import FixtureCard from "./components/FixtureCard";
import ConfirmationModal from "./components/ConfirmationModal";
import CompetitionSelector from "./components/CompetitionSelector";
import { useFixtures } from "./context/FixtureContext";
import badges from "./data/badges";
import predictionService from "./services/predictionService";
import { useCompetition } from "./context/CompetitionContext";
import authService from "./services/authService";

import { isFixtureLocked } from "./lib/predictionLock";

import leaderboardService, {
  type LeaderboardEntry,
} from "./services/leaderboardService";

type FTTSOption = "HOME" | "AWAY" | "NONE" | null;
const UI_PREDICTIONS_KEY = "csp-ui-predictions";
export default function Home() {
const { activeCompetition } = useCompetition();

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scoreSelected: boolean;
  firstTeamToScore: FTTSOption;
};

 const [playerName, setPlayerName] = useState("");
const [submitted, setSubmitted] = useState(false);

const [submittedAt, setSubmittedAt] = useState<string | null>(null);
const [showConfirmation, setShowConfirmation] = useState(false);
const [error, setError] = useState("");
const [showIncomplete, setShowIncomplete] = useState(false);

const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

const [qaMode, setQaMode] = useState(false);
const [ignoreLock, setIgnoreLock] = useState(false);

const fixtureRefs = useRef<(HTMLDivElement | null)[]>([]); 
  
const [mounted, setMounted] = useState(false);

const { fixtures } = useFixtures();
const competitionFixtures = fixtures.filter(
  (fixture) =>
    fixture.competitionId === activeCompetition.id
);

const [predictions, setPredictions] = useState<Prediction[]>(

   competitionFixtures.map((fixture) => ({
  homeTeam: fixture.homeTeam,
  awayTeam: fixture.awayTeam,

  homeScore: 0,
  awayScore: 0,
  scoreSelected: false,

  firstTeamToScore: null,
})) 

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
  (prediction, index) => {
   const fixture = competitionFixtures[index]; 

    // Ignore postponed and cancelled fixtures
    if (
      fixture.status === "Postponed" ||
      fixture.status === "Cancelled"
    ) {
      return false;
    }

    
return (
      !prediction.scoreSelected ||
      prediction.firstTeamToScore === null
    );
  }
); 

  const qaMode =
  localStorage.getItem("csp-qa-mode") === "true";

const ignoreValidation =
  localStorage.getItem(
    "csp-ignore-validation"
  ) === "true";

if (
  incompletePrediction &&
  !(qaMode && ignoreValidation)
) {
  setShowIncomplete(true);

  setError(
    "Please complete all scheduled fixtures before submitting your predictions."
  );

  return;
}

    setShowIncomplete(false);

setError("");

setShowConfirmation(true);

  };

  const confirmSubmission = () => {
  const player = authService.getCurrentPlayer();

  if (!player) {
    setError(
      "Player not found. Please contact the league administrator."
    );

    setShowConfirmation(false);

    return;
  }

  predictions.forEach((prediction, index) => {
  predictionService.savePlayerPrediction(
    player.id,
    competitionFixtures[index].id,
      prediction.homeScore,
      prediction.awayScore,
      prediction.firstTeamToScore === "HOME"
  ? "Home"
  : prediction.firstTeamToScore === "AWAY"
  ? "Away"
  : "None"
    );
  });

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

  localStorage.setItem(
    "csp-submitted",
    "true"
  );

  localStorage.setItem(
    "csp-submittedAt",
    formatted
  );

  setShowConfirmation(false);

};

 const availableFixtures = competitionFixtures.filter(
  (fixture) =>
    fixture.status !== "Postponed" &&
    fixture.status !== "Cancelled"
).length;

const completedPredictions = predictions.filter(
  (prediction, index) => {
    const fixture = competitionFixtures[index];

    // Safety check when switching competitions
    if (!fixture) {
      return false;
    }

    if (
      fixture.status === "Postponed" ||
      fixture.status === "Cancelled"
    ) {
      return false;
    }

    return (
      prediction.scoreSelected &&
      prediction.firstTeamToScore !== null
    );
  }
).length;

useEffect(() => {
  const savedPlayer = localStorage.getItem("csp-player");
  const savedPredictions = localStorage.getItem(UI_PREDICTIONS_KEY);
  const savedSubmitted = localStorage.getItem("csp-submitted");
  const savedSubmittedAt = localStorage.getItem("csp-submittedAt");

  setQaMode(
    localStorage.getItem("csp-qa-mode") === "true"
  );

  setIgnoreLock(
    localStorage.getItem("csp-ignore-lock") === "true"
  );

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

  setMounted(true);
}, []);
useEffect(() => {
  if (!mounted) return;

  localStorage.setItem(
    "csp-player",
    playerName
  );

  localStorage.setItem(
    UI_PREDICTIONS_KEY,
    JSON.stringify(predictions)
  );
}, [playerName, predictions, mounted]);

useEffect(() => {
  setLeaderboard(
    leaderboardService.getLeaderboard(
      activeCompetition.id
    )
  );
}, [
  playerName,
  predictions,
  activeCompetition.id
]);

useEffect(() => {
  setLeaderboard(
    leaderboardService.getLeaderboard(
      activeCompetition.id
    )
  );
}, [
  submitted,
  activeCompetition.id
]);

useEffect(() => {
  if (!mounted) return;

  const newCompetitionPredictions: Prediction[] =
    competitionFixtures.map((fixture) => ({
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeScore: 0,
      awayScore: 0,
      scoreSelected: false,
      firstTeamToScore: null,
    }));

  setPredictions(newCompetitionPredictions);

  setShowIncomplete(false);
  setError("");
  setSubmitted(false);
  setSubmittedAt(null);
}, [activeCompetition.id]);
if (!mounted) {
  return null;
}

return (

  <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">
<div className="mb-6 flex justify-end">
  <Link
    href="/login"
    className="inline-flex items-center rounded-xl border border-yellow-500 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
  >
    🔐 Login
  </Link>
</div>

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl">

          <h1 className="text-center text-3xl font-extrabold text-yellow-400 sm:text-4xl md:text-5xl">

  🏆 Championship Score Predictor
</h1>

          <p className="mt-3 text-center text-xl text-gray-300">

            Predict. Compete. Conquer.

          </p>

          <p className="mt-2 text-center font-semibold text-yellow-500">

            Season One • Founders Edition

          </p>

         <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"> 

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <p className="text-xs uppercase text-gray-400">
                League Code
              </p>

              <p className="mt-2 text-xl font-bold text-yellow-400 md:text-2xl">
                CSP26
              </p>

            </div>

           <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">
  <p className="text-xs uppercase text-gray-400">
    Competition
  </p>

  <div className="mt-4 flex items-center justify-center">
    <img
      src={activeCompetition.logo}
      alt={activeCompetition.name}
      className="h-14 w-14 object-contain"
    />

    <p className="ml-3 hidden font-bold md:block">
      {activeCompetition.name}
    </p>
  </div>
</div> 

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <p className="text-xs uppercase text-gray-400">
                Round
              </p>

              <p className="mt-2 font-bold">
  {competitionFixtures[0]?.round ?? "Current Round"}
</p>

            </div>

            <div className="rounded-xl bg-zinc-900 p-3 text-center md:p-4">

              <p className="text-xs uppercase text-gray-400">
                Predictions
              </p>

              <p className="mt-2 text-xl font-bold text-green-400 md:text-2xl">

                {completedPredictions}/{availableFixtures}

              </p>

            </div>

          </div>

                </div>

        <div className="mb-8">
          <CompetitionSelector />
        </div>

        <PlayerForm

          playerName={playerName}

          setPlayerName={setPlayerName}

        />

        <div className="mt-8 space-y-6">

         {competitionFixtures.map((fixture, index) => {

const locked = 
  fixture.status === "Completed"
    ? true
    : qaMode && ignoreLock
    ? false
    : isFixtureLocked(
        fixture.matchDate,
        fixture.kickOff
      );

            return (

  <div
    key={fixture.id}
    ref={(el) => {
      fixtureRefs.current[index] = el;
    }}
  >
    <FixtureCard
  competition={
  activeCompetition.name
}

competitionLogo={
  activeCompetition.logo
}

  matchDate={fixture.matchDate}
displayDate={fixture.displayDate}

  kickOff={fixture.kickOff}

  status={fixture.status}

result={{
  homeScore: fixture.homeScore ?? 0,
  awayScore: fixture.awayScore ?? 0,
  firstTeamToScore: fixture.firstTeamToScore ?? "None",
}}
locked={locked}

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
    predictions[index]?.homeScore ?? 0,

  awayScore:
    predictions[index]?.awayScore ?? 0,

  scoreSelected:
    predictions[index]?.scoreSelected ?? false,

  firstTeamToScore:
    predictions[index]?.firstTeamToScore ?? null,
}} 

               incomplete={
  showIncomplete &&
  fixture.status !== "Postponed" &&
  fixture.status !== "Cancelled" &&
  (
    !predictions[index]?.scoreSelected ||
    predictions[index]?.firstTeamToScore === null
  )
} 
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
  </div>

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

    <h2 className="text-center text-xl font-bold text-green-400 md:text-3xl">
  🏆 Predictions Submitted!
</h2>

    <p className="mt-5 text-center text-base md:text-xl">

      Good luck,{" "}

      <span className="font-bold text-yellow-400">

        {playerName}

      </span>

      ! ⚽

    </p>

    <p className="mt-4 text-center text-sm text-gray-300 md:text-base">

      Your <span className="font-semibold text-yellow-400">Current Round</span> predictions
      have been successfully recorded.

    </p>

    {submittedAt && (

      <div className="mt-6 rounded-xl bg-black p-4 text-center">

        <p className="text-sm uppercase tracking-wide text-gray-400">

          Submitted

        </p>

        <p className="mt-1 text-sm font-bold text-yellow-400 md:text-base">

          📅 {submittedAt}

        </p>

      </div>

    )}

   <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
  <p className="text-center text-sm text-yellow-200">
    ⏰ You may continue editing your predictions until{" "}
    <span className="font-bold text-yellow-400">
      30 minutes before kick-off
    </span>
    . Any changes you make will be saved automatically until the prediction lock activates.
  </p>
</div> 

  </div>

)} 

       {activeCompetition.roundWinnerEnabled &&
 leaderboard.length > 0 && ( 
  <section className="mb-10">
    <div className="rounded-3xl border border-yellow-400 bg-gradient-to-r from-yellow-500/20 via-zinc-900 to-yellow-500/20 p-8 shadow-xl">

      <div className="text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
          🏆 {activeCompetition.name} Leader
        </p>

        <h2 className="mt-4 text-5xl">
          🏆
        </h2>

        <h3 className="mt-3 text-3xl font-extrabold md:text-4xl text-yellow-400">
          {leaderboard[0].player.displayName}
        </h3>

        <p className="mt-2 text-xl text-white">
          {leaderboard[0].totalPoints} Points
        </p>

      </div>

      <div
  className={`mt-6 grid grid-cols-2 gap-4 ${
    activeCompetition.monthlyWinnerEnabled
      ? "md:grid-cols-4"
      : "md:grid-cols-3"
  }`}
>

        <div className="rounded-xl border border-green-700 bg-green-900/20 p-4 text-center">

          <p className="text-sm text-green-300">
            ✅ Results
          </p>

          <p className="mt-2 text-2xl font-bold md:text-3xl text-green-400">
            {leaderboard[0].resultPoints}
          </p>

        </div>

        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4 text-center">

          <p className="text-sm text-yellow-300">
            🎯 Exact
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {leaderboard[0].exactPoints}
          </p>

        </div>

        <div className="rounded-xl border border-blue-700 bg-blue-900/20 p-4 text-center">

          <p className="text-sm text-blue-300">
            ⚽ FTTS
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-400">
            {leaderboard[0].fttsPoints}
          </p>

        </div>
{activeCompetition.monthlyWinnerEnabled && (
  <div className="rounded-xl border border-purple-600 bg-purple-900/20 p-4 text-center">

    <p className="text-sm text-purple-300">
      🏅 Bonus
    </p>

    <p className="mt-2 text-3xl font-bold text-purple-400">
      {leaderboard[0].bonusPoints}
    </p>

  </div>
)}

      </div>

    </div>
  </section>
)}

<section className="mt-12">

  <div className="mb-6 flex items-center justify-center gap-3">

    <img
      src={activeCompetition.logo}
      alt={activeCompetition.name}
      className="h-12 w-12 object-contain"
    />

    <h2 className="text-2xl font-bold text-yellow-400 md:text-3xl">
      Top 3 Leaderboard
    </h2>

  </div>

  {leaderboard.length === 0 ? (

    <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8 text-center">
      <p className="text-gray-400">
        No scores available yet.
      </p>
    </div>

) : ( 
<>
    <div className="overflow-x-auto rounded-2xl border border-yellow-500 bg-zinc-900 shadow-lg">

      <table className="min-w-full border-collapse">

        <thead>

          <tr className="border-b border-yellow-500 bg-black text-yellow-400">

            <th className="p-3 text-left text-sm">
              Rank
            </th>

            <th className="p-3 text-left text-sm">
              Player
            </th>

            <th className="p-3 text-center text-sm">
              Total
            </th>

            <th className="p-3 text-center text-sm">
              Result
            </th>

            <th className="p-3 text-center text-sm">
              Exact
            </th>

            <th className="p-3 text-center text-sm">
  FTTS
</th>

{activeCompetition.monthlyWinnerEnabled && (
  <th className="p-3 text-center text-sm">
    Bonus
  </th>
)}

          </tr>

        </thead>

        <tbody>

          {leaderboard.slice(0, 3).map((entry) => (

            <tr
              key={entry.player.id}
              className="border-b border-zinc-700 hover:bg-zinc-800"
            >

              <td className="p-3 font-bold whitespace-nowrap">

                {entry.rank === 1
                  ? "🥇"
                  : entry.rank === 2
                  ? "🥈"
                  : "🥉"}

              </td>

              <td className="p-3 font-semibold whitespace-nowrap">

                {entry.player.displayName}

              </td>

              <td className="p-3 text-center text-lg font-bold text-yellow-400">

                {entry.totalPoints}

              </td>

              <td className="p-3 text-center">

                {entry.resultPoints}

              </td>

              <td className="p-3 text-center">

                {entry.exactPoints}

              </td>

              <td className="p-3 text-center">
  {entry.fttsPoints}
</td>

{activeCompetition.monthlyWinnerEnabled && (
  <td className="p-3 text-center">
    {entry.bonusPoints}
  </td>
)}

            </tr>

          ))}

        </tbody>

</table>

</div>

<div className="mt-6 text-center">
  <Link
    href="/leaderboard"
    className="inline-flex items-center rounded-xl border border-yellow-500 bg-yellow-500/10 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
  >
    View Full Leaderboard →
  </Link>
</div>

</>

)}
</section>

<ConfirmationModal
  isOpen={showConfirmation}
  playerName={playerName}
  round="Current Round"
  predictions={predictions}
  badges={badges}
  onCancel={() => setShowConfirmation(false)}
  onConfirm={confirmSubmission}
/>

      </div>

    </main>

  );

}











































