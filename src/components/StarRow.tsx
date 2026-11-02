import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../constants/theme';

type Props = {
  earned: number;
  total?: number;
  size?: number;
};

function StarRowBase({ earned, total = 3, size = 40 }: Props) {
  const values = useRef(
    Array.from({ length: total }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = values.map((value, i) =>
      Animated.sequence([
        Animated.delay(i * 160),
        Animated.spring(value, {
          toValue: i < earned ? 1 : 0.001,
          tension: theme.animation.star.tension,
          friction: theme.animation.star.friction,
          useNativeDriver: true,
        }),
      ]),
    );
    const group = Animated.parallel(animations);
    group.start();
    return () => group.stop();
  }, [earned, values]);

  return (
    <View style={styles.row}>
      {values.map((value, i) => {
        const filled = i < earned;
        const scale = value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.slot,
              filled ? theme.shadows.amber : null,
              {
                opacity: filled ? value : 0.55,
                transform: [{ scale: filled ? scale : 1 }],
              },
            ]}>
            <Star
              size={size}
              color={
                filled ? theme.colors.accent.primary : 'rgba(58,74,107,0.85)'
              }
              fill={filled ? theme.colors.accent.primary : 'transparent'}
              strokeWidth={1.5}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  slot: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const StarRow = memo(StarRowBase);
export default StarRow;
