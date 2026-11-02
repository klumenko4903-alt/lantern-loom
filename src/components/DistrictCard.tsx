import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { spriteAt } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  name: string;
  emblem: number;
  stars: number;
  max: number;
  locked: boolean;
  onPress: () => void;
};

const HIT = { top: 6, bottom: 6, left: 4, right: 4 };
const CARD_H = 104;

function DistrictCardBase({ name, emblem, stars, max, locked, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${name}, locked` : name}
      style={styles.hit}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          locked ? styles.cardLocked : styles.cardOpen,
          { transform: [{ scale }] },
        ]}>
        {locked ? (
          <View style={styles.lockWrap}>
            <Lock size={16} color={theme.colors.text.secondary} strokeWidth={1.5} />
          </View>
        ) : (
          <Image source={spriteAt(emblem)} style={styles.emblem} resizeMode="contain" />
        )}
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={[styles.stars, locked ? styles.starsLocked : null]}>
          {locked ? 'LOCKED' : `${stars}/${max}`}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    flex: 1,
    height: CARD_H,
  },
  card: {
    width: '100%',
    height: CARD_H,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(26,32,50,0.80)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  cardOpen: {
    borderColor: 'rgba(95,211,196,0.30)',
  },
  cardLocked: {
    borderColor: 'rgba(58,74,107,0.50)',
    opacity: 0.6,
  },
  lockWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblem: {
    width: 34,
    height: 34,
  },
  name: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.text.primary,
  },
  stars: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.accent.secondary,
    fontVariant: ['tabular-nums'],
  },
  starsLocked: {
    color: theme.colors.text.tertiary,
  },
});

export const DistrictCard = memo(DistrictCardBase);
export default DistrictCard;
