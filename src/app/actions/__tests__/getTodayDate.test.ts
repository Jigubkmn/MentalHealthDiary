import getTodayDate from '../getTodayDate';

describe('getTodayDate', () => {
  let originalDate: typeof Date;

  beforeEach(() => {
    // 元のDateコンストラクタを保存
    originalDate = global.Date;
  });

  afterEach(() => {
    // テスト後に元のDateコンストラクタを復元
    global.Date = originalDate;
  });

  describe('正常な日付のテスト', () => {
    test('2023年10月27日（金曜日）の場合、正しい形式で返される', () => {
      // 2023年10月27日 15:30:00 (金曜日) をモック
      const mockDate = new Date('2023-10-27T15:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('10月27日(金)');
    });

    test('2024年1月5日（金曜日）の場合、正しい形式で返される', () => {
      // 2024年1月5日 09:05:00 (金曜日) をモック
      const mockDate = new Date('2024-01-05T09:05:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月5日(金)');
    });

    test('2024年12月31日（火曜日）の場合、正しい形式で返される', () => {
      // 2024年12月31日 23:59:59 (火曜日) をモック
      const mockDate = new Date('2024-12-31T23:59:59');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('12月31日(火)');
    });

    test('2024年2月29日（木曜日）の場合、正しい形式で返される', () => {
      // 2024年2月29日 12:00:00 (木曜日) をモック（閏年）
      const mockDate = new Date('2024-02-29T12:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('2月29日(木)');
    });
  });

  describe('曜日のテスト', () => {
    test('日曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-07T10:00:00'); // 日曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月7日(日)');
    });

    test('月曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-08T10:00:00'); // 月曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月8日(月)');
    });

    test('火曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-09T10:00:00'); // 火曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月9日(火)');
    });

    test('水曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-10T10:00:00'); // 水曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月10日(水)');
    });

    test('木曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-11T10:00:00'); // 木曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月11日(木)');
    });

    test('金曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-12T10:00:00'); // 金曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月12日(金)');
    });

    test('土曜日の場合、正しい曜日が返される', () => {
      const mockDate = new Date('2024-01-13T10:00:00'); // 土曜日
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月13日(土)');
    });
  });

  describe('エッジケースのテスト', () => {
    test('1月1日の場合、正しい形式で返される', () => {
      const mockDate = new Date('2024-01-01T00:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月1日(月)');
    });

    test('12月31日の場合、正しい形式で返される', () => {
      const mockDate = new Date('2024-12-31T23:59:59');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('12月31日(火)');
    });

    test('月末の日付（31日）の場合、正しい形式で返される', () => {
      const mockDate = new Date('2024-01-31T12:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = getTodayDate();
      expect(result).toBe('1月31日(水)');
    });
  });
});