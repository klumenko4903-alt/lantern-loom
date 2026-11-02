// Tunables for LanternLoom. Rule #13: LOADER_DURATION_MS is EXACTLY 8000.

export const LOADER_DURATION_MS = 8000;
export const LOADER_FADE_MS = 260;

export const DISTRICT_COUNT = 6;
export const BOARDS_PER_DISTRICT = 20;
export const TOTAL_BOARDS = DISTRICT_COUNT * BOARDS_PER_DISTRICT;
export const STARS_PER_DISTRICT = BOARDS_PER_DISTRICT * 3;
export const DISTRICT_UNLOCK_STARS = 30;

/** Board geometry per district (index 0 = district 1). */
export const DISTRICT_SIZES: ReadonlyArray<number> = [5, 5, 6, 6, 7, 7];

export const DISTRICTS: ReadonlyArray<{ name: string; emblem: number }> = [
  { name: 'PAPER LANE', emblem: 0 },
  { name: 'BRASS QUAY', emblem: 1 },
  { name: 'JADE STEPS', emblem: 2 },
  { name: 'EMBER ROOF', emblem: 3 },
  { name: 'SILK BEND', emblem: 4 },
  { name: 'MOTH GATE', emblem: 0 },
];

export const ANIM = {
  rotateMs: 180,
  glowPulseMs: 320,
  tileStaggerMs: 60,
  winWashMs: 520,
  winHoldMs: 900,
  elementFadeMs: 320,
  bentoStaggerMs: 70,
  counterPulseMs: 180,
  breatheMs: 2400,
};

export const HEADER_TOP_PAD = 44;
export const HEADER_HEIGHT = 76;
export const HUD_LANE = 104;

/** Star thresholds — a finished board is never worth zero. */
export function starsForMoves(moves: number, par: number): number {
  if (moves <= par) {
    return 3;
  }
  if (moves <= Math.ceil(par * 1.5)) {
    return 2;
  }
  return 1;
}
