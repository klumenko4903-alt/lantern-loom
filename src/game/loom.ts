// Thread-mask maths for LanternLoom.
//
// A tile's thread ends are a 4-bit mask over the edges [top, right, bottom, left]:
//   TOP = 1, RIGHT = 2, BOTTOM = 4, LEFT = 8
// Rotating 90 degrees clockwise shifts every bit one step round the ring.

export const TOP = 1;
export const RIGHT = 2;
export const BOTTOM = 4;
export const LEFT = 8;

export const EDGES = [TOP, RIGHT, BOTTOM, LEFT] as const;

/** Row/col delta and the bit that faces back at us, per edge index. */
const NEIGHBOUR = [
  { dr: -1, dc: 0, back: BOTTOM },
  { dr: 0, dc: 1, back: LEFT },
  { dr: 1, dc: 0, back: TOP },
  { dr: 0, dc: -1, back: RIGHT },
];

export type Cell = {
  /** Current orientation. */
  mask: number;
  /** Orientation this tile has in the solved layout. */
  sol: number;
  /** Does this tile carry a lantern? */
  lantern: boolean;
};

export type Board = {
  rows: number;
  cols: number;
  cells: Cell[];
  par: number;
};

export function rotateMask(mask: number, steps: number): number {
  const s = ((steps % 4) + 4) % 4;
  let m = mask & 0b1111;
  for (let i = 0; i < s; i++) {
    m = ((m << 1) | (m >> 3)) & 0b1111;
  }
  return m;
}

/** Tiles whose look never changes under rotation are useless to scramble. */
export function isRotatable(mask: number): boolean {
  return mask !== 0 && mask !== 0b1111 && mask !== 0b0101 && mask !== 0b1010;
}

export function idx(r: number, c: number, cols: number): number {
  return r * cols + c;
}

/**
 * Per-tile count of thread ends that do not meet a matching end on the
 * neighbouring tile (a rim edge always counts as open).
 */
export function openEnds(board: Board, i: number): number {
  const { rows, cols, cells } = board;
  const r = Math.floor(i / cols);
  const c = i % cols;
  const mask = cells[i].mask;
  let open = 0;
  for (let e = 0; e < 4; e++) {
    if ((mask & EDGES[e]) === 0) {
      continue;
    }
    const n = NEIGHBOUR[e];
    const nr = r + n.dr;
    const nc = c + n.dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
      open += 1;
      continue;
    }
    if ((cells[idx(nr, nc, cols)].mask & n.back) === 0) {
      open += 1;
    }
  }
  return open;
}

export function totalOpenEnds(board: Board): number {
  let total = 0;
  for (let i = 0; i < board.cells.length; i++) {
    total += openEnds(board, i);
  }
  return total;
}

/**
 * Connected components built only from edges where BOTH tiles offer a thread
 * end. Returns a component id per cell plus, for each component, whether it is
 * closed (no open ends at all) and whether it holds a lantern.
 */
export type Components = {
  compOf: Int16Array;
  closed: boolean[];
  hasLantern: boolean[];
  count: number;
};

export function components(board: Board): Components {
  const { rows, cols, cells } = board;
  const total = rows * cols;
  const compOf = new Int16Array(total).fill(-1);
  const closed: boolean[] = [];
  const hasLantern: boolean[] = [];
  const stack: number[] = [];
  let count = 0;

  for (let start = 0; start < total; start++) {
    if (compOf[start] !== -1) {
      continue;
    }
    const id = count++;
    closed.push(true);
    hasLantern.push(false);
    compOf[start] = id;
    stack.length = 0;
    stack.push(start);

    while (stack.length > 0) {
      const i = stack.pop() as number;
      const r = Math.floor(i / cols);
      const c = i % cols;
      const mask = cells[i].mask;
      if (cells[i].lantern) {
        hasLantern[id] = true;
      }
      for (let e = 0; e < 4; e++) {
        if ((mask & EDGES[e]) === 0) {
          continue;
        }
        const n = NEIGHBOUR[e];
        const nr = r + n.dr;
        const nc = c + n.dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          closed[id] = false;
          continue;
        }
        const j = idx(nr, nc, cols);
        if ((cells[j].mask & n.back) === 0) {
          closed[id] = false;
          continue;
        }
        if (compOf[j] === -1) {
          compOf[j] = id;
          stack.push(j);
        }
      }
    }
  }

  return { compOf, closed, hasLantern, count };
}

/**
 * A tile is lit when it sits in a fully closed component that contains at least
 * one lantern. Lit state is derived, never stored — so progress is visible
 * section by section while the player works.
 */
export function litMask(board: Board): boolean[] {
  const comp = components(board);
  const out: boolean[] = new Array(board.cells.length);
  for (let i = 0; i < out.length; i++) {
    const id = comp.compOf[i];
    out[i] = id >= 0 && comp.closed[id] && comp.hasLantern[id];
  }
  return out;
}

export function countLitLanterns(board: Board, lit: boolean[]): number {
  let n = 0;
  for (let i = 0; i < board.cells.length; i++) {
    if (board.cells[i].lantern && lit[i]) {
      n += 1;
    }
  }
  return n;
}

export function countLanterns(board: Board): number {
  let n = 0;
  for (let i = 0; i < board.cells.length; i++) {
    if (board.cells[i].lantern) {
      n += 1;
    }
  }
  return n;
}

/**
 * Solved when no thread end anywhere is open AND every lantern hangs in the
 * same component.
 */
export function checkSolved(board: Board): boolean {
  const comp = components(board);
  for (let id = 0; id < comp.count; id++) {
    if (!comp.closed[id]) {
      return false;
    }
  }
  let lanternComp = -1;
  for (let i = 0; i < board.cells.length; i++) {
    if (!board.cells[i].lantern) {
      continue;
    }
    const id = comp.compOf[i];
    if (lanternComp === -1) {
      lanternComp = id;
    } else if (lanternComp !== id) {
      return false;
    }
  }
  return true;
}

/**
 * The tile a hint should point at: the misaligned tile with the most open ends
 * (ties broken by reading order, so the hint walks the board predictably).
 */
export function findMisaligned(board: Board): number {
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < board.cells.length; i++) {
    const cell = board.cells[i];
    if (cell.mask === cell.sol) {
      continue;
    }
    const score = openEnds(board, i);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

export function cloneCells(cells: Cell[]): Cell[] {
  return cells.map(c => ({ mask: c.mask, sol: c.sol, lantern: c.lantern }));
}
