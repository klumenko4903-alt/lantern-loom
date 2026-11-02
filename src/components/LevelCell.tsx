import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { GRID_CELL } from '../utils/layout';

export type CellState = 'locked' | 'open' | 'current' | 'solved';

type Props = {
  index: number;
  stars: number;
  state: CellState;
  onPress: (index: number) => void;
};

const HIT = { top: 4, bottom: 4, left: 4, right: 4 };
const INNER = GRID_CELL - 10;

function starGlyphs(stars: number): string {
  if (stars <= 0) {
    return '';
  }
  let out = '';
  for (let i = 0; i < stars; i++) {
    out += '★';
  }
  return out;
}

function LevelCellBase({ index, stars, state, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.93);
  const locked = state === 'locked';

  const tone =
    state === 'solved'
      ? styles.solved
      : state === 'current'
      ? styles.current
      : locked
      ? styles.locked
      : styles.open;

  const numberTone =
    state === 'solved'
      ? styles.numberSolved
      : state === 'current'
      ? styles.numberCurrent
      : styles.numberOpen;

  return (
    <Pressable
      onPress={() => onPress(index)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={`Board ${index}`}
      style={styles.slot}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.cell, tone, { transform: [{ scale }] }]}>
        {locked ? (
          <Lock size={14} color={theme.colors.text.tertiary} strokeWidth={1.5} />
        ) : (
          <View style={styles.center}>
            <Text style={[styles.number, numberTone]}>{index}</Text>
            {stars > 0 ? (
              <Text style={styles.stars}>{starGlyphs(stars)}</Text>
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: GRID_CELL,
    height: GRID_CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    width: INNER,
    height: INNER,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  solved: {
    backgroundColor: 'rgba(242,177,52,0.12)',
    borderColor: 'rgba(242,177,52,0.45)',
  },
  current: {
    backgroundColor: 'rgba(95,211,196,0.10)',
    borderColor: theme.colors.accent.secondary,
    borderWidth: 2,
  },
  open: {
    backgroundColor: 'rgba(26,32,50,0.80)',
    borderColor: theme.colors.ui.borderStrong,
  },
  locked: {
    backgroundColor: 'rgba(26,32,50,0.60)',
    borderColor: 'rgba(58,74,107,0.45)',
  },
  number: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 21,
    fontVariant: ['tabular-nums'],
  },
  numberSolved: {
    color: theme.colors.accent.primary,
  },
  numberCurrent: {
    color: theme.colors.accent.secondary,
  },
  numberOpen: {
    color: theme.colors.text.secondary,
  },
  stars: {
    marginTop: 1,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1,
    color: theme.colors.accent.primary,
  },
});

export const LevelCell = memo(LevelCellBase);
export default LevelCell;
