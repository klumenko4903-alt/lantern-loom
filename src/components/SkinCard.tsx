import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { SKIN_CELL } from '../utils/layout';

export type SkinState = 'equipped' | 'owned' | 'buyable' | 'locked';

type Props = {
  name: string;
  source: any;
  cost: number;
  state: SkinState;
  onPress: () => void;
};

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };
const CARD_H = 130;

function SkinCardBase({ name, source, cost, state, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);

  const borderColor =
    state === 'equipped'
      ? theme.colors.accent.secondary
      : state === 'locked'
      ? 'rgba(58,74,107,0.50)'
      : 'rgba(95,211,196,0.20)';

  let footer = `★ ${cost}`;
  let footerStyle = styles.cost;
  if (state === 'equipped') {
    footer = 'EQUIPPED';
    footerStyle = styles.equipped;
  } else if (state === 'owned') {
    footer = 'TAP TO WEAR';
    footerStyle = styles.owned;
  } else if (state === 'locked') {
    footer = `★ ${cost}`;
    footerStyle = styles.locked;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={styles.hit}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          theme.shadows.card,
          {
            borderColor,
            borderWidth: state === 'equipped' ? 2 : 1,
            transform: [{ scale }],
          },
        ]}>
        <View style={styles.previewWrap}>
          <Image source={source} style={styles.preview} resizeMode="contain" />
        </View>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={footerStyle}>{footer}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: SKIN_CELL,
    height: CARD_H,
  },
  card: {
    width: SKIN_CELL,
    height: CARD_H,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.ui.glass,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  previewWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 64,
    height: 64,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.text.primary,
  },
  equipped: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.accent.secondary,
  },
  owned: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.text.secondary,
  },
  cost: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.accent.primary,
  },
  locked: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.text.tertiary,
  },
});

export const SkinCard = memo(SkinCardBase);
export default SkinCard;
