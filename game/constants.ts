/** Shared constants for the game engine. Game code uses only relative imports so it can run headless. */
export const COLS = 28;
export const ROWS = 31;

export interface Vec { x: number; y: number }
export const UP: Vec = { x: 0, y: -1 };
export const LEFT: Vec = { x: -1, y: 0 };
export const DOWN: Vec = { x: 0, y: 1 };
export const RIGHT: Vec = { x: 1, y: 0 };
/** Ghosts break distance ties in this order (same as the arcade original). */
export const DIR_PRIORITY: readonly Vec[] = [UP, LEFT, DOWN, RIGHT];

export type DifficultyLabel = "EASY" | "OK OK" | "NIGHTMARE";
export type DifficultyKey = "EASY" | "OK_OK" | "NIGHTMARE";

/** Pac-Man's base speed in tiles per second (multiplied by level / difficulty settings). */
export const PAC_BASE_SPEED = 7.2;

export const HOUSE = { c0: 11, c1: 16, r0: 13, r1: 15 } as const;
export const DOOR = { r: 12, c0: 13, c1: 14 } as const;
/** Tile just above the ghost-house door. Eaten ghosts navigate here, then drop inside. */
export const HOUSE_ENTRY = { c: 13, r: 11 } as const;
export const DOOR_X = 14;
export const HOUSE_CENTER_Y = 14.5;
export const OUTSIDE_Y = 11.5;
export const FRUIT_POS: Vec = { x: 14, y: 17.5 };

export const PAC_START = { c: 14, r: 23 } as const; // with off = 0.5 and dx = -1 => x = 14.0
export const HIT_DISTANCE = 0.55;
export const FRUIT_HIT_DISTANCE = 0.75;

export const READY_FIRST_MS = 2600;
export const READY_RETRY_MS = 1700;
export const DEATH_TOTAL_S = 2.6;
export const LEVEL_COMPLETE_S = 3.0;
export const GHOST_EAT_FREEZE_S = 0.55;
