import dayjs from 'dayjs';
import handleNextDay from '../handleNextDay';

describe('handleNextDay', () => {
  describe('正常な日付処理のテスト', () => {
    test('1日後の日付が正しく計算される', () => {
      // テスト用の日付: 2023年10月27日
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();

      handleNextDay(currentDate, mockSetDate);
      // setDateが正しい日付で呼ばれることを確認
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 呼び出された引数が1日後の日付であることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-10-28');
    });

    test('月末から翌月への日付変更が正しく処理される', () => {
      // テスト用の日付: 2023年10月31日（月末）
      const currentDate = dayjs('2023-10-31');
      const mockSetDate = jest.fn();

      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 11月1日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-11-01');
    });

    test('年末から翌年への日付変更が正しく処理される', () => {
      // テスト用の日付: 2023年12月31日（年末）
      const currentDate = dayjs('2023-12-31');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 2024年1月1日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('閏年の2月28日から2月29日への変更が正しく処理される', () => {
      // テスト用の日付: 2024年2月28日（閏年）
      const currentDate = dayjs('2024-02-28');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 2月29日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2024-02-29');
    });

    test('非閏年の2月28日から3月1日への変更が正しく処理される', () => {
      // テスト用の日付: 2023年2月28日（非閏年）
      const currentDate = dayjs('2023-02-28');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 3月1日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-03-01');
    });
  });

  describe('時刻を含む日付のテスト', () => {
    test('時刻が含まれていても日付部分のみが1日進む', () => {
      // テスト用の日付: 2023年10月27日 15:30:45
      const currentDate = dayjs('2023-10-27T15:30:45');
      const mockSetDate = jest.fn();

      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      const calledDate = mockSetDate.mock.calls[0][0];
      // 日付が1日進んでいることを確認
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-10-28');
      // 時刻は変わらないことを確認
      expect(calledDate.format('HH:mm:ss')).toBe('15:30:45');
    });

    test('深夜の時刻でも正しく1日後になる', () => {
      // テスト用の日付: 2023年10月27日 23:59:59
      const currentDate = dayjs('2023-10-27T23:59:59');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-10-28 23:59:59');
    });
  });

  describe('dayjsオブジェクトの有効性テスト', () => {
    test('元の日付オブジェクトが変更されないことを確認', () => {
      const currentDate = dayjs('2023-10-27');
      const originalDateString = currentDate.format('YYYY-MM-DD');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      // 元の日付オブジェクトが変更されていないことを確認
      expect(currentDate.format('YYYY-MM-DD')).toBe(originalDateString);
    });

    test('返される日付オブジェクトが有効なdayjsオブジェクトであることを確認', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      const calledDate = mockSetDate.mock.calls[0][0];
      // dayjsオブジェクトであることを確認
      expect(calledDate.isValid()).toBe(true);
      expect(typeof calledDate.format).toBe('function');
      expect(typeof calledDate.add).toBe('function');
    });
  });

  describe('コールバック関数のテスト', () => {
    test('setDate関数が正確に1回だけ呼ばれる', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
    });
    test('複数回実行しても毎回setDateが呼ばれる', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      // 3回実行
      handleNextDay(currentDate, mockSetDate);
      handleNextDay(currentDate, mockSetDate);
      handleNextDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(3);
    });
  });
});