import React from 'react'
import { View, StyleSheet } from 'react-native'

type Props = {
  marginHorizontal?: number
}

export default function Divider({ marginHorizontal = 16 }: Props) {
  return (
    <View style={[styles.divider, { marginHorizontal }]} />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginVertical: 8,
    alignSelf: 'stretch',
  },
})