import dayjs from 'dayjs';

export type DiaryType = {
  id: string;
  diaryDate: dayjs.Dayjs;
  diaryImage: string | null;
  diaryText: string;
  feeling: string;
  updatedAt: Date;
  userId: string;
  userName: string;
  userImage: string;
}