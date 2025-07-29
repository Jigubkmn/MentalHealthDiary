import { collection, collectionGroup, query, getDocs } from 'firebase/firestore';
import { db } from '../../../../config';
import { FriendInfoType } from '../../../../../type/friend';

export default async function fetchFriendList(userId?: string): Promise<string[]> {
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsQuery = query(friendsRef);
    const friendsSnapshot = await getDocs(friendsQuery);

    const friendsData: FriendInfoType[] = [];

    // 各friendのデータを処理
    for (const friendDoc of friendsSnapshot.docs) {
      const friendData = friendDoc.data();
      const friendUserInfoId = friendData.friendId; // userInfoドキュメントのID

      // friendIdに対応するユーザーのuserInfoを取得
      const usersRef = collectionGroup(db, 'userInfo');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);

      // friendIdと一致するuserInfoドキュメントを検索
      let userInfoData = null;
      for (const doc of querySnapshot.docs) {
        if (doc.id === friendUserInfoId) {
          userInfoData = doc.data();
          break;
        }
      }

      if (userInfoData) {
        // データをまとめてオブジェクトに
        const friendInfo: FriendInfoType = {
          friendUsersId: friendUserInfoId,
          friendId: friendDoc.id,
          status: friendData.status,
          notifyOnDiary: friendData.notifyOnDiary,
          showDiary: friendData.showDiary,
          userImage: userInfoData.userImage || '',
          userName: userInfoData.userName || '',
        };

        friendsData.push(friendInfo);
      }
    }
    const userIds = [userId, ...friendsData.map(friend => friend.friendUsersId)].filter((id): id is string => id !== undefined);
    return userIds;
  } catch (error) {
    console.error('フレンド情報の取得に失敗しました:', error);
    throw error;
  }
}
