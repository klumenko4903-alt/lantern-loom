import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ANIM } from '../constants/config';
import { theme } from '../constants/theme';
import { EDGES, rotateMask } from '../game/loom';
import { ThreadPath } from './ThreadPath';

type Props = {
  index: number;
  mask: number;
  lantern: boolean;
  lit: boolean;
  hinted: boolean;
  size: number;
  sprite: number | null;
  spriteSource: any;
  litColor: string;
  lanternColor: string;
  onPress: (index: number) => void;
};

const HIT = { top: 2, bottom: 2, left: 2, right: 2 };

/**
 * Rule #8 / the pipeline override: the <Pressable> is the PARENT and the
 * <Animated.View> that spins lives INSIDE it. The spin is a pure transform, so
 * the native driver is safe (rule: never native-drive layout props).
 *
 * The tile draws itself from `mask` rotated BACK by however many quarter turns
 * it has already played, so the visual rotation and the logical mask always
 * agree instead of double-counting the tap.
 */
function LanternTileBase({
  index,
  mask,
  lantern,
  lit,
  hinted,
  size,
  spriteSource,
  litColor,
  lanternColor,
  onPress,
}: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const turns = useRef(0);
  const halo = useRef(new Animated.Value(lit ? 1 : 0)).current;

  const inner = size - 4;
  const displayMask = rotateMask(mask, -turns.current);

  useEffect(() => {
    Animated.timing(halo, {
      toValue: lit ? 1 : 0,
      duration: ANIM.glowPulseMs,
      useNativeDriver: true,
    }).start();
  }, [halo, lit]);

  const handlePress = useCallback(() => {
    turns.current += 1;
    Animated.timing(spin, {
      toValue: turns.current,
      duration: ANIM.rotateMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    onPress(index);
  }, [index, onPress, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const haloScale = halo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.08],
  });

  const threads = [];
  for (let e = 0; e < 4; e++) {
    if ((displayMask & EDGES[e]) !== 0) {
      threads.push(
        <ThreadPath key={e} edge={e} lit={lit} size={inner} litColor={litColor} />,
      );
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={`Rotate tile ${index + 1}`}
      style={[styles.slot, { width: size, height: size }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tile,
          {
            width: inner,
            height: inner,
            borderColor: hinted
              ? theme.colors.accent.primary
              : 'rgba(245,241,230,0.07)',
            borderWidth: hinted ? 2 : 1,
            transform: [{ rotate }],
          },
        ]}>
        <Svg width={inner} height={inner} style={StyleSheet.absoluteFill}>
          {threads}
          <Circle
            cx={inner / 2}
            cy={inner / 2}
            r={Math.max(2.5, inner * 0.07)}
            fill={lit ? litColor : theme.colors.ui.threadOff}
          />
        </Svg>

        {lantern ? (
          <View style={styles.center} pointerEvents="none">
            <Animated.View
              style={[
                styles.halo,
                {
                  width: inner * 0.82,
                  height: inner * 0.82,
                  borderRadius: (inner * 0.82) / 2,
                  backgroundColor: lanternColor + '38',
                  opacity: halo,
                  transform: [{ scale: haloScale }],
                },
              ]}
            />
            <Image
              source={spriteSource}
              style={{
                width: inner * 0.62,
                height: inner * 0.62,
                opacity: lit ? 1 : 0.45,
              }}
              resizeMode="contain"
            />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.ui.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
});

export const LanternTile = memo(LanternTileBase);
export default LanternTile;
