import React, { useMemo } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import feelingImageList from '../../constants/feelingImageList'
import { Image } from 'expo-image'

type Props = {
  allDaysInMonth: string[]
  chartDataValues: (number | null)[]
}

export default function FeelingScoreGraph({ allDaysInMonth, chartDataValues }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const data = useMemo(() => {
    const yAxisMax = 10;
    const yAxisMin = -10;
    return {
      // ダミーデータに合わせて、labelsの最後に空文字を追加
      labels: [ ...allDaysInMonth, '', ''],
      datasets: [
        {
          data: chartDataValues,
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          strokeWidth: 3,
        },
        {
          // ダミーデータ: Y軸のスケールを固定するための非表示データ
          data: [yAxisMax, yAxisMin],
          // 線とドットを完全に見えなくする
          withDots: false,
          color: () => `rgba(0, 0, 0, 0)`,
          strokeWidth: 0,
        },
      ],
    };
  }, [chartDataValues, allDaysInMonth]);

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // グリッド線の色（黒）
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // X軸ラベルの色
    strokeWidth: 2,
    propsForDots: {
      r: '4',
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
    <View style={styles.chartContainer}>
      {/* グラフ本体 */}
      <LineChart
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={data as any}
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
        hidePointsAtIndex={[chartDataValues.length + 1]}
        getDotProps={(value) => {
          if (value === null) {
            return { r: '0' }; // 半径0で見えなくする
          }
          return chartConfig.propsForDots;
        }}
        formatXLabel={(label) => {
          const day = parseInt(label.split('/')[1], 10);
          // ダミーデータ用の空ラベルは表示しない
          if (label === '') {
            return '';
          }
          // 1日、または5の倍数の日だけラベルを表示
          if (day === 1 || day % 5 === 0) {
            return label;
          }
          return ''; // それ以外は空文字にして非表示
        }}
      />
      {/* 絶対配置でY軸アイコンを配置 */}
      <View style={styles.absoluteYAxis}>
        {feelingImageList.map((imgSrc, index) => (
          <Image
            key={index}
            source={imgSrc}
            style={[
              styles.moodIcon,
              {
                top: (index * 41), // 各アイコンの位置を計算（41px間隔）
                left: 0,
              }
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ))}
      </View>
    </View>
  )
}

// スタイル定義
const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
    top: 0,
    left: 35,
    width: 32, // アイコンの幅
    height: 220, // グラフの高さと同じ
    zIndex: 1, // グラフの上に表示
  },
});