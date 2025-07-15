import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import DiaryList from '../diary/list/components/DiaryList'
import { auth, db } from '../../config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { DiaryType } from '../../../type/diary';
import PlusIcon from '../components/Icon/PlusIcon';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import YearMonthSelectModal from '../diary/list/components/YearMonthSelectModal';
import { UserInfoType } from '../../../type/userInfo';
import fetchUserInfo from '../actions/fetchUserInfo';

export default function home() {
  const [diaryLists, setDiaryLists] = useState<DiaryType[]>([]);
  const [userInfos, setUserInfos] = useState<UserInfoType | null>(null)
  const [userInfoId, setUserInfoId] = useState<string>('')
  const userId = auth.currentUser?.uid
  const router = useRouter();
  console.log("userInfoId", userInfoId)

  // モーダルの表示状態を管理
  const [isModalVisible, setModalVisible] = useState(false);

  // 表示用の年月を管理する
  const [displayDate, setDisplayDate] = useState(dayjs());

  // 選択された年月を'YYYY-M'形式の文字列で保持する
  const [selectedYearMonth, setSelectedYearMonth] = useState(displayDate.format('YYYY-M'));

  useEffect(() => {
    // ユーザー情報取得
    if (userId === null) return;

    const unsubscribe = fetchUserInfo({
      userId,
      setUserInfos,
      setUserInfoId
    });

    return unsubscribe;
  }, [userId])

  useEffect(() => {
    if (userId === null) return;
    // 選択された月の開始日時と終了日時（翌月の開始日時）を計算
    const startOfMonth = displayDate.startOf('month').toDate();
    const endOfMonth = displayDate.add(1, 'month').startOf('month').toDate();

    const ref = collection(db, `users/${userId}/diary`)
    const q = query(ref, orderBy('diaryDate', 'desc'), where('diaryDate', '>=', startOfMonth), where('diaryDate', '<', endOfMonth))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteDiaryList: DiaryType[] = []
      snapshot.docs.forEach((doc) => {
        const { diaryText, diaryDate, feeling, updatedAt, selectedImage } = doc.data();
        remoteDiaryList.push({ id: doc.id, diaryText, diaryDate, feeling, updatedAt, selectedImage })
      })
      setDiaryLists(remoteDiaryList)
    })
    return unsubscribe;
  }, [displayDate])

  const handleYearMonthPress = () => {
    // モーダルを開くときに、現在の表示年月をピッカーの初期値に設定する
    setSelectedYearMonth(displayDate.format('YYYY-M'));
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
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
              userName={userInfos?.userName}
              userImage={userInfos?.userImage}
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
    </View>
  )
}

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