/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import checkExistingDiary from '../checkExistingDiary';
import dayjs from 'dayjs';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('checkExistingDiary', () => {
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
    (mockCollection as any).mockReturnValue({ collection: 'diaries' });
    (mockTimestampFromDate as any).mockImplementation((date: Date) => ({ fromDate: date }));
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
  });

  describe('正常ケースのテスト', () => {
    test('指定日に日記が存在する場合、trueが返される', async () => {
      const testUserId = 'test-user-123';
      const testDate = dayjs('2023-10-15');
      // 既存の日記があることを示すモック
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      // Firestoreの関数が正しく呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', testUserId);
      // 日付範囲の確認（その日の開始から終了まで）
      const startOfDay = testDate.startOf('day').toDate();
      const endOfDay = testDate.endOf('day').toDate();
      expect(mockTimestampFromDate).toHaveBeenCalledWith(startOfDay);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(endOfDay);
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', { fromDate: startOfDay });
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<=', { fromDate: endOfDay });
      expect(mockQuery).toHaveBeenCalled();
      expect(mockGetDocs).toHaveBeenCalled();
      // 既存データがある場合trueが返される
      expect(result).toBe(true);
    });

    test('指定日に日記が存在しない場合、falseが返される', async () => {
      const testUserId = 'test-user-456';
      const testDate = dayjs('2023-10-20');
      // 日記が存在しないことを示すモック
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', testUserId);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockGetDocs).toHaveBeenCalled();
      // 既存データがない場合falseが返される
      expect(result).toBe(false);
    });

    test('異なる日付で正常に動作する', async () => {
      const testUserId = 'test-user-different-date';
      const testDate = dayjs('2023-12-25');
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      // 日付範囲が正しく計算されることを確認
      const startOfDay = testDate.startOf('day').toDate();
      const endOfDay = testDate.endOf('day').toDate();
      expect(mockTimestampFromDate).toHaveBeenCalledWith(startOfDay);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(endOfDay);
      expect(result).toBe(true);
    });

    test('月末の日付でも正常に動作する', async () => {
      const testUserId = 'test-user-month-end';
      const testDate = dayjs('2023-01-31');
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', testUserId);
      expect(result).toBe(false);
    });

    test('うるう年の2月29日でも正常に動作する', async () => {
      const testUserId = 'test-user-leap-year';
      const testDate = dayjs('2024-02-29');
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      const startOfDay = testDate.startOf('day').toDate();
      const endOfDay = testDate.endOf('day').toDate();
      expect(mockTimestampFromDate).toHaveBeenCalledWith(startOfDay);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(endOfDay);

      expect(result).toBe(true);
    });
  });

  describe('日付範囲の詳細テスト', () => {
    test('同じ日の開始時刻と終了時刻が正しく設定される', async () => {
      const testUserId = 'test-user-time-range';
      const testDate = dayjs('2023-06-15T14:30:45'); // 具体的な時刻を含む
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await checkExistingDiary(testUserId, testDate);
      // startOfDayとendOfDayが正しく計算されることを確認
      const expectedStartOfDay = testDate.startOf('day').toDate(); // 2023-06-15 00:00:00
      const expectedEndOfDay = testDate.endOf('day').toDate(); // 2023-06-15 23:59:59
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedStartOfDay);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedEndOfDay);
    });

    test('時刻情報が異なっても同じ日として扱われる', async () => {
      const testUserId = 'test-user-same-day';
      const testDate1 = dayjs('2023-07-10T08:00:00');
      const testDate2 = dayjs('2023-07-10T20:30:15');
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      // 同じ日の異なる時刻で実行
      await checkExistingDiary(testUserId, testDate1);
      jest.clearAllMocks();
      (mockCollection as any).mockReturnValue({ collection: 'diaries' });
      (mockTimestampFromDate as any).mockImplementation((date: Date) => ({ fromDate: date }));
      (mockWhere as any).mockReturnValue({ where: 'mock' });
      (mockQuery as any).mockReturnValue({ query: 'mock' });
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await checkExistingDiary(testUserId, testDate2);
      // 両方とも同じ日の範囲で検索される
      const expectedStartOfDay = dayjs('2023-07-10').startOf('day').toDate();
      const expectedEndOfDay = dayjs('2023-07-10').endOf('day').toDate();
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedStartOfDay);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expectedEndOfDay);
    });
  });

  describe('ユーザーIDのテスト', () => {
    test('異なるユーザーIDで正常に動作する', async () => {
      const testUserId = 'different-user-id';
      const testDate = dayjs('2023-08-01');
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', testUserId);
      expect(result).toBe(false);
    });

    test('特殊文字を含むユーザーIDでも正常に動作する', async () => {
      const testUserId = 'user@example.com';
      const testDate = dayjs('2023-09-01');
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', testUserId);
      expect(result).toBe(true);
    });

    test('空文字列のユーザーIDでもクエリが実行される', async () => {
      const testUserId = '';
      const testDate = dayjs('2023-10-01');
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const result = await checkExistingDiary(testUserId, testDate);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', '');
      expect(result).toBe(false);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'test-user-error';
      const testDate = dayjs('2023-11-01');
      const mockError = new Error('Firestore getDocs error');
      (mockGetDocs as any).mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkExistingDiary(testUserId, testDate);
      // エラーログが出力される
      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      // エラー時はfalseが返される
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    test('collectionの作成時にエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'test-user-collection-error';
      const testDate = dayjs('2023-11-15');
      const mockError = new Error('Collection creation error');
      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkExistingDiary(testUserId, testDate);
      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    test('queryの作成時にエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'test-user-query-error';
      const testDate = dayjs('2023-12-01');
      const mockError = new Error('Query creation error');
      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkExistingDiary(testUserId, testDate);
      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    test('Timestamp.fromDateでエラーが発生した場合、falseが返される', async () => {
      const testUserId = 'test-user-timestamp-error';
      const testDate = dayjs('2023-12-15');
      const mockError = new Error('Timestamp conversion error');
      (mockTimestampFromDate as any).mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkExistingDiary(testUserId, testDate);
      expect(consoleSpy).toHaveBeenCalledWith('既存データチェックエラー:', mockError);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクション名でクエリが構築される', async () => {
      const testUserId = 'query-test-user';
      const testDate = dayjs('2023-05-20');
      const mockQuerySnapshot = {
        empty: true
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await checkExistingDiary(testUserId, testDate);
      // 正しいコレクション名でcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
    });

    test('where句が正しい順序で構築される', async () => {
      const testUserId = 'where-test-user';
      const testDate = dayjs('2023-04-10');
      const mockQuerySnapshot = {
        empty: false
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await checkExistingDiary(testUserId, testDate);
      // where句が正しく呼ばれることを確認
      expect(mockWhere).toHaveBeenCalledTimes(3);
      expect(mockWhere).toHaveBeenNthCalledWith(1, 'userId', '==', testUserId);
      const startOfDay = testDate.startOf('day').toDate();
      const endOfDay = testDate.endOf('day').toDate();
      expect(mockWhere).toHaveBeenNthCalledWith(2, 'diaryDate', '>=', { fromDate: startOfDay });
      expect(mockWhere).toHaveBeenNthCalledWith(3, 'diaryDate', '<=', { fromDate: endOfDay });
    });

    test('queryとgetDocsが正しく呼ばれる', async () => {
      const testUserId = 'execution-test-user';
      const testDate = dayjs('2023-03-05');
      const mockDiaryRef = { collection: 'diaries' };
      const mockQueryObj = { query: 'mock' };
      const mockQuerySnapshot = { empty: true };
      (mockCollection as any).mockReturnValue(mockDiaryRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await checkExistingDiary(testUserId, testDate);
      // queryが正しい引数で呼ばれることを確認
      expect(mockQuery).toHaveBeenCalledWith(
        mockDiaryRef,
        { where: 'mock' }, // userId where
        { where: 'mock' }, // diaryDate >= where
        { where: 'mock' }  // diaryDate <= where
      );
      // getDocsが正しいクエリオブジェクトで呼ばれることを確認
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);
    });
  });

  describe('戻り値のテスト', () => {
    test('!querySnapshot.emptyの論理が正しく動作する', async () => {
      const testUserId = 'logic-test-user';
      const testDate = dayjs('2023-02-14');
      // empty: falseの場合（データが存在）
      let mockQuerySnapshot = { empty: false };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      let result = await checkExistingDiary(testUserId, testDate);
      expect(result).toBe(true); // !false = true
      // empty: trueの場合（データが存在しない）
      mockQuerySnapshot = { empty: true };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      result = await checkExistingDiary(testUserId, testDate);
      expect(result).toBe(false); // !true = false
    });
  });
});