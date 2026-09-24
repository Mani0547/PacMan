/** Difficulty presets + the function that combines level and difficulty into runtime parameters. */
import { DifficultyKey, DifficultyLabel, PAC_BASE_SPEED } from "./constants";
import { LEVELS, LEVEL_LIMITS, clamp, getLevelConfig } from "./levels";
import { FruitType } from "./fruit";

export interface DifficultyConfig {
  key: DifficultyKey;
  label: DifficultyLabel;
  tagline: string;
  lives: number;
  /** Multiplies every score award (pellets, ghosts, fruit). Harder modes pay more. */
  scoreMultiplier: number;
  ghostSpeedMultiplier: number;
  frightenedMultiplier: number;
  aggressionMultiplier: number;
  ghostReleaseMultiplier: number;
  /** How quickly the level table's difficulty ramp is felt (1 = as designed). */
  progressionMultiplier: number;
  /** Ghosts re-read Pac-Man's position only this often (ms). 0 = instantly. */
  reactionMs: number;
}

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  EASY: { key: "EASY", label: "EASY", tagline: "Just warming up.", lives: 5, scoreMultiplier: 1, ghostSpeedMultiplier: 0.85, frightenedMultiplier: 1.35, aggressionMultiplier: 0.8, ghostReleaseMultiplier: 1.3, progressionMultiplier: 0.6, reactionMs: 400 },
  OK_OK: { key: "OK_OK", label: "OK OK", tagline: "The arcade fights back.", lives: 3, scoreMultiplier: 1.5, ghostSpeedMultiplier: 1, frightenedMultiplier: 1, aggressionMultiplier: 1, ghostReleaseMultiplier: 1, progressionMultiplier: 1, reactionMs: 0 },
  NIGHTMARE: { key: "NIGHTMARE", label: "NIGHTMARE", tagline: "One life. Good luck.", lives: 1, scoreMultiplier: 2, ghostSpeedMultiplier: 1.15, frightenedMultiplier: 0.65, aggressionMultiplier: 1.25, ghostReleaseMultiplier: 0.75, progressionMultiplier: 1.25, reactionMs: 0 },
};

export const DIFFICULTY_LIST: DifficultyConfig[] = [DIFFICULTIES.EASY, DIFFICULTIES.OK_OK, DIFFICULTIES.NIGHTMARE];

export const keyFromLabel = (label: DifficultyLabel): DifficultyKey => (label === "OK OK" ? "OK_OK" : label);

export interface RuntimeParams {
  level: number;
  mazeId: number;
  mazeName: string;
  pacSpeed: number; // tiles / second
  ghostSpeed: number; // tiles / second
  frightenedMs: number;
  flashMs: number;
  scatterMs: number;
  chaseMs: number;
  releaseScale: number;
  aggression: number;
  reactionMs: number;
  fruit: FruitType;
  fruitSpawn: number[];
  fruitLifetimeMs: number;
}

/** Combine the level table with the chosen difficulty. Every value is clamped. */
export function resolveParams(level: number, key: DifficultyKey): RuntimeParams {
  const d = DIFFICULTIES[key];
  const L = getLevelConfig(level);
  const L1 = LEVELS[0];
  const blend = (value: number, base: number) => base + (value - base) * d.progressionMultiplier;

  const frightenedMs = clamp(blend(L.frightenedDuration, L1.frightenedDuration) * d.frightenedMultiplier, LEVEL_LIMITS.frightenedMs);
  return {
    level: L.level,
    mazeId: L.mazeId,
    mazeName: L.name,
    pacSpeed: PAC_BASE_SPEED * clamp(blend(L.pacmanSpeed, L1.pacmanSpeed), LEVEL_LIMITS.pacmanSpeed),
    ghostSpeed: PAC_BASE_SPEED * clamp(blend(L.ghostSpeed, L1.ghostSpeed) * d.ghostSpeedMultiplier, LEVEL_LIMITS.ghostSpeed),
    frightenedMs,
    flashMs: Math.min(2000, frightenedMs * 0.45),
    scatterMs: clamp(blend(L.scatterDuration, L1.scatterDuration) / d.aggressionMultiplier, LEVEL_LIMITS.scatterMs),
    chaseMs: clamp(blend(L.chaseDuration, L1.chaseDuration) * d.aggressionMultiplier, LEVEL_LIMITS.chaseMs),
    releaseScale: clamp(blend(L.ghostHouseReleaseTime, 1) * d.ghostReleaseMultiplier, LEVEL_LIMITS.release),
    aggression: d.aggressionMultiplier,
    reactionMs: d.reactionMs,
    fruit: L.fruit,
    fruitSpawn: L.fruitSpawnTiming,
    fruitLifetimeMs: 9500,
  };
}
