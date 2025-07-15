import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { Image } from 'expo-image'
import { noUserImage } from '../../constants/userImage';

export default function DiaryShareInfo() {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);


  const toggleNotification = () => {
    setIsNotificationEnabled(previousState => !previousState);
};

  return (
    <View style={styles.diaryShareInfo}>
      <View style={styles.diaryShareMainInfo}>
        <Image
          source={noUserImage}
          style={styles.diaryShareUserImage}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
        <Text style={styles.diaryShareUserName}>山田太郎</Text>
        <TouchableOpacity onPress={()=>{}} style={styles.diaryShareDeleteIcon}>
          <Text style={styles.diaryShareDeleteText}>削除</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.diaryShareToggleButton}>
        {/* 通知設定用トグルスイッチ */}
        <Text style={styles.notificationText}>山田太郎さんの日記作成・更新を通知する</Text>
        <Switch
          trackColor={{ false: '#FFFFFF', true: '#0080FF' }}
          thumbColor={isNotificationEnabled ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#D9D9D9"
          onValueChange={toggleNotification}
          value={isNotificationEnabled}
          style={styles.switch}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  diaryShareInfo: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },
  diaryShareMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  diaryShareUserImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  diaryShareUserName: {
    fontSize: 14,
    lineHeight: 24
  },
  diaryShareToggleButton: {
    flexDirection: 'row',
    marginLeft: 'auto',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  notificationText: {
    marginRight: 8,
  },
  diaryShareDeleteIcon: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,0,0, 0.6)',
    padding: 0,
    borderRadius: 10,
  },
  diaryShareDeleteText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#FFFFFF',
    width: 50,
    height: 24,
    textAlign: 'center',
  },

  switch: {
    transform: [{ scale: 0.8 }],
  },
})