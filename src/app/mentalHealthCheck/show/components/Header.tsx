import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import BackButton from '../../../components/button/BackButton';
import dayjs from 'dayjs';

type Props = {
  createdAt?: dayjs.Dayjs;
}

export default function Header({ createdAt }: Props) {
  const formattedDate = createdAt?.format('YYYY/MM/DD');
  return (
    <View style={styles.header}>
      {/* ヘッダー左側 */}
      <View style={styles.headerLeft}>
        <BackButton />
      </View>
      {/* 日付タイトル */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerDate}>{formattedDate}</Text>
      </View>
      {/* ヘッダー右側 */}
      <View style={styles.headerRight}>
        {/* 右側のスペーサー */}
      </View>
      </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 60,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    width: 60
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDate: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 60
  },
});