import React from 'react'
import { StyleSheet, TextInput, View, Text } from 'react-native';

type Props = {
  diaryText: string;
  setDiaryText: (text: string) => void;
}

export default function DiaryText({ diaryText, setDiaryText }: Props) {
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.textInputTitle}>今日の出来事</Text>
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="今日の出来事を入力してください"
        value={diaryText}
        onChangeText={setDiaryText}
        textAlignVertical="top"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  textInputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  textInputTitle: {
    fontSize: 16,
    lineHeight: 30,
    color: '#000000',
    marginLeft: 8,
    marginVertical: 8,
  },
  textInput: {
    height: 250,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
});