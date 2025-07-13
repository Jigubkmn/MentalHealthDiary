import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import Header from '../myPage/components/Header'
import DiaryShareInfo from '../myPage/components/DiaryShareInfo'
import { auth } from '../../config';
import { UserInfoType } from '../../../type/userInfo'
import UserInfo from '../myPage/components/UserInfo';
import fetchUserInfo from '../actions/fetchUserInfo';

export default function myPage() {
  const [userInfos, setUserInfos] = useState<UserInfoType | null>(null)
  const [userInfoId, setUserInfoId] = useState<string>('')
  const userId = auth.currentUser?.uid

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

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.bodyContainer}>
        {/* ログインユーザー情報 */}
        <UserInfo userInfos={userInfos} userId={userId} userInfoId={userInfoId} />
        <View style={styles.diaryShareContainer}>
          <Text style={styles.diaryShareTitle}>日記共通相手</Text>
          <View style={styles.diaryShareInfoContainer}>
            <DiaryShareInfo />
            <DiaryShareInfo />
            <DiaryShareInfo />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 48,
  },
  diaryShareContainer: {
    flex: 1,
    marginTop: 16,
  },
  diaryShareTitle: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
    marginLeft: 8
  },
  diaryShareInfoContainer: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    width: 350,
  },
})