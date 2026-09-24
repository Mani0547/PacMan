"use client";
import { useRef } from "react";
import { ArcadeButton, useMenuNav } from "../arcade/ui";

export type Confirm = null | "level" | "game" | "quit";

interface Props {
  confirm: Confirm;
  onConfirm: (c: Confirm) => void;
  onResume: () => void;
  onRestartLevel: () => void;
  onRestartGame: () => void;
  onQuit: () => void;
}

const COPY: Record<Exclude<Confirm, null>, { title: string; body: string }> = {
  level: { title: "Restart this level?", body: "Progress on this level will be lost. Your current game is kept." },
  game: { title: "End the current game?", body: "Your current score will not be submitted." },
  quit: { title: "End the current game?", body: "Your current score will not be submitted." },
};

function MenuView({ onConfirm, onResume }: Pick<Props, "onConfirm" | "onResume">) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuNav(ref);
  return (
    <div ref={ref}>
      <h2 className="font-arcade mb-7 text-center text-[20px] neon-yellow">PAUSED</h2>
      <div className="flex flex-col gap-3">
        <ArcadeButton variant="primary" onClick={onResume}>RESUME</ArcadeButton>
        <ArcadeButton onClick={() => onConfirm("level")}>RESTART LEVEL</ArcadeButton>
        <ArcadeButton onClick={() => onConfirm("game")}>RESTART GAME</ArcadeButton>
        <ArcadeButton variant="danger" onClick={() => onConfirm("quit")}>QUIT TO MENU</ArcadeButton>
      </div>
      <p className="mt-6 text-center text-[18px] text-[#7f95ff]">P or ESC to resume</p>
    </div>
  );
}

function ConfirmView({ kind, onYes, onNo }: { kind: Exclude<Confirm, null>; onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuNav(ref);
  return (
    <div ref={ref}>
      <h2 className="font-arcade text-center text-[13px] leading-[1.7] neon-red">{COPY[kind].title}</h2>
      <p className="mb-7 mt-4 text-center text-[22px] text-[#b8c4ff]">{COPY[kind].body}</p>
      <div className="flex flex-col gap-3">
        <ArcadeButton onClick={onNo} variant="primary">NO, GO BACK</ArcadeButton>
        <ArcadeButton variant="danger" onClick={onYes}>YES</ArcadeButton>
      </div>
    </div>
  );
}

export default function PauseMenu({ confirm, onConfirm, onResume, onRestartLevel, onRestartGame, onQuit }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#02030a]/80 p-4" role="dialog" aria-modal="true" aria-label="Pause menu">
      <div className="panel drop-in max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto p-7">
        {confirm ? (
          <ConfirmView kind={confirm} onNo={() => onConfirm(null)} onYes={confirm === "level" ? onRestartLevel : confirm === "game" ? onRestartGame : onQuit} />
        ) : (
          <MenuView onConfirm={onConfirm} onResume={onResume} />
        )}
      </div>
    </div>
  );
}
