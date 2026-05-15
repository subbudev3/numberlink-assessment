import type { Level } from '../game/types';

export const levels: Level[] = [
  {
    width: 5,
    height: 5,
    pairs: [
      { a: { x: 0, y: 0 }, b: { x: 4, y: 4 }, id: 1 },
      { a: { x: 0, y: 4 }, b: { x: 4, y: 0 }, id: 2 },
    ],
  },
];
