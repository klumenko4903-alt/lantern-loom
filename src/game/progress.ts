// In-memory progress store for LanternLoom v1 (no persistence layer yet).
// Components subscribe through `useProgress()` rather than threading props.

import {
  BOARDS_PER_DISTRICT,
  DISTRICT_COUNT,
  DISTRICT_UNLOCK_STARS,
  TOTAL_BOARDS,
} from '../constants/config';

export type Skin = {
  id: number;
  name: string;
  /** Index into SPRITES (0..4); -1 means the woven loom emblem. */
  sprite: number;
  cost: number;
};

export const SKINS: ReadonlyArray<Skin> = [
  { id: 0, name: 'PAPER LANTERN', sprite: 0, cost: 0 },
  { id: 1, name: 'PAPER MOTH', sprite: 1, cost: 20 },
  { id: 2, name: 'BRASS FISH', sprite: 2, cost: 40 },
  { id: 3, name: 'JADE BELL', sprite: 3, cost: 60 },
  { id: 4, name: 'EMBER KITE', sprite: 4, cost: 90 },
  { id: 5, name: 'LOOM CORE', sprite: -1, cost: 120 },
];

export type Settings = {
  sound: boolean;
  haptics: boolean;
  colourBlind: boolean;
};

export type Progress = {
  /** Stars per board id (1..120); absent means unsolved. */
  boardStars: Record<number, number>;
  starsSpent: number;
  equippedSkin: number;
  ownedSkins: number[];
  dailyDone: boolean;
  settings: Settings;
};

function seededProgress(): Progress {
  // The district-1 run plus the first three boards of district 2 are already
  // woven, so the hub always has real numbers to show.
  const boardStars: Record<number, number> = {};
  const pattern = [3, 3, 2, 3, 3, 2, 3, 2, 3, 3, 2, 3, 3, 2, 2, 3, 3, 2, 3, 2];
  for (let i = 0; i < 20; i++) {
    boardStars[i + 1] = pattern[i];
  }
  boardStars[21] = 3;
  boardStars[22] = 2;
  boardStars[23] = 3;
  return {
    boardStars,
    starsSpent: 20,
    equippedSkin: 0,
    ownedSkins: [0, 1],
    dailyDone: false,
    settings: { sound: true, haptics: true, colourBlind: false },
  };
}

let state: Progress = seededProgress();

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getProgress(): Progress {
  return state;
}

// ---------------------------------------------------------------- selectors

export function starsEarned(p: Progress): number {
  let total = 0;
  const ids = Object.keys(p.boardStars);
  for (let i = 0; i < ids.length; i++) {
    total += p.boardStars[Number(ids[i])];
  }
  return total;
}

export function starsAvailable(p: Progress): number {
  return Math.max(0, starsEarned(p) - p.starsSpent);
}

export function boardsLit(p: Progress): number {
  return Object.keys(p.boardStars).length;
}

export function districtStars(p: Progress, district: number): number {
  const first = (district - 1) * BOARDS_PER_DISTRICT + 1;
  let total = 0;
  for (let i = first; i < first + BOARDS_PER_DISTRICT; i++) {
    total += p.boardStars[i] || 0;
  }
  return total;
}

export function districtSolved(p: Progress, district: number): number {
  const first = (district - 1) * BOARDS_PER_DISTRICT + 1;
  let n = 0;
  for (let i = first; i < first + BOARDS_PER_DISTRICT; i++) {
    if (p.boardStars[i]) {
      n += 1;
    }
  }
  return n;
}

export function districtUnlocked(p: Progress, district: number): boolean {
  if (district <= 1) {
    return true;
  }
  return districtStars(p, district - 1) >= DISTRICT_UNLOCK_STARS;
}

/** The lowest unsolved board of the furthest unlocked district. */
export function nextBoard(p: Progress): number {
  for (let d = 1; d <= DISTRICT_COUNT; d++) {
    if (!districtUnlocked(p, d)) {
      break;
    }
    const first = (d - 1) * BOARDS_PER_DISTRICT + 1;
    for (let i = first; i < first + BOARDS_PER_DISTRICT; i++) {
      if (!p.boardStars[i]) {
        return i;
      }
    }
  }
  return Math.min(TOTAL_BOARDS, boardsLit(p) + 1);
}

export function boardUnlocked(p: Progress, boardId: number): boolean {
  const district = Math.floor((boardId - 1) / BOARDS_PER_DISTRICT) + 1;
  if (!districtUnlocked(p, district)) {
    return false;
  }
  const first = (district - 1) * BOARDS_PER_DISTRICT + 1;
  if (boardId === first) {
    return true;
  }
  return Boolean(p.boardStars[boardId - 1]) || Boolean(p.boardStars[boardId]);
}

// ------------------------------------------------------------------ actions

export function recordWin(boardId: number, stars: number) {
  if (boardId <= 0) {
    state = { ...state, dailyDone: true };
    emit();
    return;
  }
  const best = Math.max(state.boardStars[boardId] || 0, stars);
  state = {
    ...state,
    boardStars: { ...state.boardStars, [boardId]: best },
  };
  emit();
}

export function equipSkin(skinId: number) {
  if (state.ownedSkins.indexOf(skinId) === -1) {
    return;
  }
  state = { ...state, equippedSkin: skinId };
  emit();
}

export function buySkin(skinId: number): boolean {
  const skin = SKINS[skinId];
  if (!skin || state.ownedSkins.indexOf(skinId) !== -1) {
    return false;
  }
  if (starsAvailable(state) < skin.cost) {
    return false;
  }
  state = {
    ...state,
    starsSpent: state.starsSpent + skin.cost,
    ownedSkins: state.ownedSkins.concat(skinId),
    equippedSkin: skinId,
  };
  emit();
  return true;
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  state = { ...state, settings: { ...state.settings, [key]: value } };
  emit();
}

export function resetProgress() {
  state = {
    boardStars: {},
    starsSpent: 0,
    equippedSkin: 0,
    ownedSkins: [0],
    dailyDone: false,
    settings: state.settings,
  };
  emit();
}
