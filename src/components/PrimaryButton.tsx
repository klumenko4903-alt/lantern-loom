import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  Icon?: LucideIcon;
  onPress: () => void;
  tone?: 'amber' | 'teal';
  height?: number;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * Rule #20 / self-check #14: icon is a fixed 24x24 square, the label's
 * lineHeight equals the icon height, the gap is always 10, and the icon is
 * never positioned absolutely.
 */
function PrimaryButtonBase({
  label,
  Icon,
  onPress,
  tone = 'amber',
  height = 60,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const colours =
    tone === 'amber' ? theme.gradients.amber : theme.gradients.teal;
  const shadow = tone === 'amber' ? theme.shadows.amber : theme.shadows.teal;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.hit, { height }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.wrap, shadow, { height, transform: [{ scale }] }]}>
        <LinearGradient
          colors={colours}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { height }]}>
          <View style={styles.row}>
            {Icon ? (
              <Icon size={24} color={theme.colors.text.onAccent} strokeWidth={1.5} />
            ) : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: '100%',
  },
  wrap: {
    width: '100%',
    borderRadius: theme.radius.lg,
  },
  fill: {
    width: '100%',
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 24,
    color: theme.colors.text.onAccent,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export default PrimaryButton;
