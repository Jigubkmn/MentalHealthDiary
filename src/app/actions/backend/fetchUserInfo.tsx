import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../../../config'
import { UserInfoType } from '../../../../type/userInfo'

type FetchUserInfoParams = {
  userId: string | undefined
  setUserInfo: (userInfo: UserInfoType) => void
}

export default function fetchUserInfo({ userId, setUserInfo }: FetchUserInfoParams) {
  const ref = collection(db, `users/${userId}/userInfo`)
  const q = query(ref)

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const { accountId, userName, userImage } = doc.data();
      setUserInfo({ userId: doc.id, accountId, userName, userImage: userImage })
    })
  })
  return unsubscribe;
}

