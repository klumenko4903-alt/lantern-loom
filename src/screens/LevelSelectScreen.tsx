import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { LevelCell } from '../components/LevelCell';
import type { CellState } from '../components/LevelCell';
import { ScreenHeader } from '../components/ScreenHeader';
import { StarsPill } from '../components/StarsPill';
import {
  BOARDS_PER_DISTRICT,
  DISTRICTS,
  STARS_PER_DISTRICT,
} from '../constants/config';
import { theme } from '../constants/theme';
import { boardUnlocked, districtStars, nextBoard } from '../game/progress';
import { useProgress } from '../hooks/useProgress';
import {
  GRID_BORDER,
  GRID_CELL,
  GRID_PAD,
  GRID_W,
} from '../utils/layout';

type Props = {
  district: number;
  onBack: () => void;
  onPlay: (levelId: number) => void;
};

const ROWS = BOARDS_PER_DISTRICT / 4;

export function LevelSelectScreen({ district, onBack, onPlay }: Props) {
  const progress = useProgress();
  const current = nextBoard(progress);
  const first = (district - 1) * BOARDS_PER_DISTRICT + 1;

  const handlePress = useCallback(
    (id: number) => {
      onPlay(id);
    },
    [onPlay],
  );

  const cells = [];
  for (let i = 0; i < BOARDS_PER_DISTRICT; i++) {
    const id = first + i;
    const stars = progress.boardStars[id] || 0;
    let state: CellState = 'open';
    if (stars > 0) {
      state = 'solved';
    } else if (id === current) {
      state = 'current';
    } else if (!boardUnlocked(progress, id)) {
      state = 'locked';
    }
    cells.push(
      <LevelCell
        key={id}
        index={id}
        stars={stars}
        state={state}
        onPress={handlePress}
      />,
    );
  }

  return (
    <AppBackground variant="levels" blob="teal">
      <ScreenHeader
        title={DISTRICTS[district - 1].name}
        onBack={onBack}
        rightSlot={
          <StarsPill
            tone="teal"
            value={`${districtStars(progress, district)}/${STARS_PER_DISTRICT}`}
          />
        }
      />

      <View style={styles.body}>
        <View style={[styles.plate, theme.shadows.card]}>
          <View style={styles.grid}>{cells}</View>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.footer}>PAR IS A SUGGESTION, NOT A RULE</Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  plate: {
    width: GRID_W,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(26,32,50,0.78)',
    borderWidth: GRID_BORDER,
    borderColor: 'rgba(58,74,107,0.70)',
    padding: GRID_PAD,
  },
  grid: {
    width: GRID_CELL * 4,
    height: GRID_CELL * ROWS,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
  footer: {
    marginBottom: 16,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.text.tertiary,
  },
});

export default LevelSelectScreen;
