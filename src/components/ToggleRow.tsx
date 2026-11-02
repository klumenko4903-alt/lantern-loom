import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  caption?: string;
  Icon: LucideIcon;
  value: boolean;
  tint?: string;
  onToggle: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const TRACK_W = 52;
const TRACK_H = 30;
const KNOB = 24;

function ToggleRowBase({ label, caption, Icon, value, tint, onToggle }: Props) {
  const pos = useRef(new Animated.Value(value ? 1 : 0)).current;
  const accent = tint || theme.colors.accent.secondary;

  useEffect(() => {
    Animated.spring(pos, {
      toValue: value ? 1 : 0,
      tension: 180,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [pos, value]);

  const translateX = pos.interpolate({
    inputRange: [0, 1],
    outputRange: [3, TRACK_W - KNOB - 3],
  });

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={HIT}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '1F' }]}>
        <Icon size={22} color={accent} strokeWidth={1.5} />
      </View>

      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: value ? accent : 'rgba(58,74,107,0.70)' },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.knob, { transform: [{ translateX }] }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(26,32,50,0.82)',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.text.primary,
  },
  caption: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: theme.colors.text.primary,
  },
});

export const ToggleRow = memo(ToggleRowBase);
export default ToggleRow;
