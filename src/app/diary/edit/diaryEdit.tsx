import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import Feeling from '../../components/diary/Feeling';
import Header from '../edit/components/Header';
import { DiaryType } from '../../../../type/diary';
import { auth } from '../../../config';
import { useLocalSearchParams } from 'expo-router';
import fetchSelectedDiary from '../../actions/backend/fetchSelectedDiary';
import dayjs from 'dayjs';
import DiaryText from '../../components/diary/DiaryText';
import DiaryImage from '../../components/diary/DiaryImage';

export default function DiaryEdit() {
  const [selectedDiaryInfo, setSelectedDiaryInfo] = useState<DiaryType | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const userId = auth.currentUser?.uid;
  const { diaryId } = useLocalSearchParams<{ diaryId?: string }>();
  const { isTouchFeelingButton } = useLocalSearchParams<{ isTouchFeelingButton?: string }>();

  useEffect(() => {
    fetchSelectedDiary({ userId, diaryId, setSelectedDiaryInfo });
  }, []);

  useEffect(() => {
    if (selectedDiaryInfo) {
      setSelectedFeeling(selectedDiaryInfo?.feeling);
    }
  }, [selectedDiaryInfo?.feeling]);

  useEffect(() => {
    if (selectedDiaryInfo) {
      setDiaryText(selectedDiaryInfo?.diaryText);
    }
  }, [selectedDiaryInfo?.diaryText]);

  useEffect(() => {
    if (selectedDiaryInfo) {
      setSelectedImage(selectedDiaryInfo?.diaryImage);
    }
  }, [selectedDiaryInfo?.diaryImage]);

  // 画像削除
  const handleImageDelete = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerArea}>
          <Header
            userId={userId || ''}
            diaryId={selectedDiaryInfo?.id || ''}
            diaryText={diaryText}
            selectedFeeling={selectedFeeling}
            setDiaryText={setDiaryText}
            setSelectedFeeling={setSelectedFeeling}
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
            diaryDate={selectedDiaryInfo?.diaryDate || dayjs()}
          />
          <Feeling selectedFeeling={selectedFeeling || null} setSelectedFeeling={setSelectedFeeling} isTouchFeelingButton={isTouchFeelingButton === 'true'} />
        </View>
        <ScrollView style={styles.contentArea}>
          {/* 今日の出来事 */}
          <DiaryText diaryText={diaryText} setDiaryText={setDiaryText} />
          {/* 今日の出来事の画像 */}
          <DiaryImage handleImageDelete={handleImageDelete} setSelectedImage={setSelectedImage} selectedImage={selectedImage} />
        </ScrollView>
      </SafeAreaView>
    </>
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
  },
});