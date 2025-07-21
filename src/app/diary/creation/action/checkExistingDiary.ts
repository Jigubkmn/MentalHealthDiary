import dayjs from 'dayjs';
import { db } from '../../../../config';
import { collection, Timestamp, query, where, getDocs } from 'firebase/firestore'

// 同じ日付のデータが既に存在するかチェック
export default async function checkExistingDiary(userId: string, date: dayjs.Dayjs) {
  try {
    // 日付の開始と終了を設定（その日の00:00:00から23:59:59）
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    const diaryRef = collection(db, `users/${userId}/diaries`);
    const q = query(
      diaryRef,
      where('diaryDate', '>=', Timestamp.fromDate(startOfDay)),
      where('diaryDate', '<=', Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('既存データチェックエラー:', error);
    return false;
  }
}