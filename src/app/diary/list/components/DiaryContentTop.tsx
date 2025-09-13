import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'

type Props = {
  userName: string
  feelingImage: string
  formattedTime: string
}

export default function DiaryContentTop({userName, feelingImage, formattedTime}: Props) {
  return (
    <View style={styles.diaryContentTopContainer}>
      <Text style={styles.diaryUserNameAndDay}>{userName}</Text>
      <Image
        source={feelingImage}
        style={styles.feelingImage}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      {/* 日記日付 */}
      <View>
        <Text style={styles.diaryUserNameAndDay}>{formattedTime}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  diaryContentTopContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  diaryUserNameAndDay: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  feelingImage: {
    width: 30,
    height: 30,
    marginLeft: 8,
  },

})