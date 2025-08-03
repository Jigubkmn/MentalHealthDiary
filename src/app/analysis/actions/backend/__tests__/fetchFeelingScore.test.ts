/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import fetchFeelingScore from '../fetchFeelingScore';
import { FeelingScoreType } from '../../../../../../type/feelingScore';
import dayjs from 'dayjs';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('../../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('fetchFeelingScore', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockOrderBy: jest.MockedFunction<typeof orderBy>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockSetFeelingScoreDates: jest.MockedFunction<(feelingScoreDates: FeelingScoreType[]) => void>;
  let mockUnsubscribe: jest.MockedFunction<() => void>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    
    // コールバック関数のモック
    mockSetFeelingScoreDates = jest.fn();
    mockUnsubscribe = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'feelingScores' });
    (mockOrderBy as any).mockReturnValue({ orderBy: 'diaryDate' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  describe('正常ケースのテスト', () => {
    test('感情スコアデータが正常に取得される', () => {
      const testUserId = 'test-user-123';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      // モックTimestampオブジェクト
      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      // 感情スコアドキュメントのモック
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-05')),
              feelingScore: 8
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-15')),
              feelingScore: 6
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-25')),
              feelingScore: 9
            })
          }
        ]
      };

      // onSnapshotのコールバックをキャプチャして実行
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // Firestoreの関数が正しく呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores`);
      expect(mockOrderBy).toHaveBeenCalledWith('diaryDate', 'asc');
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();

      // スナップショットコールバックを実行
      snapshotCallback(mockSnapshot);

      // setFeelingScoreDatesが正しいデータで呼ばれることを確認
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '10/5', value: 8 },
        { date: '10/15', value: 6 },
        { date: '10/25', value: 9 }
      ]);

      // ログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に成功しました');

      // unsubscribe関数が返されることを確認
      expect(result).toBe(mockUnsubscribe);

      consoleSpy.mockRestore();
    });

    test('感情スコアデータが存在しない場合、空の配列が設定される', () => {
      const testUserId = 'test-user-no-data';
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-01');

      const mockEmptySnapshot = {
        docs: []
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockEmptySnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([]);

      consoleSpy.mockRestore();
    });

    test('日付フォーマットが正しく適用される', () => {
      const testUserId = 'test-user-format';
      const startOfMonth = dayjs('2023-01-01');
      const endOfMonth = dayjs('2023-02-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-01-01')),
              feelingScore: 7
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-01-10')),
              feelingScore: 5
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-01-31')),
              feelingScore: 10
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      // 日付が'M/D'形式でフォーマットされることを確認
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '1/1', value: 7 },
        { date: '1/10', value: 5 },
        { date: '1/31', value: 10 }
      ]);

      consoleSpy.mockRestore();
    });

    test('感情スコアの範囲（0-10）が正しく処理される', () => {
      const testUserId = 'test-user-score-range';
      const startOfMonth = dayjs('2023-05-01');
      const endOfMonth = dayjs('2023-06-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-05-01')),
              feelingScore: 0
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-05-15')),
              feelingScore: 5
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-05-31')),
              feelingScore: 10
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '5/1', value: 0 },
        { date: '5/15', value: 5 },
        { date: '5/31', value: 10 }
      ]);

      consoleSpy.mockRestore();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdが空文字列の場合、早期リターンされる', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      const result = fetchFeelingScore(
        '',
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // Firestoreの関数は呼ばれない
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(mockSetFeelingScoreDates).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('userIdがnullまたはundefinedの場合、早期リターンされる', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      const result1 = fetchFeelingScore(
        null as any,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      const result2 = fetchFeelingScore(
        undefined as any,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockCollection).not.toHaveBeenCalled();
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    test('有効なuserIdで正常に処理される', () => {
      const testUserId = 'valid-user-id';
      const startOfMonth = dayjs('2023-08-01');
      const endOfMonth = dayjs('2023-09-01');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores`);
      expect(result).toBe(mockUnsubscribe);

      consoleSpy.mockRestore();
    });
  });

  describe('期間指定のテスト', () => {
    test('月の境界条件が正しく処理される', () => {
      const testUserId = 'test-user-boundary';
      const startOfMonth = dayjs('2023-02-01');
      const endOfMonth = dayjs('2023-03-01');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // where句が正しい日付で呼ばれることを確認
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());

      consoleSpy.mockRestore();
    });

    test('年をまたぐ期間でも正常に処理される', () => {
      const testUserId = 'test-user-year-boundary';
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-01');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());

      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、エラーログが出力され空配列が設定される', () => {
      const testUserId = 'test-user-error';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');
      const mockError = new Error('Firestore onSnapshot error');

      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // エラーログが出力される
      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に失敗しました:', mockError);

      // 空配列が設定される
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([]);

      // undefinedが返される
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    test('queryの作成時にエラーが発生した場合、エラーハンドリングされる', () => {
      const testUserId = 'test-user-query-error';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');
      const mockError = new Error('Query creation error');

      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に失敗しました:', mockError);
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([]);

      consoleSpy.mockRestore();
    });

    test('onSnapshotエラーが発生した場合、エラーハンドリングされる', () => {
      const testUserId = 'test-user-snapshot-error';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');
      const mockError = new Error('OnSnapshot error');

      (mockOnSnapshot as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に失敗しました:', mockError);
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([]);

      consoleSpy.mockRestore();
    });
  });

  describe('データ変換のテスト', () => {
    test('Timestampオブジェクトが正しく日付文字列に変換される', () => {
      const testUserId = 'test-user-timestamp';
      const startOfMonth = dayjs('2023-07-01');
      const endOfMonth = dayjs('2023-08-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-07-04')),
              feelingScore: 6
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-07-14')),
              feelingScore: 8
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      // Timestampが正しく'M/D'形式に変換されることを確認
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '7/4', value: 6 },
        { date: '7/14', value: 8 }
      ]);

      consoleSpy.mockRestore();
    });

    test('小数点の感情スコアでも正常に処理される', () => {
      const testUserId = 'test-user-decimal';
      const startOfMonth = dayjs('2023-09-01');
      const endOfMonth = dayjs('2023-10-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-09-15')),
              feelingScore: 7.5
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-09-20')),
              feelingScore: 6.8
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '9/15', value: 7.5 },
        { date: '9/20', value: 6.8 }
      ]);

      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスとクエリが構築される', () => {
      const testUserId = 'query-test-user';
      const startOfMonth = dayjs('2023-06-01');
      const endOfMonth = dayjs('2023-07-01');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(
        expect.any(Object),
        `users/${testUserId}/feelingScores`
      );

      // orderByが正しく呼ばれることを確認
      expect(mockOrderBy).toHaveBeenCalledWith('diaryDate', 'asc');

      // where句が正しく呼ばれることを確認
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());

      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('unsubscribe関数が正しく返される', () => {
      const testUserId = 'unsubscribe-test-user';
      const startOfMonth = dayjs('2023-11-01');
      const endOfMonth = dayjs('2023-12-01');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');

      consoleSpy.mockRestore();
    });
  });
});