import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ScrollView, // ScrollViewをインポート
} from 'react-native';

// --- データ定義 ---

// 仮の質問リスト（23個）
const QUESTIONS = Array.from({ length: 23 }, (_, i) => {
  const topics = [
    'よく眠れていますか？', '食欲はありますか？', '物事に集中できますか？',
    '気分が落ち込むことがありますか？', '将来に希望が持てますか？', 'イライラすることはありますか？',
    '疲れやすいと感じますか？', '物事を楽しめていますか？', '自分に価値がないと感じますか？',
    '不安で落ち着かないことがありますか？', '人に会いたいと思いますか？', '朝、すっきりと起きられますか？',
    '自分の見た目に満足していますか？', 'ささいなことで動揺しますか？', '決断するのが難しいですか？',
    'リラックスする時間がありますか？', '頭がスッキリしていますか？', '体が重いと感じますか？',
    '誰かに相談したいと感じますか？', '物事を肯定的に考えられますか？', '趣味に没頭できていますか？',
    '1日の終わりに満足感がありますか？', '自分を責めてしまうことがありますか？',
  ];
  return `【質問 ${i + 1}】 ${topics[i] || '最近のあなたの状態について教えてください。'}`;
});

// 回答の選択肢
const ANSWER_OPTIONS = [
  { text: '全くない', value: 0 },
  { text: '時々あった', value: 1 },
  { text: 'しばしばあった', value: 2 },
  { text: 'ほとんどいつもあった', value: 3 },
];

const QUESTIONS_PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE);

// --- メインコンポーネント ---

export default function mentalHealthCheck() {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [isCompleted, setIsCompleted] = useState(false);
  // 【追加】ScrollViewへの参照を作成
  const scrollViewRef = useRef<ScrollView>(null);

  // 現在のページに表示する質問を計算
  const currentQuestions = useMemo(() => {
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return QUESTIONS.slice(startIndex, endIndex).map((question, index) => ({
      text: question,
      questionIndex: startIndex + index, // 全体での質問インデックス
    }));
  }, [currentPage]);

  // 現在のページの質問がすべて回答済みかチェック
  const isPageCompleted = useMemo(() => {
    return currentQuestions.every(
      (q) => answers[q.questionIndex] !== null
    );
  }, [answers, currentQuestions]);

  // 回答選択時の処理
  const handleSelectOption = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  // 「次へ」ボタン押下時の処理
  const handleNextPress = () => {
    if (!isPageCompleted) {
      Alert.alert('未回答の質問があります', 'このページのすべての質問に回答してください。');
      return;
    }
    if (currentPage < TOTAL_PAGES - 1) {
      // 【追加】スクロールを一番上に戻す
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentPage(currentPage + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // 「前に戻る」ボタン押下時の処理
  const handlePrevPress = () => {
    if (currentPage > 0) {
      // 【追加】スクロールを一番上に戻す
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentPage(currentPage - 1);
    }
  };

  // もう一度試す処理
  const handleRestart = () => {
    setCurrentPage(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setIsCompleted(false);
  };

  // --- レンダリング ---

  if (isCompleted) {
    const totalScore = answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultTitle}>チェック完了</Text>
          <Text style={styles.resultText}>お疲れ様でした。</Text>
          <Text style={styles.resultText}>あなたの合計スコアは {totalScore} 点です。</Text>
          <Text style={styles.disclaimer}>
            ※この結果は医学的な診断に代わるものではありません。気分の落ち込みが続く場合や、心配なことがある場合は、専門の医療機関にご相談ください。
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>もう一度試す</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {/* プログレスバー */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              ページ {currentPage + 1} / {TOTAL_PAGES}
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentPage + 1) / TOTAL_PAGES) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* 質問リスト */}
          {currentQuestions.map(({ text, questionIndex }) => (
            <View key={questionIndex} style={styles.questionBlock}>
              <Text style={styles.questionText}>{text}</Text>
              <View style={styles.optionsContainer}>
                {ANSWER_OPTIONS.map((option) => (
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
          ))}

          {/* ボタンエリア */}
          <View style={styles.buttonContainer}>
            {currentPage > 0 && (
              <TouchableOpacity style={styles.prevButton} onPress={handlePrevPress}>
                <Text style={styles.prevButtonText}>前のページへ</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                !isPageCompleted && styles.buttonDisabled,
              ]}
              onPress={handleNextPress}
              disabled={!isPageCompleted}
            >
              <Text style={styles.buttonText}>
                {currentPage === TOTAL_PAGES - 1 ? '結果を見る' : '次のページへ'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- スタイル定義 ---

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
    padding: 20,
    marginVertical: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 4,
  },
  questionBlock: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  optionsContainer: {
    // 選択肢のレイアウト調整（必要に応じて）
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
  buttonContainer: {
    marginTop: 20,
  },
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
    borderColor: '#FFA500',
    marginBottom: 12,
  },
  prevButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 8,
    color: '#555',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});