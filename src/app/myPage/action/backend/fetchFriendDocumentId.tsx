import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../../config';

export default async function fetchFriendDocumentId(friendUsersId: string, userId: string) {
  try {
    const friendsRef = collection(db, `users/${friendUsersId}/friends`);
    const friendsQuery = query(friendsRef, where('friendId', '==', userId));
    const friendsSnapshot = await getDocs(friendsQuery);

    // userIdと一致するfriendのドキュメントIDを取得
    if (!friendsSnapshot.empty) {
      const friendDoc = friendsSnapshot.docs[0];
      return friendDoc.id;
    }
    return null; // 一致するドキュメントが見つからない場合
  } catch (error) {
    console.error('フレンド情報の取得に失敗しました:', error);
    throw error;
  }
}
