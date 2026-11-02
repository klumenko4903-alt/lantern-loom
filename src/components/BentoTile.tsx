import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  height: number;
  /** Share of the row. Omit inside a column that already sets the width. */
  flex?: number;
  /** When set the tile is a filled gradient plate instead of a glass surface. */
  gradient?: string[];
  borderColor?: string;
  radius?: number;
  glow?: 'amber' | 'teal' | 'none';
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * One pressable bento cell. The surface is composed by the caller through
 * children, so the hub can hold a hero plate, a progress ring or a wide row
 * without a pile of boolean props.
 */
function BentoTileBase({
  height,
  flex,
  gradient,
  borderColor,
  radius = theme.radius.xl,
  glow = 'none',
  onPress,
  accessibilityLabel,
  children,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const shadow =
    glow === 'amber'
      ? theme.shadows.amber
      : glow === 'teal'
      ? theme.shadows.teal
      : theme.shadows.card;

  const frame = flex === undefined ? { width: '100%' as const } : { flex };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[frame, { height }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.plate,
          shadow,
          { height, borderRadius: radius, transform: [{ scale }] },
        ]}>
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.surface, { height, borderRadius: radius }]}>
            {children}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.surface,
              styles.glass,
              {
                height,
                borderRadius: radius,
                borderColor: borderColor || theme.colors.ui.border,
              },
            ]}>
            {children}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plate: {
    width: '100%',
  },
  surface: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
  },
});

export const BentoTile = memo(BentoTileBase);
export default BentoTile;
