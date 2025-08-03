/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, query, getDocs } from 'firebase/firestore';
import fetchFriendDocumentId from '../fetchFriendDocumentId';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.error をモック
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchFriendDocumentId', () => {
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

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'friends' });
    (mockQuery as any).mockReturnValue({ query: 'mock-query' });
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
    (mockCollection as any).mockReset();
    (mockQuery as any).mockReset();
    (mockGetDocs as any).mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleError.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('フレンドが存在する場合、最初のフレンドのドキュメントIDが返される', async () => {
      const userId = 'user-123';
      const expectedDocumentId = 'friend-doc-id-123';

      // モックのSnapshot設定
      const mockSnapshot = {
        empty: false,
        docs: [
          { id: expectedDocumentId },
          { id: 'friend-doc-id-456' }, // 2番目のフレンド（使用されない）
          { id: 'friend-doc-id-789' }  // 3番目のフレンド（使用されない）
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      // Firestore操作の確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'friends' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });

      // 戻り値の確認
      expect(result).toBe(expectedDocumentId);
    });

    test('複数のフレンドがいても最初のフレンドのIDが返される', async () => {
      const userId = 'user-multiple-friends';
      const firstFriendId = 'first-friend-id';
      const secondFriendId = 'second-friend-id';

      const mockSnapshot = {
        empty: false,
        docs: [
          { id: firstFriendId },
          { id: secondFriendId }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(firstFriendId);
      expect(result).not.toBe(secondFriendId);
    });

    test('1つのフレンドのみが存在する場合、そのIDが返される', async () => {
      const userId = 'user-single-friend';
      const singleFriendId = 'single-friend-id';

      const mockSnapshot = {
        empty: false,
        docs: [
          { id: singleFriendId }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(singleFriendId);
    });

    test('異なるユーザーIDでも正しいパスでアクセスされる', async () => {
      const userId = 'different-user-456';
      const friendId = 'friend-for-different-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFriendDocumentId(userId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
    });

    test('特殊文字を含むユーザーIDでも正しく処理される', async () => {
      const userId = 'user@email.com';
      const friendId = 'friend-special-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(result).toBe(friendId);
    });

    test('非常に長いユーザーIDでも正しく処理される', async () => {
      const longUserId = 'a'.repeat(1000);
      const friendId = 'friend-long-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(longUserId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${longUserId}/friends`);
      expect(result).toBe(friendId);
    });
  });

  describe('フレンドが存在しない場合のテスト', () => {
    test('フレンドが存在しない場合、undefinedが返される', async () => {
      const userId = 'user-no-friends';

      const mockSnapshot = {
        empty: true,
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      // Firestore操作の確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'friends' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });

      // undefinedが返されることを確認
      expect(result).toBeUndefined();
    });

    test('空のコレクションの場合、undefinedが返される', async () => {
      const userId = 'user-empty-collection';

      const mockSnapshot = {
        empty: true,
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBeUndefined();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('getDocsでエラーが発生した場合、エラーがthrowされる', async () => {
      const userId = 'user-getDocs-error';
      const mockError = new Error('Firestore getDocs error');

      (mockGetDocs as any).mockRejectedValue(mockError);

      await expect(fetchFriendDocumentId(userId)).rejects.toThrow('Firestore getDocs error');

      // エラーログの確認
      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
    });

    test('collectionでエラーが発生した場合、エラーがthrowされる', async () => {
      const userId = 'user-collection-error';
      const mockError = new Error('Collection reference error');

      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      await expect(fetchFriendDocumentId(userId)).rejects.toThrow('Collection reference error');

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
    });

    test('queryでエラーが発生した場合、エラーがthrowされる', async () => {
      const userId = 'user-query-error';
      const mockError = new Error('Query error');

      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });

      await expect(fetchFriendDocumentId(userId)).rejects.toThrow('Query error');

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
    });

    test('snapshot.docsでエラーが発生した場合、エラーがthrowされる', async () => {
      const userId = 'user-docs-error';
      const mockError = new Error('Docs access error');

      const mockSnapshot = {
        empty: false,
        get docs() {
          throw mockError;
        }
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await expect(fetchFriendDocumentId(userId)).rejects.toThrow('Docs access error');

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
    });

    test('snapshot.docs[0].idでエラーが発生した場合、エラーがthrowされる', async () => {
      const userId = 'user-id-access-error';
      const mockError = new Error('ID access error');

      const mockSnapshot = {
        empty: false,
        docs: [
          {
            get id() {
              throw mockError;
            }
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await expect(fetchFriendDocumentId(userId)).rejects.toThrow('ID access error');

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
    });
  });

  describe('ユーザーIDのテスト', () => {
    test('空文字列のユーザーIDでも処理される', async () => {
      const userId = '';
      const friendId = 'friend-empty-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(result).toBe(friendId);
    });

    test('数値文字列のユーザーIDでも処理される', async () => {
      const userId = '123456789';
      const friendId = 'friend-numeric-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(result).toBe(friendId);
    });

    test('Unicode文字を含むユーザーIDでも処理される', async () => {
      const userId = 'ユーザー123';
      const friendId = 'friend-unicode-user';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(result).toBe(friendId);
    });
  });

  describe('ドキュメントIDのテスト', () => {
    test('空文字列のドキュメントIDでも返される', async () => {
      const userId = 'user-empty-doc-id';
      const emptyDocId = '';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: emptyDocId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(emptyDocId);
    });

    test('特殊文字を含むドキュメントIDでも返される', async () => {
      const userId = 'user-special-doc-id';
      const specialDocId = 'friend@doc#123';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: specialDocId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(specialDocId);
    });

    test('非常に長いドキュメントIDでも返される', async () => {
      const userId = 'user-long-doc-id';
      const longDocId = 'f'.repeat(1000);

      const mockSnapshot = {
        empty: false,
        docs: [{ id: longDocId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(longDocId);
    });

    test('Unicode文字を含むドキュメントIDでも返される', async () => {
      const userId = 'user-unicode-doc-id';
      const unicodeDocId = 'フレンド文書123';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: unicodeDocId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBe(unicodeDocId);
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のフレンドドキュメントでも最初のIDが正しく返される', async () => {
      const userId = 'user-many-friends';
      const firstFriendId = 'first-friend';

      // 1000個のフレンドドキュメントを作成
      const manyDocs = Array.from({ length: 1000 }, (_, index) => ({
        id: index === 0 ? firstFriendId : `friend-${index}`
      }));

      const mockSnapshot = {
        empty: false,
        docs: manyDocs
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      // 最初のフレンドIDが返されることを確認
      expect(result).toBe(firstFriendId);
    });
  });

  describe('Firestoreクエリの確認', () => {
    test('正しいFirestoreクエリが構築される', async () => {
      const userId = 'user-query-check';

      const mockSnapshot = {
        empty: true,
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFriendDocumentId(userId);

      // 各関数が1回ずつ呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // 正しいパラメータで呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'friends' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });
    });
  });

  describe('戻り値の型のテスト', () => {
    test('成功時は文字列が返される', async () => {
      const userId = 'user-return-type';
      const friendId = 'friend-string-id';

      const mockSnapshot = {
        empty: false,
        docs: [{ id: friendId }]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(typeof result).toBe('string');
      expect(result).toBe(friendId);
    });

    test('フレンドが存在しない場合はundefinedが返される', async () => {
      const userId = 'user-undefined-return';

      const mockSnapshot = {
        empty: true,
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFriendDocumentId(userId);

      expect(result).toBeUndefined();
      expect(typeof result).toBe('undefined');
    });
  });
});