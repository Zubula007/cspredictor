export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-center text-5xl font-bold text-yellow-400">
          🛠️ CSP Admin Portal
        </h1>

        <p className="mt-4 text-center text-gray-400">
          Championship Score Predictor Administration
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            ➕ Add Fixture
          </button>

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            ✏️ Edit Fixture
          </button>          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            🗑 Delete Fixture
          </button>

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            🏆 Select Competition
          </button>

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            🔒 Lock Predictions
          </button>

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            ⚽ Enter Results
          </button>

          <button className="rounded-2xl bg-yellow-400 p-8 text-2xl font-bold text-black hover:bg-yellow-300">
            📊 Update Leaderboard
          </button>

          <button className="rounded-2xl border-2 border-yellow-400 bg-zinc-900 p-8 text-2xl font-bold text-yellow-400 hover:bg-zinc-800">
            ⚙️ League Settings
          </button>

        </div>

        <div className="mt-12 rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

          <h2 className="mb-4 text-2xl font-bold text-yellow-400">
            🚧 Coming Soon
          </h2>

          <ul className="space-y-3 text-gray-300">
            <li>✅ Automatic PSL fixture imports</li>
            <li>✅ Live score updates</li>
            <li>✅ Player management</li>
            <li>✅ Monthly winners</li>
            <li>✅ End-of-season prizes</li>
            <li>✅ One-click fixture publishing</li>
          </ul>

        </div>

      </div>

    </main>
  );
}