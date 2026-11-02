import React, { memo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { SCREEN_H, SCREEN_W } from '../utils/layout';

export type BackgroundVariant =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'board'
  | 'result'
  | 'panel';

export type BlobTone = 'amber' | 'teal' | 'none';

type Props = {
  variant: BackgroundVariant;
  blob?: BlobTone;
  children: React.ReactNode;
};

/** Fixed pseudo-random paper grain — computed once, never re-rendered. */
const GRAIN = (() => {
  const dots: Array<{ left: number; top: number; size: number }> = [];
  let a = 20250213;
  const rnd = () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
  for (let i = 0; i < 22; i++) {
    dots.push({
      left: Math.round(rnd() * (SCREEN_W - 8)),
      top: Math.round(rnd() * (SCREEN_H - 8)),
      size: rnd() > 0.65 ? 3 : 2,
    });
  }
  return dots;
})();

const OVERLAY: Record<BackgroundVariant, string[]> = {
  loader: theme.gradients.loader,
  menu: theme.gradients.menu,
  levels: theme.gradients.levels,
  board: theme.gradients.board,
  result: theme.gradients.result,
  panel: theme.gradients.panel,
};

/** A second, screen-specific wash so no two screens read as the same room. */
const WASH: Record<BackgroundVariant, string[]> = {
  loader: ['transparent', 'rgba(5,7,12,0.55)'],
  menu: ['transparent', 'rgba(242,177,52,0.10)'],
  levels: ['transparent', 'rgba(95,211,196,0.10)'],
  board: ['rgba(11,14,23,0.25)', 'transparent'],
  result: ['transparent', 'rgba(242,177,52,0.12)'],
  panel: ['transparent', 'rgba(95,211,196,0.07)'],
};

const BLOB_SIZE = 440;

function AppBackgroundBase({ variant, blob = 'none', children }: Props) {
  const blobColour =
    blob === 'amber' ? 'rgba(242,177,52,0.15)' : 'rgba(95,211,196,0.13)';

  return (
    <ImageBackground
      source={assets.bg}
      style={styles.root}
      imageStyle={styles.image}
      resizeMode="cover">
      {/* L1 — the screen's own colour grade */}
      <LinearGradient
        colors={OVERLAY[variant]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* L2 — a single soft lantern pool, placed per screen */}
      {blob === 'none' ? null : (
        <View
          pointerEvents="none"
          style={[
            styles.blob,
            {
              backgroundColor: blobColour,
              top: variant === 'result' ? SCREEN_H * 0.1 : SCREEN_H * 0.18,
            },
          ]}
        />
      )}

      {/* L3 — paper grain */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {GRAIN.map((dot, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: 'rgba(245,241,230,0.05)',
            }}
          />
        ))}
      </View>

      {/* L4 — directional wash */}
      <LinearGradient
        colors={WASH[variant]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* L5 — screen content */}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
  },
  image: {
    resizeMode: 'cover',
  },
  blob: {
    position: 'absolute',
    alignSelf: 'center',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
  content: {
    flex: 1,
  },
});

export const AppBackground = memo(AppBackgroundBase);
export default AppBackground;
