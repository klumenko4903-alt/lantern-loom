import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { ANIM, LOADER_DURATION_MS, LOADER_FADE_MS } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  onFinish: () => void;
};

const BAR_W = 220;

/**
 * Rule #13: the splash holds for exactly LOADER_DURATION_MS before it hands
 * over. Rule #14: it is deliberately the darkest screen in the app, with no
 * chips and no interactive controls, so it can never be mistaken for the hub.
 */
export function LoaderScreen({ onFinish }: Props) {
  const root = useRef(new Animated.Value(1)).current;
  const plate = useRef(new Animated.Value(0)).current;
  const logo = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(plate, {
        toValue: 1,
        tension: theme.animation.plate.tension,
        friction: theme.animation.plate.friction,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(logo, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: ANIM.breatheMs / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: ANIM.breatheMs / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Width is a layout property — the native driver is NOT allowed here.
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    entrance.start();
    loop.start();
    bar.start();

    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const holdTimer = setTimeout(() => {
      Animated.timing(root, {
        toValue: 0,
        duration: LOADER_FADE_MS,
        useNativeDriver: true,
      }).start();
      fadeTimer = setTimeout(onFinish, LOADER_FADE_MS);
    }, LOADER_DURATION_MS);

    return () => {
      entrance.stop();
      loop.stop();
      bar.stop();
      clearTimeout(holdTimer);
      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }
    };
  }, [breathe, logo, onFinish, plate, progress, root]);

  const plateScale = plate.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1],
  });
  const logoScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_W],
  });

  return (
    <AppBackground variant="loader" blob="amber">
      <Animated.View style={[styles.root, { opacity: root }]}>
        <View style={styles.spacer} />

        <Animated.View
          style={[
            styles.plate,
            theme.shadows.amber,
            { opacity: plate, transform: [{ scale: plateScale }] },
          ]}>
          <Animated.Image
            source={assets.logo}
            style={[
              styles.logo,
              { opacity: logo, transform: [{ scale: logoScale }] },
            ]}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>LANTERN LOOM</Text>
        <Text style={styles.subtitle}>WEAVE THE LIGHT</Text>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]}>
            <LinearGradient
              colors={theme.gradients.thread}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fillGradient}
            />
          </Animated.View>
        </View>

        <Text style={styles.status}>LOADING THE LOOM...</Text>

        <View style={styles.spacer} />
        <Text style={styles.footer}>SIX DISTRICTS - 120 BOARDS</Text>
      </Animated.View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  plate: {
    width: 196,
    height: 196,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.ui.glassSoft,
    borderWidth: 1,
    borderColor: 'rgba(242,177,52,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 148,
    height: 148,
  },
  title: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 5,
    color: theme.colors.text.primary,
    textShadowColor: 'rgba(242,177,52,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3.5,
    color: theme.colors.text.secondary,
  },
  track: {
    marginTop: 30,
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(58,74,107,0.55)',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillGradient: {
    flex: 1,
  },
  status: {
    marginTop: 14,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: theme.colors.text.tertiary,
  },
  footer: {
    marginBottom: 28,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(245,241,230,0.26)',
  },
});

export default LoaderScreen;
