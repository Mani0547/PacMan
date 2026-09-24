"use client";
import { useEffect } from "react";
import { GHOST_DEFS, GHOST_ORDER } from "@/game/ghost";
import { FRUITS } from "@/game/fruit";
import { ArcadeButton, GhostIcon } from "./ui";

const RULES: [string, string][] = [
  ["MOVE", "Arrow Keys / WASD"],
  ["EAT PELLETS", "Clear all pellets to progress."],
  ["POWER PELLETS", "Temporarily make ghosts vulnerable."],
  ["AVOID GHOSTS", "Unless they're frightened."],
  ["PAUSE", "P or ESC"],
  ["MUTE", "M"],
];
const BEHAVIOUR: Record<string, string> = {
  blinky: "Chases you head-on. Speeds up when few pellets remain.",
  pinky: "Aims 4 tiles ahead of you. Don't run straight at her.",
  inky: "Works with Blinky to trap you from two sides.",
  clyde: "Chases from afar, loses nerve up close.",
};

export default function HowToPlay({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);
  return (
    <div className="w-full max-w-4xl">
      <h2 className="font-arcade text-center text-[clamp(16px,2.6vw,26px)] neon-yellow">HOW TO PLAY</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {RULES.map(([t, d]) => (
          <div key={t} className="panel p-5">
            <p className="font-arcade text-[11px] neon-blue">{t}</p>
            <p className="mt-3 text-[24px]">{d}</p>
          </div>
        ))}
      </div>

      <div className="panel mt-6 p-5">
        <p className="label mb-4">THE GHOSTS</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {GHOST_ORDER.map((n) => (
            <li key={n} className="flex items-start gap-3">
              <GhostIcon color={GHOST_DEFS[n].color} size={30} />
              <div>
                <p className="font-arcade text-[10px]" style={{ color: GHOST_DEFS[n].color }}>{n.toUpperCase()}</p>
                <p className="mt-1 text-[20px] text-[#b8c4ff]">{BEHAVIOUR[n]}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="label mb-3 mt-6">SCORING</p>
        <p className="text-[20px] text-[#b8c4ff]">Pellet 10 · Power pellet 50 · Ghosts 200, 400, 800, 1600 per power pellet</p>
        <p className="mt-2 text-[20px] text-[#b8c4ff]">Harder modes pay more: EASY ×1 · OK OK ×1.5 · NIGHTMARE ×2 on everything you score.</p>
        <p className="mt-2 text-[20px] text-[#b8c4ff]">{Object.values(FRUITS).map((f) => `${f.emoji} ${f.points}`).join("  ")}</p>
      </div>
      <div className="mx-auto mt-8 max-w-[220px]"><ArcadeButton compact onClick={onBack}>BACK</ArcadeButton></div>
    </div>
  );
}
