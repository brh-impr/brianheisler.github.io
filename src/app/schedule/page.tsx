import { getScheduleFromSheet } from "@/lib/content";

export default async function SchedulePage() {
  const games = await getScheduleFromSheet();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
          Schedule
        </div>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Season schedule and results
        </h1>
        <p className="mt-3 text-slate-600">
          Follow upcoming games, recent results, and rink details.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Opponent</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Time</th>
              <th className="px-5 py-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {games.map((game) => (
              <tr key={game.id}>
                <td className="px-5 py-4">{game.date}</td>
                <td className="px-5 py-4 font-semibold">{game.opponent}</td>
                <td className="px-5 py-4">
                  {game.location} · {game.rink}
                </td>
                <td className="px-5 py-4">{game.time}</td>
                <td className="px-5 py-4">{game.result || "Upcoming"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
