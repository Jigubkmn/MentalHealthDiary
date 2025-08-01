import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import HeaderDiaryDateTitle from '../../../components/diary/HeaderDiaryDateTitle';
import BackButton from '../../../components/button/BackButton';
import EditIcon from '../../../components/Icon/EditIcon';
import DeleteIcon from '../../../components/Icon/DeleteIcon';
import formatDate from '../../../actions/formatData';
import deleteDiary from '../actions/backend/deleteDiary';

type Props = {
  userId?: string;
  diaryId: string;
  diaryDate: dayjs.Dayjs;
  selectedUserId?: string;
}

export default function Header({ userId, diaryId, diaryDate, selectedUserId }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(diaryDate);  // diaryDate："2025-07-06T09:21:43.658Z"
  const [selectedDate, setSelectedDate] = useState('');

  const isButtonVisible = selectedUserId === userId;

  useEffect(() => {
    // diaryDateが変更されたらdateも更新
    setDate(diaryDate);
  }, [diaryDate]);

  useEffect(() => {
    // 日付を文字列に変換する関数：◯月◯日(◯)
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
  }, [date]);

  const handleEdit = () => {
    router.push({
      pathname: '/diary/edit/diaryEdit',
      params: {
        diaryId: diaryId,
        isTouchFeelingButton: 'true'
      }
    })
  }

  return (
    <View style={styles.header}>
      {/* ヘッダー左側 */}
      <BackButton />
      {/* 日付タイトル */}
      <HeaderDiaryDateTitle selectedDate={selectedDate} date={date} setDate={setDate} isArrowIcon={false} />
      {/* ヘッダー右側 */}
        <View style={styles.headerRight}>
          {isButtonVisible &&
            <>
              <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
                <EditIcon size={24} color="#FFA500" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() =>deleteDiary(userId, diaryId)}>
                <DeleteIcon size={24} color="#FFA500" />
              </TouchableOpacity>
            </>
          }
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
    backgroundColor: '#ffffff',
  },
  headerRight: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editIcon: {
    marginRight: 8,
  },
});