import dayjs from 'dayjs';

export type FeelingScoreType = {
  feelingScore: number;
  diaryDate: dayjs.Dayjs;
  updatedAt: dayjs.Dayjs;
}