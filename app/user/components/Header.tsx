import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import UserAddIcon from '../../../components/Icon/UserAddIcon';
import SettingIcon from '../../../components/Icon/SettingIcon';


export default function Header() {

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {/* 左側のスペーサー - 右側のアイコンと同じ幅を確保 */}
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>マイページ</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={() => {}} style={styles.userAddIcon}>
          <UserAddIcon size={24} color="#FFA500" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <SettingIcon size={24} color="#FFA500" />
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
  },
  headerLeft: {
    width: 80, // 右側のアイコン2つ分の幅（24px + 24px + 8px margin + 余裕）
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
    width: 80, // 左側と同じ幅を確保
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAddIcon: {
    marginRight: 8,
  },
});