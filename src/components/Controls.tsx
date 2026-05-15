import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

type Props = { onReset?: () => void; onHint?: () => void };

const Controls: React.FC<Props> = ({ onReset, onHint }) => (
  <View style={styles.container}>
    <View style={styles.buttonRow}>
      <Button title="Reset" onPress={onReset} />
      <Button title="Hint" onPress={onHint} />
    </View>
  </View>
);

const styles = StyleSheet.create({ container: { padding: 10 }, buttonRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: 200 } });

export default Controls;
