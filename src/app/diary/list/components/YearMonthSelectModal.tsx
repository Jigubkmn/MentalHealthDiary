import React from 'react'
import Modal from "react-native-modal";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';

type Props = {
  setModalVisible: (visible: boolean) => void;
  setDisplayDate: (date: dayjs.Dayjs) => void;
  selectedYearMonth: string;
  setSelectedYearMonth: (yearMonth: string) => void;
  isModalVisible: boolean;
}
export default function YearMonthSelectModal({
  setModalVisible,
  setDisplayDate,
  selectedYearMonth,
  setSelectedYearMonth,
  isModalVisible,
}: Props) {

  // ピッカー用の年月リストを生成する
  const generateYearMonths = () => {
    const list = [];

    const startYear = dayjs().year() - 10;
    const endYear = dayjs().year() + 10;
    for (let year = endYear; year >= startYear; year--) {
      // 新しい月から表示するため、12月から1月へループ
      for (let month = 12; month >= 1; month--) {
        list.push({
          label: `${year}年${month}月`,
          value: `${year}-${month}`
        });
      }
    }
    return list;
  };
  const yearMonths = generateYearMonths();


  // モーダルを閉じる
  const handleModalClose = () => {
    setModalVisible(false);
  }

  // OKボタンが押されたら表示年月を更新
  const handleModalConfirm = () => {
    // 'YYYY-M'形式の文字列からdayjsオブジェクトを生成
    setDisplayDate(dayjs(selectedYearMonth));
    setModalVisible(false);
  }

    // 「今月」ボタンが押されたときの処理
  const handleSelectThisMonth = () => {
    // 現在の年月を'YYYY-M'形式で取得
    const currentMonth = dayjs().format('YYYY-M');
    // ピッカーの選択値を現在の年月に更新する
    setSelectedYearMonth(currentMonth);
  };


  return (
    <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleModalClose} // 背景をタップしたら閉じる
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleModalClose} style={styles.modalHeaderButton}>
              <Text style={styles.modalButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSelectThisMonth} style={styles.modalHeaderButton}>
              <Text style={[styles.modalButtonText, styles.modalConfirmText]}>今月</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleModalConfirm} style={styles.modalHeaderButton}>
              <Text style={[styles.modalButtonText, styles.modalConfirmText]}>OK</Text>
            </TouchableOpacity>
          </View>
          {/* ピッカー */}
          <Picker
            selectedValue={selectedYearMonth}
            onValueChange={(itemValue) => setSelectedYearMonth(itemValue)}
          >
            {yearMonths.map(item => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20, // SafeAreaViewを考慮する場合は調整
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalConfirmText: {
    fontWeight: 'bold',
  },
  noDiaryText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888888',
  },
})