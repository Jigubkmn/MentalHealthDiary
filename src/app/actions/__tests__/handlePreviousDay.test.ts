import dayjs from 'dayjs';
import handlePreviousDay from '../handlePreviousDay';

describe('handlePreviousDay', () => {
  describe('正常な日付処理のテスト', () => {
    test('1日前の日付が正しく計算される', () => {
      // テスト用の日付: 2023年10月27日
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();

      handlePreviousDay(currentDate, mockSetDate);
      // setDateが正しい日付で呼ばれることを確認
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 呼び出された引数が1日前の日付であることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-10-26');
    });

    test('月初から前月への日付変更が正しく処理される', () => {
      // テスト用の日付: 2023年11月1日（月初）
      const currentDate = dayjs('2023-11-01');
      const mockSetDate = jest.fn();

      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 10月31日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-10-31');
    });

    test('年始から前年への日付変更が正しく処理される', () => {
      // テスト用の日付: 2024年1月1日（年始）
      const currentDate = dayjs('2024-01-01');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 2023年12月31日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-12-31');
    });

    test('閏年の2月29日から2月28日への変更が正しく処理される', () => {
      // テスト用の日付: 2024年2月29日（閏年）
      const currentDate = dayjs('2024-02-29');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 2月28日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2024-02-28');
    });

    test('3月1日から2月28日への変更が正しく処理される（非閏年）', () => {
      // テスト用の日付: 2023年3月1日（非閏年）
      const currentDate = dayjs('2023-03-01');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      // 2月28日になることを確認
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-02-28');
    });
  });

  describe('時刻を含む日付のテスト', () => {
    test('時刻が含まれていても日付部分のみが1日戻る', () => {
      // テスト用の日付: 2023年10月27日 15:30:45
      const currentDate = dayjs('2023-10-27T15:30:45');
      const mockSetDate = jest.fn();

      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      const calledDate = mockSetDate.mock.calls[0][0];
      // 日付が1日戻っていることを確認
      expect(calledDate.format('YYYY-MM-DD')).toBe('2023-10-26');
      // 時刻は変わらないことを確認
      expect(calledDate.format('HH:mm:ss')).toBe('15:30:45');
    });

    test('深夜の時刻でも正しく1日前になる', () => {
      // テスト用の日付: 2023年10月27日 23:59:59
      const currentDate = dayjs('2023-10-27T23:59:59');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
      const calledDate = mockSetDate.mock.calls[0][0];
      expect(calledDate.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-10-26 23:59:59');
    });
  });

  describe('dayjsオブジェクトの有効性テスト', () => {
    test('元の日付オブジェクトが変更されないことを確認', () => {
      const currentDate = dayjs('2023-10-27');
      const originalDateString = currentDate.format('YYYY-MM-DD');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      // 元の日付オブジェクトが変更されていないことを確認
      expect(currentDate.format('YYYY-MM-DD')).toBe(originalDateString);
    });

    test('返される日付オブジェクトが有効なdayjsオブジェクトであることを確認', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      const calledDate = mockSetDate.mock.calls[0][0];
      // dayjsオブジェクトであることを確認
      expect(calledDate.isValid()).toBe(true);
      expect(typeof calledDate.format).toBe('function');
      expect(typeof calledDate.subtract).toBe('function');
    });
  });

  describe('コールバック関数のテスト', () => {
    test('setDate関数が正確に1回だけ呼ばれる', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(1);
    });
    test('複数回実行しても毎回setDateが呼ばれる', () => {
      const currentDate = dayjs('2023-10-27');
      const mockSetDate = jest.fn();
      // 3回実行
      handlePreviousDay(currentDate, mockSetDate);
      handlePreviousDay(currentDate, mockSetDate);
      handlePreviousDay(currentDate, mockSetDate);
      expect(mockSetDate).toHaveBeenCalledTimes(3);
    });
  });
});