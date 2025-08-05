/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import fetchDiaries from '../fetchDiaries';

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

describe('fetchDiaries', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockOrderBy: jest.MockedFunction<typeof orderBy>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockSetDiaryLists: jest.MockedFunction<any>;
  let mockUnsubscribe: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockSetDiaryLists = jest.fn();
    mockUnsubscribe = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'diaries' });
    (mockOrderBy as any).mockReturnValue({ orderBy: 'diaryDate' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  describe('クエリ構築のテスト', () => {
    test('visibleUserIdsが存在する場合、userIdでのフィルタリングクエリが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds = ['user1', 'user2', 'user3'];

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      // コレクションの取得確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');

      // クエリの構築確認
      expect(mockOrderBy).toHaveBeenCalledWith('diaryDate', 'desc');
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('userId', 'in', visibleUserIds);

      // onSnapshotが呼ばれることを確認
      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });

    test('visibleUserIdsが空配列の場合、userIdフィルタなしのクエリが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds: string[] = [];

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      // userIdでのフィルタリングが行われないことを確認
      expect(mockWhere).not.toHaveBeenCalledWith('userId', 'in', expect.anything());
      expect(mockWhere).toHaveBeenCalledTimes(2); // 日付フィルタのみ

      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });

    test('visibleUserIdsがundefinedの場合、userIdフィルタなしのクエリが構築される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, undefined);

      // userIdでのフィルタリングが行われないことを確認
      expect(mockWhere).not.toHaveBeenCalledWith('userId', 'in', expect.anything());
      expect(mockWhere).toHaveBeenCalledTimes(2); // 日付フィルタのみ

      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock' }, expect.any(Function));
    });
  });

  describe('データ処理のテスト', () => {
    test('visibleUserIdsが複数ある場合、指定されたユーザーの日記のみが返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds = ['user1', 'user2'];

      // モックデータの準備
      const mockSnapshot = {
        docs: [
          {
            id: 'diary1',
            data: () => ({
              diaryDate: new Date('2023-10-15'),
              diaryImage: 'image1.jpg',
              diaryText: 'テスト日記1',
              feeling: 'とても良い',
              updatedAt: new Date('2023-10-15'),
              userId: 'user1',
              userName: 'ユーザー1',
              userImage: 'user1.jpg'
            })
          },
          {
            id: 'diary2',
            data: () => ({
              diaryDate: new Date('2023-10-16'),
              diaryImage: 'image2.jpg',
              diaryText: 'テスト日記2',
              feeling: '良い',
              updatedAt: new Date('2023-10-16'),
              userId: 'user3', // visibleUserIdsに含まれないユーザー
              userName: 'ユーザー3',
              userImage: 'user3.jpg'
            })
          },
          {
            id: 'diary3',
            data: () => ({
              diaryDate: new Date('2023-10-17'),
              diaryImage: 'image3.jpg',
              diaryText: 'テスト日記3',
              feeling: '普通',
              updatedAt: new Date('2023-10-17'),
              userId: 'user2',
              userName: 'ユーザー2',
              userImage: 'user2.jpg'
            })
          }
        ]
      };

      // onSnapshotのコールバック関数を取得して実行
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      // setDiaryListsが期待されるデータで呼ばれることを確認
      expect(mockSetDiaryLists).toHaveBeenCalledWith([
        {
          id: 'diary1',
          diaryDate: new Date('2023-10-15'),
          diaryImage: 'image1.jpg',
          diaryText: 'テスト日記1',
          feeling: 'とても良い',
          updatedAt: new Date('2023-10-15'),
          userId: 'user1',
          userName: 'ユーザー1',
          userImage: 'user1.jpg'
        },
        {
          id: 'diary3',
          diaryDate: new Date('2023-10-17'),
          diaryImage: 'image3.jpg',
          diaryText: 'テスト日記3',
          feeling: '普通',
          updatedAt: new Date('2023-10-17'),
          userId: 'user2',
          userName: 'ユーザー2',
          userImage: 'user2.jpg'
        }
      ]);
    });

    test('visibleUserIdsが1個の場合、すべての日記が返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds = ['user1']; // 1個のみ

      const mockSnapshot = {
        docs: [
          {
            id: 'diary1',
            data: () => ({
              diaryDate: new Date('2023-10-15'),
              diaryImage: 'image1.jpg',
              diaryText: 'テスト日記1',
              feeling: 'とても良い',
              updatedAt: new Date('2023-10-15'),
              userId: 'user1',
              userName: 'ユーザー1',
              userImage: 'user1.jpg'
            })
          },
          {
            id: 'diary2',
            data: () => ({
              diaryDate: new Date('2023-10-16'),
              diaryImage: 'image2.jpg',
              diaryText: 'テスト日記2',
              feeling: '良い',
              updatedAt: new Date('2023-10-16'),
              userId: 'user2',
              userName: 'ユーザー2',
              userImage: 'user2.jpg'
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      // すべての日記が返されることを確認（visibleUserIds.length === 1の場合）
      expect(mockSetDiaryLists).toHaveBeenCalledWith([
        {
          id: 'diary1',
          diaryDate: new Date('2023-10-15'),
          diaryImage: 'image1.jpg',
          diaryText: 'テスト日記1',
          feeling: 'とても良い',
          updatedAt: new Date('2023-10-15'),
          userId: 'user1',
          userName: 'ユーザー1',
          userImage: 'user1.jpg'
        },
        {
          id: 'diary2',
          diaryDate: new Date('2023-10-16'),
          diaryImage: 'image2.jpg',
          diaryText: 'テスト日記2',
          feeling: '良い',
          updatedAt: new Date('2023-10-16'),
          userId: 'user2',
          userName: 'ユーザー2',
          userImage: 'user2.jpg'
        }
      ]);
    });

    test('visibleUserIdsが存在しない場合、すべての日記が返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      const mockSnapshot = {
        docs: [
          {
            id: 'diary1',
            data: () => ({
              diaryDate: new Date('2023-10-15'),
              diaryImage: 'image1.jpg',
              diaryText: 'テスト日記1',
              feeling: 'とても良い',
              updatedAt: new Date('2023-10-15'),
              userId: 'user1',
              userName: 'ユーザー1',
              userImage: 'user1.jpg'
            })
          },
          {
            id: 'diary2',
            data: () => ({
              diaryDate: new Date('2023-10-16'),
              diaryImage: 'image2.jpg',
              diaryText: 'テスト日記2',
              feeling: '良い',
              updatedAt: new Date('2023-10-16'),
              userId: 'user2',
              userName: 'ユーザー2',
              userImage: 'user2.jpg'
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, undefined);

      // すべての日記が返されることを確認
      expect(mockSetDiaryLists).toHaveBeenCalledWith([
        {
          id: 'diary1',
          diaryDate: new Date('2023-10-15'),
          diaryImage: 'image1.jpg',
          diaryText: 'テスト日記1',
          feeling: 'とても良い',
          updatedAt: new Date('2023-10-15'),
          userId: 'user1',
          userName: 'ユーザー1',
          userImage: 'user1.jpg'
        },
        {
          id: 'diary2',
          diaryDate: new Date('2023-10-16'),
          diaryImage: 'image2.jpg',
          diaryText: 'テスト日記2',
          feeling: '良い',
          updatedAt: new Date('2023-10-16'),
          userId: 'user2',
          userName: 'ユーザー2',
          userImage: 'user2.jpg'
        }
      ]);
    });

    test('スナップショットが空の場合、空配列が返される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds = ['user1', 'user2'];

      const mockEmptySnapshot = { docs: [] };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockEmptySnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      expect(mockSetDiaryLists).toHaveBeenCalledWith([]);
    });
  });

  describe('データフィールドのテスト', () => {
    test('データの全フィールドが正しく抽出される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      const mockSnapshot = {
        docs: [
          {
            id: 'complete-diary',
            data: () => ({
              diaryDate: new Date('2023-10-15T10:30:00'),
              diaryImage: 'https://example.com/image.jpg',
              diaryText: '完全なテスト日記です。絵文字も含みます😊',
              feeling: 'とても良い',
              updatedAt: new Date('2023-10-15T11:00:00'),
              userId: 'complete-user',
              userName: '完全ユーザー',
              userImage: 'https://example.com/user.jpg'
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, undefined);

      expect(mockSetDiaryLists).toHaveBeenCalledWith([
        {
          id: 'complete-diary',
          diaryDate: new Date('2023-10-15T10:30:00'),
          diaryImage: 'https://example.com/image.jpg',
          diaryText: '完全なテスト日記です。絵文字も含みます😊',
          feeling: 'とても良い',
          updatedAt: new Date('2023-10-15T11:00:00'),
          userId: 'complete-user',
          userName: '完全ユーザー',
          userImage: 'https://example.com/user.jpg'
        }
      ]);
    });

    test('nullやundefinedフィールドが含まれる場合も正しく処理される', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      const mockSnapshot = {
        docs: [
          {
            id: 'partial-diary',
            data: () => ({
              diaryDate: new Date('2023-10-15'),
              diaryImage: null,
              diaryText: 'テスト日記',
              feeling: '普通',
              updatedAt: new Date('2023-10-15'),
              userId: 'test-user',
              userName: undefined,
              userImage: null
            })
          }
        ]
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, undefined);

      expect(mockSetDiaryLists).toHaveBeenCalledWith([
        {
          id: 'partial-diary',
          diaryDate: new Date('2023-10-15'),
          diaryImage: null,
          diaryText: 'テスト日記',
          feeling: '普通',
          updatedAt: new Date('2023-10-15'),
          userId: 'test-user',
          userName: undefined,
          userImage: null
        }
      ]);
    });
  });

  describe('unsubscribe関数のテスト', () => {
    test('fetchDiariesはunsubscribe関数を返す', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');

      const result = fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, undefined);

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });
  });

  describe('日付範囲のテスト', () => {
    test('異なる月の日付範囲でも正しくクエリが構築される', () => {
      const startOfMonth = dayjs('2023-12-01');
      const endOfMonth = dayjs('2024-01-31');
      const visibleUserIds = ['user1'];

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', startOfMonth.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', endOfMonth.toDate());
    });

    test('同じ日の開始・終了日でもクエリが構築される', () => {
      const sameDay = dayjs('2023-10-15');
      const visibleUserIds = ['user1'];

      fetchDiaries(mockSetDiaryLists, sameDay, sameDay, visibleUserIds);

      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', sameDay.toDate());
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<', sameDay.toDate());
    });
  });

  describe('複雑なシナリオのテスト', () => {
    test('大量のデータと複数のvisibleUserIdsでパフォーマンステスト', () => {
      const startOfMonth = dayjs('2023-10-01');
      const endOfMonth = dayjs('2023-10-31');
      const visibleUserIds = ['user1', 'user2', 'user3', 'user4', 'user5'];

      // 大量のモックデータを生成
      const mockDocs = Array.from({ length: 100 }, (_, index) => ({
        id: `diary-${index}`,
        data: () => ({
          diaryDate: new Date(`2023-10-${(index % 30) + 1}`),
          diaryImage: `image-${index}.jpg`,
          diaryText: `テスト日記 ${index}`,
          feeling: ['とても良い', '良い', '普通', '悪い', 'とても悪い'][index % 5],
          updatedAt: new Date(`2023-10-${(index % 30) + 1}`),
          userId: `user${(index % 10) + 1}`,
          userName: `ユーザー${index}`,
          userImage: `user-${index}.jpg`
        })
      }));

      const mockSnapshot = { docs: mockDocs };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      fetchDiaries(mockSetDiaryLists, startOfMonth, endOfMonth, visibleUserIds);

      // setDiaryListsが呼ばれることを確認（フィルタリングされたデータ）
      expect(mockSetDiaryLists).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringMatching(/diary-\d+/),
            diaryText: expect.stringMatching(/テスト日記 \d+/),
            userId: expect.stringMatching(/user[1-5]/)
          })
        ])
      );
    });
  });
});