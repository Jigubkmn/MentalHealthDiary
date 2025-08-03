/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
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
      
      // Timestampモックを作成
      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      // 感情スコアドキュメントのモック
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-05')),
              feelingScore: 4
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-15')),
              feelingScore: 3
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-25')),
              feelingScore: 5
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
        { date: '10/5', value: 4 },
        { date: '10/15', value: 3 },
        { date: '10/25', value: 5 }
      ]);

      // console.logが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に成功しました');

      // unsubscribe関数が返されることを確認
      expect(result).toBe(mockUnsubscribe);

      consoleSpy.mockRestore();
    });

    test('データが存在しない場合、空の配列が設定される', () => {
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
      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に成功しました');

      consoleSpy.mockRestore();
    });

    test('小数点を含む感情スコアでも正常に処理される', () => {
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
              diaryDate: createMockTimestamp(new Date('2023-09-10')),
              feelingScore: 3.5
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-09-20')),
              feelingScore: 4.2
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '9/10', value: 3.5 },
        { date: '9/20', value: 4.2 }
      ]);
    });

    test('年をまたぐ日付範囲でも正常に処理される', () => {
      const testUserId = 'test-user-year-cross';
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-12-15')),
              feelingScore: 2
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-12-31')),
              feelingScore: 5
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '12/15', value: 2 },
        { date: '12/31', value: 5 }
      ]);
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

      // 早期リターンのため、Firestoreの関数は呼ばれない
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('userIdがnullの場合、早期リターンされる', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      const result = fetchFeelingScore(
        null as any,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('userIdがundefinedの場合、早期リターンされる', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      const result = fetchFeelingScore(
        undefined as any,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('有効なuserIdでコレクションが正しく作成される', () => {
      const testUserId = 'valid-user-id';
      const startOfMonth = dayjs('2023-08-01');
      const endOfMonth = dayjs('2023-09-01');

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores`);
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('日付フォーマットのテスト', () => {
    test('1桁の月・日が正しくフォーマットされる', () => {
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
              diaryDate: createMockTimestamp(new Date('2023-01-05')),
              feelingScore: 3
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-01-25')),
              feelingScore: 4
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '1/5', value: 3 },
        { date: '1/25', value: 4 }
      ]);
    });

    test('2桁の月・日が正しくフォーマットされる', () => {
      const testUserId = 'test-user-format-double';
      const startOfMonth = dayjs('2023-11-01');
      const endOfMonth = dayjs('2023-12-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-11-15')),
              feelingScore: 2
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '11/15', value: 2 }
      ]);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、エラーログが出力され空配列が設定される', () => {
      const testUserId = 'test-user-error';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');
      const mockError = new Error('Firestore connection error');

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

      expect(consoleSpy).toHaveBeenCalledWith('感情スコアの取得に失敗しました:', mockError);
      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([]);
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    test('queryの作成時にエラーが発生した場合、エラーログが出力される', () => {
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

    test('onSnapshotの作成時にエラーが発生した場合、エラーログが出力される', () => {
      const testUserId = 'test-user-snapshot-error';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');
      const mockError = new Error('onSnapshot error');

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

  describe('リアルタイム更新のテスト', () => {
    test('データが更新された場合、新しいデータでsetFeelingScoreDatesが呼ばれる', () => {
      const testUserId = 'test-user-realtime';
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-11-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      // 初回データ
      const initialSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-10')),
              feelingScore: 3
            })
          }
        ]
      };

      // 更新後データ
      const updatedSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-10')),
              feelingScore: 3
            })
          },
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-10-20')),
              feelingScore: 5
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // 初回データの処理
      snapshotCallback(initialSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenNthCalledWith(1, [
        { date: '10/10', value: 3 }
      ]);

      // データ更新の処理
      snapshotCallback(updatedSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenNthCalledWith(2, [
        { date: '10/10', value: 3 },
        { date: '10/20', value: 5 }
      ]);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledTimes(2);
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスとクエリ条件が構築される', () => {
      const testUserId = 'query-test-user';
      const startOfMonth = dayjs('2023-07-01');
      const endOfMonth = dayjs('2023-08-01');

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

      // whereクエリが正しく呼ばれることを確認
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());

      // queryが正しく呼ばれることを確認
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    test('日付範囲が正しくDate型に変換される', () => {
      const testUserId = 'date-conversion-user';
      const startOfMonth = dayjs('2023-06-15T10:30:00');
      const endOfMonth = dayjs('2023-07-15T15:45:00');

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      // dayjsオブジェクトが正しくDateオブジェクトに変換されることを確認
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());
    });

    test('unsubscribe関数が正しく返される', () => {
      const testUserId = 'unsubscribe-test-user';
      const startOfMonth = dayjs('2023-05-01');
      const endOfMonth = dayjs('2023-06-01');

      const result = fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });
  });

  describe('感情スコア値のテスト', () => {
    test('0の感情スコアでも正常に処理される', () => {
      const testUserId = 'test-user-zero-score';
      const startOfMonth = dayjs('2023-04-01');
      const endOfMonth = dayjs('2023-05-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-04-15')),
              feelingScore: 0
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '4/15', value: 0 }
      ]);
    });

    test('負の感情スコアでも正常に処理される', () => {
      const testUserId = 'test-user-negative-score';
      const startOfMonth = dayjs('2023-03-01');
      const endOfMonth = dayjs('2023-04-01');

      const createMockTimestamp = (date: Date) => ({
        toDate: () => date
      });

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: createMockTimestamp(new Date('2023-03-10')),
              feelingScore: -1
            })
          }
        ]
      };

      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchFeelingScore(
        testUserId,
        mockSetFeelingScoreDates,
        startOfMonth,
        endOfMonth
      );

      snapshotCallback(mockSnapshot);

      expect(mockSetFeelingScoreDates).toHaveBeenCalledWith([
        { date: '3/10', value: -1 }
      ]);
    });
  });
});