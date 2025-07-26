import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';

type Props = {
  id: string;
  createdAt: dayjs.Dayjs;
  evaluationStyle: {
    color: string;
  };
  evaluation: string;
  scoreA: number;
  scoreB: number;
  handlePressDetail: (id: string) => void;
}

export default function TableBody({id, createdAt, evaluationStyle, evaluation, scoreA, scoreB, handlePressDetail}: Props) {
  return (
    <View key={id} style={styles.dataRow}>
      <Text style={[styles.dataCell, styles.dateCell]}>{createdAt.format('YYYY/MM/DD')}</Text>
      <Text style={[styles.dataCell, styles.evaluationCell, evaluationStyle]}>
        {evaluation}
      </Text>
      <Text style={[styles.dataCell, styles.scoreCell]}>
        {`スコアA: ${scoreA}\nスコアB: ${scoreB}`}
      </Text>
      <View style={[styles.dataCell, styles.buttonCell]}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handlePressDetail(id)}
        >
          <Text style={styles.detailButtonText}>詳細</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dataCell: {
    padding: 12,
    textAlign: 'center',
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
  detailButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  detailButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});