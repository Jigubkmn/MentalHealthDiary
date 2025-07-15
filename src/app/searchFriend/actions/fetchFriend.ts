import { db } from '../../../config';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { UserInfoType } from '../../../../type/userInfo';
import { noUserImage } from '../../constants/userImage';

type Props = {
  accountId: string;
  currentUserId?: string;
  setSearchResult: (searchResult: UserInfoType | null) => void;
  setUserImage: (userImage: string | null) => void;
  setIsSearching: (isSearching: boolean) => void;
}

export default async function fetchFriend({ accountId, currentUserId, setSearchResult, setUserImage, setIsSearching }: Props) {
  if (!accountId.trim()) return;

  setIsSearching(true);
  try {
    if (!currentUserId) {
      console.log('ログインユーザーが見つかりません');
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
      if (doc.ref.parent.parent?.id !== currentUserId) {
        setSearchResult(userData);
        setUserImage(userData.userImage ? userData.userImage : noUserImage);
      } else {
        setSearchResult(null);
        setUserImage(noUserImage);
        console.log('自分自身のアカウントIDです');
      }
    } else {
      // ユーザーが見つからない場合
      setSearchResult(null);
      setUserImage(noUserImage);
      console.log('ユーザーが見つかりません');
    }
  } catch (error) {
    console.log('検索エラー:', error);
    setSearchResult(null);
    setUserImage(noUserImage);
  }
}