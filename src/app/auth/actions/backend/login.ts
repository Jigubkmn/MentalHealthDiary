
import { Alert } from 'react-native'
import { auth } from '../../../../config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { router } from 'expo-router'


export  default async function login(
  email: string,
  password: string,
) {
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("userCredential", userCredential.user.uid);
    router.push("/(tabs)")
  })
  .catch((error) => {
    console.log("error", error)
    Alert.alert("ログイン処理を失敗しました");
  })
}