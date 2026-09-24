"use client";
import { useEffect, useRef } from "react";
import { DIFFICULTY_LIST } from "@/game/difficulty";
import type { DifficultyKey } from "@/game/constants";
import { ArcadeButton, PacIcon, useMenuNav } from "./ui";

const ACCENT: Record<DifficultyKey, { text: string; border: string }> = {
  EASY: { text: "neon-green", border: "hover:border-[#5bff8a] focus-visible:border-[#5bff8a]" },
  OK_OK: { text: "neon-yellow", border: "hover:border-[#ffe600] focus-visible:border-[#ffe600]" },
  NIGHTMARE: { text: "neon-red", border: "hover:border-[#ff2b2b] focus-visible:border-[#ff2b2b]" },
};

export default function DifficultySelector({ onSelect, onBack }: { onSelect: (d: DifficultyKey) => void; onBack: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuNav(ref, "horizontal", false);
  useEffect(() => { ref.current?.querySelectorAll<HTMLElement>("[data-menu-item]")[1]?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i >= 0) onSelect(DIFFICULTY_LIST[i].key);
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect, onBack]);

  return (
    <div className="w-full max-w-4xl">
      <h2 className="font-arcade text-center text-[clamp(16px,2.6vw,26px)] neon-yellow">SELECT YOUR CHALLENGE</h2>
      <div ref={ref} className="mt-10 grid gap-5 md:grid-cols-3">
        {DIFFICULTY_LIST.map((d, i) => (
          <button
            key={d.key} type="button" data-menu-item onClick={() => onSelect(d.key)}
            className={`panel drop-in flex flex-col items-center gap-5 px-5 py-8 text-center transition-colors focus-visible:outline-none ${ACCENT[d.key].border}`}
          >
            <span className="label">{i + 1}</span>
            <span className={`font-arcade text-[clamp(15px,2vw,20px)] ${ACCENT[d.key].text}`}>{d.label}</span>
            <span className="flex h-6 items-center gap-1.5" aria-hidden="true">{Array.from({ length: d.lives }).map((_, k) => <PacIcon key={k} size={18} />)}</span>
            <span className="font-arcade text-[11px] text-white">{d.lives} {d.lives === 1 ? "LIFE" : "LIVES"}</span>
            <span className="text-[22px] text-[#8ea6ff]">{d.tagline}</span>
            <span className="font-arcade text-[10px] text-white">SCORE ×{d.scoreMultiplier}</span>
          </button>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-[220px]"><ArcadeButton compact onClick={onBack}>BACK</ArcadeButton></div>
    </div>
  );
}
