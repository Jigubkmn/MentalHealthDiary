import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ImageSourcePropType } from 'react-native';

type Props = {
  selectedFeeling: string | null;
  handleFeelingSelect: (feelingName: string) => void;
  name: string;
  image: ImageSourcePropType | undefined;
}

export default function SelectedFeelingButton({ selectedFeeling, handleFeelingSelect, name, image }: Props) {
  return (
    <TouchableOpacity
      key={name}
      style={styles.feelingItem}
      onPress={() => handleFeelingSelect(name)}
    >
      <Image
        source={image}
        style={[
          styles.feelingImage,{ opacity: selectedFeeling === name ? 1 : 0.4 }]}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <Text style={[styles.feelingText, { opacity: selectedFeeling === name ? 1 : 0.4 }]}>{name}</Text>
    </TouchableOpacity>
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