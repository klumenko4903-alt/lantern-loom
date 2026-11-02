import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { GameScreen } from './src/screens/GameScreen';
import type { GameResult } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SkinsScreen } from './src/screens/SkinsScreen';
import { BOARDS_PER_DISTRICT, TOTAL_BOARDS } from './src/constants/config';
import { theme } from './src/constants/theme';
import {
  SKINS,
  districtUnlocked,
  getProgress,
  recordWin,
  starsAvailable,
} from './src/game/progress';

type Screen =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'gameover'
  | 'skins'
  | 'settings';

const EMPTY_RESULT: GameResult = { levelId: 1, moves: 0, par: 1, stars: 1 };

/**
 * State machine only — no gameplay lives here (rule #2). Screens are rendered
 * conditionally; there is no navigation library.
 */
function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [levelId, setLevelId] = useState(1);
  const [district, setDistrict] = useState(1);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<GameResult>(EMPTY_RESULT);
  const [unlockNote, setUnlockNote] = useState<string | null>(null);

  const screenRef = useRef(screen);
  screenRef.current = screen;

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goSkins = useCallback(() => setScreen('skins'), []);
  const goSettings = useCallback(() => setScreen('settings'), []);

  const startLevel = useCallback((id: number) => {
    setLevelId(id);
    if (id > 0) {
      setDistrict(Math.floor((id - 1) / BOARDS_PER_DISTRICT) + 1);
    }
    setRound(r => r + 1);
    setScreen('game');
  }, []);

  const startDaily = useCallback(() => {
    setLevelId(0);
    setRound(r => r + 1);
    setScreen('game');
  }, []);

  const openDistrict = useCallback((d: number) => {
    setDistrict(d);
    setScreen('levels');
  }, []);

  const handleGameOver = useCallback((outcome: GameResult) => {
    const before = getProgress();
    const starsBefore = starsAvailable(before);
    const nextDistrict =
      outcome.levelId > 0
        ? Math.floor((outcome.levelId - 1) / BOARDS_PER_DISTRICT) + 2
        : 0;
    const unlockedBefore =
      nextDistrict > 0 ? districtUnlocked(before, nextDistrict) : true;

    recordWin(outcome.levelId, outcome.stars);

    const after = getProgress();
    let note: string | null = null;
    if (
      nextDistrict > 0 &&
      !unlockedBefore &&
      districtUnlocked(after, nextDistrict)
    ) {
      note = `DISTRICT ${nextDistrict} UNLOCKED`;
    } else {
      const starsAfter = starsAvailable(after);
      const reached = SKINS.find(
        skin =>
          skin.cost > 0 &&
          after.ownedSkins.indexOf(skin.id) === -1 &&
          starsBefore < skin.cost &&
          starsAfter >= skin.cost,
      );
      if (reached) {
        note = `NEW SKIN READY: ${reached.name}`;
      }
    }

    setResult(outcome);
    setUnlockNote(note);
    setScreen('gameover');
  }, []);

  const handleNext = useCallback(() => {
    const id = result.levelId > 0 ? Math.min(TOTAL_BOARDS, result.levelId + 1) : 1;
    startLevel(id);
  }, [result.levelId, startLevel]);

  const handleAgain = useCallback(() => {
    setRound(r => r + 1);
    setScreen('game');
  }, []);

  const handleMap = useCallback(() => {
    setScreen('levels');
  }, []);

  const backFromGame = useCallback(() => {
    setScreen('levels');
  }, []);

  // Android hardware back: walk up the state machine instead of killing the app.
  useEffect(() => {
    const onBack = () => {
      const current = screenRef.current;
      if (current === 'loader' || current === 'menu') {
        return false;
      }
      if (current === 'levels' || current === 'skins' || current === 'settings') {
        setScreen('menu');
        return true;
      }
      if (current === 'game') {
        setScreen('levels');
        return true;
      }
      setScreen('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {screen === 'loader' ? <LoaderScreen onFinish={goMenu} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          onPlay={startLevel}
          onDaily={startDaily}
          onDistrict={openDistrict}
          onSkins={goSkins}
          onSettings={goSettings}
        />
      ) : null}

      {screen === 'levels' ? (
        <LevelSelectScreen
          district={district}
          onBack={goMenu}
          onPlay={startLevel}
        />
      ) : null}

      {screen === 'game' ? (
        <GameScreen
          key={`${levelId}-${round}`}
          levelId={levelId}
          onBack={backFromGame}
          onGameOver={handleGameOver}
        />
      ) : null}

      {screen === 'gameover' ? (
        <GameOverScreen
          result={result}
          unlockNote={unlockNote}
          onNext={handleNext}
          onAgain={handleAgain}
          onMap={handleMap}
        />
      ) : null}

      {screen === 'skins' ? <SkinsScreen onBack={goMenu} /> : null}

      {screen === 'settings' ? <SettingsScreen onBack={goMenu} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
  },
});

export default App;
