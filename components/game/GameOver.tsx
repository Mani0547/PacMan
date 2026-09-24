"use client";
import { useRef } from "react";
import type { GameResult } from "@/game/engine";
import { ArcadeButton, DIFF_COLOR, fmt, useMenuNav } from "../arcade/ui";

export type SaveState = { status: "saving" } | { status: "saved"; newHighScore: boolean } | { status: "error"; message: string };

interface Props {
  playerName: string;
  result: GameResult;
  save: SaveState;
  onRetry: () => void;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onMenu: () => void;
}

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { dx: Math.cos(a) * (90 + (i % 3) * 30), dy: Math.sin(a) * (50 + (i % 4) * 14), c: ["#ffe600", "#ff8fd8", "#19e6ff", "#fff"][i % 4], d: (i % 5) * 0.18 };
});

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="label">{label}</div><div className="font-arcade mt-2 text-[12px]">{children}</div></div>;
}

export default function GameOver({ playerName, result, save, onRetry, onPlayAgain, onLeaderboard, onMenu }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuNav(ref, "vertical", true);
  const busy = save.status === "saving";
  const newHigh = save.status === "saved" && save.newHighScore;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#02030a]/85 p-4" role="dialog" aria-modal="true" aria-label="Game over">
      <div ref={ref} className="panel drop-in relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto p-7 text-center">
        <h2 className="font-arcade text-[clamp(20px,3vw,28px)] neon-red">GAME OVER</h2>
        <p className="font-arcade mt-5 text-[12px] neon-blue">{playerName.toUpperCase()}</p>
        <p className="font-arcade mt-3 text-[clamp(26px,4.4vw,40px)] neon-yellow">{fmt(result.score)}</p>

        <div className="relative my-4 flex min-h-[44px] items-center justify-center">
          {newHigh && (
            <>
              {SPARKS.map((s, i) => (
                <span key={i} className="sparkle" style={{ background: s.c, animationDelay: `${s.d}s`, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px` }} />
              ))}
              <p className="high-score font-arcade text-[clamp(14px,2.4vw,20px)] text-[var(--pac)]">NEW HIGH SCORE!</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-y-2 border-[#1c2a78] py-5 text-left">
          <Cell label="LEVEL REACHED">{result.levelReached}</Cell>
          <Cell label="DIFFICULTY"><span className={DIFF_COLOR[result.difficulty]}>{result.difficulty}</span></Cell>
          <Cell label="PELLETS EATEN">{fmt(result.pelletsEaten)}</Cell>
          <Cell label="GHOSTS EATEN">{fmt(result.ghostsEaten)}</Cell>
        </div>

        <div className="mt-5 min-h-[76px]" aria-live="polite">
          {save.status === "saving" && <p className="font-arcade text-[10px] text-[#8ea6ff] blink">SAVING SCORE...</p>}
          {save.status === "saved" && <p className="font-arcade text-[10px] neon-green">SCORE SAVED</p>}
          {save.status === "error" && (
            <div>
              <p className="font-arcade text-[11px] leading-[1.7] neon-red">We couldn&apos;t save your score.</p>
              <p className="mb-3 mt-1 text-[20px] text-[#b8c4ff]">{save.message}</p>
              <ArcadeButton variant="primary" compact onClick={onRetry}>TRY AGAIN</ArcadeButton>
            </div>
          )}
        </div>

        <div className="mt-2 grid gap-3">
          <ArcadeButton disabled={busy} onClick={onPlayAgain} variant={save.status === "saved" ? "primary" : "default"}>PLAY AGAIN</ArcadeButton>
          <ArcadeButton disabled={busy} onClick={onLeaderboard}>LEADERBOARD</ArcadeButton>
          <ArcadeButton disabled={busy} onClick={onMenu}>MAIN MENU</ArcadeButton>
        </div>
      </div>
    </div>
  );
}
