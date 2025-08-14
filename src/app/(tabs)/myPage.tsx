import React, { useState, useCallback } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'
import Header from '../myPage/components/Header'
import { router, useFocusEffect } from 'expo-router';
import { auth } from '../../config';
import { UserInfoType } from '../../../type/userInfo'
import { FriendInfoType } from '../../../type/friend'
import FriendInfo from '../myPage/components/FriendInfo';
import UserInfo from '../myPage/components/UserInfo';
import fetchUserInfo from '../actions/backend/fetchUserInfo';
import Divider from '../components/Divider';
import fetchFriendList from '../myPage/action/backend/fetchFriendList';
import userLogout from '../myPage/action/backend/userLogout';
import ConfirmationUserDeleteModal from '../myPage/components/ConfirmationUserDeleteModal';
import { onAuthStateChanged } from 'firebase/auth';

export default function myPage() {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null)
  const [friendsData, setFriendsData] = useState<FriendInfoType[]>([])
  const userId = auth.currentUser?.uid;

  // タブがフォーカスされたときのみ実行
  useFocusEffect(
    useCallback(() => {

      let userInfoUnsubscribe: (() => void) | null = null;
      let friendListUnsubscribe: (() => void) | null = null;

      // 認証状態監視
      const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.uid) {
          // ログイン中：ユーザー情報とフレンドリストを監視
          userInfoUnsubscribe = fetchUserInfo({
            userId: user.uid,
            setUserInfo,
          });
          friendListUnsubscribe = fetchFriendList(user.uid, setFriendsData);
        } else {
          // ログアウト時：すべてのリスナーをクリーンアップ
          if (userInfoUnsubscribe) {
            userInfoUnsubscribe();
            userInfoUnsubscribe = null;
          }
          if (friendListUnsubscribe) {
            friendListUnsubscribe();
            friendListUnsubscribe = null;
          }
          // データをクリア
          setUserInfo(null);
          setFriendsData([]);
        }
      });

      return () => {
        // タブがアンフォーカスされたときのクリーンアップ
        if (userInfoUnsubscribe) userInfoUnsubscribe();
        if (friendListUnsubscribe) friendListUnsubscribe();
        authUnsubscribe();
      };
    }, [])
  );

  // 友人削除後にstateを更新するコールバック関数
  const handleFriendDeleted = (deletedFriendId: string) => {
    setFriendsData(currentFriends =>
      currentFriends.filter(friend => friend.friendId !== deletedFriendId)
    );
  };

  // お問い合わせフォームを開く関数
  const handleContactPress = () => {
    const inquiryUrl = `https://forms.gle/W2vZjxfpzcxbpfHt9`;

    Linking.openURL(inquiryUrl).catch(() => {
      Alert.alert(
        'メールアプリが見つかりません',
        'メールアプリがインストールされていないか、設定されていません。\n\n直接以下のメールアドレスにお問い合わせください：\nbkmn.31519@gmail.com'
      );
    });
  };

  // プライバシーポリシーページを開く関数
  const handlePrivacyPolicyPress = () => {
    const privacyPolicyUrl = 'https://jigubkmn.github.io/privacyPolicy/';

    Linking.openURL(privacyPolicyUrl).catch(() => {
      Alert.alert(
        'ページを開けませんでした',
        'ブラウザでページを開くことができませんでした。しばらく時間をおいてから再度お試しください。'
      );
    });
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
        {/* お問い合わせフォームのリンク */}
        <TouchableOpacity
          onPress={handleContactPress}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>お問い合わせ</Text>
        </TouchableOpacity>
        {/* プライバシーポリシーページへのリンク */}
        <TouchableOpacity
          onPress={handlePrivacyPolicyPress}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>プライバシーポリシー</Text>
        </TouchableOpacity>
        {/* ログアウト */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {userLogout();}}>
          <Text style={styles.buttonText}>ログアウト</Text>
        </TouchableOpacity>
        {/* アカウント削除 */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={() => {ConfirmationUserDeleteModal()}}>
          <Text style={styles.buttonText}>アカウント削除</Text>
        </TouchableOpacity>
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
  linkContainer: {
    marginBottom: 16,
  },
  linkButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#333333',
    fontWeight: '500',
  },
  logoutButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(141, 141, 141, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#ffffff',
    fontWeight: '500',
  },
  deleteAccountButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 8,
  },
})