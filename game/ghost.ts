import { HOUSE_CENTER_Y, LEFT, OUTSIDE_Y, DOOR_X, Vec } from "./constants";
import { Mover } from "./movement";

export type GhostName = "blinky" | "pinky" | "inky" | "clyde";
export type GhostState = "IN_GHOST_HOUSE" | "LEAVING_GHOST_HOUSE" | "SCATTER" | "CHASE" | "FRIGHTENED" | "EATEN";

export interface GhostDef { name: GhostName; color: string; role: string; scatter: Vec; home: Vec }

export const GHOST_ORDER: GhostName[] = ["blinky", "pinky", "inky", "clyde"];

export const GHOST_DEFS: Record<GhostName, GhostDef> = {
  blinky: { name: "blinky", color: "#ff2b2b", role: "Direct hunter", scatter: { x: 25, y: -3 }, home: { x: DOOR_X, y: OUTSIDE_Y } },
  pinky: { name: "pinky", color: "#ff8fd8", role: "Ambusher", scatter: { x: 2, y: -3 }, home: { x: DOOR_X, y: HOUSE_CENTER_Y } },
  inky: { name: "inky", color: "#19e6ff", role: "Tactical hunter", scatter: { x: 27, y: 33 }, home: { x: 12.5, y: HOUSE_CENTER_Y } },
  clyde: { name: "clyde", color: "#ffa733", role: "Hunter / coward", scatter: { x: 0, y: 33 }, home: { x: 15.5, y: HOUSE_CENTER_Y } },
};

export interface Ghost extends Mover {
  name: GhostName;
  color: string;
  state: GhostState;
  /** Render position in tiles (authoritative while inside the house). */
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  scatterTarget: Vec;
  anim: number;
  /** Eaten ghosts: first travel back ('return'), then drop into the house ('enter'). */
  eatenPhase: "return" | "enter";
  /** True after being eaten: leaves the house again as soon as regeneration finishes. */
  regen: boolean;
  houseTimer: number;
  face: Vec;
}

export function createGhost(name: GhostName): Ghost {
  const def = GHOST_DEFS[name];
  const g = { name, color: def.color, scatterTarget: def.scatter, homeX: def.home.x, homeY: def.home.y } as Ghost;
  resetGhost(g, "SCATTER");
  return g;
}

/** Return a ghost to its starting position. Blinky starts outside the house, the rest inside. */
export function resetGhost(g: Ghost, mode: "SCATTER" | "CHASE"): void {
  g.x = g.homeX; g.y = g.homeY;
  g.anim = Math.random() * 3; g.eatenPhase = "return"; g.regen = false; g.houseTimer = 0;
  g.face = LEFT; g.off = 0; g.dx = 0; g.dy = 0;
  if (g.name === "blinky") {
    g.state = mode; g.c = 14; g.r = 11; g.off = 0.5; g.dx = -1; g.dy = 0;
    g.x = 14; g.y = OUTSIDE_Y;
  } else {
    g.state = "IN_GHOST_HOUSE"; g.c = 14; g.r = 14;
  }
}
