import dayjs from 'dayjs';
import formatWeekData from '../formatWeekData';

describe('formatWeekData', () => {
  test('"M月D日(曜日)"になる', () => {
    // Firestore Timestampオブジェクトの形式でテストデータを作成
    const testDate = dayjs('2023-10-27');
    const timestamp = {
      seconds: Math.floor(testDate.valueOf() / 1000),
      nanoseconds: (testDate.valueOf() % 1000) * 1000000
    } as unknown as dayjs.Dayjs;

    const formattedString = formatWeekData(timestamp);

    // 検証 (Assert)
    expect(formattedString).toBe('10月27日(金)');
  });

  test('1桁の月と日の日付を正しくフォーマットする', () => {
    const testDate = dayjs('2024-01-05');
    const timestamp = {
      seconds: Math.floor(testDate.valueOf() / 1000),
      nanoseconds: (testDate.valueOf() % 1000) * 1000000
    } as unknown as dayjs.Dayjs;

    const formattedString = formatWeekData(timestamp);
    // 検証 (Assert)
    expect(formattedString).toBe('1月5日(金)');
  });

  test('日曜日の日付を正しくフォーマットする', () => {
    const testDate = dayjs('2023-10-29');
    const timestamp = {
      seconds: Math.floor(testDate.valueOf() / 1000),
      nanoseconds: (testDate.valueOf() % 1000) * 1000000
    } as unknown as dayjs.Dayjs;

    const formattedString = formatWeekData(timestamp);
    // 検証 (Assert)
    expect(formattedString).toBe('10月29日(日)');
  });

  test('土曜日の日付を正しくフォーマットする', () => {
    const testDate = dayjs('2023-10-28');
    const timestamp = {
      seconds: Math.floor(testDate.valueOf() / 1000),
      nanoseconds: (testDate.valueOf() % 1000) * 1000000
    } as unknown as dayjs.Dayjs;

    const formattedString = formatWeekData(timestamp);
    // 検証 (Assert)
    expect(formattedString).toBe('10月28日(土)');
  });

  test('うるう年の日付を正しくフォーマットする', () => {
    const testDate = dayjs('2024-02-29');
    const timestamp = {
      seconds: Math.floor(testDate.valueOf() / 1000),
      nanoseconds: (testDate.valueOf() % 1000) * 1000000
    } as unknown as dayjs.Dayjs;

    const formattedString = formatWeekData(timestamp);
    // 検証 (Assert)
    expect(formattedString).toBe('2月29日(木)');
  });
});