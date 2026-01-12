import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { UserInfoType } from '../../../../../type/userInfo';
import { FriendInfoType } from '../../../../../type/friend';
import UserIconImage from '../../../components/UserIconImage';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  userInfo: UserInfoType | null;
  selectedUserInfo: UserInfoType | null;
  friendsData: FriendInfoType[];
  onSelectUser: (userId: string) => void;
};

export default function UserSelectionModal({
  isVisible,
  onClose,
  userInfo,
  selectedUserInfo,
  friendsData,
  onSelectUser,
}: Props) {
  const handleUserSelect = (userId: string) => {
    onSelectUser(userId);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ユーザーを選択</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.userList}>
            {/* ログインユーザー */}
            {userInfo && (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedUserInfo?.userId === userInfo.userId && styles.selectedUserItem
                ]}
                onPress={() => handleUserSelect(userInfo.userId)}
              >
                <UserIconImage userImage={selectedUserInfo?.userImage} size={36} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userInfo.userName}</Text>
                  <Text style={styles.userLabel}>あなた</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 友人のリスト */}
            {friendsData.map((friend) => (
              <TouchableOpacity
                key={friend.friendId}
                style={[
                  styles.userItem,
                  selectedUserInfo?.userId === friend.friendUsersId && styles.selectedUserItem
                ]}
                onPress={() => handleUserSelect(friend.friendUsersId)}
              >
                <UserIconImage userImage={friend.userImage} size={40} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{friend.userName}</Text>
                  <Text style={styles.userLabel}>友人</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  userList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedUserItem: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  userLabel: {
    fontSize: 12,
    color: '#666666',
  },
});