import { Dimensions } from 'react-native';

const win = Dimensions.get('window');

export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

/** Rule #5 — never wider than 380, always 16px of air on each side. */
export const CONTENT_MAX_W = Math.min(SCREEN_W - 32, 380);

/** Rule #4 — the plate's own padding + border is subtracted before dividing. */
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8

export function tileSize(cols: number): number {
  return Math.floor((CONTENT_MAX_W - 2 * BOARD_FRAME) / cols);
}

export function boardWidth(cols: number): number {
  return tileSize(cols) * cols + 2 * BOARD_FRAME;
}

/** Level-select grid: 4 columns inside a padded, bordered plate. */
export const GRID_PAD = 8;
export const GRID_BORDER = 2;
export const GRID_FRAME = GRID_PAD + GRID_BORDER; // 10
export const GRID_COLS = 4;
export const GRID_CELL = Math.floor(
  (CONTENT_MAX_W - 2 * GRID_FRAME) / GRID_COLS,
);
export const GRID_W = GRID_CELL * GRID_COLS + 2 * GRID_FRAME;

/** Skins grid: 2 columns with one 12px gutter inside the content width. */
export const SKIN_GAP = 12;
export const SKIN_CELL = Math.floor((CONTENT_MAX_W - SKIN_GAP) / 2);
