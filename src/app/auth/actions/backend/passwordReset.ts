import { Alert } from 'react-native'
import { router } from 'expo-router'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

export  default async function passwordReset( email: string, setEmail: (email: string) => void) {
  const auth = getAuth();
  sendPasswordResetEmail(auth, email)
  .then(() => {
    Alert.alert("パスワード再度設定メールを送信しました");
    setEmail('');
    router.push("/auth/login");
  })
  .catch((error) => {
    console.log("error", error);
  })
}