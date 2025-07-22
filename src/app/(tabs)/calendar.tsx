import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import {Calendar} from 'react-native-calendars';

export default function calendar() {
  // 例として、日記データがあると仮定
const diaryEntries = ['2024-05-10', '2024-05-22', '2024-06-05'];

  const marked = useMemo(() => {
    const markedDates: { [key: string]: { marked: boolean; dotColor: string } } = {};
    diaryEntries.forEach(date => {
      markedDates[date] = { marked: true, dotColor: 'red' };
    });
    return markedDates;
  }, [diaryEntries]);

  return (
    <View style={styles.container}>
      <Calendar
        // ここに様々なプロパティを追加していきます
        markedDates={marked}
      />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})