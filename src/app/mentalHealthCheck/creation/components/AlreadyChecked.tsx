import React from 'react'
import { View, StyleSheet, Text } from 'react-native';

export default function AlreadyChecked() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageTitle}>本日のチェックは完了しています</Text>
      <Text style={styles.messageBody}>お疲れ様でした。</Text>
      <Text style={styles.messageBody}>次回のメンタルヘルスチェックは明日以降に可能です。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 16,
  },
  messageBody: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24
  },
});