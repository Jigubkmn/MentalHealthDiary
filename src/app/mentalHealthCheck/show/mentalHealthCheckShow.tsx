import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

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

// --- ここからが仮データです ---
// DBから取得したと仮定する、23個の質問に対する回答データ
// 1から4までのランダムな数値を生成して仮の回答としています。
const mockAnswers: (number | null)[] = Array.from({ length: 23 }, () => Math.floor(Math.random() * 4) + 1);
const mockScoreA = 30; // 仮のスコアA
const mockScoreB = 15; // 仮のスコアB
const mockDate = "2023年10月27日"; // 仮の実施日
// --- 仮データはここまで ---

export default function MentalHealthCheckHistory() {

  /**
   * 質問インデックスと回答の値から、対応する回答テキストを取得するヘルパー関数
   * @param questionIndex - 質問のインデックス (0-22)
   * @param answerValue - 回答の値 (1-4)
   * @returns 回答のテキスト（例：「ときどきあった」）
   */
  const getAnswerText = (questionIndex: number, answerValue: number | null): string => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>メンタルヘルスチェック履歴</Text>
          <Text style={styles.headerDate}>実施日: {mockDate}</Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreTitle}>総合スコア</Text>
          <View style={styles.scoreBox}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>設問A (最近1ヶ月の状態)</Text>
              <Text style={styles.scoreValue}>{mockScoreA}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>設問B (仕事・対人関係)</Text>
              <Text style={styles.scoreValue}>{mockScoreB}</Text>
            </View>
          </View>
        </View>

        <View style={styles.qaListContainer}>
          {questions.map((questionText, index) => {
            let sectionHeaderComponent = null;

            // 各セクションの開始インデックスでヘッダーを生成
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
              // keyは一番外側の要素に設定
              <View key={index}>
                {sectionHeaderComponent}
                <View style={styles.qaBlock}>
                  <Text style={styles.questionText}>{`Q${index + 1}. ${questionText}`}</Text>
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>
                      {getAnswerText(index, mockAnswers[index])}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  headerDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
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
    marginTop: 16, // セクション間のスペース
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
    alignSelf: 'flex-start', // 回答の幅をテキストに合わせる
  },
  answerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D48800',
  },
});