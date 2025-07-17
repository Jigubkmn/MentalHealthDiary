import { Alert } from 'react-native'
import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore'

export default async function updateStatus(
  userId: string,
  friendId: string,
  status: string,
  isBlocked: boolean,
  setStatus: (status: string) => void,
  setIsBlocked: (isBlocked: boolean) => void
) {
  if (userId === null) return;
  const updateStatus = isBlocked ? 'approval' : 'block'
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
            await updateDoc(friendRef, {
              status: updateStatus,
              isBlocked: !isBlocked
            });
            // blockはステータス変更前
            if (isBlocked) {
              Alert.alert("友人のブロックを解除しました");
            } else {
              Alert.alert("友人をブロックしました");
            }
            setStatus(updateStatus);
            setIsBlocked(!isBlocked);
          } catch (error) {
            console.error('友人のステータス更新に失敗しました:', error);
            Alert.alert('エラー', '友人のステータス更新に失敗しました。');
          }
        },
      },
    ]
  );

}