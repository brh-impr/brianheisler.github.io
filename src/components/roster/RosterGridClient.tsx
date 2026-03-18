"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

type PlayerRow = {
  name: string;
  slug: string;
  number: number;
  position: string;
  year: string;
  hometown: string;
  shoots?: string;
  previous_team?: string;
  major?: string;
  image?: string;
  bio?: string;
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzKcL42kKLA681-_-upPJhPAV1cJ_U1DbhqD3jmjhLciDVXvE1oI7Cnuva9aSH7ONZ-sUciWes85dG/pub?gid=1762913809&single=true&output=csv";

export default function RosterGridClient() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(SHEET_URL, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch roster: ${res.status}`);
        }

        const text = await res.text();
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        const rows = (parsed.data as any[]).map((player) => ({
          name: player.name ?? "",
          slug: player.slug ?? "",
          number: Number(player.number),
          position: player.position ?? "",
          year: player.year ?? "",
          hometown: player.hometown ?? "",
          shoots: player.shoots || undefined,
          previous_team: player.previous_team || undefined,
          major: player.major || undefined,
          image: player.image || undefined,
          bio: player.bio || undefined,
        }));

        setPlayers(rows);
      } catch {
        setError("Unable to load the latest roster right now.");
      } finally {
        setLoading(false);
      }
    }

    loadPlayers();
  }, []);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => a.number - b.number);
  }, [players]);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        Loading latest roster...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-soft">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {sortedPlayers.map((player) => (
        <article
          key={player.slug}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
        >
          <div className="flex items-start justify-between">
            <div className="text-5xl font-black text-brand">
              {player.number}
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
              {player.position}
            </div>
          </div>

          <h2 className="mt-4 text-xl font-bold">{player.name}</h2>
          <p className="text-slate-600">{player.year}</p>
          <p className="mt-3 text-sm text-slate-500">{player.hometown}</p>

          <Link
            href={`/roster/${player.slug}`}
            className="mt-5 inline-flex rounded-2xl border border-slate-300 px-4 py-2 font-semibold"
          >
            View Profile
          </Link>
        </article>
      ))}
    </div>
  );
}
