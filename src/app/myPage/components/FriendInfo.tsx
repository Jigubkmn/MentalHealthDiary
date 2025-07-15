import React, { useState } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { noUserImage } from '../../constants/userImage';
import { FriendInfoType } from '../../../../type/friend'
import Divider from '../../components/Divider';
import DeleteIcon from '../../components/Icon/DeleteIcon';
import BlockIcon from '../../components/Icon/Block';
import getStatusStyle from '../action/getStatusStyle';

type FriendInfoProps = {
  friendData: FriendInfoType
}

export default function FriendInfo({ friendData }: FriendInfoProps) {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isViewEnabled, setIsViewEnabled] = useState(false);

  const toggleNotification = () => {
    setIsNotificationEnabled(previousState => !previousState);
  };

  const toggleView = () => {
    setIsViewEnabled(previousState => !previousState);
  };

  const handleDelete = () => {
    // onDelete();
    console.log('delete');
  }

  // statusのスタイルを取得
  const statusStyle = getStatusStyle(friendData.status);

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
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
          <BlockIcon size={24} color="#000000" />
          <Text style={styles.blockButtonText}>ブロックする</Text>
        </TouchableOpacity>
        {/* 削除ボタン */}
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
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