import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../../config';

export default async function fetchFriendDocumentId(userId?: string) {
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsQuery = query(friendsRef);
    const friendsSnapshot = await getDocs(friendsQuery);

    // 最初のfriendのドキュメントIDを取得
    if (!friendsSnapshot.empty) {
      const friendDoc = friendsSnapshot.docs[0];
      return friendDoc.id;
    }

  } catch (error) {
    console.error('フレンド情報の取得に失敗しました:', error);
    throw error;
  }
}
