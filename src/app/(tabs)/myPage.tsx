import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import Header from '../myPage/components/Header'
import { router } from 'expo-router';
import { UserInfoType } from '../../../type/userInfo'
import { FriendInfoType } from '../../../type/friend'
import FriendInfo from '../myPage/components/FriendInfo';
import UserInfo from '../myPage/components/UserInfo';
import fetchUserInfo from '../actions/fetchUserInfo';
import Divider from '../components/Divider';
import { useFriends } from '../../contexts/FriendContext';

export default function myPage() {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null)
  const { friends, userId } = useFriends();
  const [friendsData, setFriendsData] = useState<FriendInfoType[]>(friends)

  useEffect(() => {
    // ユーザー情報取得
    if (userId === null) return;

    const unsubscribe = fetchUserInfo({
      userId,
      setUserInfo,
    });

    return unsubscribe;
  }, [userId])

  // FriendContextのfriendsが更新された時にfriendsDataも更新
  useEffect(() => {
    setFriendsData(friends);
  }, [friends]);

  // 友人削除後にstateを更新するコールバック関数
  const handleFriendDeleted = (deletedFriendId: string) => {
    setFriendsData(currentFriends =>
      currentFriends.filter(friend => friend.friendId !== deletedFriendId)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header currentAccountId={userInfo?.accountId} userId={userId} />
      <ScrollView style={styles.bodyContainer}>
        {/* ログインユーザー情報 */}
        <UserInfo
          userInfo={userInfo}
          userId={userId}
        />
        {/* 友人一覧 */}
        <View style={styles.friendListContainer}>
          <Text style={styles.friendListTitle}>友人一覧</Text>
          <View style={styles.friendListWrapper}>
            {/* 友人一覧 */}
            <View style={styles.friendListInfoContainer}>
              {friendsData.length > 0 ? (
                friendsData.map((friendData) => (
                  <FriendInfo
                    key={friendData.friendId}
                    friendData={friendData}
                    userId={userId || ''}
                    onFriendDeleted={handleFriendDeleted}
                  />
                ))
              ) : (
                <>
                <View style={styles.noFriendContainer}>
                  <Text style={styles.noFriendText}>友人がいません。</Text>
                  <Text style={styles.noFriendText}>友人を登録して下さい。</Text>
                </View>
                <Divider />
                </>
              )}
            </View>
            {/* 友人を登録 */}
            <TouchableOpacity
              onPress={() => {router.push({
                pathname: '/searchFriend/searchFriend',
                params: {
                  currentAccountId: userInfo?.accountId,
                  userId: userId,
                }})}}
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
  noFriendContainer: {
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  noFriendText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
})