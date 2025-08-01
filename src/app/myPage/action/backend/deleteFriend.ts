import { Alert } from 'react-native';
import { db } from '../../../../config';
import { doc, deleteDoc } from 'firebase/firestore';

export default async function deleteFriend(
  userId: string,
  friendId: string,
  friendUsersId: string,
  friendDocumentId: string | null,
  onFriendDeleted: (friendId: string) => void
) {
  if (userId === null || friendId === null || friendUsersId === null || friendDocumentId === null) return;
  try {
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    const currentUserRef = doc(db, `users/${friendUsersId}/friends/${friendDocumentId}`);
    await deleteDoc(friendRef);
    await deleteDoc(currentUserRef);
    console.log('友人を削除しました');
    Alert.alert('削除完了', '友人を削除しました');
    onFriendDeleted(friendId);
  } catch (error) {
    console.error('友人の削除に失敗しました:', error);
    Alert.alert('エラー', '友人の削除に失敗しました。');
  }
}