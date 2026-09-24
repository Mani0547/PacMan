"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { PlayerExtraStats, PlayerProfile } from "@/lib/types";
import { DIFF_COLOR, fmt } from "./ui";

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className={`font-arcade mt-2 text-[15px] ${className || "text-white"}`}>{value}</div>
    </div>
  );
}

export default function PlayerStats({ player }: { player: PlayerProfile }) {
  const [extra, setExtra] = useState<PlayerExtraStats | null>(null);
  useEffect(() => {
    let live = true;
    apiGet<{ stats: PlayerExtraStats }>("/api/player/me").then((r) => live && setExtra(r.stats)).catch(() => undefined);
    return () => { live = false; };
  }, [player.totalGames]);

  return (
    <section className="panel w-full p-6" aria-label="Player statistics">
      <p className="font-arcade text-[12px] neon-blue">{player.name.toUpperCase()}</p>
      {player.department && <p className="mt-1 text-[#7f95ff]">{player.department}</p>}
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6">
        <Stat label="HIGH SCORE" value={fmt(player.highScore)} className="neon-yellow" />
        <Stat label="HIGHEST LEVEL" value={player.highestLevel ? String(player.highestLevel) : "—"} />
        <Stat label="GAMES PLAYED" value={fmt(player.totalGames)} />
        <Stat label="BEST DIFFICULTY" value={player.bestDifficulty ?? "—"} className={player.bestDifficulty ? DIFF_COLOR[player.bestDifficulty] : "text-white"} />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-[#1c2a78] pt-5">
        <Stat label="AVG SCORE" value={extra ? fmt(extra.averageScore) : "…"} className="text-[11px] text-[#b8c4ff]" />
        <Stat label="GHOSTS EATEN" value={extra ? fmt(extra.totalGhostsEaten) : "…"} className="text-[11px] text-[#b8c4ff]" />
        <Stat label="PELLETS EATEN" value={extra ? fmt(extra.totalPelletsEaten) : "…"} className="text-[11px] text-[#b8c4ff]" />
      </div>
    </section>
  );
}
