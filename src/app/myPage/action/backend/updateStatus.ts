import { Alert } from 'react-native'
import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore'

export default async function updateStatus(
  userId: string,
  friendId: string,
  friendUsersId: string,
  friendDocumentId: string,
  isBlocked: boolean,
  setStatus: (status: string) => void,
  setIsBlocked: (isBlocked: boolean) => void,
  setIsNotificationEnabled: (isNotificationEnabled: boolean) => void,
  setIsViewEnabled: (isViewEnabled: boolean) => void
) {
  if (userId === null) return;
  const updateStatus = isBlocked ? 'approval' : 'block'
  const updateCurrentUserStatus = isBlocked ? 'approval' : 'unApproved'
  Alert.alert(
    isBlocked ? '友人のブロック解除' : '友人をブロック',
    isBlocked ? '友人のブロックを解除しますか？' : '友人をブロックしますか？',
    [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: isBlocked ? 'ブロック解除' : 'ブロック',
        style: 'destructive',
        onPress: async () => {
          try {
            const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
            const currentUserRef = doc(db, `users/${friendUsersId}/friends/${friendDocumentId}`);
            await updateDoc(friendRef, {
              status: updateStatus,
              blocked: !isBlocked,
              notificationEnabled: isBlocked,
              viewEnabled: isBlocked,
            });
            await updateDoc(currentUserRef, {
              status: updateCurrentUserStatus,
              blocked: !isBlocked,
              notificationEnabled: isBlocked,
              viewEnabled: isBlocked,
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
        },
      },
    ]
  );

}