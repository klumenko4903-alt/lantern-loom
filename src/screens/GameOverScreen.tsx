import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, RotateCcw } from 'lucide-react-native';
import { assets, spriteAt } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { StarRow } from '../components/StarRow';
import { StatCard } from '../components/StatCard';
import { HEADER_TOP_PAD } from '../constants/config';
import { theme } from '../constants/theme';
import { SKINS } from '../game/progress';
import { useProgress } from '../hooks/useProgress';
import type { GameResult } from './GameScreen';

type Props = {
  result: GameResult;
  unlockNote: string | null;
  onNext: () => void;
  onAgain: () => void;
  onMap: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * The result screen required by rule #12. Rule #17: the lantern sits in its
 * own block well above the heading, so no decoration ever crosses a letter.
 * Rule #19: the unlock note sits ABOVE the CTA block, never under it.
 */
export function GameOverScreen({
  result,
  unlockNote,
  onNext,
  onAgain,
  onMap,
}: Props) {
  const progress = useProgress();
  const skin = SKINS[progress.equippedSkin] || SKINS[0];
  const lantern = skin.sprite < 0 ? assets.logo : spriteAt(skin.sprite);

  return (
    <AppBackground variant="result" blob="amber">
      <View style={styles.root}>
        <View style={styles.topPad} />

        <Image source={lantern} style={styles.lantern} resizeMode="contain" />

        <View style={styles.starBlock}>
          <StarRow earned={result.stars} total={3} size={40} />
        </View>

        <Text style={styles.title}>LOOM COMPLETE</Text>
        <Text style={styles.subtitle}>EVERY LANTERN IS ON ONE THREAD</Text>

        <View style={styles.stats}>
          <View style={styles.statSlot}>
            <StatCard
              value={String(result.moves)}
              label="MOVES"
              accent={theme.colors.text.primary}
            />
          </View>
          <View style={styles.statSlot}>
            <StatCard
              value={String(result.par)}
              label="PAR"
              accent={theme.colors.accent.secondary}
            />
          </View>
          <View style={styles.statSlot}>
            <StatCard
              value={`${result.stars}/3`}
              label="STARS"
              accent={theme.colors.accent.primary}
            />
          </View>
        </View>

        <View style={styles.spacer} />

        {unlockNote ? <Text style={styles.unlock}>{unlockNote}</Text> : null}

        <View style={styles.cta}>
          <PrimaryButton label="NEXT BOARD" Icon={ArrowRight} onPress={onNext} />
          <SecondaryButton label="WEAVE AGAIN" Icon={RotateCcw} onPress={onAgain} />
          <Pressable
            onPress={onMap}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel="District map"
            style={styles.tertiary}>
            <Text style={styles.tertiaryLabel}>DISTRICT MAP</Text>
          </Pressable>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topPad: {
    height: HEADER_TOP_PAD,
  },
  lantern: {
    width: 86,
    height: 86,
  },
  starBlock: {
    marginTop: 16,
    height: 48,
    justifyContent: 'center',
  },
  title: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 3,
    color: theme.colors.text.primary,
    textShadowColor: 'rgba(242,177,52,0.50)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
    color: theme.colors.text.secondary,
  },
  stats: {
    marginTop: 26,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  statSlot: {
    flex: 1,
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  unlock: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.accent.secondary,
  },
  cta: {
    width: '100%',
    marginBottom: 28,
    gap: 12,
  },
  tertiary: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    lineHeight: 16,
    color: theme.colors.text.secondary,
  },
});

export default GameOverScreen;
