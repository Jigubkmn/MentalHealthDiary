import { Alert } from 'react-native'
import userDelete from '../action/backend/userDelete';
import { UserInfoType } from '../../../../type/userInfo';

export default async function ConfirmationUserDeleteModal(userInfo: UserInfoType | null) {
  Alert.alert(
    'アカウントを削除',
    'このアカウントを削除しますか？\nこの操作は取り消せません。',
    [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => userDelete(userInfo)
      },
    ]
  );
}