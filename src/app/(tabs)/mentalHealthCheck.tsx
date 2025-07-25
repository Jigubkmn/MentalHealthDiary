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
import MentalHealthResult from '../mentalHealthCheck/components/MentalHealthResult';
import QuestionList from '../mentalHealthCheck/components/QuestionList';

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

  // 現在のページに表示する質問を計算
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
    return <MentalHealthResult
      pageQuestionCount={PAGE_CONFIG[0].questionCount}
      answers={answers}
      handleRestart={handleRestart}
    />;
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
            <QuestionList
              key={questionIndex}
              text={text}
              questionIndex={questionIndex}
              index={index}
              currentAnswerOptions={currentAnswerOptions}
              answers={answers}
              handleSelectOption={handleSelectOption}
            />
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
});