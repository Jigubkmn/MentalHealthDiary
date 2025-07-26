import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, StatusBar, ScrollView } from 'react-native';
import MentalHealthResult from '../components/MentalHealthResult';
import QuestionList from '../components/QuestionList';
import ProgressIndicator from '../components/ProgressIndicator';
import PaginationControlButton from '../components/PaginationControlButton';
import dayjs from 'dayjs';
import { auth } from '../../../config';
import createMentalHealthCheckResult from '../actions/backend/createMentalHealthCheckResult';
import getScoreResult from '../actions/getScoreResult';
import checkExistingMentalHealthCheckResult from '../actions/checkExistingMentalHealthCheckResult';

const questions = Array.from({ length: 23 }, (_, i) => {
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

const pageConfig = [
  {
    questionGroupHeader: '<設問A>',
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
    questionGroupHeader: '<設問B-1>',
    header: 'あなたの仕事について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [
      { text: 'ちがう', value: 1 },
      { text: 'ややちがう', value: 2 },
      { text: 'まあそうだ', value: 3 },
      { text: 'そうだ', value: 4 },
    ],
  },
  {
    questionGroupHeader: '<設問B-2>',
    header: 'あなたの上司と同僚について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [
      { text: '全くない', value: 1 },
      { text: '多少', value: 2 },
      { text: 'かなり', value: 3 },
      { text: '非常に', value: 4 },
    ],
  },
];

const totalPages = pageConfig.length;
const lastPage = totalPages - 1;

export default function mentalHealthCheckCreate() {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [isCompleted, setIsCompleted] = useState(false);
  // const [scoreAResult, setScoreAResult] = useState<number | null>(null); // 設問Aの合計
  // const [scoreBResult, setScoreBResult] = useState<number | null>(null); // 設問B-1とB-2の合計
  const [evaluationResult, setEvaluationResult] = useState<string>(''); // 最終評価
  const [isExistingMentalHealth, setIsExistingMentalHealth] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const today = dayjs(); // "2025-07-06T09:16:59.082Z"
  const userId = auth.currentUser?.uid;

  // 現在のページ設定をまとめて取得
  const {
    questionGroupHeader: currentPageQuestionGroupHeader,
    header: currentPageHeader,
    questionCount: currentPageQuestionCount,
    answerOptions: currentAnswerOptions,
  } = pageConfig[currentPage];

  // 現在のページに表示する質問を計算
  const currentQuestions = useMemo(() => {
    // 現在のページまでの質問数を合計して開始インデックスを計算
    const startIndex = pageConfig.slice(0, currentPage).reduce(
      (acc, config) => acc + config.questionCount,
      0
    );
    const endIndex = startIndex + currentPageQuestionCount;
    return questions.slice(startIndex, endIndex).map((question, index) => ({
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


  useEffect(() => {
  const checkExistingMentalHealth = async () => {
  // 同じ日付のメンタルヘルスチェック結果が既に存在するかチェック
  const hasExistingMentalHealthCheckResult = await checkExistingMentalHealthCheckResult(userId ?? '', today);
  if (hasExistingMentalHealthCheckResult) {
      setIsExistingMentalHealth(true);
    } else {
      setIsExistingMentalHealth(false);
    }
  }
  checkExistingMentalHealth();
  }, []);

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
    if (currentPage < lastPage) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentPage(currentPage + 1);
    } else {
      const { scoreA, scoreB, evaluation } = getScoreResult(pageConfig[0].questionCount, answers);
      // setScoreAResult(scoreA);
      // setScoreBResult(scoreB);
      setEvaluationResult(evaluation);
      setIsCompleted(true);
      if (!userId) return;
      createMentalHealthCheckResult(answers, evaluation, scoreA, scoreB, userId);
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
    setAnswers(Array(questions.length).fill(null));
    setIsCompleted(false);
  };

  // 結果画面
  if (isCompleted) {
    return <MentalHealthResult
      evaluationResult={evaluationResult}
      handleRestart={handleRestart}
    />;
  }

  if (isExistingMentalHealth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>本日のチェックは完了しています</Text>
          <Text style={styles.messageBody}>お疲れ様でした。</Text>
          <Text style={styles.messageBody}>次回のメンタルヘルスチェックは明日以降に可能です。</Text>
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
          {/* 進捗バー */}
          <ProgressIndicator currentPage={currentPage} totalPages={totalPages} />
          {/* ページヘッダー */}
          <Text style={styles.pageGroupHeader}>{currentPageQuestionGroupHeader}</Text>
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
          {/* ボタン */}
          <PaginationControlButton
            isPageCompleted={isPageCompleted}
            handleNextPress={handleNextPress}
            handlePrevPress={handlePrevPress}
            currentPage={currentPage}
            lastPage={lastPage}
          />
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
  messageContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 16,
  },
  messageBody: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24, // 行間を少し空けると読みやすい
  },
  card: {
    flex: 1,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 20,
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
  pageGroupHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  pageHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    paddingBottom: 10,
  },
});