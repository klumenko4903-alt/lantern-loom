import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { assets, spriteAt } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SkinCard } from '../components/SkinCard';
import type { SkinState } from '../components/SkinCard';
import { StarsPill } from '../components/StarsPill';
import { theme } from '../constants/theme';
import { SKINS, buySkin, equipSkin, starsAvailable } from '../game/progress';
import { useProgress } from '../hooks/useProgress';
import { SKIN_GAP } from '../utils/layout';

type Props = {
  onBack: () => void;
};

export function SkinsScreen({ onBack }: Props) {
  const progress = useProgress();
  const stars = starsAvailable(progress);

  const handlePress = useCallback(
    (id: number) => {
      if (progress.ownedSkins.indexOf(id) !== -1) {
        equipSkin(id);
        return;
      }
      buySkin(id);
    },
    [progress.ownedSkins],
  );

  const cards = SKINS.map(skin => {
    const owned = progress.ownedSkins.indexOf(skin.id) !== -1;
    let state: SkinState = 'buyable';
    if (owned) {
      state = progress.equippedSkin === skin.id ? 'equipped' : 'owned';
    } else if (stars < skin.cost) {
      state = 'locked';
    }
    return (
      <SkinCard
        key={skin.id}
        name={skin.name}
        source={skin.sprite < 0 ? assets.logo : spriteAt(skin.sprite)}
        cost={skin.cost}
        state={state}
        onPress={() => handlePress(skin.id)}
      />
    );
  });

  return (
    <AppBackground variant="panel" blob="teal">
      <ScreenHeader
        title="LANTERN SKINS"
        onBack={onBack}
        rightSlot={<StarsPill value={String(stars)} />}
      />

      <View style={styles.body}>
        <Text style={styles.hint}>SPENT STARS NEVER COST YOU PROGRESS</Text>
        <View style={styles.grid}>{cards}</View>
        <View style={styles.spacer} />
        <Text style={styles.footer}>
          {'TAP TO WEAR · STARS ARE EARNED, NEVER BOUGHT'}
        </Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  hint: {
    marginBottom: 12,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SKIN_GAP,
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
    letterSpacing: 1.4,
    color: theme.colors.text.tertiary,
  },
});

export default SkinsScreen;
