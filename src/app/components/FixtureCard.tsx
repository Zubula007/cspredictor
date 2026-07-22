type FixtureCardProps = {
  homeTeam: string;
  awayTeam: string;
};

export default function FixtureCard({
  homeTeam,
  awayTeam,
}: FixtureCardProps) {
  return (
    <div className="mt-4 bg-gray-900 rounded-xl p-4">
      <p className="font-bold">
        {homeTeam} vs {awayTeam}
      </p>

      <div className="flex gap-3 mt-3 items-center">
        <input
          className="w-16 bg-black border border-yellow-400 rounded p-2 text-center"
          placeholder="0"
        />

        <span className="text-xl">-</span>

        <input
          className="w-16 bg-black border border-yellow-400 rounded p-2 text-center"
          placeholder="0"
        />
      </div>
    </div>
  );
}
