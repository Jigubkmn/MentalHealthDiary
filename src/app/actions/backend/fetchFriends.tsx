import { FriendInfoType } from '../../../../type/friend';
import fetchFriendList from '../../myPage/action/backend/fetchFriendList';

export default async function fetchFriends(setFriendsData: (data: FriendInfoType[]) => void, userId?: string) {
  try {
    const data = await fetchFriendList(userId);
    setFriendsData(data);
    console.log('友人情報の取得に成功しました');
  } catch (error) {
    console.error('友人情報の取得に失敗しました:', error);
    setFriendsData([]);
  }
}
