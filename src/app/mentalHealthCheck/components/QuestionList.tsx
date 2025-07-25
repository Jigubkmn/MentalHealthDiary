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
    marginBottom: 16,
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderColor: '#FFA500',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#D48800',
  },
});