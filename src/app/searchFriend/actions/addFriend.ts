import { db } from '../../../config';
import { Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';

type Props = {
  currentUserId?: string;
  friendId: string;
  accountId: string;
}

export default async function addFriend({ currentUserId, friendId, accountId }: Props) {

  try {
    const ref = collection(db, `users/${currentUserId}/friends`);
    await addDoc(ref, {
      friendId: friendId,
      accountId: accountId,
      notifyOnDiary: true,
      showDiary: true,
      status: 'pending',
      createdAt: Timestamp.fromDate(new Date()),
    })
    Alert.alert('友人を追加しました');
    router.push('/(tabs)/myPage');

  }catch (error) {
    console.log('error', error);
    Alert.alert('友人の追加に失敗しました');
  }
}