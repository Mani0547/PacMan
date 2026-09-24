/**
 * Data-driven level table. Nothing about level pacing lives in React components.
 * Speeds are multipliers of PAC_BASE_SPEED; durations are milliseconds.
 * Levels 1-10 are hand-tuned; level 11+ rotates the mazes and keeps scaling (clamped) from level 10.
 */
import { fruitForLevel, FruitType } from "./fruit";

export interface LevelConfig {
  level: number;
  mazeId: number;
  name: string;
  pacmanSpeed: number;
  ghostSpeed: number;
  frightenedDuration: number;
  scatterDuration: number;
  chaseDuration: number;
  /** Multiplier on ghost-house release timers (lower = ghosts leave sooner). */
  ghostHouseReleaseTime: number;
  /** Fractions of pellets eaten at which fruit appears. */
  fruitSpawnTiming: number[];
  fruit: FruitType;
  brief: string;
}

const SPAWN = [0.3, 0.7];

export const LEVELS: LevelConfig[] = [
  { level: 1, mazeId: 0, name: "CLASSIC", pacmanSpeed: 1.0, ghostSpeed: 0.9, frightenedDuration: 7000, scatterDuration: 7000, chaseDuration: 20000, ghostHouseReleaseTime: 1.0, fruitSpawnTiming: SPAWN, fruit: "cherry", brief: "Classic introduction. Moderate ghosts, long power time." },
  { level: 2, mazeId: 1, name: "CORNER CUT", pacmanSpeed: 1.0, ghostSpeed: 0.94, frightenedDuration: 6000, scatterDuration: 7000, chaseDuration: 20000, ghostHouseReleaseTime: 0.95, fruitSpawnTiming: SPAWN, fruit: "strawberry", brief: "Faster ghosts and trickier corners." },
  { level: 3, mazeId: 2, name: "CROSSROADS", pacmanSpeed: 1.0, ghostSpeed: 0.95, frightenedDuration: 5500, scatterDuration: 7000, chaseDuration: 21000, ghostHouseReleaseTime: 0.9, fruitSpawnTiming: SPAWN, fruit: "orange", brief: "More intersections. Easier to get surrounded." },
  { level: 4, mazeId: 3, name: "TUNNEL RUN", pacmanSpeed: 1.0, ghostSpeed: 0.96, frightenedDuration: 5000, scatterDuration: 6500, chaseDuration: 21000, ghostHouseReleaseTime: 0.9, fruitSpawnTiming: SPAWN, fruit: "orange", brief: "Extra tunnels. Ghosts use them too." },
  { level: 5, mazeId: 4, name: "THE GRID", pacmanSpeed: 1.02, ghostSpeed: 0.99, frightenedDuration: 4500, scatterDuration: 5500, chaseDuration: 26000, ghostHouseReleaseTime: 0.85, fruitSpawnTiming: SPAWN, fruit: "apple", brief: "Aggressive ghosts. Longer chase phases." },
  { level: 6, mazeId: 5, name: "SPLIT DECISION", pacmanSpeed: 1.02, ghostSpeed: 1.0, frightenedDuration: 3000, scatterDuration: 5500, chaseDuration: 26000, ghostHouseReleaseTime: 0.65, fruitSpawnTiming: SPAWN, fruit: "apple", brief: "Short power time. Ghosts leave the house fast." },
  { level: 7, mazeId: 6, name: "LABYRINTH", pacmanSpeed: 1.03, ghostSpeed: 1.03, frightenedDuration: 2600, scatterDuration: 5000, chaseDuration: 27000, ghostHouseReleaseTime: 0.6, fruitSpawnTiming: SPAWN, fruit: "melon", brief: "Complex maze. Dangerous intersections." },
  { level: 8, mazeId: 7, name: "OVERDRIVE", pacmanSpeed: 1.07, ghostSpeed: 1.1, frightenedDuration: 2200, scatterDuration: 4500, chaseDuration: 28000, ghostHouseReleaseTime: 0.55, fruitSpawnTiming: SPAWN, fruit: "melon", brief: "High speed. Everything moves faster." },
  { level: 9, mazeId: 8, name: "GAUNTLET", pacmanSpeed: 1.05, ghostSpeed: 1.08, frightenedDuration: 1400, scatterDuration: 3500, chaseDuration: 32000, ghostHouseReleaseTime: 0.5, fruitSpawnTiming: SPAWN, fruit: "galaxian", brief: "Power pellets barely last. Ghosts relentless." },
  { level: 10, mazeId: 9, name: "COUNTERPOINT", pacmanSpeed: 1.06, ghostSpeed: 1.1, frightenedDuration: 1200, scatterDuration: 3000, chaseDuration: 34000, ghostHouseReleaseTime: 0.5, fruitSpawnTiming: SPAWN, fruit: "galaxian", brief: "The final exam. Then it keeps going." },
];

/** Hard limits so endless scaling can never become mathematically impossible. */
export const LEVEL_LIMITS = {
  pacmanSpeed: [0.9, 1.12],
  ghostSpeed: [0.6, 1.15],
  frightenedMs: [1000, 14000],
  scatterMs: [1500, 15000],
  chaseMs: [6000, 90000],
  release: [0.25, 2.5],
} as const;

export const clamp = (v: number, [lo, hi]: readonly [number, number] | readonly number[]): number => Math.min(hi, Math.max(lo, v));

/** Configuration for any level number (1..infinity). There is deliberately no maximum level. */
export function getLevelConfig(level: number): LevelConfig {
  const n = Math.max(1, Math.floor(level));
  if (n <= LEVELS.length) return LEVELS[n - 1];
  const last = LEVELS[LEVELS.length - 1];
  const extra = n - LEVELS.length; // how many levels beyond the designed set
  const mazeId = (n - 1) % LEVELS.length; // rotate the existing mazes
  return {
    level: n,
    mazeId,
    name: LEVELS[mazeId].name,
    pacmanSpeed: clamp(last.pacmanSpeed + extra * 0.003, LEVEL_LIMITS.pacmanSpeed),
    ghostSpeed: clamp(last.ghostSpeed + extra * 0.006, LEVEL_LIMITS.ghostSpeed),
    frightenedDuration: clamp(last.frightenedDuration - extra * 60, LEVEL_LIMITS.frightenedMs),
    scatterDuration: clamp(last.scatterDuration - extra * 120, LEVEL_LIMITS.scatterMs),
    chaseDuration: clamp(last.chaseDuration + extra * 700, LEVEL_LIMITS.chaseMs),
    ghostHouseReleaseTime: clamp(last.ghostHouseReleaseTime - extra * 0.015, LEVEL_LIMITS.release),
    fruitSpawnTiming: SPAWN,
    fruit: fruitForLevel(n),
    brief: "Endless mode. The arcade never stops.",
  };
}
