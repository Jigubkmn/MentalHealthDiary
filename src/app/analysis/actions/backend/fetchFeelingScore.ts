import { db } from '../../../../config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import dayjs from 'dayjs';

export default function fetchFeelingScore(
  setFeelingScoreList: (feelingScoreList: number[]) => void,
  setFeelingDateList: (feelingDateList: string[]) => void,
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs,
  userId?: string,
) {
  const ref = collection(db, `users/${userId}/feelingScores`)
  const q = query(ref, orderBy('diaryDate', 'asc'), where('diaryDate', '>=', startOfMonth.toDate()), where('diaryDate', '<', endOfMonth.toDate()))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const remoteFeelingScoreList: number[] = []
    const remoteFeelingDateList: string[] = []
    snapshot.docs.forEach((doc) => {
      const { feelingScore, diaryDate } = doc.data();
      remoteFeelingScoreList.push(feelingScore)
      // 1. TimestampオブジェクトをJavaScriptのDateオブジェクトに変換
      const jsDate = diaryDate.toDate();
      // 2. dayjsを使って 'M/D' (月/日) 形式の文字列にフォーマット
      const formattedDate = dayjs(jsDate).format('M/D');
      remoteFeelingDateList.push(formattedDate)
    })
    setFeelingScoreList(remoteFeelingScoreList)
    setFeelingDateList(remoteFeelingDateList)
  })
  return unsubscribe;
}