import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  value?: number | null;
  onPress?: () => void;
  style?: ViewStyle;
  color?: string | null;
  isEndpoint?: boolean;
};

const Cell: React.FC<Props> = ({ value, onPress, style, color, isEndpoint }) => {
  const background = color ? (isEndpoint ? color : `${color}cc`) : 'transparent';
  return (
    <TouchableOpacity
      style={[styles.cell, style, { backgroundColor: background, borderColor: color ?? '#ccc' }]}
      onPress={onPress}
    >
      {isEndpoint ? <Text style={[styles.text, styles.endpointText]}>{value ?? ''}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  text: { fontSize: 18 },
  endpointText: { color: '#fff', fontWeight: '700' },
});

export default Cell;
