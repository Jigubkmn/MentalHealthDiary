import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView  } from 'react-native'
import DiaryList from '../diary/list/components/DiaryList'
import { auth } from '../../config';
import { DiaryType } from '../../../type/diary';
import PlusIcon from '../components/Icon/PlusIcon';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import YearMonthSelectModal from '../components/YearMonthSelectModal';
import { UserInfoType } from '../../../type/userInfo';
import fetchUserInfo from '../actions/fetchUserInfo';
import fetchDiaries from '../diary/list/actions/backend/fetchDiaries';
import { FriendInfoType } from '../../../type/friend';
import fetchFriendList from '../myPage/action/backend/fetchFriendList';
import Header from '../diary/list/components/Header';

export default function home() {
  const userId = auth.currentUser?.uid
  const [diaryLists, setDiaryLists] = useState<DiaryType[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null)
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfoType | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>('') // 日記を表示しているユーザーID
  const [friendsData, setFriendsData] = useState<FriendInfoType[]>([])
  const router = useRouter();

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

  useEffect(() => {
    if (userId === null || !selectedUserId) return;
    // 日記を表示しているユーザー情報を取得
    const unsubscribe = fetchUserInfo({
      userId: selectedUserId,
      setUserInfo: setSelectedUserInfo,
    });

    fetchFriends();
    return unsubscribe;
  }, [selectedUserId])

  useEffect(() => {
    if (userId === null) return;
    // ログイン情報取得
    const unsubscribe = fetchUserInfo({
      userId,
      setUserInfo,
    });
    fetchFriends();
    return unsubscribe;
  }, [userId])

  useEffect(() => {
    if (userId === null || !selectedUserId) return;
    // 選択された月の開始日時と終了日時（翌月の開始日時）を計算
    const startOfMonth = displayDate.startOf('month');
    const endOfMonth = displayDate.add(1, 'month').startOf('month');
    // 選択されたユーザーの日記一覧を取得
    const unsubscribe = fetchDiaries(selectedUserId, setDiaryLists, startOfMonth, endOfMonth);
    return unsubscribe;
  }, [displayDate, selectedUserId])

  const handleYearMonthPress = () => {
    // モーダルを開くときに、現在の表示年月をピッカーの初期値に設定する
    setSelectedYearMonth(displayDate.format('YYYY-M'));
    setModalVisible(true);
  }

  const fetchFriends = async () => {
    try {
      const data = await fetchFriendList(userId);
      setFriendsData(data);
      console.log('友人情報の取得に成功しました');
    } catch (error) {
      console.error('友人情報の取得に失敗しました:', error);
      setFriendsData([]);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="日記一覧"
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
      {/* 日記一覧 */}
      <ScrollView style={styles.diaryListContainer}>
        {diaryLists.length > 0 ? diaryLists.map((diaryList) => {
          return (
            <DiaryList
              key={diaryList.id}
              diaryList={diaryList}
              userName={selectedUserInfo?.userName}
              userImage={selectedUserInfo?.userImage}
              selectedUserId={selectedUserId}
            />
          )
        }):
        <Text style={styles.noDiaryText}>日記がありません</Text>
        }
      </ScrollView>
      {/* 日記作成ボタン */}
      <TouchableOpacity style={styles.plusButton} onPress={() => router.push({
          pathname: '/(tabs)/diaryCreation',
          params: {
            isShowBackButton: 'true',
            isTouchFeelingButton: 'true'
          }
        })}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  yearMonthContainer: {
    backgroundColor: '#FFFFFF',
  },
  yearMonthText: {
    fontSize: 20,
    lineHeight: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diaryListContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
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
  noDiaryText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888888',
  },
})