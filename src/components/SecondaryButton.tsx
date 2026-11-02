import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  Icon?: LucideIcon;
  onPress: () => void;
  height?: number;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Same icon contract as PrimaryButton: 24x24, lineHeight 24, gap 10. */
function SecondaryButtonBase({ label, Icon, onPress, height = 48 }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);

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
        style={[styles.fill, { height, transform: [{ scale }] }]}>
        <View style={styles.row}>
          {Icon ? (
            <Icon size={24} color={theme.colors.text.primary} strokeWidth={1.5} />
          ) : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: '100%',
  },
  fill: {
    width: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(245,241,230,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
export default SecondaryButton;
