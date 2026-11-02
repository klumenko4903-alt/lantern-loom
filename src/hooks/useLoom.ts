import { useCallback, useMemo, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import {
  checkSolved,
  cloneCells,
  countLanterns,
  countLitLanterns,
  findMisaligned,
  litMask,
  rotateMask,
} from '../game/loom';
import type { Board, Cell } from '../game/loom';
import { getDailyLevel, getLevel } from '../game/levels';
import { getProgress } from '../game/progress';

export type LoomState = {
  cells: Cell[];
  rows: number;
  cols: number;
  par: number;
  moves: number;
  solved: boolean;
  lit: boolean[];
  lanterns: number;
  lanternsLit: number;
  hintIndex: number;
  rotate: (index: number) => void;
  hint: () => void;
  reset: () => void;
};

function levelFor(levelId: number) {
  return levelId > 0 ? getLevel(levelId) : getDailyLevel();
}

function tick() {
  if (getProgress().settings.haptics) {
    Vibration.vibrate(10);
  }
}

/**
 * Owns one board. Mutable data that animation callbacks need lives in refs
 * (rule #8); React state carries only what the UI renders.
 */
export function useLoom(levelId: number): LoomState {
  const level = useMemo(() => levelFor(levelId), [levelId]);

  const [cells, setCells] = useState<Cell[]>(() => cloneCells(level.cells));
  const [moves, setMoves] = useState(0);
  const [hintIndex, setHintIndex] = useState(-1);
  const [builtFor, setBuiltFor] = useState(levelId);
  const solvedRef = useRef(false);

  // Re-seed when the caller switches board, without an extra effect pass.
  if (builtFor !== levelId) {
    setBuiltFor(levelId);
    setCells(cloneCells(level.cells));
    setMoves(0);
    setHintIndex(-1);
    solvedRef.current = false;
  }

  const board: Board = useMemo(
    () => ({ rows: level.rows, cols: level.cols, cells, par: level.par }),
    [cells, level.rows, level.cols, level.par],
  );

  const lit = useMemo(() => litMask(board), [board]);
  const solved = useMemo(() => checkSolved(board), [board]);
  solvedRef.current = solved;

  const lanterns = useMemo(() => countLanterns(board), [board]);
  const lanternsLit = useMemo(() => countLitLanterns(board, lit), [board, lit]);

  const rotate = useCallback((index: number) => {
    if (solvedRef.current) {
      return;
    }
    setHintIndex(-1);
    setCells(prev => {
      const next = cloneCells(prev);
      next[index] = { ...next[index], mask: rotateMask(next[index].mask, 1) };
      return next;
    });
    setMoves(m => m + 1);
    tick();
  }, []);

  /**
   * Free and unlimited (age 7+, no monetisation): the hint snaps the most
   * tangled tile onto its woven orientation and flags it, so the board shows
   * exactly where the light just travelled.
   */
  const hint = useCallback(() => {
    if (solvedRef.current) {
      return;
    }
    const target = findMisaligned(board);
    if (target < 0) {
      return;
    }
    setHintIndex(target);
    setCells(prev => {
      const next = cloneCells(prev);
      next[target] = { ...next[target], mask: next[target].sol };
      return next;
    });
    setMoves(m => m + 1);
    tick();
  }, [board]);

  const reset = useCallback(() => {
    solvedRef.current = false;
    setCells(cloneCells(level.cells));
    setMoves(0);
    setHintIndex(-1);
  }, [level]);

  return {
    cells,
    rows: level.rows,
    cols: level.cols,
    par: level.par,
    moves,
    solved,
    lit,
    lanterns,
    lanternsLit,
    hintIndex,
    rotate,
    hint,
    reset,
  };
}

export default useLoom;
