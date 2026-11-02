import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../constants/theme';

type Props = {
  value: string;
  tone?: 'amber' | 'teal';
};

/** The header's stars read-out. Shared by every screen that shows one. */
function StarsPillBase({ value, tone = 'amber' }: Props) {
  const colour =
    tone === 'amber' ? theme.colors.accent.primary : theme.colors.accent.secondary;
  return (
    <View
      style={[
        styles.pill,
        { borderColor: colour + '61', backgroundColor: colour + '24' },
      ]}>
      <Star size={16} color={colour} strokeWidth={1.5} />
      <Text style={[styles.value, { color: colour }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 34,
    minWidth: 68,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
});

export const StarsPill = memo(StarsPillBase);
export default StarsPill;
