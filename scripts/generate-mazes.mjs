// Generates game/maze-layouts.ts : 10 designed, mirror-symmetric mazes derived from the classic layout.
// Every maze is validated: fully connected, no dead ends, no open 2x2 blocks, ghost house untouched.
// Run with:  npm run generate:mazes
import { writeFileSync } from "node:fs";

const COLS = 28, ROWS = 31;
const CLASSIC = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "######.##### ## #####.######",
  "######.##          ##.######",
  "######.## ###--### ##.######",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "######.## ######## ##.######",
  "######.##          ##.######",
  "######.## ######## ##.######",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......  .......##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

const SPECS = [
  { name: "CLASSIC",        seed: 1,   carve: 0,  fill: 0, tunnels: [] },
  { name: "CORNER CUT",     seed: 11,  carve: 3,  fill: 3, tunnels: [] },
  { name: "CROSSROADS",     seed: 23,  carve: 9,  fill: 2, tunnels: [] },
  { name: "TUNNEL RUN",     seed: 37,  carve: 4,  fill: 3, tunnels: [5, 26] },
  { name: "THE GRID",       seed: 41,  carve: 7,  fill: 5, tunnels: [] },
  { name: "SPLIT DECISION", seed: 59,  carve: 6,  fill: 6, tunnels: [] },
  { name: "LABYRINTH",      seed: 67,  carve: 10, fill: 7, tunnels: [8, 23] },
  { name: "OVERDRIVE",      seed: 71,  carve: 8,  fill: 8, tunnels: [5] },
  { name: "GAUNTLET",       seed: 83,  carve: 12, fill: 8, tunnels: [26] },
  { name: "COUNTERPOINT",   seed: 97,  carve: 14, fill: 10, tunnels: [5, 20, 23] },
];

const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const inHouse = (c, r) => c >= 11 && c <= 16 && r >= 13 && r <= 15;
const open = (g, c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS && !inHouse(c, r) && (g[r][c] === "." || g[r][c] === "o" || g[r][c] === " ");
const editable = (c, r) => c >= 1 && c <= 12 && ((r >= 1 && r <= 8) || (r >= 20 && r <= 29));
const PROTECT = new Set(["6,8", "12,8", "6,20", "9,20", "12,23", "12,5", "12,29", "12,1", "12,20"]);
const DIRS = [[0, -1], [-1, 0], [0, 1], [1, 0]];

function nbrs(g, c, r) {
  const out = [];
  for (const [dx, dy] of DIRS) {
    let nc = c + dx; const nr = r + dy;
    if (nc < 0) nc = COLS - 1; else if (nc >= COLS) nc = 0;
    if (open(g, nc, nr)) out.push([dx, dy]);
  }
  return out;
}

function validate(g) {
  let total = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (open(g, c, r)) { total++; if (nbrs(g, c, r).length < 2) return false; }
  for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS - 1; c++)
    if (open(g, c, r) && open(g, c + 1, r) && open(g, c, r + 1) && open(g, c + 1, r + 1)) return false;
  const seen = new Set(["13,23"]); const q = [[13, 23]];
  while (q.length) {
    const [c, r] = q.pop();
    for (const [dx, dy] of nbrs(g, c, r)) {
      let nc = c + dx; if (nc < 0) nc = COLS - 1; else if (nc >= COLS) nc = 0;
      const k = nc + "," + (r + dy);
      if (!seen.has(k)) { seen.add(k); q.push([nc, r + dy]); }
    }
  }
  return seen.size === total;
}

const set = (g, c, r, ch) => { g[r][c] = ch; g[r][COLS - 1 - c] = ch; };
const pickRow = (rng) => { const rows = [1, 2, 3, 4, 5, 6, 7, 8, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]; return rows[Math.floor(rng() * rows.length)]; };

function tryCarve(g, rng) {
  for (let a = 0; a < 80; a++) {
    const c = 1 + Math.floor(rng() * 12), r = pickRow(rng);
    if (g[r][c] !== "#") continue;
    const [dx, dy] = rng() < 0.5 ? [1, 0] : [0, 1];
    let x = c, y = r;
    while (editable(x - dx, y - dy) && g[y - dy][x - dx] === "#") { x -= dx; y -= dy; }
    if (!open(g, x - dx, y - dy)) continue;
    const run = [];
    while (editable(x, y) && g[y][x] === "#" && run.length < 7) { run.push([x, y]); x += dx; y += dy; }
    if (run.length === 0 || run.length > 5 || !open(g, x, y)) continue;
    const backup = run.map(([cx, cy]) => [cx, cy, g[cy][cx]]);
    run.forEach(([cx, cy]) => set(g, cx, cy, "."));
    if (validate(g)) return true;
    backup.forEach(([cx, cy, ch]) => set(g, cx, cy, ch));
  }
  return false;
}

function tryFill(g, rng) {
  const straight = (c, r) => { const n = nbrs(g, c, r); return n.length === 2 && n[0][0] + n[1][0] === 0 && n[0][1] + n[1][1] === 0 ? n[0] : null; };
  for (let a = 0; a < 80; a++) {
    const c = 1 + Math.floor(rng() * 12), r = pickRow(rng);
    if (g[r][c] !== "." || PROTECT.has(c + "," + r)) continue;
    const ax = straight(c, r); if (!ax) continue;
    const run = [[c, r]];
    for (const s of [1, -1]) {
      let x = c + ax[0] * s, y = r + ax[1] * s;
      while (editable(x, y) && g[y][x] === "." && !PROTECT.has(x + "," + y) && straight(x, y) && run.length < 6) { run.push([x, y]); x += ax[0] * s; y += ax[1] * s; }
    }
    if (run.length > 5) continue;
    run.forEach(([cx, cy]) => set(g, cx, cy, "#"));
    if (validate(g)) return true;
    run.forEach(([cx, cy]) => set(g, cx, cy, "."));
  }
  return false;
}

const layouts = [], names = [];
for (const spec of SPECS) {
  const g = CLASSIC.map((row) => row.split(""));
  if (!validate(g)) throw new Error("classic base failed validation");
  const rng = mulberry32(spec.seed);
  for (const r of spec.tunnels) { g[r][0] = "."; g[r][COLS - 1] = "."; }
  if (!validate(g)) throw new Error(spec.name + ": tunnel setup invalid");
  let carved = 0, filled = 0;
  for (let i = 0; i < spec.carve; i++) if (tryCarve(g, rng)) carved++;
  for (let i = 0; i < spec.fill; i++) if (tryFill(g, rng)) filled++;
  if (!validate(g)) throw new Error(spec.name + " failed validation");
  const rows = g.map((row) => row.join(""));
  const pellets = rows.join("").split("").filter((ch) => ch === "." || ch === "o").length;
  console.log(`${spec.name.padEnd(15)} carved ${carved}/${spec.carve}  filled ${filled}/${spec.fill}  tunnels [${spec.tunnels}]  pellets ${pellets}`);
  layouts.push(rows); names.push(spec.name);
}

const out = `// AUTO-GENERATED by scripts/generate-mazes.mjs — run \`npm run generate:mazes\` to regenerate.
// '#' wall  '.' pellet  'o' power pellet  ' ' empty  '-' ghost-house door
export const MAZE_NAMES: string[] = ${JSON.stringify(names)};

export const MAZE_LAYOUTS: string[][] = ${JSON.stringify(layouts, null, 2)};
`;
writeFileSync(new URL("../game/maze-layouts.ts", import.meta.url), out);
if (process.argv.includes("--print")) layouts.forEach((l, i) => console.log("\n" + names[i] + "\n" + l.join("\n")));
