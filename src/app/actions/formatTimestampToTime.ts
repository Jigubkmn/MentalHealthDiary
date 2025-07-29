import { DiaryType } from "../../../type/diary";
import dayjs from 'dayjs';
import formatDate from './formatData';

export default function formatTimestampToTime({diaryList}: {diaryList: DiaryType}) {
  if (diaryList.updatedAt && typeof diaryList.updatedAt === 'object' && 'seconds' in diaryList.updatedAt) {
    // Firestoreのタイムスタンプ形式の場合
    const timestamp = diaryList.updatedAt as unknown as { seconds: number; nanoseconds: number };
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const dayjsDate = dayjs(date);

    // 日付と時間を含む形式で返す
    return formatDate(dayjsDate);
  }

  // タイムスタンプが存在しない場合のフォールバック
  return '';
}