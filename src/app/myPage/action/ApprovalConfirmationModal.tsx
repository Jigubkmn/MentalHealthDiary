import { Alert } from 'react-native'
import { FriendInfoType } from '../../../../type/friend'


export default function ApprovalConfirmationModal(friendData: FriendInfoType, handleApproveFriend: () => void) {
  if (friendData.status === 'pendingApproval') {
    console.log('承認待ち状態です')
    // 承認確認モーダルを表示
    Alert.alert(
      '友人承認',
      `${friendData.userName}さんからの友達申請を承認しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '承認',
          onPress: () => handleApproveFriend(),
        },
      ]
    );
  }
}
