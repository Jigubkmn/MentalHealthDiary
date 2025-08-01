import { db } from '../../../config';
import { Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';

type Props = {
  userId?: string;
  friendUsersId: string;
  accountId: string;
  currentUserInfosId?: string;
  currentAccountId?: string;
  friendUserInfosId: string | null;
}

export default async function addFriend({ userId, friendUsersId, accountId, currentAccountId, friendUserInfosId }: Props) {
  if (!userId || !friendUsersId || !accountId || !currentAccountId || !friendUserInfosId) {
    return;
  }

  try {
    const currentUserRef = collection(db, `users/${userId}/friends`);
    const friendRef = collection(db, `users/${friendUsersId}/friends`);
    // ログインユーザーのfriendsコレクションに友人を追加
    await addDoc(currentUserRef, {
      friendId: friendUserInfosId,
      accountId: accountId,
      blocked: false,
      showDiary: true,
      status: 'pending',
      createdAt: Timestamp.fromDate(new Date()),
    });
    // 友人のfriendsコレクションにログインユーザーを追加
    await addDoc(friendRef, {
      friendId: userId,
      accountId: currentAccountId,
      blocked: false,
      showDiary: true,
      status: 'awaitingApproval',
      createdAt: Timestamp.fromDate(new Date()),
    });

    Alert.alert('友人を追加しました');
    router.push('/(tabs)/myPage');

  }catch (error) {
    console.log('error', error);
    Alert.alert('友人の追加に失敗しました');
  }
}