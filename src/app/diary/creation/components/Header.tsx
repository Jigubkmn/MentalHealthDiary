import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import formatWeekDate from '../../../actions/formatWeekData';
import HeaderDiaryDateTitle from '../../../components/diary/HeaderDiaryDateTitle';
import BackButton from '../../../components/button/BackButton';
import createDiary from '../action/backend/createDiary';
import { UserInfoType } from '../../../../../type/userInfo';

type Props = {
  diaryText: string;
  selectedFeeling: string | null;
  setDiaryText: (text: string) => void;
  setSelectedFeeling: (feeling: string | null) => void;
  setSelectedImage: (image: string | null) => void;
  isShowBackButton: boolean;
  selectedImage: string | null;
  userInfo: UserInfoType | null;
  userId?: string;
}

export default function Header({
  diaryText,
  selectedFeeling,
  setDiaryText,
  setSelectedFeeling,
  setSelectedImage,
  isShowBackButton,
  selectedImage,
  userInfo,
  userId
}: Props) {
  const today = dayjs(); // "2025-07-06T09:17:23.408Z"
  const [date, setDate] = useState(today); // "2025-07-06T09:16:59.082Z"
  const [selectedDate, setSelectedDate] = useState(""); // 7月6日(日)

  useEffect(() => {
  // 日付を文字列に変換する関数：◯月◯日(◯)
    const formattedDate = formatWeekDate(date);
    setSelectedDate(formattedDate);
  }, [date])

  // 必須項目が全て入力されているかチェック
  const isFormValid = () => {
    return diaryText && diaryText.trim() !== '' && date && selectedFeeling;
  };

  // 日記を保存
  const handleSave = async () => {
    try {
      await createDiary(
        selectedFeeling,
        selectedImage,
        date,
        diaryText,
        setDiaryText,
        setSelectedFeeling,
        setSelectedImage,
        userInfo?.userName || '',
        userInfo?.userImage || '',
        userId
      );
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <View style={styles.header}>
      {/* ヘッダー左側 */}
      {isShowBackButton ? (
        <BackButton />
      ) : (
        <View style={styles.headerLeft}>
          {/* 左側のスペーサー - タブからアクセスした場合は空のスペース */}
        </View>
      )}
      {/* 日付タイトル */}
      <HeaderDiaryDateTitle selectedDate={selectedDate} date={date} setDate={setDate} isArrowIcon={true} />
      {/* ヘッダー右側 */}
      <TouchableOpacity
        onPress={() => {handleSave()}}
        style={[isFormValid() ? styles.headerSaveButton : styles.disabledButton]}
        disabled={!isFormValid()}
      >
        <Text style={[styles.headerButtonText, !isFormValid() && styles.disabledButtonText]}>保存</Text>
      </TouchableOpacity>
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
  headerLeft: {
    width: 60,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#FFA500',
  },
  headerSaveButton: {
    width: 60,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  disabledButton: {
    width: 60,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#999999',
  },
});