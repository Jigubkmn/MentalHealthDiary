import { db } from '../../../../../config';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default async function fetchFeelingScoreForLast7Days(userId?: string) {
  try {
    const router = useRouter();
    const sixDaysAgo = dayjs().subtract(6, 'day').startOf('day');
    const today = dayjs().endOf('day');

    const ref = collection(db, `users/${userId}/feelingScores`);
    const q = query(
      ref,
      orderBy('diaryDate', 'desc'),
      where('diaryDate', '>=', sixDaysAgo.toDate()),
      where('diaryDate', '<=', today.toDate())
    );
    const snapshot = await getDocs(q);

    // 過去7日間の日付配列を作成（今日から6日前まで）
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      return dayjs().subtract(i, 'day').startOf('day');
    }).reverse(); // 古い日付から新しい日付の順に並べる

    // 各日付に対応するfeelingScoreを取得
    const feelingScoresArray = last7Days.map(date => {
      const matchingDoc = snapshot.docs.find(doc => {
        const docDate = dayjs(doc.data().diaryDate.toDate()).startOf('day');
        return docDate.isSame(date);
      });

      return matchingDoc ? matchingDoc.data().feelingScore : null;
    });

    // 条件チェック: null以外の数が4個以上で、合計値が-25以下
    const nonNullScores = feelingScoresArray.filter(score => score !== null);
    const totalScore = nonNullScores.reduce((sum, score) => sum + score, 0);

    if (nonNullScores.length >= 4 && totalScore <= -25) {
      Alert.alert(
        '日記を作成しました',
        '最近、体調が悪化しているようです。\n1度、メンタルヘルスチェックを行いませんか？',
        [
          {
            text: '実施しない',
            style: 'cancel',
            onPress: () => {
              Alert.alert(
                'かしこまりました',
                '無理せず、まずはゆっくり休んでくださいね。ご自身の心と体を一番に。'
              );
            }
          },
          {
            text: '実施する',
            onPress: () => {router.push("mentalHealthCheck/creation/mentalHealthCheckCreate")}
          }
        ]
      );
    }
    return feelingScoresArray;
  } catch (error) {
    console.error('feelingScoreの取得に失敗しました:', error);
    return [];
  }
}