import { db } from '../../../../../config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { DiaryType } from '../../../../../../type/diary';
import dayjs from 'dayjs';

export default function fetchDiaries(
  setDiaryLists: (diaryLists: DiaryType[]) => void,
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs,
  userId?: string,
) {
  const ref = collection(db, `users/${userId}/diaries`)
  const q = query(ref, orderBy('diaryDate', 'desc'), where('diaryDate', '>=', startOfMonth.toDate()), where('diaryDate', '<', endOfMonth.toDate()))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const remoteDiaryList: DiaryType[] = []
    snapshot.docs.forEach((doc) => {
      const { diaryText, diaryDate, feeling, updatedAt, diaryImage } = doc.data();
      remoteDiaryList.push({ id: doc.id, diaryText, diaryDate, feeling, updatedAt, diaryImage })
    })
    setDiaryLists(remoteDiaryList)
  })
  return unsubscribe;
}