import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import MentalHealthResult from './components/MentalHealthResult';
import QuestionList from '../components/QuestionList';
import ProgressIndicator from '../components/ProgressIndicator';
import PaginationControlButton from '../components/PaginationControlButton';
import dayjs from 'dayjs';
import { auth } from '../../../config';
import createMentalHealthCheckResult from './actions/backend/createMentalHealthCheckResult';
import getScoreResult from '../actions/getScoreResult';
import checkExistingMentalHealthCheckResult from '../actions/checkExistingMentalHealthCheckResult';
import { questionTexts } from '../../constants/questionTexts';
import { pageConfig } from '../../constants/pageConfig';
import Header from './components/Header';
import AlreadyChecked from './components/AlreadyChecked';

const totalPages = pageConfig.length;
const lastPage = totalPages - 1;

export default function mentalHealthCheckCreate() {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questionTexts.length).fill(null));
  const [isCompleted, setIsCompleted] = useState(false);
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
    return questionTexts.slice(startIndex, endIndex).map((question, index) => ({
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bodyContainer}>
        <Header />
        {isExistingMentalHealth ? (
          // 本日はメンタルヘルスチェック完了済み
          <AlreadyChecked />
        ) : isCompleted ? (
          // 結果画面
          <MentalHealthResult evaluationResult={evaluationResult} />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.card}
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
            <View style={{ height: 10 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bodyContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F0F0F0',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 10,
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
    fontSize: 16,
    lineHeight: 24,
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