import React from 'react'
import { auth } from '../../config';
import { View, Text } from 'react-native';
import { useFriends } from '../../contexts/FriendContext';

export default function test() {
  const userId = auth.currentUser?.uid;
  const { friends } = useFriends();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        テストページ - ユーザー情報取得
      </Text>
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
    </View>
  )
}
