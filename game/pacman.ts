import { LEFT, PAC_START, Vec } from "./constants";
import { Mover } from "./movement";

export interface Pacman extends Mover {
  facing: Vec;
  /** Mouth animation clock (seconds, only advances while moving). */
  mouth: number;
}

export function createPacman(): Pacman {
  const p = { facing: LEFT, mouth: 0 } as Pacman;
  resetPacman(p);
  return p;
}

export function resetPacman(p: Pacman): void {
  p.c = PAC_START.c; p.r = PAC_START.r; p.off = 0.5; p.dx = -1; p.dy = 0;
  p.facing = LEFT; p.mouth = 0;
}
