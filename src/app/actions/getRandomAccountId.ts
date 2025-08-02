import { db } from '../../config'
import { collectionGroup, getDocs, query, where } from 'firebase/firestore'

// 重複しないアカウントIDを生成する関数
export default async function getRandomAccountId(): Promise<string> {
  let newAccountId: string
  let isDuplicate = true

  const usersRef = collectionGroup(db, 'userInfo')

  // isDuplicateがtrueである限り（＝IDが重複している間）ループを続ける
  do {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    newAccountId = result
    const q = query(usersRef, where('accountId', '==', newAccountId))
    const querySnapshot = await getDocs(q)
    isDuplicate = !querySnapshot.empty

    if (isDuplicate) {
      console.log(`アカウントID "${newAccountId}" は既に存在します。再生成します...`)
    }
  } while (isDuplicate)

  console.log(`ユニークなアカウントID "${newAccountId}" を生成しました。`)
  return newAccountId
}