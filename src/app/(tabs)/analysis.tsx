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
        data: [0, 1, 4, 2, 1, 4, 0],
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // 線の色（オレンジ）
        strokeWidth: 3, // 線の太さを増加
      },
    ],
  };

  // グラフのスタイル設定
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // グリッド線の色（黒）
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // X軸ラベルの色
    strokeWidth: 2,
    // データポイントの丸を非表示にする
    propsForDots: {
      r: '3',
      strokeWidth: '0',
      fill: '#FFA500',
    },
    // グリッド線の設定
    propsForBackgroundLines: {
      strokeDasharray: '', // 実線
      strokeWidth: 1, // 線の太さ
      stroke: '#000000', // 線の色
    },
    // Y軸の線を表示
    propsForVerticalLabels: {
      fontSize: 0, // Y軸ラベルは非表示
    },
    // X軸の線を表示
    propsForHorizontalLabels: {
      fontSize: 12, // X軸ラベルのフォントサイズ

    },
  };

  return (
    <View style={styles.card}>
      {/* グラフエリア */}
      <View style={styles.chartContainer}>
        {/* グラフ本体 */}
        <LineChart
          data={data}
          width={screenWidth - 80} // カードのpaddingやY軸の幅を引く
          height={220}
          chartConfig={chartConfig}
          withHorizontalLabels={false} // Y軸のラベルを描画しないためのオフセット
          withVerticalLabels={true} // X軸のラベルは表示
          withHorizontalLines={true} // 水平線を表示
          withVerticalLines={true} // 垂直線を表示
          withDots={true} // データポイントを非表示
          // bezierを付けないことで、カクカクした線になる
          // データを0から開始しないようにする（データの最小値が基点になる）
          fromZero={false}
          // 5段階なので4つの区切り
          segments={4}
          // X軸の一番下の線を表示するための設定
          withInnerLines={false} // 内側の線を表示
        />

        {/* 絶対配置でY軸アイコンを配置 */}
        <View style={styles.absoluteYAxis}>
          {moodImages.map((imgSrc, index) => (
            <Image
              key={index}
              source={imgSrc}
              style={[
                styles.moodIcon,
                {
                  top: (index * 41), // 各アイコンの位置を計算（36px間隔）
                  left: 0, // 左端に配置
                }
              ]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ))}
        </View>
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
    justifyContent: 'flex-start', // 左寄せ
    position: 'relative', // 絶対配置の基準点
  },
  customYAxis: {
    height: 220, // グラフの高さと合わせる
    justifyContent: 'space-between', // アイコンを均等に配置
    paddingRight: 5, // 右側の余白を最小限に
    marginRight: 0, // 右側のマージンを削除
  },
  moodIcon: {
    width: 32,
    height: 32,
    borderRadius: 20,
    resizeMode: 'contain',
    position: 'absolute', // 各アイコンも絶対配置
  },
  absoluteYAxis: {
    position: 'absolute',
    top: 0, // グラフの上部余白を考慮
    left: 10, // 左端からの距離
    width: 32, // アイコンの幅
    height: 220, // グラフの高さと同じ
    zIndex: 1, // グラフの上に表示
  },
});

export default MoodChartWithIcons;