import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { auth } from '../../../config';
import { MentalHealthCheckType } from '../../../../type/mentalHealthCheck';
import fetchSelectedMentalHealthCheck from './actions/backend/fetchSelectedMentalHealthCheck';
import Header from './components/Header';

// 質問文の定義（mentalHealthCheck.tsxから流用）
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

// ページごとの設定（mentalHealthCheck.tsxから流用）
const pageConfig = [
  {
    questionGroupHeader: '<設問A>',
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
    questionCount: 6,
    answerOptions: [
      { text: '全くない', value: 1 },
      { text: '多少', value: 2 },
      { text: 'かなり', value: 3 },
      { text: '非常に', value: 4 },
    ],
  },
];

export default function MentalHealthCheckHistory() {
  const userId = auth.currentUser?.uid;
  const { mentalHealthCheckId } = useLocalSearchParams<{ mentalHealthCheckId?: string}>();
  const [selectedMentalHealthCheckInfo, setSelectedMentalHealthCheckInfo] = useState<MentalHealthCheckType>();

  const evaluationStyle =
    selectedMentalHealthCheckInfo?.evaluation === '要治療'
      ? styles.evaluationCritical
      : selectedMentalHealthCheckInfo?.evaluation === '要経過観察'
      ? styles.evaluationWarning
      : styles.evaluationNormal;

  useEffect(() => {
    if (userId === null || mentalHealthCheckId === null) return;
    // メンタルヘルスチェック結果の情報を取得
    fetchSelectedMentalHealthCheck({ mentalHealthCheckId, setSelectedMentalHealthCheckInfo, userId });
  }, []);

  const getAnswerText = (questionIndex: number, answerValue?: number): string => {
    if (answerValue === null) {
      return '未回答';
    }

    // 質問インデックスに応じて、どのページの回答選択肢を使うかを決定
    let config;
    const firstPageLimit = pageConfig[0].questionCount;
    const secondPageLimit = firstPageLimit + pageConfig[1].questionCount;

    if (questionIndex < firstPageLimit) {
      config = pageConfig[0];
    } else if (questionIndex < secondPageLimit) {
      config = pageConfig[1];
    } else {
      config = pageConfig[2];
    }

    const option = config.answerOptions.find(opt => opt.value === answerValue);
    return option ? option.text : '不明な回答';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Header createdAt={selectedMentalHealthCheckInfo?.createdAt} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>メンタルヘルスチェック結果</Text>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.scoreTitleContainer}>
            <Text style={styles.scoreTitle}>総合スコア</Text>
            <Text style={[styles.evaluationText, evaluationStyle]}>{selectedMentalHealthCheckInfo?.evaluation}</Text>
          </View>
          <View style={styles.scoreBox}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>設問A (最近1ヶ月の状態)</Text>
              <Text style={styles.scoreValue}>{selectedMentalHealthCheckInfo?.scoreA}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>設問B (仕事・対人関係)</Text>
              <Text style={styles.scoreValue}>{selectedMentalHealthCheckInfo?.scoreA}</Text>
            </View>
          </View>
        </View>

        <View style={styles.qaListContainer}>
          {questions.map((questionText, index) => {
            let sectionHeaderComponent = null;

            if (index === 0) {
              sectionHeaderComponent = (
                <Text style={[styles.sectionHeader, { marginTop: 0 }]}>
                  {'<設問A>\n最近1ヶ月間のあなたの状態について'}
                </Text>
              );
            } else if (index === pageConfig[0].questionCount) {
              sectionHeaderComponent = (
                <Text style={styles.sectionHeader}>
                  {'<設問B-1>\nあなたの仕事について'}
                </Text>
              );
            } else if (index === pageConfig[0].questionCount + pageConfig[1].questionCount) {
              sectionHeaderComponent = (
                <Text style={styles.sectionHeader}>
                  {'<設問B-2>\nあなたの周りの方々について'}
                </Text>
              );
            }

            return (
              <View key={index}>
                {sectionHeaderComponent}
                <View style={styles.qaBlock}>
                  <Text style={styles.questionText}>{`Q${index + 1}. ${questionText}`}</Text>
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>
                      {getAnswerText(index, selectedMentalHealthCheckInfo?.answers[index])}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F0F0F0',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  scoreSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  evaluationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#555',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    marginTop: 4,
  },
  qaListContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 1,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    marginBottom: 16,
    marginTop: 16,
  },
  qaBlock: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  answerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D48800',
  },
  evaluationCritical: {
    color: '#d9534f',
  },
  evaluationWarning: {
    color: '#f0ad4e',
  },
  evaluationNormal: {
    color: '#5cb85c',
  },
});