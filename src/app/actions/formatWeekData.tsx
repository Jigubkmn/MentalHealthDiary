import dayjs from 'dayjs';

export default function formatWeekData(diaryDate: dayjs.Dayjs) : string {
  const timestamp = diaryDate as unknown as { seconds: number; nanoseconds: number };
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const dayjsDate = dayjs(date);
  const month = dayjsDate.month() + 1; // dayjsは0ベースなので+1
  const day = dayjsDate.date();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dayjsDate.day()];

  return `${month}月${day}日(${dayOfWeek})`;
};