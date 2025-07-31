import { Alert } from 'react-native'
import deleteFriend from './backend/deleteFriend'
import updateApprovalStatus from './backend/updateApprovalStatus';


export default function ApprovalConfirmationModal(
  userId: string,
  friendId: string,
  friendUsersId: string,
  userName: string,
  friendDocumentId: string | null,
  onFriendDeleted: (friendId: string) => void,
  setStatus: (status: string) => void,
) {
  // 承認確認モーダルを表示
  Alert.alert(
    '友人承認',
    `${userName}さんからの友達申請を承認しますか？`,
    [
      {
        text: '承認しない',
        onPress: async () => deleteFriend(userId, friendId, friendUsersId, friendDocumentId, onFriendDeleted),
      },
      {
        text: '承認する',
        onPress: () => updateApprovalStatus(userId, friendId, friendUsersId, friendDocumentId, setStatus),
      },
    ]
  );
}
