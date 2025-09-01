import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import BackButton from '../../../components/button/BackButton';
import HeaderDiaryDateTitle from '../../../components/diary/HeaderDiaryDateTitle';
import updateDiary from '../action/backend/updateDiary';
import formatWeekData from '../../../actions/formatWeekData';

type Props = {
  userId: string;
  diaryId: string;
  diaryText: string;
  selectedFeeling: string | null;
  setDiaryText: (text: string) => void;
  setSelectedFeeling: (feeling: string | null) => void;
  setSelectedImage: (image: string | null) => void;
  selectedImage: string | null;
  diaryDate: dayjs.Dayjs;
  originalImageUrl?: string | null;
}

export default function Header({ userId, diaryId, diaryText, selectedFeeling, setDiaryText, setSelectedFeeling, setSelectedImage, selectedImage, diaryDate, originalImageUrl }: Props) {
  const [date, setDate] = useState(diaryDate);  // diaryDate："2025-07-06T09:21:43.658Z"
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    // diaryDateが変更されたらdateも更新
    setDate(diaryDate);
  }, [diaryDate]);

  useEffect(() => {
    // 日付を文字列に変換する関数：◯月◯日(◯)
    const formattedDate = formatWeekData(date);
    setSelectedDate(formattedDate);
  }, [date]);

  // 必須項目が全て入力されているかチェック
  const isFormValid = () => {
    return diaryText && diaryText.trim() !== '' && date && selectedFeeling;
  };

  const handleUpdate = async () => {
    updateDiary(
      diaryText,
      diaryId,
      date,
      selectedFeeling,
      selectedImage,
      setDiaryText,
      setSelectedFeeling,
      setSelectedImage,
      userId,
      originalImageUrl
    );
  }

  return (
    <View style={styles.header}>
      {/* ヘッダー左側 */}
      <BackButton />
      {/* 日付タイトル */}
      <HeaderDiaryDateTitle selectedDate={selectedDate} date={date} setDate={setDate} isArrowIcon={false} />
      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => {handleUpdate()}}
          style={[!isFormValid() ? styles.disabledButton : styles.headerUpdateButton]}
          disabled={!isFormValid()}
        >
          <Text style={[styles.headerButtonText, !isFormValid() && styles.disabledButtonText]}>更新</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 60,
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerUpdateButton: {
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#000000',
  },
  headerButtonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#FFA500',
  },
});