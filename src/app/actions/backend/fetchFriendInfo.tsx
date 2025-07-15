import { collection, collectionGroup, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../config';
import { FriendInfoType } from '../../../../type/friend';

export default async function fetchFriendInfo(userId?: string): Promise<FriendInfoType[]> {
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsQuery = query(friendsRef);
    const friendsSnapshot = await getDocs(friendsQuery);

    const friendsData: FriendInfoType[] = [];

    // 各friendのデータを処理
    for (const friendDoc of friendsSnapshot.docs) {
      const friendData = friendDoc.data();
      const accountId = friendData.accountId;

      // accountIdに対応するユーザーのuserInfoを取得
      const usersRef = collectionGroup(db, 'userInfo');
      const q = query(usersRef, where('accountId', '==', accountId.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userInfoData = doc.data();

        // データをまとめてオブジェクトに
        const friendInfo: FriendInfoType = {
          accountId: friendData.accountId,
          notifyOnDiary: friendData.notifyOnDiary,
          showDiary: friendData.showDiary,
          status: friendData.status,
          userImage: userInfoData.userImage || '',
          userName: userInfoData.userName || '',
        };

        friendsData.push(friendInfo);
      }
    }
    return friendsData;
  } catch (error) {
    console.error('Error fetching friend info:', error);
    throw error;
  }
}
