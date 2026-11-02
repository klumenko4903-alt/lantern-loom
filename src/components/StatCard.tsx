import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  value: string;
  label: string;
  accent: string;
};

/**
 * Rule #21 / self-check #15: one shared pill design everywhere. No raster
 * icons inside — colour and the big number carry the meaning, so three pills
 * in a row are pixel-identical in size whatever they hold.
 *
 * Rule #19a: the card itself never uses flex:1 — the caller's slot does, and
 * the card fills it with width:'100%' plus its intrinsic height.
 */
function StatCardBase({ value, label, accent }: Props) {
  return (
    <View style={[styles.card, { borderColor: accent + '55' }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.text.secondary,
  },
});

export const StatCard = memo(StatCardBase);
export default StatCard;
