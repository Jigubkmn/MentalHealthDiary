import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, TouchableWithoutFeedback, View, ScrollView, Keyboard } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Feeling from '../components/diary/Feeling';
import Header from '../diary/creation/components/Header';
import DiaryText from '../components/diary/DiaryText';
import DiaryImage from '../components/diary/DiaryImage';

export default function DiaryCreation() {
  const { isShowBackButton } = useLocalSearchParams<{ isShowBackButton?: string }>();
  const [diaryText, setDiaryText] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isTouchFeelingButton } = useLocalSearchParams<{ isTouchFeelingButton?: string }>();

  useFocusEffect(
    React.useCallback(() => {
      setDiaryText('');
      setSelectedFeeling(null);
      setSelectedImage(null);
    }, [])
  );

  const handleImageDelete = () => {
    setSelectedImage(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerArea}>
          <Header
            diaryText={diaryText}
            selectedFeeling={selectedFeeling}
            setDiaryText={setDiaryText}
            setSelectedFeeling={setSelectedFeeling}
            setSelectedImage={setSelectedImage}
            isShowBackButton={isShowBackButton === 'true'}
            selectedImage={selectedImage}
          />
          <Feeling selectedFeeling={selectedFeeling} setSelectedFeeling={setSelectedFeeling} isTouchFeelingButton={isTouchFeelingButton === 'true'} />
        </View>
        <ScrollView style={styles.contentArea}>
          {/* 今日の出来事 */}
          <DiaryText diaryText={diaryText} setDiaryText={setDiaryText} />
          {/* 今日の出来事の画像 */}
          <DiaryImage handleImageDelete={handleImageDelete} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerArea: {
    backgroundColor: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 16,
  }
});
