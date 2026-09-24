import { COLS, ROWS, HOUSE, HOUSE_ENTRY } from "./constants";
import { MAZE_LAYOUTS, MAZE_NAMES } from "./maze-layouts";

export const TILE_OPEN = 0;
export const TILE_WALL = 1;
export const TILE_DOOR = 2;
export const TILE_HOUSE = 3;

export interface MazeGeometry {
  id: number;
  name: string;
  tiles: Uint8Array;
  /** Initial pellets: 0 none, 1 pellet, 2 power pellet. */
  pellets: Uint8Array;
  totalPellets: number;
  /** Rows whose left and right edges are open (they wrap around). */
  tunnelRows: boolean[];
  /** BFS distance from every open tile to the ghost-house entry tile (used by eaten ghosts). */
  homeDist: Int16Array;
}

const cache = new Map<number, MazeGeometry>();

export function getMaze(id: number): MazeGeometry {
  const idx = ((id % MAZE_LAYOUTS.length) + MAZE_LAYOUTS.length) % MAZE_LAYOUTS.length;
  let geo = cache.get(idx);
  if (!geo) { geo = build(idx); cache.set(idx, geo); }
  return geo;
}

function build(id: number): MazeGeometry {
  const rows = MAZE_LAYOUTS[id];
  const tiles = new Uint8Array(COLS * ROWS);
  const pellets = new Uint8Array(COLS * ROWS);
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = rows[r][c] ?? "#";
      const i = r * COLS + c;
      const inHouse = c >= HOUSE.c0 && c <= HOUSE.c1 && r >= HOUSE.r0 && r <= HOUSE.r1;
      if (inHouse) tiles[i] = TILE_HOUSE;
      else if (ch === "#") tiles[i] = TILE_WALL;
      else if (ch === "-") tiles[i] = TILE_DOOR;
      else {
        tiles[i] = TILE_OPEN;
        if (ch === ".") { pellets[i] = 1; total++; }
        else if (ch === "o") { pellets[i] = 2; total++; }
      }
    }
  }
  const tunnelRows: boolean[] = [];
  for (let r = 0; r < ROWS; r++) tunnelRows[r] = tiles[r * COLS] === TILE_OPEN && tiles[r * COLS + COLS - 1] === TILE_OPEN;

  const geo: MazeGeometry = { id, name: MAZE_NAMES[id], tiles, pellets, totalPellets: total, tunnelRows, homeDist: new Int16Array(COLS * ROWS).fill(32767) };
  // BFS from the house entry (includes tunnel wrap-around edges).
  const q: number[] = [HOUSE_ENTRY.r * COLS + HOUSE_ENTRY.c];
  geo.homeDist[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const c = q[h] % COLS, r = (q[h] / COLS) | 0, d = geo.homeDist[q[h]];
    for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]]) {
      let nc = c + dx; const nr = r + dy;
      if (nc < 0) nc = COLS - 1; else if (nc >= COLS) nc = 0;
      if (nr < 0 || nr >= ROWS || tiles[nr * COLS + nc] !== TILE_OPEN) continue;
      if (Math.abs(nc - c) > 1 && !tunnelRows[r]) continue;
      const ni = nr * COLS + nc;
      if (geo.homeDist[ni] === 32767) { geo.homeDist[ni] = d + 1; q.push(ni); }
    }
  }
  return geo;
}

/** Can a normal mover stand on tile (c, r)? Columns -1 and COLS exist only on tunnel rows. */
export function walkable(geo: MazeGeometry, c: number, r: number): boolean {
  if (r < 0 || r >= ROWS) return false;
  if (c < 0 || c >= COLS) return (c === -1 || c === COLS) && geo.tunnelRows[r];
  return geo.tiles[r * COLS + c] === TILE_OPEN;
}

export function homeDistance(geo: MazeGeometry, c: number, r: number): number {
  const cc = c < 0 ? COLS - 1 : c >= COLS ? 0 : c;
  return geo.homeDist[r * COLS + cc];
}

/** Mutable per-level pellet state. */
export class MazeState {
  readonly pellets: Uint8Array;
  remaining: number;
  constructor(readonly geo: MazeGeometry) {
    this.pellets = geo.pellets.slice();
    this.remaining = geo.totalPellets;
  }
  eat(c: number, r: number): 0 | 1 | 2 {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 0;
    const i = r * COLS + c;
    const v = this.pellets[i] as 0 | 1 | 2;
    if (v) { this.pellets[i] = 0; this.remaining--; }
    return v;
  }
  get eaten(): number { return this.geo.totalPellets - this.remaining; }
}
