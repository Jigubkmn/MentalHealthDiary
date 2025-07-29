import React, { useState} from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'
import { FriendInfoType } from '../../../../../type/friend';
import { UserInfoType } from '../../../../../type/userInfo';
import UserSelectionModal from './UserSelectionModal';
import { noUserImage } from '../../../constants/userImage';

type Props = {
  title: string
  userInfo: UserInfoType | null
  selectedUserInfo: UserInfoType | null
  friendsData: FriendInfoType[]
  setSelectedUserId: (selectedUserId: string) => void
}

export default function Header({ title, userInfo, selectedUserInfo, friendsData, setSelectedUserId }: Props) {
  // ユーザー選択モーダルの表示状態を管理
  const [isUserSelectionModalVisible, setIsUserSelectionModalVisible] = useState(false);

  const handleUserIconPress = () => {
    setIsUserSelectionModalVisible(true);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <>
      <View style={styles.header}>
        {/* ヘッダー左側 */}
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleUserIconPress}>
            <Image
              source={selectedUserInfo?.userImage || noUserImage}
              style={styles.userIcon}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        </View>
        {/* 日付タイトル */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {/* ヘッダー右側 */}
        <View style={styles.headerRight}>
          {/* 右側のスペーサー */}
        </View>
      </View>

      {/* ユーザー選択モーダル */}
      <UserSelectionModal
        isVisible={isUserSelectionModalVisible}
        onClose={() => setIsUserSelectionModalVisible(false)}
        userInfo={userInfo}
        selectedUserInfo={selectedUserInfo}
        friendsData={friendsData}
        onSelectUser={handleUserSelect}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 60,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    width: 60
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 60
  },
});