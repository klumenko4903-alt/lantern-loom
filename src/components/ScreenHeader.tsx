import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { HEADER_TOP_PAD } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  title: string;
  onBack?: () => void;
  /** Rendered on the right — a stars pill, a counter, or nothing. */
  rightSlot?: React.ReactNode;
  /** `true` keeps the dark backing surface; Menu uses it transparent. */
  solid?: boolean;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function BackButton({ onPress }: { onPress: () => void }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={styles.backHit}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.backPlate, { transform: [{ scale }] }]}>
        <ChevronLeft size={22} color={theme.colors.text.primary} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

/**
 * The single header used by every screen (rule #12 of the self-check): same
 * geometry, same backing surface, only the slots change.
 */
function ScreenHeaderBase({ title, onBack, rightSlot, solid = true }: Props) {
  return (
    <View style={[styles.header, solid ? styles.headerSolid : null]}>
      <View style={styles.side}>
        {onBack ? <BackButton onPress={onBack} /> : null}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: HEADER_TOP_PAD,
    height: HEADER_TOP_PAD + 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSolid: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },
  side: {
    width: 92,
    height: 44,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlate: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.ui.glassSoft,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: theme.colors.text.primary,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
export default ScreenHeader;
