import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Image } from 'expo-image'
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// 用意した画像をrequireで読み込み、配列にまとめる
// 上から順（良い気分 -> 悪い気分）に並べるのがポイント
const moodImages = [
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../assets/images/excellent_icon.png'), // データ値: 0
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../assets/images/good_icon.png'), // データ値: 1
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../assets/images/normal_icon.png'), // データ値: 2
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../assets/images/bad_icon.png'), // データ値: 3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../assets/images/terrible_icon.png'), // データ値: 4
];

const MoodChartWithIcons = () => {
  // グラフ用のデータ
  const data = {
    labels: ['7/1', '7/6', '7/11', '7/16', '7/21', '7/26', '7/31'],
    datasets: [
      {
        // 画像のグラフをざっくり再現
        // データの値はmoodImagesのインデックスに対応させます (0が一番上、4が一番下)
        data: [
          0, // 7/1: 最高
          1,
          4, // 7/3あたり: 最悪
          2,
          1,
          4, // 7/8あたり: 最悪
          0, // 7/11: 最高
        ],
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 線の色 (黒)
        strokeWidth: 2,
      },
    ],
  };

  // グラフのスタイル設定
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`, // グリッド線やラベルの色
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, // X軸ラベルの色
    strokeWidth: 2,
    // データポイントの丸を非表示にする
    propsForDots: {
      r: '3',
      strokeWidth: '0',
    },
    // Y軸の数値を非表示
    withVerticalLabels: false,
    // 水平のグリッド線を非表示
    withHorizontalLines: false,
    // 垂直のグリッド線は表示
    withVerticalLines: true,
  };

  return (
    <View style={styles.card}>
      {/* グラフエリア */}
      <View style={styles.chartContainer}>
        {/* カスタムY軸 (アイコン) */}
        <View style={styles.customYAxis}>
          {moodImages.map((imgSrc, index) => (
            <Image
              key={index}
              source={imgSrc}
              style={styles.moodIcon}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ))}
        </View>

        {/* グラフ本体 */}
        <LineChart
          data={data}
          width={screenWidth - 80} // カードのpaddingやY軸の幅を引く
          height={220}
          chartConfig={chartConfig}
          withHorizontalLabels={false} // Y軸のラベルを描画しないためのオフセット
          withHorizontalLines={true} // 水平線を表示
          withDots={true} // データポイントを非表示
          // bezierを付けないことで、カクカクした線になる
          style={styles.chart}
          // データを0から開始しないようにする（データの最小値が基点になる）
          fromZero={false}
          // Y軸のラベルを描画しないためのオフセット
          yLabelsOffset={20}
          // 5段階なので4つの区切り
          segments={4}
        />
      </View>
    </View>
  );
};

// スタイル定義
const styles = StyleSheet.create({
  card: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    // 影をつけたい場合
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // アイコンとグラフの上端を合わせる
  },
  customYAxis: {
    height: 220, // グラフの高さと合わせる
    justifyContent: 'space-between', // アイコンを均等に配置
    paddingRight: 10,
    paddingVertical: 5, // 上下の余白を微調整
  },
  moodIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  chart: {
    // グラフの左側に余白が自動で入る場合があるので、マイナスマージンで調整
    marginLeft: -15,
  },
});

export default MoodChartWithIcons;