import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lightbulb } from 'lucide-react-native';
import { ANIM } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  moves: number;
  par: number;
  onHint: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pulse.setValue(1.14);
    Animated.timing(pulse, {
      toValue: 1,
      duration: ANIM.counterPulseMs,
      useNativeDriver: true,
    }).start();
  }, [pulse, value]);

  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Animated.Text
        style={[
          styles.blockValue,
          { color, transform: [{ scale: pulse }] },
        ]}>
        {value}
      </Animated.Text>
    </View>
  );
}

/**
 * The G2 floating control bar. The parent positions it; this component owns
 * only its surface and its contents.
 */
function FloatingHudBase({ moves, par, onHint }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const parColour =
    moves <= par ? theme.colors.accent.secondary : theme.colors.accent.primary;

  return (
    <View style={[styles.bar, theme.shadows.plate]}>
      <Counter label="MOVES" value={moves} color={theme.colors.text.primary} />
      <View style={styles.divider} />
      <Counter label="PAR" value={par} color={parColour} />

      <Pressable
        onPress={onHint}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel="Hint"
        style={styles.hintHit}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.hintWrap, theme.shadows.teal, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={theme.gradients.teal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hintFill}>
            <View style={styles.hintRow}>
              <Lightbulb
                size={24}
                color={theme.colors.text.onAccent}
                strokeWidth={1.5}
              />
              <Text style={styles.hintLabel}>HINT</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(16,20,31,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(245,241,230,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  block: {
    minWidth: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  blockLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.text.secondary,
  },
  blockValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 23,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.ui.border,
  },
  hintHit: {
    marginLeft: 'auto',
    width: 118,
    height: 48,
  },
  hintWrap: {
    width: 118,
    height: 48,
    borderRadius: theme.radius.md,
  },
  hintFill: {
    width: 118,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 24,
    color: theme.colors.text.onAccent,
  },
});

export const FloatingHud = memo(FloatingHudBase);
export default FloatingHud;
