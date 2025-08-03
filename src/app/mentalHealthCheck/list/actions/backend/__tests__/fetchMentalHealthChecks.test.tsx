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

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      // コレクションの取得確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks`);

      // クエリの構築確認
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<', endOfMonth.toDate());

      // onSnapshotが呼ばれることを確認
      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });

    test('userIdがundefinedの場合も正しくパスが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, undefined);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/mentalHealthChecks');
      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });
  });

  describe('データ処理のテスト', () => {
    test('メンタルヘルスチェックデータが正常に処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-data-test';

      // モックデータの準備
      const mockSnapshot = {
        docs: [
          {
            id: 'check1',
            data: () => ({
              answers: [1, 2, 3, 4, 5],
              evaluation: '要治療',
              scoreA: 31,
              scoreB: 39,
              createdAt: {
                toDate: () => new Date('2023-10-15T12:00:00Z')
              }
            })
          },
          {
            id: 'check2',
            data: () => ({
              answers: [0, 1, 0, 1, 0],
              evaluation: '異常なし',
              scoreA: 5,
              scoreB: 5,
              createdAt: {
                toDate: () => new Date('2023-10-10T09:30:00Z')
              }
            })
          }
        ]
      };

      // onSnapshotのコールバック関数を取得して実行
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      // setMentalHealthCheckListsが期待されるデータで呼ばれることを確認
      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([
        {
          id: 'check1',
          answers: [1, 2, 3, 4, 5],
          evaluation: '要治療',
          scoreA: 31,
          scoreB: 39,
          createdAt: expect.any(dayjs)
        },
        {
          id: 'check2',
          answers: [0, 1, 0, 1, 0],
          evaluation: '異常なし',
          scoreA: 5,
          scoreB: 5,
          createdAt: expect.any(dayjs)
        }
      ]);
    });

    test('createdAtがnullの場合、現在時刻のdayjsオブジェクトが設定される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-null-date';

      const mockSnapshot = {
        docs: [
          {
            id: 'check-null-date',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: 'テスト',
              scoreA: 10,
              scoreB: 15,
              createdAt: null
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      const calledData = mockSetMentalHealthCheckLists.mock.calls[0][0];
      expect(calledData[0].createdAt).toBeInstanceOf(dayjs);
    });

    test('空のスナップショットの場合、空配列が返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-empty';

      const mockEmptySnapshot = { docs: [] };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockEmptySnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledWith([]);
    });
  });

  describe('データフィールドのテスト', () => {
    test('全てのフィールドが正しく抽出・変換される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-fields-test';

      const testDate = new Date('2023-10-15T16:30:45Z');
      const mockSnapshot = {
        docs: [
          {
            id: 'complete-check',
            data: () => ({
              answers: [1, null, 3, 4, null],
              evaluation: '要治療（重度）',
              scoreA: 50,
              scoreB: 60,
              createdAt: {
                toDate: () => testDate
              }
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      const expectedData = mockSetMentalHealthCheckLists.mock.calls[0][0];
      expect(expectedData[0]).toEqual({
        id: 'complete-check',
        answers: [1, null, 3, 4, null],
        evaluation: '要治療（重度）',
        scoreA: 50,
        scoreB: 60,
        createdAt: expect.any(dayjs)
      });

      // createdAtの変換確認 - タイムスタンプ比較でタイムゾーンに依存しない
      const createdAtDayjs = expectedData[0].createdAt;
      expect(createdAtDayjs.toDate().getTime()).toBe(testDate.getTime());
    });

    test('null/undefined値を含むデータも正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-null-values';

      const mockSnapshot = {
        docs: [
          {
            id: 'partial-check',
            data: () => ({
              answers: null,
              evaluation: undefined,
              scoreA: null,
              scoreB: undefined,
              createdAt: {
                toDate: () => new Date('2023-10-15T10:00:00Z')
              }
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      const expectedData = mockSetMentalHealthCheckLists.mock.calls[0][0];
      expect(expectedData[0]).toEqual({
        id: 'partial-check',
        answers: null,
        evaluation: undefined,
        scoreA: null,
        scoreB: undefined,
        createdAt: expect.any(dayjs)
      });
    });
  });

  describe('unsubscribe関数のテスト', () => {
    test('fetchMentalHealthChecksはunsubscribe関数を返す', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-unsubscribe';

      const result = fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });
  });

  describe('リアルタイム更新のテスト', () => {
    test('データが更新された場合、新しいデータで再度コールされる', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const userId = 'user-realtime';

      let snapshotCallback: any;

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      // 最初のデータ
      const firstSnapshot = {
        docs: [
          {
            id: 'check1',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 30,
              createdAt: {
                toDate: () => new Date('2023-10-15T10:00:00Z')
              }
            })
          }
        ]
      };

      snapshotCallback(firstSnapshot);
      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledTimes(1);

      // 更新されたデータ
      const updatedSnapshot = {
        docs: [
          {
            id: 'check1',
            data: () => ({
              answers: [1, 2, 3],
              evaluation: '要治療',
              scoreA: 25,
              scoreB: 30,
              createdAt: {
                toDate: () => new Date('2023-10-15T10:00:00Z')
              }
            })
          },
          {
            id: 'check2',
            data: () => ({
              answers: [0, 1, 0],
              evaluation: '異常なし',
              scoreA: 3,
              scoreB: 3,
              createdAt: {
                toDate: () => new Date('2023-10-16T11:00:00Z')
              }
            })
          }
        ]
      };

      snapshotCallback(updatedSnapshot);
      expect(mockSetMentalHealthCheckLists).toHaveBeenCalledTimes(2);

      // 最新の呼び出しデータを確認
      const latestCallData = mockSetMentalHealthCheckLists.mock.calls[1][0];
      expect(latestCallData).toHaveLength(2);
    });
  });

  describe('ユーザーIDのテスト', () => {
    test('特殊文字を含むユーザーIDでも正しくパスが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const specialUserId = 'user@email.com';

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, specialUserId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${specialUserId}/mentalHealthChecks`);
    });
  });

  describe('日付範囲のテスト', () => {
    test('異なる月の日付範囲でも正しくクエリが構築される', () => {
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-31');
      const userId = 'user-cross-month';

      fetchMentalHealthChecks(mockSetMentalHealthCheckLists, startOfMonth, endOfMonth, userId);

      expect(mockWhere).toHaveBeenCalledWith('createdAt', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('createdAt', '<', endOfMonth.toDate());
    });
  });
});