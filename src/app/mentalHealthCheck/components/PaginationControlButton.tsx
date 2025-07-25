import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  isPageCompleted: boolean;
  handleNextPress: () => void;
  handlePrevPress: () => void;
  currentPage: number;
  lastPage: number;
}


export default function PaginationControlButton({ isPageCompleted, handleNextPress, handlePrevPress, currentPage, lastPage }: Props) {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.button,
          !isPageCompleted && styles.buttonDisabled,
        ]}
        onPress={handleNextPress}
        disabled={!isPageCompleted}
      >
        <Text style={styles.buttonText}>
          {currentPage === lastPage ? '結果を見る' : '次のページへ'}
        </Text>
      </TouchableOpacity>
      {currentPage > 0 && (
        <TouchableOpacity style={styles.prevButton} onPress={handlePrevPress}>
          <Text style={styles.prevButtonText}>前のページへ</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFA500',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFDEAD',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  prevButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8D8D8D',
    marginTop: 10,
  },
  prevButtonText: {
    color: '#8D8D8D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});