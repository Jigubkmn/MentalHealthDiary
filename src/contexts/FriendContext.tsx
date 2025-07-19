import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config';
import fetchFriendList from '../app/myPage/action/backend/fetchFriendList';
import { FriendInfoType } from '../../type/friend';

type FriendContextType = {
  friends: FriendInfoType[];
  refreshFriends: () => Promise<void>;
};

const FriendContext = createContext<FriendContextType | undefined>(undefined);

type FriendProviderProps = {
  children: ReactNode;
};

export function FriendProvider({ children }: FriendProviderProps) {
  const [friends, setFriends] = useState<FriendInfoType[]>([]);

  const fetchFriends = async () => {
    const userId = auth.currentUser?.uid;

    try {
      const friendsData = await fetchFriendList(userId);
      setFriends(friendsData);
    } catch (error) {
      console.error('友人情報の取得に失敗しました:', error);
    }
  };

  const refreshFriends = async () => {
    await fetchFriends();
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const value: FriendContextType = {
    friends,
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