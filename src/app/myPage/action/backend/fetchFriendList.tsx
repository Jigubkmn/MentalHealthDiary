import { collection, doc, query, onSnapshot, getDoc } from 'firebase/firestore';
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

        try {
          // friendIdに対応するユーザーのuserInfoを取得
          const userInfoRef = doc(db, `users/${friendUserInfoId}/userInfo/${friendUserInfoId}`);
          const userInfoDoc = await getDoc(userInfoRef);

          if (userInfoDoc.exists()) {
            const userInfoData = userInfoDoc.data();

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
        } catch (error) {
          console.error(`友人 ${friendUserInfoId} の情報取得に失敗しました:`, error);
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
