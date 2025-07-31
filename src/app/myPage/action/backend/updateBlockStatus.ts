import { Alert } from 'react-native'
import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore'

export default async function updateBlockStatus(
  userId: string,
  friendId: string,
  friendUsersId: string,
  friendDocumentId: string | null,
  isBlocked: boolean,
  setStatus: (status: string) => void,
  setIsBlocked: (isBlocked: boolean) => void,
  setIsViewEnabled: (isViewEnabled: boolean) => void
) {
  try {
    if (userId === null) return;
    const friendUpdateStatus = isBlocked ? 'approval' : 'block'
    const currentUserUpdateStatus = isBlocked ? 'approval' : 'unavailable'
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    const currentUserRef = doc(db, `users/${friendUsersId}/friends/${friendDocumentId}`);
    // ログインユーザーの友人情報を更新
    await updateDoc(friendRef, {
      status: friendUpdateStatus,
      blocked: !isBlocked,
      showDiary: isBlocked,
    });
    // 友人の友人情報を更新
    await updateDoc(currentUserRef, {
      status: currentUserUpdateStatus,
      blocked: !isBlocked,
      showDiary: isBlocked,
    });
    if (isBlocked) {
      Alert.alert("友人のブロックを解除しました");
    } else {
      Alert.alert("友人をブロックしました");
    }
    setStatus(friendUpdateStatus);
    setIsBlocked(!isBlocked);
    setIsViewEnabled(isBlocked);
  } catch (error) {
    console.error('友人のステータス更新に失敗しました:', error);
    Alert.alert('エラー', '友人のステータス更新に失敗しました。');
  }
}