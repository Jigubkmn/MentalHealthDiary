import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import Header from '../myPage/components/Header'
import DiaryShareInfo from '../myPage/components/DiaryShareInfo'
import { auth } from '../../config';
import { router } from 'expo-router';
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
        {/* 友人一覧 */}
        <View style={styles.friendListContainer}>
          <Text style={styles.friendListTitle}>友人一覧</Text>
          <View style={styles.friendListWrapper}>
            {/* 友人一覧 */}
            <View style={styles.friendListInfoContainer}>
              <DiaryShareInfo />
              <DiaryShareInfo />
              <DiaryShareInfo />
            </View>
            {/* 友人を登録 */}
            <TouchableOpacity
              onPress={() => {router.push('/searchFriend/searchFriend')}}
              style={styles.addFriendButton}
            >
              <Text style={styles.buttonText}>友人を登録</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  friendListContainer: {
    flex: 1,
    marginVertical: 16,
  },
  friendListTitle: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
    marginLeft: 8
  },
  friendListWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  friendListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  friendAddComment: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  friendListInfoContainer: {
    borderRadius: 10,
  },
  addFriendButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA500',
    borderRadius: 10,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})