import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

type Props = {
  pageQuestionCount: number;
  answers: (number | null)[];
  handleRestart: () => void;
}

export default function MentalHealthResult({ pageQuestionCount, answers, handleRestart }: Props) {
  // 1. スコアを分割して計算
  const page1QuestionsCount = pageQuestionCount;
  const page1Answers = answers.slice(0, page1QuestionsCount);
  const page2And3Answers = answers.slice(page1QuestionsCount);

  const page1Score = page1Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
  const page2And3Score = page2And3Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);

  // 2. 結果メッセージ用の変数を初期化
  let resultTitle = '';
  let resultMessage = '';

  // 3. 条件分岐
  const isHighStressCondition =
    (page1Score >= 31 && page2And3Score <= 38) ||
    (page1Score >= 23 && page2And3Score >= 39);

  if (isHighStressCondition) {
    // 条件1または条件2の場合
    resultTitle = 'ストレスがかなり高い状態です';
    resultMessage = '診断結果から、あなたは現在、心身に大きな負担がかかっている可能性があります。このまま一人で抱え込まず、できるだけ早く専門家へ相談することをお勧めします。\nお近くの精神科・心療内科、または公的な相談窓口にご相談ください。';
  } else {
    // 条件3の場合
    resultTitle = 'お疲れ様でした';
    resultMessage = 'あなたは現在、ある程度のストレスを感じているようですが、今のところ深刻な状態ではないようです。\n日々の生活の中で意識的にリラックスする時間を作ったり、自分の好きなことをする時間を大切にしたりすることが、今後の心の健康につながります。';
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultTitle}>{resultTitle}</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{resultMessage}</Text>
          </View>

          <View style={styles.debugScoreBox}>
            <Text style={styles.debugScoreText}>ページ1スコア: {page1Score}</Text>
            <Text style={styles.debugScoreText}>ページ2&3スコア: {page2And3Score}</Text>
          </View>

          <Text style={styles.disclaimer}>
            ※この結果は医学的な診断に代わるものではありません。気分の落ち込みが続く場合や、心配なことがある場合は、専門の医療機関にご相談ください。
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>もう一度試す</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 40,
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
    color: '#333',
  },
  resultBox: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FEEABC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 8,
    color: '#555',
  },
  debugScoreBox: {
    padding: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 4,
    marginBottom: 24
  },
  debugScoreText: {
    fontSize: 12,
    color: '#555'
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});