import type { Level, Point, Pair } from './types';
import { solveLevel } from './solver';

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function generateLevel({ size = 5, difficulty = 'easy' }: { size?: number; difficulty?: 'easy' | 'medium' | 'hard' } = {}): Level {
  const pairsCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const pairs: Pair[] = [];
  const used = new Set<string>();

  const maxAttempts = 5000;
  let attempts = 0;

  while (pairs.length < pairsCount && attempts < maxAttempts) {
    attempts++;
    const a = { x: randInt(size), y: randInt(size) } as Point;
    const b = { x: randInt(size), y: randInt(size) } as Point;
    const ka = `${a.x},${a.y}`;
    const kb = `${b.x},${b.y}`;
    if (ka === kb) continue;
    if (used.has(ka) || used.has(kb)) continue;
    used.add(ka);
    used.add(kb);
    pairs.push({ a, b, id: pairs.length + 1 });
  }

  const level: Level = { width: size, height: size, pairs };
  // quick check: return only if solvable; otherwise fall back to a preset
  if (solveLevel(level)) return level;
  // fallback: known solvable easy puzzle
  return {
    width: 5,
    height: 5,
    pairs: [
      { a: { x: 2, y: 0 }, b: { x: 0, y: 4 }, id: 1 },
      { a: { x: 1, y: 4 }, b: { x: 4, y: 4 }, id: 2 },
      { a: { x: 1, y: 0 }, b: { x: 0, y: 2 }, id: 3 },
    ],
  };
}
