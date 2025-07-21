import { db } from '../../config';
import { doc, getDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { DiaryType } from '../../../type/diary';

type Props = {
  userId?: string;
  diaryId?: string;
  setSelectedDiaryInfo: (diary: DiaryType) => void;
}

export default async function fetchSelectedDiary({ userId, diaryId, setSelectedDiaryInfo }: Props) {
  if (userId === null || diaryId === null) return;
    try {
      const diaryRef = doc(db, `users/${userId}/diaries/${diaryId}`);
      const diarySnap = await getDoc(diaryRef);
      if (diarySnap.exists()) {
        const data = diarySnap.data();
        const diary: DiaryType = {
          id: diarySnap.id,
          diaryText: data.diaryText,
          diaryDate: dayjs(data.diaryDate.toDate()),
          feeling: data.feeling || null,
          diaryImage: data.diaryImage,
          updatedAt: data.updatedAt.toDate(),
        };
        setSelectedDiaryInfo(diary);
      } else {
        console.log('対象データがありません。');
      }
    } catch (error) {
      console.error('対象データの取得に失敗しました。', error);
  }
}