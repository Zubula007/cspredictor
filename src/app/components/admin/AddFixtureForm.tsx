"use client";

export default function AddFixtureForm() {
  return (
    <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-8">

      <h2 className="mb-6 text-3xl font-bold text-yellow-400">
        ➕ Add New Fixture
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-semibold">
            Competition
          </label>

          <select className="w-full rounded-xl bg-black p-3 text-white border border-gray-700">
            <option>Betway Premiership</option>
            <option>MTN8</option>
            <option>Nedbank Cup</option>
            <option>Carling Knockout</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Match Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl bg-black p-3 text-white border border-gray-700"
          />
        </div>        <div>
          <label className="mb-2 block font-semibold">
            Kick-Off Time
          </label>

          <input
            type="time"
            className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Home Team
          </label>

          <select className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white">
            <option>Select Home Team</option>
            <option>Kaizer Chiefs</option>
            <option>Orlando Pirates</option>
            <option>Mamelodi Sundowns</option>
            <option>Stellenbosch FC</option>
            <option>AmaZulu</option>
            <option>Golden Arrows</option>
            <option>Chippa United</option>
            <option>Sekhukhune United</option>
            <option>TS Galaxy</option>
            <option>Richards Bay</option>
            <option>Polokwane City</option>
            <option>Marumo Gallants</option>
            <option>Kruger United</option>
            <option>Milford FC</option>
            <option>Durban City</option>
            <option>Siwelele FC</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Away Team
          </label>

          <select className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white">
            <option>Select Away Team</option>
            <option>Kaizer Chiefs</option>
            <option>Orlando Pirates</option>
            <option>Mamelodi Sundowns</option>
            <option>Stellenbosch FC</option>
            <option>AmaZulu</option>
            <option>Golden Arrows</option>
            <option>Chippa United</option>
            <option>Sekhukhune United</option>
            <option>TS Galaxy</option>
            <option>Richards Bay</option>
            <option>Polokwane City</option>
            <option>Marumo Gallants</option>
            <option>Kruger United</option>
            <option>Milford FC</option>
            <option>Durban City</option>
            <option>Siwelele FC</option>
          </select>
        </div>

      </div>

      <button className="mt-8 w-full rounded-xl bg-yellow-400 py-4 text-xl font-bold text-black transition hover:bg-yellow-300">
        💾 Save Fixture
      </button>

    </div>
  );
}