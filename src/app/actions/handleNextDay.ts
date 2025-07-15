import dayjs from "dayjs";

// 1日後に移動
export default function handleNextDay(date: dayjs.Dayjs, setDate: (date: dayjs.Dayjs) => void) {
  const newDate = date.add(1, 'day');
  setDate(newDate);
}