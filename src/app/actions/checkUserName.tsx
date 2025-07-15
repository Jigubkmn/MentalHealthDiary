import { db } from '../../config'
import { collectionGroup, getDocs, query, where } from 'firebase/firestore'

// ユーザー名の重複チェック関数
export default async function checkUserName(newUserName: string): Promise<boolean> {
  try{
    const usersRef = collectionGroup(db, 'userInfo')

    // ユーザー名の重複チェック
    const q = query(usersRef, where('userName', '==', newUserName))
    const querySnapshot = await getDocs(q)
    // true：重複している、false：重複していない
    const isDuplicate = !querySnapshot.empty

    if (isDuplicate) {
      console.log(`ユーザー名 "${newUserName}" は既に存在します。`)
      return true
    } else {
      console.log(`ユーザー名 "${newUserName}" は使用可能です。`)
      return false
    }
  } catch (error) {
    console.error("ユーザー名の重複チェックに失敗しました:", error)
    return true
  }
}