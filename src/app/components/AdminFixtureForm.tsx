"use client";

import { useState } from "react";

import teams from "../data/teams";
import { CompetitionIds } from "../lib/enums";

export interface FixtureFormData {
  competitionId: string;
  round: number;
  streak: number;
  matchDate: string;
  kickOff: string;
  homeTeam: string;
  awayTeam: string;
}

interface Props {
  onSave: (fixture: FixtureFormData) => void;
}

export default function AdminFixtureForm({
  onSave,
}: Props) {
  const [competitionId, setCompetitionId] =
    useState<string>(CompetitionIds.BET);

  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(1);

  const [matchDate, setMatchDate] = useState("");
  const [kickOff, setKickOff] = useState("");

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

  const saveFixture = () => {
    if (
      !matchDate ||
      !kickOff ||
      !homeTeam ||
      !awayTeam
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (homeTeam === awayTeam) {
      alert("Home and Away teams cannot be the same.");
      return;
    }

    onSave({
      competitionId,
      round,
      streak,
      matchDate,
      kickOff,
      homeTeam,
      awayTeam,
    });

    setCompetitionId(CompetitionIds.BET);
    setRound(1);
    setStreak(1);
    setMatchDate("");
    setKickOff("");
    setHomeTeam("");
    setAwayTeam("");
  };

  return (
    <div className="mb-10 rounded-3xl border border-yellow-500 bg-zinc-900 p-8">

      <h2 className="mb-6 text-3xl font-bold text-yellow-400">
        ➕ Create Fixture
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Competition
          </label>

          <select
            value={competitionId}
            onChange={(e) =>
              setCompetitionId(e.target.value)
            }
            className="w-full rounded-xl bg-black p-3"
          >
            <option value={CompetitionIds.BET}>
              Betway Premiership
            </option>

            <option value={CompetitionIds.MTN}>
              MTN8
            </option>

            <option value={CompetitionIds.NED}>
              Nedbank Cup
            </option>

            <option value={CompetitionIds.CAR}>
              Carling Knockout
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Round
          </label>

          <input
            type="number"
            min={1}
            value={round}
            onChange={(e) =>
              setRound(Number(e.target.value))
            }
            className="w-full rounded-xl bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Match Number
          </label>

          <input
            type="number"
            min={1}
            value={streak}
            onChange={(e) =>
              setStreak(Number(e.target.value))
            }
            className="w-full rounded-xl bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Match Date
          </label>

          <input
            type="date"
            value={matchDate}
            onChange={(e) =>
              setMatchDate(e.target.value)
            }
            className="w-full rounded-xl bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Kick-off
          </label>

          <input
            type="time"
            value={kickOff}
            onChange={(e) =>
              setKickOff(e.target.value)
            }
            className="w-full rounded-xl bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Home Team
          </label>

          <select
            value={homeTeam}
            onChange={(e) =>
              setHomeTeam(e.target.value)
            }
            className="w-full rounded-xl bg-black p-3"
          >
            <option value="">
              Select Home Team
            </option>

            {teams.map((team) => (
              <option
                key={team.name}
                value={team.name}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Away Team
          </label>

          <select
            value={awayTeam}
            onChange={(e) =>
              setAwayTeam(e.target.value)
            }
            className="w-full rounded-xl bg-black p-3"
          >
            <option value="">
              Select Away Team
            </option>

            {teams.map((team) => (
              <option
                key={team.name}
                value={team.name}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      <button
        onClick={saveFixture}
        className="mt-8 w-full rounded-xl bg-yellow-400 py-4 font-bold text-black transition hover:bg-yellow-300"
      >
        Save Fixture
      </button>

    </div>
  );
}