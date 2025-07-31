import React from 'react'
import { View, Text, StyleSheet } from 'react-native';

export default function TableHeader() {
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.dateCell]}>日付</Text>
      <Text style={[styles.headerCell, styles.evaluationCell]}>評価</Text>
      <Text style={[styles.headerCell, styles.scoreCell]}>スコア</Text>
      <View style={[styles.headerCell, styles.buttonCell]} />
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  dateCell: {
    flex: 3,
  },
  evaluationCell: {
    flex: 3.5,
  },
  scoreCell: {
    flex: 3,
  },
  buttonCell: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});