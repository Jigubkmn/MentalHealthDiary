import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import XIcon from '../Icon/XIcon';
import AddImageIcon from '../Icon/AddImageIcon';
import handleImageSelect from '../../actions/handleImageSelect';
import { noImage } from '../../constants/userImage';

type Props = {
  handleImageDelete: () => void;
  selectedImage: string | null;
  setSelectedImage: (image: string) => void;
  userId?: string;
}

export default function DiaryImage({ handleImageDelete, selectedImage, setSelectedImage, userId}: Props) {
  
  const ImageSelect = async () => {
    const newUserImage = await handleImageSelect(userId, 'diaryImages');
    if (!newUserImage) return;
    setSelectedImage(newUserImage);
  };

  return (
    <View style={styles.imageContainer}>
      <View style={styles.imageTitleContainer}>
        <Text style={styles.textInputTitle}>今日の画像</Text>
        <TouchableOpacity
          onPress={handleImageDelete}
        >
          <XIcon size={24} color="#000000" />
        </TouchableOpacity>
      </View>
      {/* 画像表示部分 */}
      <TouchableOpacity style={styles.selectedImageContainer} onPress={() => ImageSelect() }>
          {selectedImage ? (
            <Image
              source={selectedImage ? { uri: selectedImage } : noImage}
              style={styles.selectedImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.addImageContainer}>
                <AddImageIcon size={48} color="#000000" />
              <Text style={styles.addImageText}>今日の写真を選択して下さい</Text>
            </View>
          )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  imageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    height: 250,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  textInputTitle: {
    fontSize: 16,
    lineHeight: 30,
    color: '#000000',
    marginLeft: 8,
    marginVertical: 8,
  },
  selectedImageContainer: {
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  addImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 16,
    color: '#000000',
  },
});