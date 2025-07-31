import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  text: string;
  questionIndex: number;
  index: number;
  currentAnswerOptions: {
    text: string;
    value: number;
  }[];
  answers: (number | null)[];
  handleSelectOption: (questionIndex: number, value: number) => void;
}
export default function QuestionList({ text, questionIndex, index, currentAnswerOptions, answers, handleSelectOption }: Props) {
  return (
    <View key={questionIndex} style={styles.questionBlock}>
      <Text style={styles.questionText}>{`Q${index + 1}. ${text}`}</Text>
      <View>
        {/* 【変更】ページごとの回答選択肢を使用 */}
        {currentAnswerOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              answers[questionIndex] === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => handleSelectOption(questionIndex, option.value)}
          >
            <Text style={[
              styles.optionText,
              answers[questionIndex] === option.value && styles.optionTextSelected,
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  questionBlock: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: '#F7F7F7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderColor: '#FFA500',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#D48800',
  },
});