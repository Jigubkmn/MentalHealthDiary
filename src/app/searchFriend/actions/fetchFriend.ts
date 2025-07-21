import { db } from '../../../config';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { UserInfoType } from '../../../../type/userInfo';
import { noUserImage } from '../../constants/userImage';

type Props = {
  accountId: string;
  userId?: string;
  friendsAccountId: string[];
  setSearchResult: (searchResult: UserInfoType | null) => void;
  setUserImage: (userImage: string | null) => void;
  setIsSearching: (isSearching: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  setFriendUsersId: (friendUsersId: string) => void;
  setFriendUserInfosId: (friendUserInfosId: string) => void;
}

export default async function fetchFriend({
  accountId,
  userId,
  friendsAccountId,
  setSearchResult,
  setUserImage,
  setIsSearching,
  setErrorMessage,
  setFriendUsersId,
  setFriendUserInfosId
}: Props) {
  if (!accountId.trim()) return;

  setIsSearching(true);
  setErrorMessage(null);

  try {
    if (!userId) {
      console.log('ログインユーザーが見つかりません');
      setErrorMessage('ログインユーザーが見つかりません');
      return;
    }

    // userInfoコレクションから指定されたaccountIdで完全一致検索
    const usersRef = collectionGroup(db, 'userInfo');
    const q = query(usersRef, where('accountId', '==', accountId.trim()));
    const querySnapshot = await getDocs(q);

    // ユーザーが見つかった場合
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = doc.data() as UserInfoType;

      // ログインユーザー以外のデータのみ取得
      if (doc.ref.parent.parent?.id !== userId) {
        if (!friendsAccountId.includes(accountId)) {
          setSearchResult(userData);
          setUserImage(userData.userImage ? userData.userImage : noUserImage);
          setFriendUsersId(doc.ref.parent.parent?.id || ''); // usersコレクションのドキュメントID（userId）を設定
          setFriendUserInfosId(doc.id); // userInfoコレクションのドキュメントID（userInfoId）を設定
        } else {
          console.log('既に登録されているアカウントIDです');
          setErrorMessage('既に登録されているアカウントIDです');
        }
      } else {
        setSearchResult(null);
        setUserImage(noUserImage);
        console.log('自分自身のアカウントIDです');
        setErrorMessage('自分以外のIDを検索してください');
      }
    } else {
      // ユーザーが見つからない場合
      setSearchResult(null);
      setUserImage(noUserImage);
      console.log('ユーザーが見つかりません');
      setErrorMessage('ユーザーが見つかりません');
    }
  } catch (error) {
    console.log('検索エラー:', error);
    setSearchResult(null);
    setUserImage(noUserImage);
    setErrorMessage('検索中にエラーが発生しました');
  }
}