"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DifficultyKey } from "@/game/constants";
import type { GameResult, HudState, PacmanEngine } from "@/game/engine";
import { sound } from "@/game/sound";
import { ApiError, apiPost } from "@/lib/api";
import type { CompleteGameResponse, PlayerProfile } from "@/lib/types";
import GameCanvas from "./GameCanvas";
import { HudBar, HudLeft, HudRight } from "./GameHUD";
import GameOver, { SaveState } from "./GameOver";
import PauseMenu, { Confirm } from "./PauseMenu";

interface Props {
  player: PlayerProfile;
  difficulty: DifficultyKey;
  onExit: () => void;
  onLeaderboard: () => void;
  onPlayAgain: () => void;
  onProfile: (p: PlayerProfile) => void;
}

/** React owns menus, HUD, save flow. The engine owns everything that changes 60 times per second. */
export default function PacmanGame({ player, difficulty, onExit, onLeaderboard, onPlayAgain, onProfile }: Props) {
  const engineRef = useRef<PacmanEngine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(sound.muted);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showOver, setShowOver] = useState(false);
  const [save, setSave] = useState<SaveState>({ status: "saving" });

  const options = useMemo(() => ({
    difficulty, playerName: player.name.split(" ")[0].toUpperCase(), highScore: player.highScore,
    onHud: setHud,
    onGameOver: setResult,
    onPauseChange: (p: boolean) => { setPaused(p); if (!p) setConfirm(null); },
    onMuteChange: setMuted,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [difficulty]);

  const submit = useCallback(async (r: GameResult) => {
    setSave({ status: "saving" });
    try {
      const res = await apiPost<CompleteGameResponse>("/api/game/complete", r);
      onProfile(res.profile);
      setSave({ status: "saved", newHighScore: res.isNewHighScore });
    } catch (err) {
      setSave({ status: "error", message: err instanceof ApiError ? err.message : "Something went wrong." });
    }
  }, [onProfile]);

  useEffect(() => {
    if (!result) return;
    void submit(result);
    const t = setTimeout(() => setShowOver(true), 1600); // let "GAME OVER" sit on the board first
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const resume = () => engineRef.current?.resume();
  const doRestartLevel = () => { setConfirm(null); engineRef.current?.restartLevel(); };
  const doRestartGame = () => { setConfirm(null); setHud(null); engineRef.current?.restartGame(); };

  return (
    <div className="crt fixed inset-0 flex flex-col bg-[#02030a]">
      {hud && <HudBar hud={hud} />}
      <div className="flex min-h-0 flex-1">
        {hud && <HudLeft hud={hud} />}
        <div className="relative min-h-0 min-w-0 flex-1">
          <GameCanvas options={options} onEngine={(e) => { engineRef.current = e; }} />
          {paused && !result && (
            <PauseMenu confirm={confirm} onConfirm={setConfirm} onResume={resume} onRestartLevel={doRestartLevel} onRestartGame={doRestartGame} onQuit={onExit} />
          )}
          {result && showOver && (
            <GameOver
              playerName={player.name} result={result} save={save}
              onRetry={() => void submit(result)}
              onPlayAgain={onPlayAgain} onLeaderboard={onLeaderboard} onMenu={onExit}
            />
          )}
        </div>
        {hud && <HudRight hud={hud} muted={muted} onMute={() => engineRef.current?.toggleMute()} onPause={() => engineRef.current?.pause()} />}
      </div>
    </div>
  );
}
