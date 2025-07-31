import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image'
import { noUserImage } from '../../../constants/userImage';

type Props = {
  userImage?: string | null
}

export default function Header({ userImage }: Props) {
  return (
    <View style={styles.header}>
      {/* ヘッダー左側 */}
      <View style={styles.headerLeft}>
        <Image
          source={userImage || noUserImage}
          style={styles.userIcon}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        </View>
      {/* 日付タイトル */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>日記一覧</Text>
      </View>
      {/* ヘッダー右側 */}
      <View style={styles.headerRight}>
        {/* 右側のスペーサー */}
      </View>
    </View>
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