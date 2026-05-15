import type { Level, Point } from './types';

export function createEmptyGrid(level: Level): (number | null)[][] {
  return Array.from({ length: level.height }, () =>
    Array.from({ length: level.width }, () => null)
  );
}

export function inBounds(p: Point, level: Level) {
  return p.x >= 0 && p.x < level.width && p.y >= 0 && p.y < level.height;
}
