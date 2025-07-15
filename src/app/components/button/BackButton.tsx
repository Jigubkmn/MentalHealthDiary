import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import handleBack from '../../actions/handleBack';

export default function BackButton() {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handleBack}>
        <Text style={styles.headerButtonText}>戻る</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    width: 60,
    height: 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerButtonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#FFA500',
  },
})