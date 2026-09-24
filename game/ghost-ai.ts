/**
 * Ghost personalities and intersection logic.
 *  - Blinky targets Pac-Man directly (and speeds up as pellets run out).
 *  - Pinky targets 4 tiles ahead of Pac-Man.
 *  - Inky doubles the vector from Blinky to the tile 2 ahead of Pac-Man.
 *  - Clyde chases until he is within ~8 tiles, then retreats to his corner.
 */
import { DIR_PRIORITY, Vec } from "./constants";
import { Ghost } from "./ghost";
import { MazeGeometry, homeDistance, walkable } from "./maze";

/** What the ghosts "know". Refreshed every `reactionMs` (slower on EASY). */
export interface Percept {
  pacC: number; pacR: number; pacDx: number; pacDy: number; blinkyC: number; blinkyR: number;
}

export function chaseTarget(g: Ghost, p: Percept, aggression: number): Vec {
  switch (g.name) {
    case "blinky":
      return { x: p.pacC, y: p.pacR };
    case "pinky":
      return { x: p.pacC + p.pacDx * 4, y: p.pacR + p.pacDy * 4 };
    case "inky": {
      const px = p.pacC + p.pacDx * 2, py = p.pacR + p.pacDy * 2;
      return { x: px + (px - p.blinkyC), y: py + (py - p.blinkyR) };
    }
    case "clyde": {
      const dx = g.c - p.pacC, dy = g.r - p.pacR;
      const radius = 8 / Math.max(0.6, aggression); // braver on NIGHTMARE, more cowardly on EASY
      return dx * dx + dy * dy > radius * radius ? { x: p.pacC, y: p.pacR } : g.scatterTarget;
    }
  }
}

export type ChoiceMode = "target" | "random" | "home";

/**
 * Pick the direction to leave the current tile centre.
 * Ghosts never reverse on their own (reversals are forced by mode changes), except in dead ends.
 */
export function chooseGhostDirection(g: Ghost, geo: MazeGeometry, mode: ChoiceMode, target: Vec | null, rng: () => number): Vec {
  const ok = (d: Vec) => walkable(geo, g.c + d.x, g.r + d.y);
  // Eyes heading home may turn around freely; everyone else only reverses in dead ends.
  const noReverse = mode !== "home";
  let options = DIR_PRIORITY.filter((d) => ok(d) && !(noReverse && d.x === -g.dx && d.y === -g.dy && (g.dx !== 0 || g.dy !== 0)));
  if (options.length === 0) options = DIR_PRIORITY.filter(ok);
  if (options.length === 0) return { x: 0, y: 0 };
  if (options.length === 1) return options[0];

  if (mode === "random") return options[Math.floor(rng() * options.length)];

  let best = options[0], bestScore = Infinity;
  for (const d of options) {
    const nc = g.c + d.x, nr = g.r + d.y;
    let score: number;
    if (mode === "home") score = homeDistance(geo, nc, nr);
    else { const tx = target!.x - nc, ty = target!.y - nr; score = tx * tx + ty * ty; }
    if (score < bestScore) { bestScore = score; best = d; }
  }
  return best;
}
