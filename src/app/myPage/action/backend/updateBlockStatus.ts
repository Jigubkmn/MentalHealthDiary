import { Alert } from 'react-native'
import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore'

export default async function updateBlockStatus(
  userId: string,
  friendId: string,
  isBlocked: boolean,
  setStatus: (status: string) => void,
  setIsBlocked: (isBlocked: boolean) => void,
  setIsNotificationEnabled: (isNotificationEnabled: boolean) => void,
  setIsViewEnabled: (isViewEnabled: boolean) => void
) {
  try {
    if (userId === null) return;
    const updateStatus = isBlocked ? 'approval' : 'block'
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    await updateDoc(friendRef, {
      status: updateStatus,
      blocked: !isBlocked,
      notifyOnDiary: isBlocked,
      showDiary: isBlocked,
    });
    // blockはステータス変更前
    if (isBlocked) {
      Alert.alert("友人のブロックを解除しました");
    } else {
      Alert.alert("友人をブロックしました");
    }
    setStatus(updateStatus);
    setIsBlocked(!isBlocked);
    setIsNotificationEnabled(isBlocked);
    setIsViewEnabled(isBlocked);
  } catch (error) {
    console.error('友人のステータス更新に失敗しました:', error);
    Alert.alert('エラー', '友人のステータス更新に失敗しました。');
  }
}