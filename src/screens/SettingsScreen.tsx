import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Eye, Trash2, Vibrate, Volume2 } from 'lucide-react-native';
import { AppBackground } from '../components/AppBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { StarsPill } from '../components/StarsPill';
import { ToggleRow } from '../components/ToggleRow';
import { TOTAL_BOARDS } from '../constants/config';
import { theme } from '../constants/theme';
import { resetProgress, setSetting, starsAvailable } from '../game/progress';
import { useProgress } from '../hooks/useProgress';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  onBack: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const CONFIRM_MS = 4000;

export function SettingsScreen({ onBack }: Props) {
  const progress = useProgress();
  const [arming, setArming] = useState(false);
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    if (!arming) {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), CONFIRM_MS);
      return;
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setArming(false);
    resetProgress();
  }, [arming]);

  return (
    <AppBackground variant="panel" blob="amber">
      <ScreenHeader
        title="SETTINGS"
        onBack={onBack}
        rightSlot={<StarsPill value={String(starsAvailable(progress))} />}
      />

      <View style={styles.body}>
        <ToggleRow
          label="SOUND"
          caption="CHIMES WHEN A THREAD CLOSES"
          Icon={Volume2}
          value={progress.settings.sound}
          onToggle={() => setSetting('sound', !progress.settings.sound)}
        />
        <ToggleRow
          label="HAPTICS"
          caption="A SOFT TICK ON EVERY TURN"
          Icon={Vibrate}
          value={progress.settings.haptics}
          onToggle={() => setSetting('haptics', !progress.settings.haptics)}
        />
        <ToggleRow
          label="COLOUR-BLIND PALETTE"
          caption="LIT THREADS READ BY BRIGHTNESS"
          Icon={Eye}
          tint={theme.colors.accent.primary}
          value={progress.settings.colourBlind}
          onToggle={() =>
            setSetting('colourBlind', !progress.settings.colourBlind)
          }
        />

        <Pressable
          onPress={handleReset}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel="Reset progress"
          style={styles.dangerHit}>
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.danger,
              arming ? styles.dangerArmed : null,
              { transform: [{ scale }] },
            ]}>
            <View style={styles.dangerIcon}>
              <Trash2
                size={22}
                color={theme.colors.accent.primary}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.dangerText}>
              <Text style={styles.dangerLabel}>RESET PROGRESS</Text>
              <Text style={styles.dangerCaption}>
                {arming ? 'TAP AGAIN TO CONFIRM' : 'CLEARS STARS AND BOARDS'}
              </Text>
            </View>
          </Animated.View>
        </Pressable>

        <View style={styles.spacer} />
        <Text style={styles.footer}>
          {`LANTERN LOOM v1.0 · ${TOTAL_BOARDS} BOARDS`}
        </Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  dangerHit: {
    width: '100%',
    height: 64,
  },
  danger: {
    width: '100%',
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(26,32,50,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(242,177,52,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  dangerArmed: {
    borderColor: theme.colors.accent.primary,
    backgroundColor: 'rgba(242,177,52,0.12)',
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,177,52,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    flex: 1,
    justifyContent: 'center',
  },
  dangerLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.accent.primary,
  },
  dangerCaption: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
  footer: {
    textAlign: 'center',
    marginBottom: 18,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.text.tertiary,
  },
});

export default SettingsScreen;
