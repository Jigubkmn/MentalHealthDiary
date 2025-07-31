import React from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native';

type Props = {
  evaluationResult: string
}

export default function MentalHealthResult({ evaluationResult }: Props) {
  let resultTitle = '';
  let resultMessage = '';

  if (evaluationResult === '要治療') {
    resultTitle = evaluationResult;
    resultMessage = '診断結果から、あなたは現在、心身に大きな負担がかかっている可能性があります。このまま一人で抱え込まず、できるだけ早く専門家へ相談することをお勧めします。\nお近くの精神科・心療内科、または公的な相談窓口にご相談ください。';
  } else if (evaluationResult === '要経過観察') {
    resultTitle = evaluationResult;
    resultMessage = '診断結果から、あなたは現在、一定のストレスを抱えている状態のようです。今のところ深刻な問題はありませんが、ストレスが溜まり始めているサインかもしれません。\n意識的に休息を取ったり、気分転換になる活動を取り入れたりして、ご自身の心の状態に注意を払ってみましょう。';
  } else {
    resultTitle = '異常なし';
    resultMessage = 'お疲れ様です。現在のあなたの心の状態は、良好なようです。\n日々のストレスにうまく対処できている証拠ですね。\nこれからも、リラックスする時間や好きなことを楽しむ時間を大切にして、素晴らしい毎日をお過ごしください。';
  }

  return (
    <View style={styles.card}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultTitle}>{resultTitle}</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{resultMessage}</Text>
        </View>

        <Text style={styles.disclaimer}>
          ※この結果は医学的な診断に代わるものではありません。気分の落ち込みが続く場合や、心配なことがある場合は、専門の医療機関にご相談ください。
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000000',
  },
  resultBox: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FEEABC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  resultText: {
    fontSize: 16,
    color: '#555555',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 18,
  },
});