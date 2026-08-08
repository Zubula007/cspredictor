"use client";

import { useEffect, useState } from "react";

import competitionService, {
  type CompetitionInfo,
} from "../services/competitionService";

type CompetitionSelectorProps = {
  onCompetitionChange?: (competition: CompetitionInfo) => void;
};

export default function CompetitionSelector({
  onCompetitionChange,
}: CompetitionSelectorProps) {
  const [competitions] = useState<CompetitionInfo[]>(() =>
    competitionService.getAllCompetitions()
  );

  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const activeCompetition =
      competitionService.getActiveCompetition();

    setSelectedId(activeCompetition.id);
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const competitionId = event.target.value;

    competitionService.setActiveCompetition(
      competitionId
    );

    const competition =
      competitionService.getCompetition(competitionId);

    setSelectedId(competitionId);

    onCompetitionChange?.(competition);

    window.location.reload();
  };

  const selectedCompetition =
    competitions.find(
      (competition) =>
        competition.id === selectedId
    ) ??
    competitionService.getActiveCompetition();

  return (
    <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-4 shadow-lg">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">

        <div className="flex items-center gap-3">

          <img
            src={selectedCompetition.logo}
            alt={selectedCompetition.name}
            className="h-10 w-10 object-contain"
          />

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Competition
            </p>

            <p className="font-bold text-yellow-400">
              {selectedCompetition.name}
            </p>
          </div>

        </div>

        <select
          value={selectedId}
          onChange={handleChange}
          className="w-full rounded-xl border border-yellow-500 bg-black px-4 py-3 font-semibold text-white outline-none transition focus:ring-2 focus:ring-yellow-400 sm:w-auto"
          aria-label="Select competition"
        >
          {competitions.map((competition) => (
            <option
              key={competition.id}
              value={competition.id}
            >
              {competition.name}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}