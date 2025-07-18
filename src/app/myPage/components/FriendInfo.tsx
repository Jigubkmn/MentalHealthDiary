import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { noUserImage } from '../../constants/userImage';
import { FriendInfoType } from '../../../../type/friend'
import Divider from '../../components/Divider';
import DeleteIcon from '../../components/Icon/DeleteIcon';
import BlockIcon from '../../components/Icon/Block';
import getStatusStyle from '../action/getStatusStyle';
import saveNotifyOnDiary from '../action/backend/saveNotifyOnDiary';
import saveShowDiary from '../action/backend/saveShowDiary';
import updateStatus from '../action/backend/updateBlockStatus';
import fetchFriendDocumentId from '../action/backend/fetchFriendDocumentId';
import ApprovalConfirmationModal from '../action/ApprovalConfirmationModal';
import ConfirmationDeleteFriendModal from '../action/ConfirmationDeleteFriendModal';

type FriendInfoProps = {
  friendData: FriendInfoType
  userId: string
  onFriendDeleted: (friendId: string) => void
}

export default function FriendInfo({ friendData, userId, onFriendDeleted }: FriendInfoProps) {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(friendData.notifyOnDiary);
  const [isViewEnabled, setIsViewEnabled] = useState(friendData.showDiary);
  const [status, setStatus] = useState(friendData.status);
  const [statusStyle, setStatusStyle] = useState(getStatusStyle(friendData.status));
  const [isBlocked, setIsBlocked] = useState(false);
  const [friendDocumentId, setFriendDocumentId] = useState<string | null>(null);

  const toggleNotification = async () => {
    const newValue = !isNotificationEnabled;
    setIsNotificationEnabled(newValue);
    saveNotifyOnDiary(userId, friendData.friendId, newValue, setIsNotificationEnabled, isNotificationEnabled);
  };

  const toggleView = async () => {
    const newValue = !isViewEnabled;
    setIsViewEnabled(newValue);
    saveShowDiary(userId, friendData.friendId, newValue, setIsViewEnabled, isViewEnabled);
  };

  useEffect(() => {
    const isStatusBlocked = status === 'block';
    setIsBlocked(isStatusBlocked);

    const fetchFriendDocument = async () => {
      try {
        const data = await fetchFriendDocumentId(friendData.friendUsersId);
        setFriendDocumentId(data || null);
        // 承認確認モーダル表示
        ApprovalConfirmationModal(userId, friendData, data || null, onFriendDeleted, setStatus);
      } catch (error) {
        console.error('フレンドドキュメントIDの取得に失敗しました', error);
      }
    };

    fetchFriendDocument();
  }, []);

  useEffect(() => {
    const statusStyle = getStatusStyle(status);
    // statusのスタイルを取得
    setStatusStyle(statusStyle);
  }, [status]);

  return (
    <View style={styles.friendInfo}>
      <View style={styles.friendMainInfo}>
        <Image
          source={friendData.userImage || noUserImage}
          style={styles.friendImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Text style={styles.friendName}>{friendData.userName}</Text>
        <View style={[styles.status, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {statusStyle.text}
          </Text>
        </View>
      </View>
      {/* 通知設定用トグルスイッチ */}
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>{`${friendData.userName}さんの日記を通知する`}</Text>
        <Switch
          trackColor={{ false: '#FFFFFF', true: '#0080FF' }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="#D9D9D9"
          onValueChange={toggleNotification}
          value={isNotificationEnabled}
          style={styles.switch}
        />
      </View>
      {/* 表示設定用トグルスイッチ */}
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>{`${friendData.userName}さんの日記を表示する`}</Text>
        <Switch
          trackColor={{ false: '#FFFFFF', true: '#0080FF' }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="#D9D9D9"
          onValueChange={toggleView}
          value={isViewEnabled}
          style={styles.switch}
        />
      </View>
      <Divider marginHorizontal={0} />
      <View style={styles.actionContainer}>
        {/* ブロックボタン */}
        <TouchableOpacity onPress={() => updateStatus(
          userId,
          friendData.friendId,
          isBlocked,
          setStatus,
          setIsBlocked,
          setIsNotificationEnabled,
          setIsViewEnabled
          )}
          style={styles.actionButton}>
          <BlockIcon size={24} color="#000000" />
          <Text style={styles.blockButtonText}>{isBlocked ? 'ブロック解除' : 'ブロック'}</Text>
        </TouchableOpacity>
        {/* 削除ボタン */}
        <TouchableOpacity onPress={() => ConfirmationDeleteFriendModal(userId, friendData, friendDocumentId,  onFriendDeleted)} style={styles.actionButton}>
          <DeleteIcon size={24} color="#FF0000" />
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  friendInfo: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },
  friendMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  friendName: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
  },
  status: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,0,0, 0.6)',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    justifyContent: 'center',
  },

  switch: {
    transform: [{ scale: 0.8 }],
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 14,
    lineHeight: 24,
  },
  deleteButtonText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#FF0000',
  },
})