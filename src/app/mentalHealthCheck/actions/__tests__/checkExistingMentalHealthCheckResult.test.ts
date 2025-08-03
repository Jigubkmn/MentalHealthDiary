/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import checkExistingMentalHealthCheckResult from '../checkExistingMentalHealthCheckResult';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {},
}));

describe('checkExistingMentalHealthCheckResult', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
    (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
  });

  describe('データが存在する場合のテスト', () => {
    test('指定日にメンタルヘルスチェック結果が存在する場合、trueが返される', async () => {
      const testUserId = 'user-123';
      const testDate = dayjs('2023-10-15T12:30:45');

      // データが存在する場合のモック
      const mockNonEmptySnapshot = { empty: false };
      (mockGetDocs as any).mockResolvedValue(mockNonEmptySnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);

      // 日付範囲クエリが正しく構築されることを確認
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', { timestamp: 'mock-timestamp' });
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<=', { timestamp: 'mock-timestamp' });

      // Timestamp.fromDateが開始時刻と終了時刻で呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(2);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(testDate.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(testDate.endOf('day').toDate());

      // クエリが実行されることを確認
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock' });

      // 結果がtrueであることを確認
      expect(result).toBe(true);
    });

    test('複数のメンタルヘルスチェック結果が存在する場合、trueが返される', async () => {
      const testUserId = 'user-multiple';
      const testDate = dayjs('2023-10-15');

      // 複数のデータが存在する場合のモック
      const mockMultipleDataSnapshot = {
        empty: false,
        docs: [
          { id: 'check1', data: () => ({}) },
          { id: 'check2', data: () => ({}) }
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockMultipleDataSnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      expect(result).toBe(true);
    });
  });

  describe('データが存在しない場合のテスト', () => {
    test('指定日にメンタルヘルスチェック結果が存在しない場合、falseが返される', async () => {
      const testUserId = 'user-456';
      const testDate = dayjs('2023-10-16T09:15:30');

      // データが存在しない場合のモック
      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);

      // クエリが実行されることを確認
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock' });

      // 結果がfalseであることを確認
      expect(result).toBe(false);
    });
  });

  describe('日付処理のテスト', () => {
    test('日付の開始時刻と終了時刻が正しく計算される', async () => {
      const testUserId = 'user-date-test';
      const testDate = dayjs('2023-10-15T14:30:45');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      await checkExistingMentalHealthCheckResult(testUserId, testDate);

      // startOf('day')とendOf('day')が正しく呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenNthCalledWith(1, testDate.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenNthCalledWith(2, testDate.endOf('day').toDate());
    });

    test('異なる時間の同じ日付でも正しく処理される', async () => {
      const testUserId = 'user-same-day';
      const morningDate = dayjs('2023-10-15T08:00:00');
      const eveningDate = dayjs('2023-10-15T20:00:00');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      // 朝の時間でテスト
      await checkExistingMentalHealthCheckResult(testUserId, morningDate);

      // 夕方の時間でテスト
      jest.clearAllMocks();
      (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
      (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
      (mockWhere as any).mockReturnValue({ where: 'mock' });
      (mockQuery as any).mockReturnValue({ query: 'mock' });
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      await checkExistingMentalHealthCheckResult(testUserId, eveningDate);

      // 両方とも同じ日の開始・終了時刻が使われることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(eveningDate.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(eveningDate.endOf('day').toDate());
    });

    test('月末・月初の日付でも正しく処理される', async () => {
      const testUserId = 'user-month-boundary';
      const endOfMonth = dayjs('2023-10-31T23:59:59');
      const startOfMonth = dayjs('2023-11-01T00:00:01');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      // 月末日でテスト
      await checkExistingMentalHealthCheckResult(testUserId, endOfMonth);

      expect(mockTimestampFromDate).toHaveBeenCalledWith(endOfMonth.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(endOfMonth.endOf('day').toDate());

      // リセット
      jest.clearAllMocks();
      (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
      (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
      (mockWhere as any).mockReturnValue({ where: 'mock' });
      (mockQuery as any).mockReturnValue({ query: 'mock' });
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);
      // 月初日でテスト
      await checkExistingMentalHealthCheckResult(testUserId, startOfMonth);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(startOfMonth.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(startOfMonth.endOf('day').toDate());
    });

    test('うるう年の2月29日でも正しく処理される', async () => {
      const testUserId = 'user-leap-year';
      const leapYearDate = dayjs('2024-02-29T12:00:00');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      await checkExistingMentalHealthCheckResult(testUserId, leapYearDate);

      expect(mockTimestampFromDate).toHaveBeenCalledWith(leapYearDate.startOf('day').toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(leapYearDate.endOf('day').toDate());
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
    });
  });

  describe('ユーザーIDのテスト', () => {
    test('異なるユーザーIDで正しいパスが構築される', async () => {
      const testCases = [
        'user-123',
        'user-with-special-chars_456',
        'user@email.com',
        '1234567890',
        'very-long-user-id-with-many-characters-123456789'
      ];

      const testDate = dayjs('2023-10-15');
      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      for (const userId of testCases) {
        jest.clearAllMocks();
        (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
        (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
        (mockWhere as any).mockReturnValue({ where: 'mock' });
        (mockQuery as any).mockReturnValue({ query: 'mock' });
        (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

        await checkExistingMentalHealthCheckResult(userId, testDate);

        expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks`);
      }
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'user-error';
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Firestore connection error');

      (mockGetDocs as any).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    test('クエリ構築でエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'user-query-error';
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Query construction error');

      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    test('collectionでエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'user-collection-error';
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Collection access error');

      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    test('Timestamp.fromDateでエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'user-timestamp-error';
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Timestamp conversion error');

      (mockTimestampFromDate as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkExistingMentalHealthCheckResult(testUserId, testDate);

      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('クエリ構造のテスト', () => {
    test('正しいwhere句でクエリが構築される', async () => {
      const testUserId = 'user-query-structure';
      const testDate = dayjs('2023-10-15T15:30:45');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      await checkExistingMentalHealthCheckResult(testUserId, testDate);

      // where句が2回呼ばれることを確認（>= と <=）
      expect(mockWhere).toHaveBeenCalledTimes(2);
      expect(mockWhere).toHaveBeenNthCalledWith(1, 'createdAt', '>=', { timestamp: 'mock-timestamp' });
      expect(mockWhere).toHaveBeenNthCalledWith(2, 'createdAt', '<=', { timestamp: 'mock-timestamp' });

      // queryが正しく構築されることを確認
      expect(mockQuery).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        { where: 'mock' },
        { where: 'mock' }
      );
    });
  });

  describe('境界値テスト', () => {
    test('現在時刻でも正しく処理される', async () => {
      const testUserId = 'user-now';
      const now = dayjs();

      const mockNonEmptySnapshot = { empty: false };
      (mockGetDocs as any).mockResolvedValue(mockNonEmptySnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, now);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
      expect(result).toBe(true);
    });

    test('過去の日付でも正しく処理される', async () => {
      const testUserId = 'user-past';
      const pastDate = dayjs('2020-01-01');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, pastDate);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
      expect(result).toBe(false);
    });

    test('未来の日付でも正しく処理される', async () => {
      const testUserId = 'user-future';
      const futureDate = dayjs('2030-12-31');

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      const result = await checkExistingMentalHealthCheckResult(testUserId, futureDate);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
      expect(result).toBe(false);
    });
  });

  describe('パフォーマンステスト', () => {
    test('複数回の呼び出しでも正しく動作する', async () => {
      const testUserId = 'user-performance';
      const dates = [
        dayjs('2023-10-15'),
        dayjs('2023-10-16'),
        dayjs('2023-10-17')
      ];

      const mockEmptySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      for (const date of dates) {
        const result = await checkExistingMentalHealthCheckResult(testUserId, date);
        expect(result).toBe(false);
      }

      // 各日付で適切にクエリが実行されることを確認
      expect(mockGetDocs).toHaveBeenCalledTimes(3);
      expect(mockCollection).toHaveBeenCalledTimes(3);
    });
  });
});