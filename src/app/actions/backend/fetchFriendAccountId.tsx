import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../config';

export default async function fetchFriendAccountId(userId?: string): Promise<string[]> {
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsQuery = query(friendsRef);
    const friendsSnapshot = await getDocs(friendsQuery);

    const accountIds: string[] = [];

    // 各friendのaccountIdを配列に保存
    for (const friendDoc of friendsSnapshot.docs) {
      const friendData = friendDoc.data();
      if (friendData && friendData.accountId) {
        accountIds.push(friendData.accountId);
      }
    }

    return accountIds;
  } catch (error) {
    console.error('友人のアカウントID取得エラー:', error);
    throw error;
  }
}
