import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import Board from '../components/Board';
import Controls from '../components/Controls';
import { solveLevel } from '../game/solver';
import type { Level, Point } from '../game/types';
import { generateLevel } from '../game/generator';

const directions = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

type DrawingState = {
  id: number;
  path: Point[];
  existing?: boolean;
};

const GameScreen: React.FC = () => {
  const level = useMemo(() => generateLevel({ size: 5, difficulty: 'easy' }), []);
  const [grid, setGrid] = useState<(number | null)[][]>(() => createInitialBoard(level));
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  function createInitialBoard(level: Level) {
    const board: (number | null)[][] = Array.from({ length: level.height }, () =>
      Array.from({ length: level.width }, () => null)
    );

    for (const pair of level.pairs) {
      board[pair.a.y][pair.a.x] = pair.id;
      board[pair.b.y][pair.b.x] = pair.id;
    }

    return board;
  }

  function cloneBoard(boardToClone: (number | null)[][]) {
    return boardToClone.map((row) => row.slice());
  }

  function getAdjacentCellsWithSameId(
    x: number,
    y: number,
    id: number,
    board: (number | null)[][]
  ) {
    const result: Point[] = [];

    for (const direction of directions) {
      const nx = x + direction.x;
      const ny = y + direction.y;

      if (nx < 0 || ny < 0 || ny >= board.length || nx >= board[0].length) {
        continue;
      }

      if (board[ny][nx] === id) {
        result.push({ x: nx, y: ny });
      }
    }

    return result;
  }

  function removeExistingPathCells(board: (number | null)[][], id: number) {
    const nextBoard = cloneBoard(board);
    const pair = level.pairs.find((item) => item.id === id);

    if (!pair) return nextBoard;

    const endpoints = new Set([`${pair.a.x},${pair.a.y}`, `${pair.b.x},${pair.b.y}`]);

    for (let row = 0; row < nextBoard.length; row += 1) {
      for (let col = 0; col < nextBoard[row].length; col += 1) {
        if (nextBoard[row][col] === id && !endpoints.has(`${col},${row}`)) {
          nextBoard[row][col] = null;
        }
      }
    }

    return nextBoard;
  }

  function buildSolutionBoard(solution: Point[][]) {
    const boardSolution: number[][] = Array.from({ length: level.height }, () =>
      Array.from({ length: level.width }, () => -1)
    );

    for (let i = 0; i < solution.length; i += 1) {
      for (const point of solution[i]) {
        boardSolution[point.y][point.x] = level.pairs[i].id;
      }
    }

    return boardSolution;
  }

  function doesBoardConflictWithSolution(
    board: (number | null)[][],
    solutionBoard: number[][]
  ) {
    for (let row = 0; row < level.height; row += 1) {
      for (let col = 0; col < level.width; col += 1) {
        const value = board[row][col];
        if (value !== null && value !== solutionBoard[row][col]) {
          return true;
        }
      }
    }

    return false;
  }

  function findNextHintCell(
    board: (number | null)[][],
    solutionBoard: number[][]
  ) {
    for (let row = 0; row < level.height; row += 1) {
      for (let col = 0; col < level.width; col += 1) {
        if (board[row][col] === null) {
          const id = solutionBoard[row][col];
          if (id >= 0) {
            return { x: col, y: row, id };
          }
        }
      }
    }

    return null;
  }

  function findPairForEndpoint(x: number, y: number) {
    return level.pairs.find(
      (pair) =>
        (pair.a.x === x && pair.a.y === y) ||
        (pair.b.x === x && pair.b.y === y)
    );
  }

  function isWinningBoard(board: (number | null)[][]) {
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        if (board[row][col] === null) {
          return false;
        }
      }
    }

    for (const pair of level.pairs) {
      const id = pair.id;

      if (board[pair.a.y][pair.a.x] !== id || board[pair.b.y][pair.b.x] !== id) {
        return false;
      }

      const pairCells: Point[] = [];
      for (let row = 0; row < board.length; row += 1) {
        for (let col = 0; col < board[row].length; col += 1) {
          if (board[row][col] === id) {
            pairCells.push({ x: col, y: row });
          }
        }
      }

      if (pairCells.length < 2) {
        return false;
      }

      const visited = new Set<string>();
      const queue: Point[] = [{ x: pair.a.x, y: pair.a.y }];
      visited.add(`${pair.a.x},${pair.a.y}`);

      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of getAdjacentCellsWithSameId(current.x, current.y, id, board)) {
          const key = `${neighbor.x},${neighbor.y}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push(neighbor);
          }
        }
      }

      if (visited.size !== pairCells.length) {
        return false;
      }

      for (const cell of pairCells) {
        const adjacentCount = getAdjacentCellsWithSameId(cell.x, cell.y, id, board).length;
        const isEndpoint =
          (cell.x === pair.a.x && cell.y === pair.a.y) ||
          (cell.x === pair.b.x && cell.y === pair.b.y);

        if (isEndpoint) {
          if (adjacentCount !== 1) return false;
        } else if (adjacentCount !== 2) {
          return false;
        }
      }
    }

    return true;
  }

  const handleReset = () => {
    setGrid(createInitialBoard(level));
    setDrawing(null);
    setElapsed(0);
    setWon(false);
    startRef.current = Date.now();
  };

  const handleHint = () => {
    const solution = solveLevel(level);

    if (!solution) {
      Alert.alert('Hint unavailable', 'This level is unsolvable.');
      return;
    }

    const solutionBoard = buildSolutionBoard(solution);

    if (doesBoardConflictWithSolution(grid, solutionBoard)) {
      Alert.alert('Hint unavailable', 'Reset the board and try again.');
      return;
    }

    const hintCell = findNextHintCell(grid, solutionBoard);

    if (!hintCell) {
      Alert.alert('Hint unavailable', 'No hint available.');
      return;
    }

    const nextBoard = cloneBoard(grid);
    nextBoard[hintCell.y][hintCell.x] = hintCell.id;
    setGrid(nextBoard);
  };

  const handleCellPress = (x: number, y: number) => {
    const endpointPair = findPairForEndpoint(x, y);

    if (!drawing) {
      if (!endpointPair) return;

      const hasPathCells = grid.some((row, rowIndex) =>
        row.some(
          (value, colIndex) =>
            value === endpointPair.id &&
            !(endpointPair.a.x === colIndex && endpointPair.a.y === rowIndex) &&
            !(endpointPair.b.x === colIndex && endpointPair.b.y === rowIndex)
        )
      );

      setDrawing({ id: endpointPair.id, path: [{ x, y }], existing: hasPathCells });
      return;
    }

    const currentDrawing = drawing;
    const lastPoint = currentDrawing.path[currentDrawing.path.length - 1];
    const dx = Math.abs(lastPoint.x - x);
    const dy = Math.abs(lastPoint.y - y);

    if (dx + dy !== 1) {
      if (endpointPair) {
        const hasPathCells = grid.some((row, rowIndex) =>
          row.some(
            (value, colIndex) =>
              value === endpointPair.id &&
              !(endpointPair.a.x === colIndex && endpointPair.a.y === rowIndex) &&
              !(endpointPair.b.x === colIndex && endpointPair.b.y === rowIndex)
          )
        );

        setDrawing({ id: endpointPair.id, path: [{ x, y }], existing: hasPathCells });
      }
      return;
    }

    const cellValue = grid[y][x];

    if (currentDrawing.path.length >= 2) {
      const previous = currentDrawing.path[currentDrawing.path.length - 2];
      if (previous.x === x && previous.y === y) {
        const nextGrid = cloneBoard(grid);
        const lastCell = currentDrawing.path[currentDrawing.path.length - 1];
        const isEndpoint = level.pairs.some(
          (pair) =>
            (pair.a.x === lastCell.x && pair.a.y === lastCell.y) ||
            (pair.b.x === lastCell.x && pair.b.y === lastCell.y)
        );

        if (!isEndpoint) {
          nextGrid[lastCell.y][lastCell.x] = null;
        }

        setGrid(nextGrid);
        setDrawing({ id: currentDrawing.id, path: currentDrawing.path.slice(0, -1) });
        return;
      }
    }

    if (cellValue !== null && cellValue !== currentDrawing.id) {
      return;
    }

    if (currentDrawing.existing && cellValue === null) {
      setGrid(removeExistingPathCells(grid, currentDrawing.id));
      setDrawing({ ...currentDrawing, existing: false });
    }

    const nextBoard = cloneBoard(grid);
    nextBoard[y][x] = currentDrawing.id;
    setGrid(nextBoard);

    const nextPath = currentDrawing.path.concat([{ x, y }]);
    const pair = level.pairs.find((item) => item.id === currentDrawing.id)!;
    const isTarget =
      (pair.a.x === x && pair.a.y === y) ||
      (pair.b.x === x && pair.b.y === y);

    if (isTarget) {
      setDrawing(null);

      const isBoardFilled = nextBoard.every((row) => row.every((cell) => cell !== null));
      if (isBoardFilled && isWinningBoard(nextBoard)) {
        if (timerRef.current) clearInterval(timerRef.current);
        setWon(true);
        submitScore({ levelId: 1, time: elapsed }).catch(() => {});
      } else if (isBoardFilled) {
        Alert.alert('Incomplete', 'The board is filled but not valid yet.');
      }

      return;
    }

    setDrawing({ id: currentDrawing.id, path: nextPath, existing: currentDrawing.existing });
  };

  useEffect(() => {
    if (won) {
      return;
    }

    if (isWinningBoard(grid)) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDrawing(null);
      setWon(true);
      submitScore({ levelId: 1, time: elapsed }).catch(() => {});
    }
  }, [grid, won]);

  async function submitScore(body: { levelId: number; time: number }) {
    try {
      await fetch('http://localhost:3000/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      // Ignore network errors.
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Numberlink — Level 1</Text>
      <Text style={styles.timer}>Time: {elapsed}s</Text>
      <Board
        level={level}
        grid={grid}
        onCellPress={handleCellPress}
        onTouchEnd={() => setDrawing(null)}
        cellSize={64}
      />
      <Controls onReset={handleReset} onHint={handleHint} />
      {won && (
        <View style={overlayStyles.overlay}>
          <View style={overlayStyles.card}>
            <Text style={overlayStyles.winTitle}>You Win!</Text>
            <Text style={overlayStyles.winText}>Time: {elapsed}s</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  timer: { fontSize: 14, marginBottom: 6 },
});

const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center' },
  winTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  winText: { fontSize: 16 },
});

export default GameScreen;
