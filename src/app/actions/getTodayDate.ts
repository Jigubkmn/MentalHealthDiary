export default function getTodayDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];
  return `${month}月${date}日(${dayOfWeek})`;
};