export const PELLET_SCORE = 10;
export const POWER_PELLET_SCORE = 50;
/** Points for the 1st..4th ghost eaten during a single power pellet. */
export const GHOST_CHAIN = [200, 400, 800, 1600] as const;
export const ghostScore = (chainIndex: number): number => GHOST_CHAIN[Math.min(chainIndex, GHOST_CHAIN.length - 1)];
