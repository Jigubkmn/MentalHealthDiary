import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import UserAddIcon from '../../components/Icon/UserAddIcon';
import SettingIcon from '../../components/Icon/SettingIcon';

type Props = {
  currentAccountId?: string;
  userId?: string;
}

export default function Header({ currentAccountId, userId }: Props) {

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {/* 左側のスペーサー - 右側のアイコンと同じ幅を確保 */}
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>マイページ</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => {router.push({
            pathname: '/searchFriend/searchFriend',
            params: {
              currentAccountId: currentAccountId,
              userId: userId,
            }})}}
          style={styles.userAddIcon}>
          <UserAddIcon size={24} color="#FFA500" />
        </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    width: 40,
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
    width: 40,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAddIcon: {
    marginRight: 8,
  },
});