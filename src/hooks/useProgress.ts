import { useEffect, useState } from 'react';
import { getProgress, subscribe } from '../game/progress';
import type { Progress } from '../game/progress';

/**
 * Subscribes to the progress store. Screens pull only the selectors they need
 * from the returned snapshot (rule: do not thread the whole game state through
 * every component by hand).
 */
export function useProgress(): Progress {
  const [snapshot, setSnapshot] = useState<Progress>(getProgress);

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshot(getProgress()));
    // A write could have landed between the first render and this effect.
    setSnapshot(getProgress());
    return unsubscribe;
  }, []);

  return snapshot;
}

export default useProgress;
