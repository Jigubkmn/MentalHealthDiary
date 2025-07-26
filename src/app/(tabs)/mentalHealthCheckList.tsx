import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView, // FlatListの代わりにScrollViewをインポート
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';

// --- 表示するダミーデータ ---
const DUMMY_RESULTS = [
  {
    id: '1',
    date: '2025/7/17',
    evaluation: '要治療',
    scoreA: 80,
    scoreB: 75,
  },
  {
    id: '2',
    date: '2025/6/15',
    evaluation: '要経過観察',
    scoreA: 65,
    scoreB: 70,
  },
  {
    id: '3',
    date: '2025/5/12',
    evaluation: '異常なし',
    scoreA: 40,
    scoreB: 35,
  },
  {
    id: '4',
    date: '2025/4/18',
    evaluation: '異常なし',
    scoreA: 30,
    scoreB: 28,
  },
];

export default function mentalHealthCheckList() {
  // 詳細ボタンが押されたときの処理
  const handlePressDetail = () => {
    Alert.alert(
      '詳細ページへ遷移',
      `の結果の詳細を表示します。`,
      [{ text: 'OK' }]
    );
    // 例: navigation.navigate('ResultDetail', { resultId: item.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>メンタルヘルスチェック結果一覧</Text>
      <View style={styles.tableContainer}>
        {/* ScrollViewでコンテンツ全体を囲む */}
        <ScrollView>
          {/* ヘッダー行を最初に配置 */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.dateCell]}>日付</Text>
            <Text style={[styles.headerCell, styles.evaluationCell]}>評価</Text>
            <Text style={[styles.headerCell, styles.scoreCell]}>スコア</Text>
            <View style={[styles.headerCell, styles.buttonCell]} />
          </View>
          {/* mapメソッドでデータを繰り返し表示 */}
          {DUMMY_RESULTS.map((item) => {
            // 評価に応じて文字色を変えるためのスタイルを決定
            const evaluationStyle =
              item.evaluation === '要治療'
                ? styles.evaluationCritical
                : item.evaluation === '要経過観察'
                ? styles.evaluationWarning
                : styles.evaluationNormal;

            return (
              // 各行に一意の `key` を設定することが重要
              <View key={item.id} style={styles.dataRow}>
                <Text style={[styles.dataCell, styles.dateCell]}>{item.date}</Text>
                <Text style={[styles.dataCell, styles.evaluationCell, evaluationStyle]}>
                  {item.evaluation}
                </Text>
                <Text style={[styles.dataCell, styles.scoreCell]}>
                  {`スコアA: ${item.scoreA}\nスコアB: ${item.scoreB}`}
                </Text>
                <View style={[styles.dataCell, styles.buttonCell]}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handlePressDetail()}
                  >
                    <Text style={styles.detailButtonText}>詳細</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- スタイル定義 (変更なし) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dataCell: {
    padding: 12,
    textAlign: 'center',
  },
  dateCell: {
    flex: 3,
  },
  evaluationCell: {
    flex: 3.5,
  },
  scoreCell: {
    flex: 3,
  },
  buttonCell: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evaluationCritical: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
  evaluationWarning: {
    color: '#f0ad4e',
  },
  evaluationNormal: {
    color: '#5cb85c',
  },
  detailButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  detailButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});