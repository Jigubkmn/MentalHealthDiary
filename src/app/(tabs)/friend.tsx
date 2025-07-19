import React, { useEffect, useState } from 'react'
import { auth } from '../../config';
import { collection, collectionGroup, query, getDocs } from 'firebase/firestore';
import { db } from '../../config';
import { View, Text } from 'react-native';

// Firestoreから取得する友人データの型
type FriendData = {
  friendUsersId: string;
  friendUserInfoId: string;
  friendId: string;
  notifyOnDiary: boolean;
  showDiary: boolean;
  status: string;
  userImage: string;
  userName: string;
}

export default function test() {
  const userId = auth.currentUser?.uid;
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchFriends = async () => {
        try {
          setLoading(true);
          // 1. ログインユーザーの友人リストを取得
          const friendsRef = collection(db, `users/${userId}/friends`);
          const friendsQuery = query(friendsRef);
          const friendsSnapshot = await getDocs(friendsQuery);

          const friendsData: FriendData[] = [];
          for (const friendDoc of friendsSnapshot.docs) {
            const friendData = friendDoc.data();
            const friendUserInfoId = friendData.friendId; // userInfoドキュメントのID
            const usersRef = collectionGroup(db, 'userInfo');
            const q = query(usersRef);
            const querySnapshot = await getDocs(q);

            // friendIdと一致するuserInfoドキュメントを検索
            let userInfoData = null;
            let friendUsersId = null;
            for (const doc of querySnapshot.docs) {
              if (doc.id === friendUserInfoId) {
                userInfoData = doc.data();
                friendUsersId = doc.ref.parent.parent?.id; // usersコレクションのドキュメントID
                break;
              }
            }

            if (userInfoData) {
              // データをまとめてオブジェクトに
              const friendInfo: FriendData = {
                friendUsersId: friendUsersId || '',
                friendUserInfoId: friendUserInfoId,
                friendId: friendDoc.id,
                status: friendData.status,
                notifyOnDiary: friendData.notifyOnDiary,
                showDiary: friendData.showDiary,
                userImage: userInfoData.userImage || '',
                userName: userInfoData.userName || '',
              };
              friendsData.push(friendInfo);
            }
          }

          setFriends(friendsData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
      fetchFriends();
    }
  }, [userId]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        テストページ - ユーザー情報取得
      </Text>
      {loading ? (
        <Text>読み込み中...</Text>
      ) : (
        <View>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            userId: {userId || '未ログイン'}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            友人数: {friends.length}人
          </Text>
          {friends.map((friend, index) => (
            <View key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0' }}>
              <Text>ユーザー名: {friend.userName || '未設定'}</Text>
              <Text>friendUsersId: {friend.friendUsersId}</Text>
              <Text>friendUserInfoId: {friend.friendUserInfoId}</Text>
              <Text>ステータス: {friend.status}</Text>
              <Text>通知設定: {friend.notifyOnDiary ? 'ON' : 'OFF'}</Text>
              <Text>日記表示: {friend.showDiary ? 'ON' : 'OFF'}</Text>
              <Text>ユーザー画像: {friend.userImage || '未設定'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
