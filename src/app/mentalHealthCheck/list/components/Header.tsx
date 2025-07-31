import React from 'react'
import { View, Text, StyleSheet } from 'react-native';



export default function Header() {
  return (
    <>
      <View style={styles.header}>
        {/* 日付タイトル */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>メンタルヘルスチェック一覧</Text>
        </View>
      </View>
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
    backgroundColor: '#ffffff',
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
});