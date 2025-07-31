import dayjs from 'dayjs';

export default function formatDate(date: dayjs.Dayjs) : string {
  const month = date.month() + 1; // dayjsは0ベースなので+1
  const day = date.date();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.day()];

  const formattedDate = `${month}月${day}日(${dayOfWeek}) ${date.format('HH:mm')}`;
  return formattedDate;
};