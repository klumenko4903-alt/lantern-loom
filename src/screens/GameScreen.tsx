import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { assets, spriteAt } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { FloatingHud } from '../components/FloatingHud';
import { LanternBoard } from '../components/LanternBoard';
import { ScreenHeader } from '../components/ScreenHeader';
import { ANIM, HUD_LANE, starsForMoves } from '../constants/config';
import { theme } from '../constants/theme';
import { SKINS } from '../game/progress';
import { useLoom } from '../hooks/useLoom';
import { useProgress } from '../hooks/useProgress';

export type GameResult = {
  levelId: number;
  moves: number;
  par: number;
  stars: number;
};

type Props = {
  levelId: number;
  onBack: () => void;
  onGameOver: (result: GameResult) => void;
};

const COLOUR_BLIND_THREAD = '#8AB4F8';

export function GameScreen({ levelId, onBack, onGameOver }: Props) {
  const progress = useProgress();
  const loom = useLoom(levelId);

  const plate = useRef(new Animated.Value(0)).current;
  const hud = useRef(new Animated.Value(0)).current;
  const wash = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  const skin = SKINS[progress.equippedSkin] || SKINS[0];
  const spriteSource = skin.sprite < 0 ? assets.logo : spriteAt(skin.sprite);

  const litColor = progress.settings.colourBlind
    ? COLOUR_BLIND_THREAD
    : theme.colors.accent.secondary;
  const lanternColor = progress.settings.colourBlind
    ? theme.colors.text.primary
    : theme.colors.accent.primary;

  const district = levelId > 0 ? Math.floor((levelId - 1) / 20) + 1 : 0;
  const title = levelId > 0 ? `D${district} · BOARD ${levelId}` : 'DAILY LOOM';

  useEffect(() => {
    finished.current = false;
    plate.setValue(0);
    hud.setValue(0);
    wash.setValue(0);

    const entrance = Animated.parallel([
      Animated.spring(plate, {
        toValue: 1,
        tension: theme.animation.entrance.tension,
        friction: theme.animation.entrance.friction,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(hud, {
          toValue: 1,
          duration: ANIM.elementFadeMs,
          useNativeDriver: true,
        }),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [hud, levelId, plate, wash]);

  // The round's numbers live in a ref so the win effect can depend on nothing
  // but `solved` — a dependency change mid-celebration must not cancel the
  // handover to the result screen.
  const snapshot = useRef({ levelId, moves: loom.moves, par: loom.par });
  snapshot.current = { levelId, moves: loom.moves, par: loom.par };
  const handover = useRef(onGameOver);
  handover.current = onGameOver;

  useEffect(() => {
    if (!loom.solved || finished.current) {
      return;
    }
    finished.current = true;

    const shot = snapshot.current;
    const result: GameResult = {
      levelId: shot.levelId,
      moves: shot.moves,
      par: shot.par,
      stars: starsForMoves(shot.moves, shot.par),
    };

    const celebration = Animated.sequence([
      Animated.timing(wash, {
        toValue: 1,
        duration: ANIM.winWashMs / 2,
        useNativeDriver: true,
      }),
      Animated.timing(wash, {
        toValue: 0,
        duration: ANIM.winWashMs / 2,
        useNativeDriver: true,
      }),
    ]);
    celebration.start();

    const timer = setTimeout(() => handover.current(result), ANIM.winHoldMs);
    return () => {
      celebration.stop();
      clearTimeout(timer);
    };
  }, [loom.solved, wash]);

  const plateScale = plate.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const hudShift = hud.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  const counter = useMemo(
    () => (
      <View style={styles.counter}>
        <Lightbulb size={16} color={lanternColor} strokeWidth={1.5} />
        <Text style={[styles.counterValue, { color: lanternColor }]}>
          {`${loom.lanternsLit}/${loom.lanterns}`}
        </Text>
      </View>
    ),
    [lanternColor, loom.lanterns, loom.lanternsLit],
  );

  return (
    <AppBackground variant="board" blob="none">
      <ScreenHeader title={title} onBack={onBack} rightSlot={counter} />

      <View style={styles.area}>
        <Animated.View
          pointerEvents="box-none"
          style={{ opacity: plate, transform: [{ scale: plateScale }] }}>
          <LanternBoard
            cells={loom.cells}
            lit={loom.lit}
            rows={loom.rows}
            cols={loom.cols}
            hintIndex={loom.hintIndex}
            spriteSource={spriteSource}
            litColor={litColor}
            lanternColor={lanternColor}
            onRotate={loom.rotate}
          />
        </Animated.View>

        <Text style={styles.coach}>TAP A TILE TO TURN THE THREAD</Text>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.hudLane, { transform: [{ translateY: hudShift }] }]}>
        <FloatingHud moves={loom.moves} par={loom.par} onHint={loom.hint} />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.wash, { opacity: wash }]}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: HUD_LANE,
  },
  coach: {
    marginTop: 18,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
    color: theme.colors.text.tertiary,
  },
  hudLane: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(242,177,52,0.18)',
  },
});

export default GameScreen;
