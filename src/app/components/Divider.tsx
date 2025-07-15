import React from 'react'
import { View, StyleSheet } from 'react-native'

export default function Divider() {
  return (
    <View style={styles.divider} />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginVertical: 8,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
})