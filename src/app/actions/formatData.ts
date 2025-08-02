import dayjs from 'dayjs';
import { DiaryType } from '../../../type/diary';

export default function formatData({diaryList}: {diaryList: DiaryType}) {
  if (diaryList.diaryDate && typeof diaryList.diaryDate === 'object' && 'seconds' in diaryList.diaryDate) {
    // Firestoreのタイムスタンプ形式の場合
    const timestamp = diaryList.diaryDate as unknown as { seconds: number; nanoseconds: number };
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const dayjsDate = dayjs(date);

    const month = dayjsDate.month() + 1; // dayjsは0ベースなので+1
    const day = dayjsDate.date();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dayjsDate.day()];

    const formattedDate = `${month}月${day}日(${dayOfWeek}) ${dayjsDate.format('HH:mm')}`;
    return formattedDate;
  }

  // タイムスタンプが存在しない場合のフォールバック
  return '';
}