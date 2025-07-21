import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config';
import { onAuthStateChanged } from 'firebase/auth';
import fetchFriendList from '../app/myPage/action/backend/fetchFriendList';
import { FriendInfoType } from '../../type/friend';

type FriendContextType = {
  friends: FriendInfoType[];
  userId: string | undefined;
  isLoading: boolean;
  refreshFriends: () => Promise<void>;
};

const FriendContext = createContext<FriendContextType | undefined>(undefined);

type FriendProviderProps = {
  children: ReactNode;
};

export function FriendProvider({ children }: FriendProviderProps) {
  const [friends, setFriends] = useState<FriendInfoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(auth.currentUser?.uid);

  const fetchFriends = async (currentUserId: string | undefined) => {
    if (!currentUserId) {
      console.log("ログインユーザーが見つかりません");
      setFriends([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const friendsData = await fetchFriendList(currentUserId);
      setFriends(friendsData);
      console.log('友人情報の取得に成功しました');
    } catch (error) {
      console.error('友人情報の取得に失敗しました:', error);
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFriends = async () => {
    await fetchFriends(userId);
  };

  useEffect(() => {
    // 認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentUserId = user?.uid;
      setUserId(currentUserId);
      fetchFriends(currentUserId);
    });

    return unsubscribe;
  }, []);

  const value: FriendContextType = {
    friends,
    userId,
    isLoading,
    refreshFriends,
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error('contextがundefinedです');
  }
  return context;
}