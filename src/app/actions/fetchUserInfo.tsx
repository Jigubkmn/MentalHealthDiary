import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../../config'
import { UserInfoType } from '../../../type/userInfo'

type FetchUserInfoParams = {
  userId: string | undefined
  setUserInfo: (userInfo: UserInfoType) => void
}

export default function fetchUserInfo({ userId, setUserInfo }: FetchUserInfoParams) {
  const ref = collection(db, `users/${userId}/userInfo`)
  const q = query(ref) // ユーザー情報の参照を取得。

  // snapshot：userInfoのデータを取得。
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // データ1つずつの処理
    snapshot.docs.forEach((doc) => {
      const { accountId, userName, userImage } = doc.data();
      setUserInfo({ accountId, userName, userImage })
    })
  })

  return unsubscribe;
}
