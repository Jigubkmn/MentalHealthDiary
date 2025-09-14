import React from 'react'
import { Image } from 'expo-image'
import { noUserImage } from '../constants/userImage'

type Props = {
  userImage: string
  size?: number
}

export default function UserIconImage({userImage, size = 50}: Props) {
  return (
    <Image
      source={userImage || noUserImage}
      style={ { width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  )
}