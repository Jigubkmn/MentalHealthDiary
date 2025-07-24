import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image'
import { LineChart } from 'react-native-chart-kit';
import Header from '../analysis/components/Header';
import feelingImageList from '../constants/feelingImageList';
import { auth } from '../../config';
import dayjs from 'dayjs';
import YearMonthSelectModal from '../diary/list/components/YearMonthSelectModal';
import fetchFeelingScore from '../analysis/actions/backend/fetchFeelingScore';
import { FeelingScoreType } from '../../../type/feelingScore';

const screenWidth = Dimensions.get('window').width;

export default function analysis() {
  const userId = auth.currentUser?.uid
  const [feelingScoreDates, setFeelingScoreDates] = useState<FeelingScoreType[]>([]);
  // モーダルの表示状態を管理
  const [isModalVisible, setModalVisible] = useState(false);
  // 表示用の年月を管理する
  const [displayDate, setDisplayDate] = useState(dayjs());
  // 選択された年月を'YYYY-M'形式の文字列で保持する
  const [selectedYearMonth, setSelectedYearMonth] = useState(displayDate.format('YYYY-M'));

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      const startOfMonth = displayDate.startOf('month');
      const endOfMonth = displayDate.add(1, 'month').startOf('month');
      const unsubscribe = fetchFeelingScore(
        setFeelingScoreDates,
        startOfMonth,
        endOfMonth,
        userId
      );
      return unsubscribe;
    }, [displayDate, userId])
  );

  // X軸の全日付ラベルを生成 ('7/1', '7/2', ..., '7/31')
  const allDaysInMonth = useMemo(() => {
    return Array.from({ length: displayDate.daysInMonth() }, (_, i) =>
      displayDate.date(i + 1).format('M/D')
    );
  }, [displayDate])

  // グラフ用のデータを生成
  const chartDataValues = allDaysInMonth.map(label => {
    const dataPoint = feelingScoreDates.find(d => d.date === label);
    return dataPoint ? dataPoint.value : null;
  });

  // 描画可能なデータがあるか判定
  const hasDataToRender = useMemo(() => {
    // chartDataValues の中に一つでも null でない値があれば true
    return chartDataValues.some(value => value !== null);
  }, [chartDataValues]);

  const handleYearMonthPress = () => {
    // モーダルを開くときに、現在の表示年月をピッカーの初期値に設定する
    setSelectedYearMonth(displayDate.format('YYYY-M'));
    setModalVisible(true);
  }


  // グラフ用のデータ
  const data = useMemo(() => {
    const yAxisMax = 10;
    const yAxisMin = -10;
    return {
      // ダミーデータに合わせて、labelsの最初と最後に空文字を追加
      labels: ['', ...allDaysInMonth, ''],
      datasets: [
        {
          // データの最初と最後にY軸の最大/最小値をダミーとして追加
          data: chartDataValues,
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          strokeWidth: 3,
        },
        {
          // Dataset 2: Y軸のスケールを固定するための非表示データ
          data: [yAxisMax, yAxisMin],
          // 線とドットを完全に見えなくする
          withDots: false,
          color: () => `rgba(0, 0, 0, 0)`,
          strokeWidth: 0,
        },
      ],
    };
  }, [chartDataValues, allDaysInMonth]);

  // グラフのスタイル設定
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
    <View style={styles.container}>
      <Header />
      {/* 年月 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity onPress={handleYearMonthPress}>
          <Text style={styles.yearMonthText}>{displayDate.format('YYYY年M月')} ↓</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {/* グラフエリア */}
        {hasDataToRender && (
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
                // 1日、または5の倍数の日だけラベルを表示
                // ダミーデータ用の空ラベルは表示しない
                if (label === '') {
                  return '';
                }
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
        )}
      </View>
      {/* 年月選択モーダル */}
      <YearMonthSelectModal
        setModalVisible={setModalVisible}
        setDisplayDate={setDisplayDate}
        selectedYearMonth={selectedYearMonth}
        setSelectedYearMonth={setSelectedYearMonth}
        isModalVisible={isModalVisible}
      />
    </View>
  );
};

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  yearMonthContainer: {
    backgroundColor: '#ffffff',
  },
  yearMonthText: {
    fontSize: 20,
    lineHeight: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
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
    left: 20, // 左端からの距離
    width: 32, // アイコンの幅
    height: 220, // グラフの高さと同じ
    zIndex: 1, // グラフの上に表示
  },
});