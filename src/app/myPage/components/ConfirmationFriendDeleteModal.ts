import { Alert } from 'react-native'
import deleteFriend from '../action/backend/deleteFriend';

export default async function ConfirmationFriendDeleteModal(
  userId: string,
  friendId: string,
  friendUsersId: string,
  friendDocumentId: string | null,
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
        onPress: async () => deleteFriend(userId, friendId, friendUsersId, friendDocumentId, onFriendDeleted),
      },
    ]
  );
}