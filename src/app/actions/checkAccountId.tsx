import { db } from '../../config'
import { collectionGroup, getDocs, query, where } from 'firebase/firestore'

// ユーザー名の重複チェック関数
export default async function checkAccountId(newAccountId: string): Promise<boolean> {
  try{
    const usersRef = collectionGroup(db, 'userInfo')

    // ユーザー名の重複チェック
    const q = query(usersRef, where('accountId', '==', newAccountId))
    const querySnapshot = await getDocs(q)
    // true：重複している、false：重複していない
    const isDuplicate = !querySnapshot.empty

    // 重複している場合はtrue、重複していない場合はfalseを返す
    if (isDuplicate) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error("ユーザーIDの重複チェックに失敗しました:", error)
    return true
  }
}