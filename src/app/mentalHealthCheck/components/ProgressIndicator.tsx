import React from 'react'
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  currentPage: number;
  totalPages: number;
  }

export default function ProgressIndicator({ currentPage, totalPages }: Props) {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        ページ {currentPage + 1} / {totalPages}
      </Text>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentPage + 1) / totalPages) * 100}%` },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 4,
  },
});