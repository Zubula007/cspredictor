type PlayerFormProps = {
  playerName: string;
  setPlayerName: (name: string) => void; };

export default function PlayerForm({
  playerName,
  setPlayerName,
}: PlayerFormProps) {
  return (
    <div className="mt-8 bg-gray-900 rounded-xl p-4">
      <h2 className="text-2xl font-bold text-yellow-400">
        👤 Player
      </h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="mt-4 w-full rounded-xl bg-black border border-yellow-400 p-3 text-white"
      />
    </div>
  );
}
