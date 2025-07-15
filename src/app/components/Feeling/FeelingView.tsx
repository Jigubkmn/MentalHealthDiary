import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ImageSourcePropType } from 'react-native';

type Props = {
  selectedFeeling: string | null;
  name: string;
  image: ImageSourcePropType | undefined;
}

export default function FeelingView({ selectedFeeling, name, image }: Props) {
  return (
    <View key={name} style={styles.feelingItem}>
      <Image
        source={image}
        style={[
          styles.feelingImage,{ opacity: selectedFeeling === name ? 1 : 0.4 }]}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <Text style={[styles.feelingText, { opacity: selectedFeeling === name ? 1 : 0.4 }]}>{name}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  feelingItem: {
    alignItems: 'center',
  },
  feelingImage: {
    width: 40,
    height: 40,
  },
  feelingText: {
    fontSize: 14,
    lineHeight: 24,
  },
});