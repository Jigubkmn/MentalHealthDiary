import { Alert } from 'react-native'
import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore'

export default async function updateApprovalStatus(
  userId: string,
  friendId: string,
  friendUsersId: string,
  friendDocumentId: string | null,
  setStatus: (status: string) => void,
) {
  if (userId === null || friendId === null || friendUsersId === null || friendDocumentId === null) return;
  try {
    if (userId === null) return;
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    const currentUserRef = doc(db, `users/${friendUsersId}/friends/${friendDocumentId}`);
    await updateDoc(friendRef, { status: 'approval'});
    await updateDoc(currentUserRef, { status: 'approval'});
    Alert.alert('友人を承認しました');
    setStatus('approval');
  } catch (error) {
    console.error('友人のステータス更新に失敗しました:', error);
    Alert.alert('エラー', '友人のステータス更新に失敗しました。');
  }
}