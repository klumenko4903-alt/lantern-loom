// Board construction for LanternLoom's 120 boards (6 districts x 20).
//
// Boards are built deterministically from the board id, so the same id always
// produces the same board on every launch and on every device. The solved
// layout is a random spanning tree over the grid, which guarantees that every
// thread end meets a partner and that all lanterns hang on one loom. The puzzle
// is then made by rotating a slice of the tiles — so every board is solvable by
// construction, and `par` is the exact number of taps that undoes the scramble.

import {
  BOARDS_PER_DISTRICT,
  DISTRICT_COUNT,
  DISTRICT_SIZES,
} from '../constants/config';
import { BOTTOM, LEFT, RIGHT, TOP, isRotatable, rotateMask } from './loom';
import type { Cell } from './loom';

const MAX_LANTERNS = 10;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function popcount(mask: number): number {
  let n = 0;
  let m = mask;
  while (m > 0) {
    n += m & 1;
    m >>= 1;
  }
  return n;
}

const STEP = [
  { dr: -1, dc: 0, bit: TOP, back: BOTTOM },
  { dr: 0, dc: 1, bit: RIGHT, back: LEFT },
  { dr: 1, dc: 0, bit: BOTTOM, back: TOP },
  { dr: 0, dc: -1, bit: LEFT, back: RIGHT },
];

/** Randomised depth-first spanning tree — the solved thread layout. */
function weaveSolution(rows: number, cols: number, rnd: () => number): number[] {
  const total = rows * cols;
  const masks = new Array<number>(total).fill(0);
  const seen = new Array<boolean>(total).fill(false);
  const stack: number[] = [];

  const start = Math.floor(rnd() * total);
  seen[start] = true;
  stack.push(start);

  while (stack.length > 0) {
    const i = stack[stack.length - 1];
    const r = Math.floor(i / cols);
    const c = i % cols;

    const options: number[] = [];
    for (let e = 0; e < 4; e++) {
      const nr = r + STEP[e].dr;
      const nc = c + STEP[e].dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        continue;
      }
      if (seen[nr * cols + nc]) {
        continue;
      }
      options.push(e);
    }

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const e = options[Math.floor(rnd() * options.length)];
    const j = (r + STEP[e].dr) * cols + (c + STEP[e].dc);
    masks[i] |= STEP[e].bit;
    masks[j] |= STEP[e].back;
    seen[j] = true;
    stack.push(j);
  }

  return masks;
}

/** How much of the board a given board number inside its district scrambles. */
function scrambleFraction(boardInDistrict: number): number {
  const t = (boardInDistrict - 1) / (BOARDS_PER_DISTRICT - 1);
  return 0.12 + t * 0.78;
}

export type Level = {
  id: number;
  district: number; // 1-based
  boardInDistrict: number; // 1-based
  rows: number;
  cols: number;
  cells: Cell[];
  par: number;
};

function build(
  id: number,
  district: number,
  boardInDistrict: number,
  size: number,
  seed: number,
): Level {
  const rnd = mulberry32(seed);
  const rows = size;
  const cols = size;
  const sol = weaveSolution(rows, cols, rnd);

  const cells: Cell[] = new Array(rows * cols);
  let lanternsPlaced = 0;
  for (let i = 0; i < sol.length; i++) {
    const isLeaf = popcount(sol[i]) === 1;
    const lantern = isLeaf && lanternsPlaced < MAX_LANTERNS;
    if (lantern) {
      lanternsPlaced += 1;
    }
    cells[i] = { mask: sol[i], sol: sol[i], lantern };
  }

  // Shuffle the rotatable tiles, then twist the leading slice of them.
  const pool: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (isRotatable(cells[i].sol)) {
      pool.push(i);
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  const wanted = Math.round(pool.length * scrambleFraction(boardInDistrict));
  const twistCount = Math.max(1, Math.min(pool.length, wanted));

  let par = 0;
  for (let n = 0; n < twistCount; n++) {
    const i = pool[n];
    const steps = 1 + Math.floor(rnd() * 3); // 1..3
    cells[i].mask = rotateMask(cells[i].sol, steps);
    par += (4 - steps) % 4; // clockwise taps needed to undo it
  }

  return {
    id,
    district,
    boardInDistrict,
    rows,
    cols,
    cells,
    par: Math.max(1, par),
  };
}

const cache = new Map<number, Level>();

/** Board ids are 1..120. */
export function getLevel(id: number): Level {
  const clamped = Math.max(1, Math.min(DISTRICT_COUNT * BOARDS_PER_DISTRICT, id));
  const cached = cache.get(clamped);
  if (cached) {
    return cached;
  }
  const district = Math.floor((clamped - 1) / BOARDS_PER_DISTRICT) + 1;
  const boardInDistrict = ((clamped - 1) % BOARDS_PER_DISTRICT) + 1;
  const size = DISTRICT_SIZES[district - 1];
  const level = build(
    clamped,
    district,
    boardInDistrict,
    size,
    clamped * 9301 + 49297,
  );
  cache.set(clamped, level);
  return level;
}

/** One procedurally generated 6x6 board, seeded by the calendar day. */
export function getDailyLevel(now?: Date): Level {
  const d = now || new Date();
  const seed =
    d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return build(0, 0, 10, 6, seed * 7919 + 13);
}

export function districtOf(levelId: number): number {
  return Math.floor((levelId - 1) / BOARDS_PER_DISTRICT) + 1;
}

export function firstBoardOfDistrict(district: number): number {
  return (district - 1) * BOARDS_PER_DISTRICT + 1;
}
