import { db } from '../../../../../config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { DiaryType } from '../../../../../../type/diary';
import dayjs from 'dayjs';

export default function fetchDiaries(
  setDiaryLists: (diaryLists: DiaryType[]) => void,
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs,
  visibleUserIds?: string[]
) {
  const ref = collection(db, `diaries`)

  let q;
  if (visibleUserIds && visibleUserIds.length > 0) {
    q = query(
      ref,
      orderBy('diaryDate', 'desc'),
      where('diaryDate', '>=', startOfMonth.toDate()),
      where('diaryDate', '<', endOfMonth.toDate()),
      where('userId', 'in', visibleUserIds)
    );
  } else {
    q = query(
      ref,
      orderBy('diaryDate', 'desc'),
      where('diaryDate', '>=', startOfMonth.toDate()),
      where('diaryDate', '<', endOfMonth.toDate())
    );
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const remoteDiaryList: DiaryType[] = []
    snapshot.docs.forEach((doc) => {
      const { diaryDate, diaryImage,diaryText, feeling, updatedAt, userId, userName, userImage } = doc.data();

      if (visibleUserIds && visibleUserIds.length > 1) {
        if (visibleUserIds.includes(userId)) {
          remoteDiaryList.push({ id: doc.id, diaryDate, diaryImage, diaryText, feeling, updatedAt, userId, userName, userImage })
        }
      } else {
        remoteDiaryList.push({ id: doc.id, diaryDate, diaryImage, diaryText, feeling, updatedAt, userId, userName, userImage })
      }
    })
    setDiaryLists(remoteDiaryList)
  })
  return unsubscribe;
}