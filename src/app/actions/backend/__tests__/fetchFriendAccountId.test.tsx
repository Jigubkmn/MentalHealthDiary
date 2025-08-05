/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, query, getDocs } from 'firebase/firestore';
import fetchFriendAccountId from '../fetchFriendAccountId';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('fetchFriendAccountId', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

    // モックをリセット
    jest.clearAllMocks();
  });

  describe('正常ケースのテスト', () => {
    test('友人のアカウントIDリストが正常に取得される', async () => {
      const testUserId = 'test-user-123';
      const expectedAccountIds = ['friend1-account', 'friend2-account', 'friend3-account'];

      // Firestoreクエリのモック設定
      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // 友人データを含むドキュメントのモック
      const mockDocs = [
        {
          data: () => ({ accountId: 'friend1-account', userName: 'Friend 1' })
        },
        {
          data: () => ({ accountId: 'friend2-account', userName: 'Friend 2' })
        },
        {
          data: () => ({ accountId: 'friend3-account', userName: 'Friend 3' })
        }
      ];

      const mockSnapshot = {
        docs: mockDocs
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      // Firestoreの関数が正しい引数で呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/friends`);
      expect(mockQuery).toHaveBeenCalledWith(mockFriendsRef);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);

      // 正しいアカウントIDの配列が返されることを確認
      expect(result).toEqual(expectedAccountIds);
      expect(result).toHaveLength(3);
    });

    test('友人がいない場合、空の配列が返される', async () => {
      const testUserId = 'user-with-no-friends';

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // 空のドキュメント配列
      const mockSnapshot = {
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/friends`);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('accountIdがないドキュメントは除外される', async () => {
      const testUserId = 'test-user-456';

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // 一部のドキュメントにaccountIdがない
      const mockDocs = [
        {
          data: () => ({ accountId: 'valid-account-1', userName: 'Valid Friend 1' })
        },
        {
          data: () => ({ userName: 'Invalid Friend - no accountId' }) // accountIdなし
        },
        {
          data: () => ({ accountId: 'valid-account-2', userName: 'Valid Friend 2' })
        },
        {
          data: () => ({ accountId: '', userName: 'Empty AccountId' }) // 空のaccountId
        }
      ];

      const mockSnapshot = {
        docs: mockDocs
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      // accountIdが存在するもののみが返される（空文字列は除外される）
      expect(result).toEqual(['valid-account-1', 'valid-account-2']);
      expect(result).toHaveLength(2);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、エラーがthrowされる', async () => {
      const testUserId = 'test-user-error';
      const mockError = new Error('Firestore connection failed');

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // Firestoreエラーをモック
      (mockGetDocs as any).mockRejectedValue(mockError);

      // console.errorをモック
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // エラーがthrowされることを確認
      await expect(fetchFriendAccountId(testUserId)).rejects.toThrow('Firestore connection failed');

      // エラーログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('友人のアカウントID取得エラー:', mockError);

      consoleSpy.mockRestore();
    });

    test('collectionの作成時にエラーが発生した場合、エラーがthrowされる', async () => {
      const testUserId = 'test-user-collection-error';
      const mockError = new Error('Collection creation failed');

      // collectionでエラーが発生
      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchFriendAccountId(testUserId)).rejects.toThrow('Collection creation failed');

      expect(consoleSpy).toHaveBeenCalledWith('友人のアカウントID取得エラー:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdが未定義の場合でも正常に処理される', async () => {
      const mockFriendsRef = { collection: 'users/undefined/friends' };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      const mockSnapshot = {
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(undefined);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/friends');
      expect(result).toEqual([]);
    });

    test('空文字列のuserIdでも正常に処理される', async () => {
      const testUserId = '';
      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      const mockSnapshot = {
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users//friends');
      expect(result).toEqual([]);
    });
  });

  describe('データ整合性のテスト', () => {
    test('重複するaccountIdがある場合、すべて含まれる', async () => {
      const testUserId = 'test-user-duplicates';

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // 重複するaccountIdを含むデータ
      const mockDocs = [
        {
          data: () => ({ accountId: 'duplicate-account', userName: 'Friend 1' })
        },
        {
          data: () => ({ accountId: 'unique-account', userName: 'Friend 2' })
        },
        {
          data: () => ({ accountId: 'duplicate-account', userName: 'Friend 3' })
        }
      ];

      const mockSnapshot = {
        docs: mockDocs
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      // 重複も含めてすべてのaccountIdが返される
      expect(result).toEqual(['duplicate-account', 'unique-account', 'duplicate-account']);
      expect(result).toHaveLength(3);
    });

    test('特殊文字を含むaccountIdでも正常に処理される', async () => {
      const testUserId = 'test-user-special-chars';

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      // 特殊文字を含むaccountId
      const mockDocs = [
        {
          data: () => ({ accountId: 'friend@email.com', userName: 'Email Friend' })
        },
        {
          data: () => ({ accountId: 'friend-with_underscore', userName: 'Underscore Friend' })
        },
        {
          data: () => ({ accountId: 'friend.with.dots', userName: 'Dots Friend' })
        }
      ];

      const mockSnapshot = {
        docs: mockDocs
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendAccountId(testUserId);

      expect(result).toEqual(['friend@email.com', 'friend-with_underscore', 'friend.with.dots']);
      expect(result).toHaveLength(3);
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスでクエリが構築される', async () => {
      const testUserId = 'specific-test-user';

      const mockFriendsRef = { collection: `users/${testUserId}/friends` };
      const mockQueryObj = { ref: mockFriendsRef };

      (mockCollection as any).mockReturnValue(mockFriendsRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);

      const mockSnapshot = { docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFriendAccountId(testUserId);

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(
        expect.any(Object),
        `users/${testUserId}/friends`
      );
      expect(mockQuery).toHaveBeenCalledWith(mockFriendsRef);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);
    });
  });
});