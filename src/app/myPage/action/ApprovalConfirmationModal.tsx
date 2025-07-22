import { Alert } from 'react-native'
import { FriendInfoType } from '../../../../type/friend'
import deleteFriend from './backend/deleteFriend'
import updateApprovalStatus from './backend/updateApprovalStatus';


export default function ApprovalConfirmationModal(
  userId: string,
  friendData: FriendInfoType,
  friendDocumentId: string | null,
  onFriendDeleted: (friendId: string) => void,
  setStatus: (status: string) => void,
) {
  // 承認確認モーダルを表示
  Alert.alert(
    '友人承認',
    `${friendData.userName}さんからの友達申請を承認しますか？`,
    [
      {
        text: '承認しない',
        onPress: async () => deleteFriend(userId, friendData, friendDocumentId, onFriendDeleted),
      },
      {
        text: '承認する',
        onPress: () => updateApprovalStatus(userId, friendData, friendDocumentId, setStatus),
      },
    ]
  );
}
