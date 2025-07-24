import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Header from '../diary/list/components/Header';
import { auth } from '../../config';
import dayjs from 'dayjs';
import YearMonthSelectModal from '../diary/list/components/YearMonthSelectModal';
import fetchFeelingScore from '../analysis/actions/backend/fetchFeelingScore';
import { FeelingScoreType } from '../../../type/feelingScore';
import { UserInfoType } from '../../../type/userInfo';
import fetchUserInfo from '../actions/fetchUserInfo';
import fetchFriends from '../actions/backend/fetchFriends';
import { FriendInfoType } from '../../../type/friend';
import FeelingScoreGraph from '../analysis/components/FeelingScoreGraph';

export default function analysis() {
  const userId = auth.currentUser?.uid
  const [feelingScoreDates, setFeelingScoreDates] = useState<FeelingScoreType[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null)  // ログイン情報
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfoType | null>(null) // 日記を表示しているユーザー情報
  const [friendsData, setFriendsData] = useState<FriendInfoType[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('') // 日記を表示しているユーザーID
  // モーダルの表示状態を管理
  const [isModalVisible, setModalVisible] = useState(false);
  // 表示用の年月を管理する
  const [displayDate, setDisplayDate] = useState(dayjs());
  // 選択された年月を'YYYY-M'形式の文字列で保持する
  const [selectedYearMonth, setSelectedYearMonth] = useState(displayDate.format('YYYY-M'));

  // selectedUserIdの初期化
  useEffect(() => {
    if (userId && !selectedUserId) {
      setSelectedUserId(userId);
    }
  }, [userId, selectedUserId]);

  // 日記を表示しているユーザー情報を取得
  useEffect(() => {
    if (userId === null || !selectedUserId) return;
    const unsubscribe = fetchUserInfo({
      userId: selectedUserId,
      setUserInfo: setSelectedUserInfo,
    });
    fetchFriends(setFriendsData, userId);
    return unsubscribe;
  }, [selectedUserId])

  // ログインユーザー情報を取得
  useEffect(() => {
    if (userId === null) return;
    const unsubscribe = fetchUserInfo({
      userId,
      setUserInfo,
    });
    fetchFriends(setFriendsData, userId);
    return unsubscribe;
  }, [userId])

  useEffect(() => {
      if (!userId) return;
      const startOfMonth = displayDate.startOf('month');
      const endOfMonth = displayDate.add(1, 'month').startOf('month');
      const unsubscribe = fetchFeelingScore(
        selectedUserId,
        setFeelingScoreDates,
        startOfMonth,
        endOfMonth,
      );
      return unsubscribe;
    }, [displayDate, selectedUserId])

  // X軸の全日付ラベルを生成 ('7/1', '7/2', ..., '7/31')
  const allDaysInMonth = useMemo(() => {
    return Array.from({ length: displayDate.daysInMonth() }, (_, i) =>
      displayDate.date(i + 1).format('M/D')
    );
  }, [displayDate])

  // グラフ用のデータを生成
  const chartDataValues = allDaysInMonth.map(label => {
    const dataPoint = feelingScoreDates.find(d => d.date === label);
    return dataPoint ? dataPoint.value : null;
  });

  // 描画可能なデータがあるか判定
  const hasDataToRender = useMemo(() => {
    // chartDataValues の中に一つでも null でない値があれば true
    return chartDataValues.some(value => value !== null);
  }, [chartDataValues]);

  // モーダルを開くときに、現在の表示年月をピッカーの初期値に設定する
  const handleYearMonthPress = () => {
    setSelectedYearMonth(displayDate.format('YYYY-M'));
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <Header
        title="分析レポート"
        userInfo={userInfo}
        selectedUserInfo={selectedUserInfo}
        friendsData={friendsData}
        setSelectedUserId={setSelectedUserId}
      />
      {/* 年月 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity onPress={handleYearMonthPress}>
          <Text style={styles.yearMonthText}>{displayDate.format('YYYY年M月')} ↓</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {/* グラフ表示 */}
        {hasDataToRender ? (
          <FeelingScoreGraph allDaysInMonth={allDaysInMonth} chartDataValues={chartDataValues} />
        ): (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>データがありません</Text>
          </View>
        )}
      </View>
      {/* 年月選択モーダル */}
      <YearMonthSelectModal
        setModalVisible={setModalVisible}
        setDisplayDate={setDisplayDate}
        selectedYearMonth={selectedYearMonth}
        setSelectedYearMonth={setSelectedYearMonth}
        isModalVisible={isModalVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // アイコンとグラフの上端を合わせる
    justifyContent: 'flex-start', // 左寄せ
    position: 'relative', // 絶対配置の基準点
  },
  noDataContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  }
});