import RosterGridClient from "@/components/roster/RosterGridClient";

export default function RosterPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Roster
          </div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Meet the team
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Browse player profiles, class years, hometowns, and season bios.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            className="rounded-2xl border border-slate-300 px-4 py-2"
            placeholder="Search players"
          />
          <select className="rounded-2xl border border-slate-300 px-4 py-2">
            <option>All Positions</option>
            <option>Forwards</option>
            <option>Defense</option>
            <option>Goalies</option>
          </select>
        </div>
      </div>

      <RosterGridClient />
    </section>
  );
}
