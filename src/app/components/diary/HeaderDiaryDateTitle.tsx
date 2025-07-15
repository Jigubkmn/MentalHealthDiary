import React from 'react'
import dayjs from 'dayjs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import handlePreviousDay from '../../actions/handlePreviousDay';
import handleNextDay from '../../actions/handleNextDay';
import RightArrowIcon from '../Icon/RightArrowIcon';
import LeftArrowIcon from '../Icon/LeftArrowIcon';

type Props = {
  selectedDate: string;
  date: dayjs.Dayjs;
  setDate: (date: dayjs.Dayjs) => void;
  isArrowIcon: boolean;
}

export default function HeaderDiaryDateTitle({ selectedDate, date, setDate, isArrowIcon }: Props) {
  return (
    <View style={styles.dateContainer}>
      {isArrowIcon ? (
        <>
          <TouchableOpacity onPress={() => {handlePreviousDay(date, setDate)}} style={styles.iconButton}>
            <LeftArrowIcon size={24} color="black" />
          </TouchableOpacity>
          {/* 日付表示 */}
          <Text style={styles.headerTitle}>{selectedDate}</Text>
          <TouchableOpacity onPress={() => {handleNextDay(date, setDate)}} style={styles.iconButton}>
            <RightArrowIcon size={24} color="black" />
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.headerTitle}>{selectedDate}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 8,
  },

});