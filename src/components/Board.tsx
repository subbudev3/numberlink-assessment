import React from 'react';
import { View, StyleSheet } from 'react-native';
import Cell from './Cell';
import type { Level } from '../game/types';

type Props = {
  level: Level;
  grid: (number | null)[][];
  onCellPress?: (x: number, y: number) => void;
  onTouchEnd?: () => void;
  cellSize?: number;
};

const COLORS = ['#000000', '#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'];

const Board: React.FC<Props> = ({ level, grid, onCellPress, onTouchEnd, cellSize }) => {
  const rows = Array.from({ length: level.height }, (_, y) =>
    Array.from({ length: level.width }, (_, x) => ({ x, y }))
  );

  // determine endpoints
  const endpointSet = new Set<string>();
  for (const p of level.pairs) {
    endpointSet.add(`${p.a.x},${p.a.y}`);
    endpointSet.add(`${p.b.x},${p.b.y}`);
  }
  return (
    <View
      style={[styles.container, { width: (cellSize ?? 64) * level.width, height: (cellSize ?? 64) * level.height }]}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => {
        const loc = e.nativeEvent.locationX;
        const locY = e.nativeEvent.locationY;
        const x = Math.floor(loc / (cellSize ?? 64));
        const y = Math.floor(locY / (cellSize ?? 64));
        if (onCellPress && x >= 0 && x < level.width && y >= 0 && y < level.height) onCellPress(x, y);
      }}
      onResponderMove={(e) => {
        const loc = e.nativeEvent.locationX;
        const locY = e.nativeEvent.locationY;
        const x = Math.floor(loc / (cellSize ?? 64));
        const y = Math.floor(locY / (cellSize ?? 64));
        if (onCellPress && x >= 0 && x < level.width && y >= 0 && y < level.height) onCellPress(x, y);
      }}
      onResponderRelease={() => {
        if (onTouchEnd) onTouchEnd();
      }}
    >
      {rows.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((cell) => {
            const id = grid[y][cell.x];
            const color = id ? COLORS[id % COLORS.length] : null;
            const isEndpoint = endpointSet.has(`${cell.x},${cell.y}`);
            return (
              <Cell
                key={`${cell.x}-${cell.y}`}
                value={isEndpoint ? id : undefined}
                color={color}
                isEndpoint={isEndpoint}
                onPress={() => onCellPress && onCellPress(cell.x, cell.y)}
                style={{ width: cellSize ?? 64, height: cellSize ?? 64 }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  row: { flexDirection: 'row' },
});

export default Board;
