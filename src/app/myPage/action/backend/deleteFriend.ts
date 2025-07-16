import { Alert } from 'react-native'

import { db } from '../../../../config';
import { doc, deleteDoc } from 'firebase/firestore';
import { FriendInfoType } from '../../../../../type/friend';

export default async function deleteFriend(
  userId: string,
  friendData: FriendInfoType
) {
  Alert.alert(
    '友人を削除',
    'この友人を削除しますか？\nこの操作は取り消せません。',
    [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            const friendRef = doc(db, `users/${userId}/friends/${friendData.friendId}`);
            await deleteDoc(friendRef);
            console.log('友人を削除しました');
          } catch (error) {
            console.error('友人の削除に失敗しました:', error);
            Alert.alert('エラー', '友人の削除に失敗しました。');
          }
        },
      },
    ]
  );
}