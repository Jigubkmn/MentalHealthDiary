import { Alert } from 'react-native'
import { auth } from '../../config';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

// 1日後に移動
export default function UserLogout() {
  signOut(auth)
    .then(() => {
      router.replace("/auth/login")
    })
    .catch((error) => {
      console.log("error", error)
      Alert.alert("ログアウト処理を失敗しました")
    })
}