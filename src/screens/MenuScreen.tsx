import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react-native';
import { assets } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { BentoTile } from '../components/BentoTile';
import { DistrictCard } from '../components/DistrictCard';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenHeader } from '../components/ScreenHeader';
import { StarsPill } from '../components/StarsPill';
import {
  ANIM,
  BOARDS_PER_DISTRICT,
  DISTRICTS,
  DISTRICT_COUNT,
  STARS_PER_DISTRICT,
  TOTAL_BOARDS,
} from '../constants/config';
import { theme } from '../constants/theme';
import {
  boardsLit,
  districtStars,
  districtUnlocked,
  nextBoard,
  starsAvailable,
} from '../game/progress';
import { useProgress } from '../hooks/useProgress';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  onPlay: (levelId: number) => void;
  onDaily: () => void;
  onDistrict: (district: number) => void;
  onSkins: () => void;
  onSettings: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const PER_PAGE = 3;
const PAGES = Math.ceil(DISTRICT_COUNT / PER_PAGE);

/** Staggered entrance shell. box-none keeps taps flowing to the tiles inside. */
function Reveal({ delay, children }: { delay: number; children: React.ReactNode }) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, {
        toValue: 1,
        duration: ANIM.elementFadeMs,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, value]);

  const translateY = value.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ opacity: value, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function PagerButton({
  dir,
  onPress,
  disabled,
}: {
  dir: 'prev' | 'next';
  onPress: () => void;
  disabled: boolean;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.9);
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={dir === 'prev' ? 'Previous districts' : 'Next districts'}
      style={styles.pagerHit}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.pagerPlate,
          disabled ? styles.pagerDisabled : null,
          { transform: [{ scale }] },
        ]}>
        <Icon
          size={18}
          color={disabled ? theme.colors.text.tertiary : theme.colors.text.primary}
          strokeWidth={1.5}
        />
      </Animated.View>
    </Pressable>
  );
}

/** M3 Bento-Hub: one hero plate, two meters, a district strip, two wide rows. */
export function MenuScreen({
  onPlay,
  onDaily,
  onDistrict,
  onSkins,
  onSettings,
}: Props) {
  const progress = useProgress();
  const [page, setPage] = useState(0);

  const stars = starsAvailable(progress);
  const lit = boardsLit(progress);
  const target = nextBoard(progress);
  const targetDistrict = Math.floor((target - 1) / BOARDS_PER_DISTRICT) + 1;
  const skinCount = progress.ownedSkins.length;

  const visible = useMemo(() => {
    const start = page * PER_PAGE;
    const out: number[] = [];
    for (let d = start + 1; d <= Math.min(DISTRICT_COUNT, start + PER_PAGE); d++) {
      out.push(d);
    }
    return out;
  }, [page]);

  const handlePlay = useCallback(() => onPlay(target), [onPlay, target]);
  const prevPage = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const nextPage = useCallback(
    () => setPage(p => Math.min(PAGES - 1, p + 1)),
    [],
  );

  return (
    <AppBackground variant="menu" blob="amber">
      <ScreenHeader
        title="LANTERN LOOM"
        solid={false}
        rightSlot={<StarsPill value={String(stars)} />}
      />

      <View style={styles.body}>
        <Reveal delay={0}>
          <View style={styles.rowA}>
            <BentoTile
              height={176}
              flex={1.35}
              gradient={theme.gradients.amber}
              glow="amber"
              onPress={handlePlay}
              accessibilityLabel="Start weaving">
              <Image source={assets.sprite1} style={styles.heroSprite} resizeMode="contain" />
              <Text style={styles.heroTitle}>START WEAVING</Text>
              <Text style={styles.heroCaption}>
                {`DISTRICT ${targetDistrict} · BOARD ${target}`}
              </Text>
            </BentoTile>

            <View style={styles.rowAColumn}>
              <BentoTile
                height={82}
                radius={theme.radius.lg}
                borderColor="rgba(95,211,196,0.22)"
                glow="none"
                onPress={() => onDistrict(targetDistrict)}
                accessibilityLabel="Boards lit">
                <ProgressRing
                  value={lit}
                  max={TOTAL_BOARDS}
                  size={44}
                  stroke={5}
                  caption="BOARDS LIT"
                />
              </BentoTile>

              <BentoTile
                height={82}
                radius={theme.radius.lg}
                borderColor="rgba(242,177,52,0.22)"
                glow="none"
                onPress={onDaily}
                accessibilityLabel="Daily loom">
                <Sparkles size={20} color={theme.colors.accent.primary} strokeWidth={1.5} />
                <Text style={styles.smallTitle}>DAILY LOOM</Text>
                <Text style={styles.smallCaption}>
                  {progress.dailyDone ? 'WOVEN TODAY' : 'NEW BOARD TODAY'}
                </Text>
              </BentoTile>
            </View>
          </View>
        </Reveal>

        <Reveal delay={ANIM.bentoStaggerMs}>
          <View style={styles.stripHead}>
            <Text style={styles.stripLabel}>DISTRICTS</Text>
            <View style={styles.pager}>
              <PagerButton dir="prev" onPress={prevPage} disabled={page === 0} />
              <PagerButton
                dir="next"
                onPress={nextPage}
                disabled={page >= PAGES - 1}
              />
            </View>
          </View>

          <View style={styles.strip}>
            {visible.map(d => (
              <DistrictCard
                key={d}
                name={DISTRICTS[d - 1].name}
                emblem={DISTRICTS[d - 1].emblem}
                stars={districtStars(progress, d)}
                max={STARS_PER_DISTRICT}
                locked={!districtUnlocked(progress, d)}
                onPress={() => onDistrict(d)}
              />
            ))}
          </View>
        </Reveal>

        <Reveal delay={ANIM.bentoStaggerMs * 2}>
          <View style={styles.rowC}>
            <BentoTile
              height={72}
              flex={1}
              radius={theme.radius.lg}
              borderColor="rgba(95,211,196,0.22)"
              onPress={onSkins}
              accessibilityLabel="Lantern skins">
              <View style={styles.wideRow}>
                <Palette size={20} color={theme.colors.accent.secondary} strokeWidth={1.5} />
                <View style={styles.wideText}>
                  <Text style={styles.wideTitle}>SKINS</Text>
                  <Text style={styles.wideCaption}>{`${skinCount} UNLOCKED`}</Text>
                </View>
              </View>
            </BentoTile>

            <BentoTile
              height={72}
              flex={1}
              radius={theme.radius.lg}
              borderColor="rgba(245,241,230,0.14)"
              onPress={onSettings}
              accessibilityLabel="Settings">
              <View style={styles.wideRow}>
                <SettingsIcon size={20} color={theme.colors.text.primary} strokeWidth={1.5} />
                <View style={styles.wideText}>
                  <Text style={styles.wideTitle}>SETTINGS</Text>
                  <Text style={styles.wideCaption}>
                    {'SOUND · HAPTICS'}
                  </Text>
                </View>
              </View>
            </BentoTile>
          </View>
        </Reveal>

        <View style={styles.spacer} />

        <Text style={styles.footer}>
          {'NO TIMERS · NO ADS · JUST LIGHT'}
        </Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  rowA: {
    flexDirection: 'row',
    gap: 12,
    height: 176,
  },
  rowAColumn: {
    flex: 1,
    height: 176,
    gap: 12,
  },
  heroSprite: {
    width: 64,
    height: 64,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 21,
    color: theme.colors.text.onAccent,
  },
  heroCaption: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(16,20,31,0.66)',
  },
  smallTitle: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.primary,
  },
  smallCaption: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
  stripHead: {
    marginTop: 16,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.text.secondary,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pagerHit: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerPlate: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: theme.colors.ui.glassSoft,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerDisabled: {
    opacity: 0.45,
  },
  strip: {
    marginTop: 8,
    height: 104,
    flexDirection: 'row',
    gap: 10,
  },
  rowC: {
    marginTop: 14,
    height: 72,
    flexDirection: 'row',
    gap: 12,
  },
  wideRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  wideText: {
    justifyContent: 'center',
  },
  wideTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 16,
    color: theme.colors.text.primary,
  },
  wideCaption: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.1,
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
    letterSpacing: 2,
    color: theme.colors.text.tertiary,
  },
});

export default MenuScreen;
