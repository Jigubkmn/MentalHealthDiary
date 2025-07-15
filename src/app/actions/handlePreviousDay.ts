import dayjs from "dayjs";

// 1日前に移動
export default function handlePreviousDay(date: dayjs.Dayjs, setDate: (date: dayjs.Dayjs) => void) {
  const newDate = date.subtract(1, 'day');
  setDate(newDate);
}