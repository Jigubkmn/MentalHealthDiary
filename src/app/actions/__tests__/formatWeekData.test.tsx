import dayjs from 'dayjs';
import formatWeekData from '../formatWeekData';

describe('formatWeekData', () => {
  test('"M月D日(曜日)"になる', () => {
    const date = dayjs('2023-10-27');
    const formattedString = formatWeekData(date);

    // 検証 (Assert)
    expect(formattedString).toBe('10月27日(金)');
  });

  test('1桁の月と日の日付を正しくフォーマットする', () => {
    const date = dayjs('2024-01-05');
    const formattedString = formatWeekData(date);
    // 検証 (Assert)
    expect(formattedString).toBe('1月5日(金)');
  });

  test('日曜日の日付を正しくフォーマットする', () => {
    const date = dayjs('2023-10-29');
    const formattedString = formatWeekData(date);
    // 検証 (Assert)
    expect(formattedString).toBe('10月29日(日)');
  });

  test('土曜日の日付を正しくフォーマットする', () => {
    const date = dayjs('2023-10-28');
    const formattedString = formatWeekData(date);
    // 検証 (Assert)
    expect(formattedString).toBe('10月28日(土)');
  });

  test('うるう年の日付を正しくフォーマットする', () => {
    const date = dayjs('2024-02-29');
    const formattedString = formatWeekData(date);
    // 検証 (Assert)
    expect(formattedString).toBe('2月29日(木)');
  });
});