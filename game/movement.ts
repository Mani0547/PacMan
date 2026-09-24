import { COLS } from "./constants";
import { MazeGeometry, walkable } from "./maze";

/**
 * Grid mover. (c, r) is the tile whose centre we last left / are heading from,
 * (dx, dy) the heading, off in [0,1) how far we are toward the next tile centre.
 * Decisions are made only when a tile centre is reached, so nothing ever clips a wall.
 */
export interface Mover { c: number; r: number; off: number; dx: number; dy: number }

export const moverX = (m: Mover): number => m.c + 0.5 + m.dx * m.off;
export const moverY = (m: Mover): number => m.r + 0.5 + m.dy * m.off;

export function canMove(geo: MazeGeometry, m: Mover, dx: number, dy: number): boolean {
  return walkable(geo, m.c + dx, m.r + dy);
}

/** Turn around in place (mid-tile is fine: position stays identical). */
export function reverse(geo: MazeGeometry, m: Mover): void {
  if (m.dx === 0 && m.dy === 0) return;
  if (m.off === 0) {
    if (canMove(geo, m, -m.dx, -m.dy)) { m.dx = -m.dx; m.dy = -m.dy; }
    return;
  }
  m.c += m.dx; m.r += m.dy; m.off = 1 - m.off; m.dx = -m.dx; m.dy = -m.dy;
}

/** Advance by `dist` tiles, calling onArrive at every tile centre reached. Handles tunnel wrap. */
export function advance(m: Mover, dist: number, onArrive: (m: Mover) => void): void {
  let left = dist;
  for (let guard = 0; left > 1e-9 && guard < 8; guard++) {
    if (m.dx === 0 && m.dy === 0) return;
    const toNext = 1 - m.off;
    if (left < toNext) { m.off += left; return; }
    left -= toNext;
    m.c += m.dx; m.r += m.dy; m.off = 0;
    // Tunnel wrap: teleport when fully off-screen so there is no visible pop.
    if (m.c === COLS && m.dx > 0) m.c = -1;
    else if (m.c === -1 && m.dx < 0) m.c = COLS;
    onArrive(m);
  }
}
