import dayjs from 'dayjs';

export type DiaryType = {
  id: string;
  diaryText: string;
  diaryDate: dayjs.Dayjs;
  feeling: string;
  updatedAt: Date;
  selectedImage: string | null;
}