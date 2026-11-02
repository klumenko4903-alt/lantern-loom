import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';
import type { Cell } from '../game/loom';
import { BOARD_BORDER, BOARD_PAD, boardWidth, tileSize } from '../utils/layout';
import { LanternTile } from './LanternTile';

type Props = {
  cells: Cell[];
  lit: boolean[];
  rows: number;
  cols: number;
  hintIndex: number;
  spriteSource: any;
  litColor: string;
  lanternColor: string;
  onRotate: (index: number) => void;
};

/**
 * The board plate. Geometry follows rule #4 — the plate's own padding and
 * border are subtracted before the tile size is divided out, so the grid can
 * never overflow its frame.
 */
function LanternBoardBase({
  cells,
  lit,
  rows,
  cols,
  hintIndex,
  spriteSource,
  litColor,
  lanternColor,
  onRotate,
}: Props) {
  const tile = tileSize(cols);
  const width = boardWidth(cols);
  const height = tile * rows + 2 * (BOARD_PAD + BOARD_BORDER);

  const tiles = [];
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    tiles.push(
      <LanternTile
        key={i}
        index={i}
        mask={cell.mask}
        lantern={cell.lantern}
        lit={lit[i]}
        hinted={hintIndex === i}
        size={tile}
        sprite={null}
        spriteSource={spriteSource}
        litColor={litColor}
        lanternColor={lanternColor}
        onPress={onRotate}
      />,
    );
  }

  return (
    <View style={[styles.plate, theme.shadows.plate, { width, height }]}>
      <View style={[styles.inner, { width: tile * cols, height: tile * rows }]}>
        {tiles}
      </View>
      <View pointerEvents="none" style={styles.highlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(26,32,50,0.92)',
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(58,74,107,0.85)',
    padding: BOARD_PAD,
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(245,241,230,0.06)',
  },
});

export const LanternBoard = memo(LanternBoardBase);
export default LanternBoard;
