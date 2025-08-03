/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import fetchMentalHealthChecks from '../fetchMentalHealthChecks';
import { MentalHealthCheckType } from '../../../../../../../type/mentalHealthCheck';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

describe('fetchMentalHealthChecks', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockOrderBy: jest.MockedFunction<typeof orderBy>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockSetMentalHealthCheckLists: jest.MockedFunction<any>;
  let mockUnsubscribe: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockSetMentalHealthCheckLists = jest.fn();
    mockUnsubscribe = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
    (mockOrderBy as any).mockReturnValue({ orderBy: 'createdAt' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  describe('クエリ構築のテスト', () => {
    test('正しいコレクションパスとクエリが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-123';

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      // コレクションの取得確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks`);

      // クエリの構築確認
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<', endOfMonth.toDate());

      // onSnapshotが呼ばれることを確認
      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });

    test('userIdがundefinedでも正しいパスが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        undefined
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/mentalHealthChecks');
    });

    test('特殊文字を含むuserIdでも正しいパスが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user@email.com';

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks`);
    });
  });

  describe('データ処理のテスト', () => {
    test('メンタルヘルスチェックデータが正常に処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-123';

      // モックデータの準備
      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'check1',
            data: () => ({
              answers: [1, 2, 3, 4, 5],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 40,
              createdAt: mockTimestamp
            })
          },
          {
            id: 'check2',
            data: () => ({
              answers: [0, 1, 0, 1, 0],
              evaluation: '異常なし',
              scoreA: 5,
              scoreB: 8,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      // onSnapshotのコールバック関数を取得して実行
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      // setMentalHealthCheckListsが期待されるデータで呼ばれることを確認
      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        {
          id: 'check1',
          answers: [1, 2, 3, 4, 5],
          evaluation: '要治療',
          scoreA: 25,
          scoreB: 40,
          createdAt: dayjs('2023-10-15T10:30:00Z')
        },
        {
          id: 'check2',
          answers: [0, 1, 0, 1, 0],
          evaluation: '異常なし',
          scoreA: 5,
          scoreB: 8,
          createdAt: dayjs('2023-10-15T10:30:00Z')
        }
      ]);
    });

    test('空のスナップショットの場合、空配列が返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-no-data';

      const mockEmptySnapshot = { docs: [] };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockEmptySnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([]);
    });

    test('null値を含むデータも正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-null-data';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'check-with-nulls',
            data: () => ({
              answers: [1, null, 3, null, 5],
              evaluation: '要経過観察',
              scoreA: null,
              scoreB: null,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        {
          id: 'check-with-nulls',
          answers: [1, null, 3, null, 5],
          evaluation: '要経過観察',
          scoreA: null,
          scoreB: null,
          createdAt: dayjs('2023-10-15T10:30:00Z')
        }
      ]);
    });

    test('createdAtがnullの場合、現在時刻が使用される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-null-timestamp';

      const mockSnapshot = {
        docs: [
          {
            id: 'check-null-timestamp',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 40,
              createdAt: null
            })
          }
        ]
      };

      // 現在時刻をモック
      const mockNow = dayjs('2023-10-20T15:00:00Z');
      jest.spyOn(dayjs, 'dayjs' as any).mockReturnValue(mockNow);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        {
          id: 'check-null-timestamp',
          answers: [1, 2, 3],
          evaluation: '要治療',
          scoreA: 25,
          scoreB: 40,
          createdAt: mockNow
        }
      ]);

      (dayjs as any).mockRestore();
    });
  });

  describe('評価タイプ別のテスト', () => {
    test('要治療の評価データが正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-severe';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'severe-case',
            data: () => ({
              answers: [4, 4, 4, 4, 4, 4],
              evaluation: '要治療',
              scoreA: 31,
              scoreB: 39,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        expect.objectContaining({
          evaluation: '要治療',
          scoreA: 31,
          scoreB: 39
        })
      ]);
    });

    test('異常なしの評価データが正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-normal';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'normal-case',
            data: () => ({
              answers: [0, 1, 0, 1, 0, 1],
              evaluation: '異常なし',
              scoreA: 3,
              scoreB: 3,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        expect.objectContaining({
          evaluation: '異常なし',
          scoreA: 3,
          scoreB: 3
        })
      ]);
    });

    test('要経過観察の評価データが正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-observation';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'observation-case',
            data: () => ({
              answers: [2, 2, 2, 2, 2, 2],
              evaluation: '要経過観察',
              scoreA: 18,
              scoreB: 42,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        expect.objectContaining({
          evaluation: '要経過観察',
          scoreA: 18,
          scoreB: 42
        })
      ]);
    });
  });

  describe('日付範囲のテスト', () => {
    test('異なる月の日付範囲でも正しくクエリが構築される', () => {
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-31');
      const userId = 'user-cross-month';

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<', endOfMonth.toDate());
    });

    test('同じ日の開始・終了日でもクエリが構築される', () => {
      const sameDay = dayjs('2023-10-15');
      const userId = 'user-same-day';

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        sameDay,
        sameDay,
        userId
      );

      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', sameDay.toDate());
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<', sameDay.toDate());
    });
  });

  describe('unsubscribe関数のテスト', () => {
    test('fetchMentalHealthChecksはunsubscribe関数を返す', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-unsubscribe';

      const result = fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });
  });

  describe('大量データのテスト', () => {
    test('大量のメンタルヘルスチェックデータも正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-large-data';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      // 100個のメンタルヘルスチェックデータを生成
      const mockDocs = Array.from({ length: 100 }, (_, index) => ({
        id: `check-${index}`,
        data: () => ({
          answers: Array(10).fill(index % 5),
          evaluation: ['要治療', '異常なし', '要経過観察'][index % 3],
          scoreA: index * 2,
          scoreB: index * 3,
          createdAt: mockTimestamp
        })
      }));

      const mockSnapshot = { docs: mockDocs };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      // setMentalHealthCheckListsが呼ばれることを確認
      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringMatching(/check-\d+/),
            answers: expect.any(Array),
            evaluation: expect.stringMatching(/要治療|異常なし|要経過観察/),
            scoreA: expect.any(Number),
            scoreB: expect.any(Number),
            createdAt: expect.any(Object)
          })
        ])
      );

      // 正確に100個のデータが処理されることを確認
      const calledWith = mockSetMentalHealthCheckLists.mock.calls[0][0];
      expect(calledWith).toHaveLength(100);
    });
  });

  describe('タイムスタンプ変換のテスト', () => {
    test('Firestoreタイムスタンプが正しくdayjsオブジェクトに変換される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-timestamp-conversion';

      const specificDate = new Date('2023-10-15T14:30:45.123Z');
      const mockTimestamp = {
        toDate: () => specificDate
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'timestamp-test',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 40,
              createdAt: mockTimestamp
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      const calledWith = mockSetMentalHealthCheckLists.mock.calls[0][0];
      const createdAtDayjs = calledWith[0].createdAt;

      // dayjsオブジェクトが正しく作成されることを確認
      expect(createdAtDayjs.toDate()).toEqual(specificDate);
      expect(createdAtDayjs.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-10-15 14:30:45');
    });

    test('undefined createdAtの場合、現在時刻のdayjsオブジェクトが使用される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-undefined-timestamp';

      const mockSnapshot = {
        docs: [
          {
            id: 'undefined-timestamp-test',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 40,
              createdAt: undefined
            })
          }
        ]
      };

      const mockCurrentTime = dayjs('2023-10-20T16:00:00Z');
      jest.spyOn(dayjs, 'dayjs' as any).mockReturnValue(mockCurrentTime);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      const calledWith = mockSetMentalHealthCheckLists.mock.calls[0][0];
      expect(calledWith[0].createdAt).toBe(mockCurrentTime);

      (dayjs as any).mockRestore();
    });
  });

  describe('データフィールドの完全性テスト', () => {
    test('すべてのフィールドが正しく抽出・変換される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-complete-fields';

      const mockTimestamp = {
        toDate: () => new Date('2023-10-15T10:30:00Z')
      };

      const mockSnapshot = {
        docs: [
          {
            id: 'complete-field-test',
            data: () => ({
              answers: [1, 2, null, 4, 5],
              evaluation: '要経過観察',
              scoreA: 20,
              scoreB: 35,
              createdAt: mockTimestamp,
              // 余分なフィールドがあっても無視される
              extraField: 'should be ignored'
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(
        mockSetMentalHealthCheckLists,
        startOfMonth,
        endOfMonth,
        userId
      );

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        {
          id: 'complete-field-test',
          answers: [1, 2, null, 4, 5],
          evaluation: '要経過観察',
          scoreA: 20,
          scoreB: 35,
          createdAt: dayjs('2023-10-15T10:30:00Z')
          // extraFieldは含まれない
        }
      ]);
    });
  });
});