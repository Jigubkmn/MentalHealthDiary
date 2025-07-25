import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';

// --- データ定義 ---

// 仮の質問リスト（23個）
const QUESTIONS = Array.from({ length: 23 }, (_, i) => {
  const topics = [
    'ひどく疲れた', 'へとへとだ', 'だるい', '気がはりつめている', '不安だ', '落ち着かない',
    'ゆううつだ', '何をするのも面倒だ', '気分が晴れない', '食欲がない', 'よく眠れない',
    '非常にたくさんの仕事をしないといけない', '時間内に仕事が処理しきれない', '一生懸命働かなければならない',
    '自分のベースで仕事ができない', '自分で仕事の手順・やり方を決めることができない', '職場の仕事の方針に自分の意見を反映できない',
    '上司たちとどのくらい気軽に話ができますか？', '同僚たちとどのくらい気軽に話ができますか？', 'あなたが困った時、上司はどのくらい頼りになりますか？',
    'あなたが困った時、同僚はどのくらい頼りになりますか？', 'あなたの個人的な話を上司はどのくらい聞いてくれますか？', 'あなたの個人的な話を同僚はどのくらい聞いてくれますか？',
  ];
  return topics[i];
});

// 【変更】ページごとの設定をまとめて定義
const PAGE_CONFIG = [
  {
    header: '最近1ヶ月のあなたの状態についてうかがいます。\n最もあてはまるものを解答してください。',
    questionCount: 11,
    answerOptions: [
      { text: 'ほとんどなかった', value: 1 },
      { text: 'ときどきあった', value: 2 },
      { text: 'しばしばあった', value: 3 },
      { text: 'ほとんどいつもあった', value: 4 },
    ],
  },
  {
    header: 'あなたの仕事について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [ // 2ページ目用の選択肢
      { text: 'ちがう', value: 1 },
      { text: 'ややちがう', value: 2 },
      { text: 'まあそうだ', value: 3 },
      { text: 'そうだ', value: 4 },
    ],
  },
  {
    header: 'あなたの上司と同僚について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [ // 3ページ目用の選択肢
      { text: '全くない', value: 1 },
      { text: '多少', value: 2 },
      { text: 'かなり', value: 3 },
      { text: '非常に', value: 4 },
    ],
  },
];

const TOTAL_PAGES = PAGE_CONFIG.length;

// --- メインコンポーネント ---

export default function mentalHealthCheck() {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 【変更】現在のページ設定をまとめて取得
  const {
    header: currentPageHeader,
    questionCount: currentPageQuestionCount,
    answerOptions: currentAnswerOptions,
  } = PAGE_CONFIG[currentPage];

  // 【変更】現在のページに表示する質問を計算
  const currentQuestions = useMemo(() => {
    // 現在のページまでの質問数を合計して開始インデックスを計算
    const startIndex = PAGE_CONFIG.slice(0, currentPage).reduce(
      (acc, config) => acc + config.questionCount,
      0
    );
    const endIndex = startIndex + currentPageQuestionCount;
    return QUESTIONS.slice(startIndex, endIndex).map((question, index) => ({
      text: question,
      questionIndex: startIndex + index,
    }));
  }, [currentPage, currentPageQuestionCount]);

  // 現在のページの質問がすべて回答済みかチェック
  const isPageCompleted = useMemo(() => {
    return currentQuestions.every(
      (q) => answers[q.questionIndex] !== null
    );
  }, [answers, currentQuestions]);

  // --- (以降のハンドラはほぼ変更なし) ---

  const handleSelectOption = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNextPress = () => {
    if (!isPageCompleted) {
      Alert.alert('未回答の質問があります', 'このページのすべての質問に回答してください。');
      return;
    }
    if (currentPage < TOTAL_PAGES - 1) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentPage(currentPage + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevPress = () => {
    if (currentPage > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRestart = () => {
    setCurrentPage(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setIsCompleted(false);
  };

  // --- レンダリング ---

  if (isCompleted) {
    // 1. スコアを分割して計算
    const page1QuestionsCount = PAGE_CONFIG[0].questionCount;
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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

          {/* 【追加】ページヘッダー */}
          <Text style={styles.pageHeader}>{currentPageHeader}</Text>

          {/* 質問リスト */}
          {currentQuestions.map(({ text, questionIndex }, index) => (
            <View key={questionIndex} style={styles.questionBlock}>
              <Text style={styles.questionText}>{`Q${index + 1}. ${text}`}</Text>
              <View style={styles.optionsContainer}>
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
          ))}

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
  // 【追加】ページヘッダーのスタイル
  pageHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    paddingBottom: 10,
  },
  questionBlock: {
    marginBottom: 28,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {},
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
  resultBox: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FEEABC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
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