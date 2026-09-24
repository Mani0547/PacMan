/** Canvas drawing for the game. Everything is drawn in tile units (1 tile = 1 unit) via a scale transform. */
import { COLS, ROWS, FRUIT_POS } from "./constants";
import type { PacmanEngine } from "./engine";
import { FruitType } from "./fruit";
import type { Ghost } from "./ghost";
import { MazeGeometry, TILE_DOOR, TILE_WALL } from "./maze";
import { moverX, moverY } from "./movement";

const BG = "#02030a";
const PI = Math.PI;

export interface Layers { normal: HTMLCanvasElement; flash: HTMLCanvasElement; mazeId: number; k: number }

export function buildLayers(geo: MazeGeometry, k: number): Layers {
  return { normal: paintMaze(geo, k, "#2f5bff", "#3d7bff"), flash: paintMaze(geo, k, "#ffffff", "#9fb4ff"), mazeId: geo.id, k };
}

function paintMaze(geo: MazeGeometry, k: number, line: string, glow: string): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = Math.round(COLS * k); cv.height = Math.round(ROWS * k);
  const g = cv.getContext("2d")!;
  g.scale(cv.width / COLS, cv.height / ROWS);
  const isWall = (c: number, r: number) => c < 0 || c >= COLS || r < 0 || r >= ROWS || geo.tiles[r * COLS + c] === TILE_WALL;

  g.fillStyle = BG; g.fillRect(0, 0, COLS, ROWS);
  g.fillStyle = "#050a26";
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (isWall(c, r) && !(c < 0)) g.fillRect(c, r, 1.02, 1.02);

  const edges = new Path2D();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (geo.tiles[r * COLS + c] !== TILE_WALL) continue;
      if (r > 0 && !isWall(c, r - 1)) { edges.moveTo(c, r); edges.lineTo(c + 1, r); }
      if (r < ROWS - 1 && !isWall(c, r + 1)) { edges.moveTo(c, r + 1); edges.lineTo(c + 1, r + 1); }
      if (c > 0 && !isWall(c - 1, r)) { edges.moveTo(c, r); edges.lineTo(c, r + 1); }
      if (c < COLS - 1 && !isWall(c + 1, r)) { edges.moveTo(c + 1, r); edges.lineTo(c + 1, r + 1); }
    }
  }
  g.lineJoin = "round"; g.lineCap = "round";
  g.strokeStyle = glow; g.globalAlpha = 0.55; g.lineWidth = 0.2; g.shadowColor = glow; g.shadowBlur = k * 0.55;
  g.stroke(edges);
  g.globalAlpha = 1; g.shadowBlur = 0; g.strokeStyle = line; g.lineWidth = 0.09;
  g.stroke(edges);

  g.fillStyle = "#ffb8de";
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (geo.tiles[r * COLS + c] === TILE_DOOR) g.fillRect(c, r + 0.4, 1, 0.2);
  return cv;
}

export function drawFrame(ctx: CanvasRenderingContext2D, e: PacmanEngine, k: number, layers: Layers): void {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG; ctx.fillRect(0, 0, cw, ch);
  const flashOn = e.phase === "levelComplete" && e.lcT > 0.9 && Math.floor((e.lcT - 0.9) / 0.28) % 2 === 1;
  ctx.drawImage(flashOn ? layers.flash : layers.normal, 0, 0, cw, ch);
  ctx.setTransform(cw / COLS, 0, 0, ch / ROWS, 0, 0);

  drawPellets(ctx, e);
  if (e.fruit) drawFruit(ctx, e.fruit.type, e.fruit.x, e.fruit.y, e.fruit.msLeft < 2000 && Math.floor(e.fruit.msLeft / 150) % 2 === 0);

  const showGhosts = (e.phase === "ready" || e.phase === "playing") || (e.phase === "dying" && e.deathT < 0.75) || (e.phase === "levelComplete" && e.lcT < 0.35);
  if (showGhosts) for (const g of e.ghosts) { if (g.state === "EATEN" && e.freezeT > 0) continue; drawGhost(ctx, g, e, k); }
  if (e.phase !== "gameOver") drawPac(ctx, e, k);

  for (const p of e.popups) label(ctx, k, p.text, p.x, p.y - (1.1 - Math.min(1.1, p.t)) * 0.4, 0.62, "#19e6ff");

  const cx = COLS / 2, cy = FRUIT_POS.y;
  if (e.phase === "ready") {
    if (e.readyT > 0.7) label(ctx, k, "READY!", cx, cy, 0.95, "#ffe600");
    else label(ctx, k, "GO!", cx, cy, 0.95, "#ffffff");
  } else if (e.phase === "levelComplete" && e.lcT > 0.9) label(ctx, k, "LEVEL COMPLETE", cx, cy, 0.85, "#ffffff", true);
  else if (e.phase === "gameOver") label(ctx, k, "GAME OVER", cx, cy, 1.0, "#ff2b2b", true);
}

function label(ctx: CanvasRenderingContext2D, k: number, text: string, x: number, y: number, size: number, color: string, box = false): void {
  const sx = ctx.canvas.width / COLS;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `${size * sx}px "Press Start 2P", "Courier New", monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (box) {
    const w = ctx.measureText(text).width + size * sx * 1.2;
    ctx.fillStyle = "rgba(2,3,10,0.88)";
    ctx.fillRect(x * sx - w / 2, (y - size * 0.95) * sx, w, size * 1.9 * sx);
  }
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = sx * 0.5;
  ctx.fillText(text, x * sx, y * sx);
  ctx.restore();
}

function drawPellets(ctx: CanvasRenderingContext2D, e: PacmanEngine): void {
  const pel = e.maze.pellets;
  ctx.fillStyle = "#ffd6bd";
  ctx.beginPath();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (pel[r * COLS + c] === 1) ctx.rect(c + 0.5 - 0.09, r + 0.5 - 0.09, 0.18, 0.18);
  ctx.fill();
  if (Math.floor(e.time * 4) % 2 === 0 || e.phase !== "playing") {
    ctx.fillStyle = "#fff1e0"; ctx.shadowColor = "#ffd6bd"; ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (pel[r * COLS + c] === 2) { ctx.moveTo(c + 0.5 + 0.32, r + 0.5); ctx.arc(c + 0.5, r + 0.5, 0.32, 0, 2 * PI); }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawPac(ctx: CanvasRenderingContext2D, e: PacmanEngine, k: number): void {
  const p = e.pac, x = moverX(p), y = moverY(p), R = 0.72;
  ctx.save();
  ctx.fillStyle = "#ffe600"; ctx.shadowColor = "#ffcc00"; ctx.shadowBlur = k * 0.4;
  ctx.beginPath();
  if (e.phase === "dying" && e.deathT >= 0.75) {
    const t = Math.min(1, (e.deathT - 0.75) / 1.45);
    if (t >= 1) { ctx.restore(); return; }
    const a = 0.12 * PI + t * 0.88 * PI;
    ctx.moveTo(x, y); ctx.arc(x, y, R, -PI / 2 + a, -PI / 2 - a + 2 * PI);
  } else {
    const half = (0.04 + 0.26 * Math.abs(Math.sin(p.mouth))) * PI;
    const rot = Math.atan2(p.facing.y, p.facing.x);
    ctx.moveTo(x, y); ctx.arc(x, y, R, rot + half, rot - half + 2 * PI);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawGhost(ctx: CanvasRenderingContext2D, g: Ghost, e: PacmanEngine, k: number): void {
  const R = 0.7, x = g.x, y = g.y;
  const frightened = g.state === "FRIGHTENED", eyesOnly = g.state === "EATEN", flash = frightened && e.flashing;
  ctx.save();
  if (!eyesOnly) {
    const body = frightened ? (flash ? "#f3f3ff" : "#2137ff") : g.color;
    ctx.fillStyle = body; ctx.shadowColor = body; ctx.shadowBlur = k * 0.35;
    const wave = Math.floor(e.time * 8) % 2 === 0;
    const yb = y + R * 0.9;
    ctx.beginPath();
    ctx.arc(x, y - 0.05, R, PI, 0);
    ctx.lineTo(x + R, yb);
    for (let i = 0; i < 6; i++) ctx.lineTo(x + R - (i + 1) * (R / 3), (i % 2 === 0) === wave ? yb - 0.24 : yb);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  }
  if (frightened) {
    ctx.fillStyle = flash ? "#ff2b2b" : "#ffd6bd"; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.08;
    ctx.fillRect(x - 0.3, y - 0.22, 0.14, 0.14); ctx.fillRect(x + 0.16, y - 0.22, 0.14, 0.14);
    ctx.beginPath(); ctx.moveTo(x - 0.42, y + 0.32);
    for (let i = 1; i <= 6; i++) ctx.lineTo(x - 0.42 + i * 0.14, y + (i % 2 ? 0.2 : 0.32));
    ctx.stroke();
  } else {
    const fx = g.face.x * 0.1, fy = g.face.y * 0.1;
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x + s * 0.28, y - 0.15, 0.2, 0.26, 0, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#1a2cff"; ctx.beginPath(); ctx.arc(x + s * 0.28 + fx, y - 0.15 + fy, 0.11, 0, 2 * PI); ctx.fill();
    }
  }
  ctx.restore();
}

function drawFruit(ctx: CanvasRenderingContext2D, type: FruitType, x: number, y: number, dim: boolean): void {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = dim ? 0.45 : 1; ctx.lineCap = "round"; ctx.lineWidth = 0.09;
  const disc = (cx: number, cy: number, r: number, col: string) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * PI); ctx.fill(); };
  switch (type) {
    case "cherry":
      ctx.strokeStyle = "#63d95f"; ctx.beginPath(); ctx.moveTo(-0.28, 0.2); ctx.quadraticCurveTo(-0.1, -0.4, 0.25, -0.55); ctx.moveTo(0.3, 0.25); ctx.quadraticCurveTo(0.3, -0.2, 0.25, -0.55); ctx.stroke();
      disc(-0.28, 0.3, 0.3, "#ff2b3b"); disc(0.3, 0.35, 0.3, "#ff2b3b"); break;
    case "strawberry":
      ctx.fillStyle = "#ff3b4e"; ctx.beginPath(); ctx.moveTo(-0.5, -0.2); ctx.quadraticCurveTo(0, -0.5, 0.5, -0.2); ctx.quadraticCurveTo(0.35, 0.5, 0, 0.7); ctx.quadraticCurveTo(-0.35, 0.5, -0.5, -0.2); ctx.fill();
      ctx.fillStyle = "#63d95f"; ctx.fillRect(-0.3, -0.42, 0.6, 0.14); ctx.fillStyle = "#fff3a0"; [[-0.15, 0], [0.15, 0.05], [0, 0.3]].forEach(([sx, sy]) => ctx.fillRect(sx - 0.03, sy - 0.03, 0.07, 0.07)); break;
    case "orange":
      disc(0, 0.1, 0.5, "#ffa21f"); ctx.fillStyle = "#63d95f"; ctx.fillRect(-0.05, -0.5, 0.1, 0.18); ctx.fillRect(0, -0.5, 0.3, 0.1); break;
    case "apple":
      disc(-0.15, 0.15, 0.36, "#ff2b3b"); disc(0.15, 0.15, 0.36, "#ff2b3b"); ctx.strokeStyle = "#63d95f"; ctx.beginPath(); ctx.moveTo(0, -0.15); ctx.lineTo(0.1, -0.5); ctx.stroke(); break;
    case "melon":
      disc(0, 0.1, 0.5, "#4fd86b"); ctx.strokeStyle = "#c9ffd6"; ctx.lineWidth = 0.06; ctx.beginPath(); ctx.moveTo(-0.35, 0); ctx.lineTo(0.35, 0.25); ctx.moveTo(-0.3, 0.3); ctx.lineTo(0.3, -0.05); ctx.stroke(); break;
    case "galaxian":
      ctx.fillStyle = "#ffe600"; ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.lineTo(0.15, 0.1); ctx.lineTo(-0.15, 0.1); ctx.fill();
      ctx.fillStyle = "#3d7bff"; ctx.beginPath(); ctx.moveTo(-0.55, -0.3); ctx.lineTo(-0.15, 0.1); ctx.lineTo(0, 0.5); ctx.lineTo(0.15, 0.1); ctx.lineTo(0.55, -0.3); ctx.lineTo(0.3, 0.1); ctx.lineTo(0, 0.05); ctx.lineTo(-0.3, 0.1); ctx.fill(); break;
    case "bell":
      ctx.fillStyle = "#ffd21f"; ctx.beginPath(); ctx.moveTo(-0.45, 0.35); ctx.quadraticCurveTo(-0.4, -0.5, 0, -0.5); ctx.quadraticCurveTo(0.4, -0.5, 0.45, 0.35); ctx.closePath(); ctx.fill(); disc(0, 0.45, 0.12, "#fff"); break;
    case "key":
      ctx.strokeStyle = "#7fe9ff"; ctx.lineWidth = 0.13; ctx.beginPath(); ctx.arc(0, -0.28, 0.2, 0, 2 * PI); ctx.moveTo(0, -0.08); ctx.lineTo(0, 0.5); ctx.moveTo(0, 0.3); ctx.lineTo(0.22, 0.3); ctx.moveTo(0, 0.5); ctx.lineTo(0.22, 0.5); ctx.stroke(); break;
  }
  ctx.restore();
}
