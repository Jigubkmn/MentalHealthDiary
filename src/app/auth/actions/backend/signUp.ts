import { Alert } from 'react-native'
import { router } from 'expo-router'
import { auth, db } from '../../../../config'
import { AuthError } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth'
import getRandomAccountId from '../../../actions/getRandomAccountId'

export  default async function signUp(
  email: string,
  password: string,
  userName: string,
  setErrors: (errors: { userName: string, email: string, password: string, confirmPassword: string }) => void
) {
  let userCredential: UserCredential | null = null
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userId = userCredential.user.uid
    const ref = doc(db, 'users', userId, 'userInfo', userId)
    // 重複しないアカウントIDを生成
    const accountId = await getRandomAccountId()
    await setDoc(ref, {
      userName,
      accountId: accountId,
      userImage: '',
      createdAt: serverTimestamp()
    })
    Alert.alert('会員登録に成功しました')
    router.replace('/(tabs)')
  } catch (error: unknown) {
    console.log("error", error)
    const newErrors = { userName: '', email: '', password: '', confirmPassword: '' }
    switch ((error as AuthError).code) {
      case 'auth/invalid-email': {
        newErrors.email = 'メールアドレスの形式が正しくありません。'
        break
      }
      case 'auth/email-already-in-use': {
        newErrors.email = 'このメールアドレスは既に使用されています。'
        break
      }
      case 'auth/weak-password': {
        newErrors.password = 'パスワードは6文字以上で入力してください。'
        break
      }
      default:
        Alert.alert('登録エラー', '予期せぬエラーが発生しました。時間をおいて再試行してください。')
        break
    }
    setErrors(newErrors)
  }
}