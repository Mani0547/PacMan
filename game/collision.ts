import { HIT_DISTANCE } from "./constants";

/** Tile/grid collision handles walls; characters use small circular hitboxes (radius ~0.28 tile each). */
export const distSq = (ax: number, ay: number, bx: number, by: number): number => (ax - bx) ** 2 + (ay - by) ** 2;
export const touching = (ax: number, ay: number, bx: number, by: number, dist = HIT_DISTANCE): boolean => distSq(ax, ay, bx, by) < dist * dist;
