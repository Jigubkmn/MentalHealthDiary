import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Header from '../mentalHealthCheck/list/components/Header';
import PlusIcon from '../components/Icon/PlusIcon';
import { useRouter } from 'expo-router';
import { auth } from '../../config';
import dayjs from 'dayjs';
import { MentalHealthCheckType } from '../../../type/mentalHealthCheck';
import fetchMentalHealthChecks from '../mentalHealthCheck/list/actions/backend/fetchMentalHealthChecks';
import YearMonthSelectModal from '../components/YearMonthSelectModal';
import TableHeader from '../mentalHealthCheck/list/components/TableHeader';
import TableBody from '../mentalHealthCheck/list/components/TableBody';

export default function mentalHealthCheckList() {
  const userId = auth.currentUser?.uid
  const router = useRouter();
  const [mentalHealthCheckLists, setMentalHealthCheckLists] = useState<MentalHealthCheckType[]>([]);
    // モーダルの表示状態を管理
    const [isModalVisible, setModalVisible] = useState(false);
    // 表示用の年月を管理する
    const [displayDate, setDisplayDate] = useState(dayjs());
    // 選択された年月を'YYYY-M'形式の文字列で保持する
    const [selectedYearMonth, setSelectedYearMonth] = useState(displayDate.format('YYYY-M'));

  useEffect(() => {
    if (userId === null) return;
    // 選択された月の開始日時と終了日時（翌月の開始日時）を計算
    const startOfMonth = displayDate.startOf('month');
    const endOfMonth = displayDate.add(1, 'month').startOf('month');
    // 選択されたユーザーの日記一覧を取得
    const unsubscribe = fetchMentalHealthChecks(setMentalHealthCheckLists, startOfMonth, endOfMonth, userId);
    return unsubscribe;
  }, [displayDate, userId])

  const handlePressDetail = (mentalHealthCheckId: string) => {
    router.push({
      pathname: `/mentalHealthCheck/show/mentalHealthCheckShow`,
      params: {
        mentalHealthCheckId: mentalHealthCheckId,
      }
    });
  };

  const handleYearMonthPress = () => {
    // モーダルを開くときに、現在の表示年月をピッカーの初期値に設定する
    setSelectedYearMonth(displayDate.format('YYYY-M'));
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {/* 年月 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity onPress={handleYearMonthPress}>
          <Text style={styles.yearMonthText}>{displayDate.format('YYYY年M月')} ↓</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableContainer}>
        <ScrollView>
          <TableHeader />
          {mentalHealthCheckLists.map((mentalHealthCheck) => {
            // 評価に応じて文字色を変えるためのスタイルを決定
            const evaluationStyle =
              mentalHealthCheck.evaluation === '要治療'
                ? styles.evaluationCritical
                : mentalHealthCheck.evaluation === '要経過観察'
                ? styles.evaluationWarning
                : styles.evaluationNormal;

            return (
              <TableBody
                key={mentalHealthCheck.id}
                id={mentalHealthCheck.id}
                createdAt={mentalHealthCheck.createdAt}
                evaluationStyle={evaluationStyle}
                evaluation={mentalHealthCheck.evaluation}
                scoreA={mentalHealthCheck.scoreA}
                scoreB={mentalHealthCheck.scoreB}
                handlePressDetail={handlePressDetail}
              />
            );
          })}
        </ScrollView>
      </View>
      {/* 日記作成ボタン */}
      <TouchableOpacity style={styles.plusButton} onPress={() => router.push(
        '/mentalHealthCheck/creation/mentalHealthCheckCreate'
      )}>
        <PlusIcon width={30} height={30} color="white" />
      </TouchableOpacity>
      {/* 年月選択モーダル */}
      <YearMonthSelectModal
        setModalVisible={setModalVisible}
        setDisplayDate={setDisplayDate}
        selectedYearMonth={selectedYearMonth}
        setSelectedYearMonth={setSelectedYearMonth}
        isModalVisible={isModalVisible}
      />
    </SafeAreaView>
  );
}

// --- スタイル定義 (変更なし) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  yearMonthContainer: {
    backgroundColor: '#ffffff',
  },
  yearMonthText: {
    fontSize: 20,
    lineHeight: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  evaluationCritical: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
  evaluationWarning: {
    color: '#f0ad4e',
  },
  evaluationNormal: {
    color: '#5cb85c',
  },
  plusButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    backgroundColor: '#FFA500',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});