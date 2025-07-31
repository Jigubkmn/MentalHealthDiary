import { collection, collectionGroup, query, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../config';
import { FriendInfoType } from '../../../../../type/friend';

export default function fetchFriendList(
  userId: string | undefined,
  setFriendsData: (friendsData: FriendInfoType[]) => void
) {
  if (!userId) {
    setFriendsData([]);
    return () => {}; // 空のアンサブスクライブ関数を返す
  }
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsQuery = query(friendsRef);

    const unsubscribe = onSnapshot(friendsQuery, async (friendsSnapshot) => {
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
            showDiary: friendData.showDiary,
            userImage: userInfoData.userImage || '',
            userName: userInfoData.userName || '',
          };

          friendsData.push(friendInfo);
        }
      }
      // フレンドデータを設定
      setFriendsData(friendsData);
      console.log('友人情報の取得に成功しました');
    }, (error) => {
      console.error('フレンド情報の取得に失敗しました:', error);
      // エラー時は空配列を設定
      setFriendsData([]);
    });
    return unsubscribe;
  } catch (error) {
    console.error('フレンド情報の取得に失敗しました:', error);
    // エラー時は空配列を設定
    setFriendsData([]);
    return () => {}; // 空のアンサブスクライブ関数を返す
  }
}
