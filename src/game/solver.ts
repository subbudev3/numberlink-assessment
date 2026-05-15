import type { Level, Point, Solution } from './types';

const DIRS: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function inBounds(p: Point, level: Level) {
  return p.x >= 0 && p.x < level.width && p.y >= 0 && p.y < level.height;
}

function key(p: Point) {
  return `${p.x},${p.y}`;
}

export function solveLevel(level: Level): Solution | null {
  const { width, height, pairs } = level;
  const grid: (number | null)[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null)
  );

  const endpointMap = new Map<string, number>();
  for (const p of pairs) {
    endpointMap.set(key(p.a), p.id);
    endpointMap.set(key(p.b), p.id);
  }
  // mark endpoints so paths know which cells are endpoints
  for (const pair of pairs) {
    grid[pair.a.y][pair.a.x] = pair.id;
    grid[pair.b.y][pair.b.x] = pair.id;
  }

  const solution: Solution = pairs.map(() => []);

  function neighbors(pt: Point) {
    return DIRS.map((d) => ({ x: pt.x + d.x, y: pt.y + d.y })).filter((n) => inBounds(n, level));
  }

  function dfsPath(curr: Point, target: Point, visited: Set<string>, path: Point[]): boolean {
    if (curr.x === target.x && curr.y === target.y) {
      return true;
    }

    for (const n of neighbors(curr)) {
      const k = key(n);
      if (visited.has(k)) continue;
      const occ = grid[n.y][n.x];
      // allow stepping into the target even if it's occupied; otherwise block occupied cells
      if (!(n.x === target.x && n.y === target.y) && occ !== null) continue;

      visited.add(k);
      path.push(n);
      // temporarily mark this cell while searching this path
      const prev = grid[n.y][n.x];
      grid[n.y][n.x] = -1; // temp

      if (dfsPath(n, target, visited, path)) return true;

      // backtrack
      grid[n.y][n.x] = prev;
      path.pop();
      visited.delete(k);
    }

    return false;
  }

  function solvePair(index: number): boolean {
    if (index >= pairs.length) {
      // check grid fully filled (no nulls)
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (grid[y][x] === null) return false;
      return true;
    }

    const pair = pairs[index];
    // prepare path starting at a
    const start: Point = pair.a;
    const target: Point = pair.b;

    const visited = new Set<string>();
    visited.add(key(start));
    const path: Point[] = [start];

    // free the target temporarily so dfs can step into it
    const targetPrev = grid[target.y][target.x];
    grid[target.y][target.x] = null;

    if (dfsPath(start, target, visited, path)) {
      // record path and mark cells for this pair
      solution[index] = path.slice();
      for (const p of path) grid[p.y][p.x] = pair.id;
      for (const p of path) grid[p.y][p.x] = pair.id;

      if (solvePair(index + 1)) return true;

      // undo markings when backtracking
      for (const p of path) {
        // don't clear endpoints since other pairs expect them to be endpoints originally
        const isEndpoint = endpointMap.get(key(p)) === pair.id;
        if (!isEndpoint) grid[p.y][p.x] = null;
        else grid[p.y][p.x] = pair.id;
      }
    }

    grid[target.y][target.x] = targetPrev;
    return false;
  }

  // Try solving; simple ordering
  if (solvePair(0)) return solution;
  return null;
}
