import { Alert } from 'react-native'
import { FriendInfoType } from '../../../../type/friend';
import deleteFriend from './backend/deleteFriend';

export default async function ConfirmationDeleteFriendModal(
  userId: string,
  friendData: FriendInfoType,
  friendDocumentId: string,
  onFriendDeleted: (friendId: string) => void
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
        onPress: async () => deleteFriend(userId, friendData, friendDocumentId, onFriendDeleted),
      },
    ]
  );
}