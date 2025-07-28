import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { auth } from '../../../config';
import { MentalHealthCheckType } from '../../../../type/mentalHealthCheck';
import fetchSelectedMentalHealthCheck from './actions/backend/fetchSelectedMentalHealthCheck';
import Header from './components/Header';
import { questionTexts } from '../../constants/questionTexts';
import { pageConfig } from '../../constants/pageConfig';

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
            {questionTexts.map((questionText, index) => {
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
    borderBottomColor: '#D9D9D9',
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
    color: '#D9534F',
  },
  evaluationWarning: {
    color: '#F0AD4E',
  },
  evaluationNormal: {
    color: '#5CB85C',
  },
});