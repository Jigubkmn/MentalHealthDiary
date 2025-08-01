import { db } from '../../../../config';
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';
import { FeelingScoreType } from '../../../../../type/feelingScore';

export default function fetchFeelingScore(
  userId: string,
  setFeelingScoreDates: (feelingScoreDates: FeelingScoreType[]) => void,
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs,
) {
  if (!userId) return;
  try {
    const ref = collection(db, `users/${userId}/feelingScores`)
    const q = query(ref, orderBy('diaryDate', 'asc'), where('diaryDate', '>=', startOfMonth.toDate()), where('diaryDate', '<', endOfMonth.toDate()))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteChartData: FeelingScoreType[] = []
      snapshot.docs.forEach((doc) => {
        const { diaryDate, feelingScore } = doc.data() as { diaryDate: Timestamp, feelingScore: number};
        // Timestampオブジェクトを 'M/D' 形式の文字列に変換
        const formattedDate = dayjs(diaryDate.toDate()).format('M/D');
        remoteChartData.push({ date: formattedDate, value: feelingScore });
      })
      setFeelingScoreDates(remoteChartData)
    })
    console.log('感情スコアの取得に成功しました');
    return unsubscribe;
  } catch (error) {
    console.error('感情スコアの取得に失敗しました:', error);
    setFeelingScoreDates([]);
  }
}