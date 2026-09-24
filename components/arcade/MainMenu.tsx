"use client";
import { useRef } from "react";
import type { PlayerProfile } from "@/lib/types";
import PlayerStats from "./PlayerStats";
import { ArcadeButton, useMenuNav } from "./ui";

interface Props { player: PlayerProfile; onPlay: () => void; onLeaderboard: () => void; onHowTo: () => void; onChangePlayer: () => void }

export default function MainMenu({ player, onPlay, onLeaderboard, onHowTo, onChangePlayer }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuNav(ref);
  const first = player.name.split(" ")[0].toUpperCase();
  return (
    <div className="grid w-full max-w-4xl items-start gap-10 md:grid-cols-[minmax(0,340px)_1fr]">
      <div ref={ref}>
        <p className="label">WELCOME,</p>
        <h1 className="pixel-title mb-8 mt-3 break-words text-[clamp(22px,3.4vw,34px)] leading-tight">{first}</h1>
        <nav className="flex flex-col gap-3" aria-label="Main menu">
          <ArcadeButton variant="primary" onClick={onPlay}>PLAY</ArcadeButton>
          <ArcadeButton onClick={onLeaderboard}>LEADERBOARD</ArcadeButton>
          <ArcadeButton onClick={onHowTo}>HOW TO PLAY</ArcadeButton>
          <ArcadeButton onClick={onChangePlayer}>CHANGE PLAYER</ArcadeButton>
        </nav>
      </div>
      <PlayerStats player={player} />
    </div>
  );
}
