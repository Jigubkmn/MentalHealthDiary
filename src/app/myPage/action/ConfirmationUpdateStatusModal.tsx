import { Alert } from 'react-native'
import updateStatus from './backend/updateStatus';

export default function ConfirmationUpdateStatusModal(
  userId: string,
  friendId: string,
  isBlocked: boolean,
  setStatus: (status: string) => void,
  setIsBlocked: (isBlocked: boolean) => void,
  setIsNotificationEnabled: (isNotificationEnabled: boolean) => void,
  setIsViewEnabled: (isViewEnabled: boolean) => void
) {
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
        onPress: async () => updateStatus(
          userId,
          friendId,
          isBlocked,
          setStatus,
          setIsBlocked,
          setIsNotificationEnabled,
          setIsViewEnabled
        )
      },
    ]
  );
}
