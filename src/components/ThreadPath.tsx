import React, { memo } from 'react';
import { G, Line } from 'react-native-svg';
import { theme } from '../constants/theme';

type Props = {
  /** 0 = top, 1 = right, 2 = bottom, 3 = left. */
  edge: number;
  lit: boolean;
  size: number;
  litColor?: string;
};

/**
 * One thread end: a wide translucent under-stroke plus a narrow bright stroke
 * on top. Two stacked strokes are a cheap, reliable bloom on Android — far
 * safer than a blur filter.
 */
function ThreadPathBase({ edge, lit, size, litColor }: Props) {
  const half = size / 2;
  const ends = [
    { x: half, y: 0 },
    { x: size, y: half },
    { x: half, y: size },
    { x: 0, y: half },
  ];
  const end = ends[edge] || ends[0];

  const colour = lit
    ? litColor || theme.colors.accent.secondary
    : theme.colors.ui.threadOff;
  const topWidth = Math.max(3, size * 0.085);
  const glowWidth = Math.max(8, size * 0.2);

  return (
    <G>
      {lit ? (
        <Line
          x1={half}
          y1={half}
          x2={end.x}
          y2={end.y}
          stroke={colour}
          strokeWidth={glowWidth}
          strokeOpacity={0.26}
          strokeLinecap="round"
        />
      ) : null}
      <Line
        x1={half}
        y1={half}
        x2={end.x}
        y2={end.y}
        stroke={colour}
        strokeWidth={topWidth}
        strokeOpacity={lit ? 1 : 0.85}
        strokeLinecap="round"
      />
    </G>
  );
}

export const ThreadPath = memo(ThreadPathBase);
export default ThreadPath;
