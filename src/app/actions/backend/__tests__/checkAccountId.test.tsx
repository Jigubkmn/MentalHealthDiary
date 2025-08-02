import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import checkAccountId from '../checkAccountId';

// 型定義
type MockQuerySnapshot = {
  empty: boolean;
  docs: Array<{ id: string; data?: () => Record<string, unknown> }>;
};

type MockFirestoreRef = {
  collection: string;
};

type MockWhereCondition = {
  field: string;
  operator: string;
  value: string;
};

type MockQueryObj = {
  ref: MockFirestoreRef;
  where: MockWhereCondition;
};

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collectionGroup: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('checkAccountId', () => {
  let mockCollectionGroup: jest.MockedFunction<typeof collectionGroup>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockWhere: jest.MockedFunction<typeof where>;

  beforeEach(() => {
    // モック関数を取得
    mockCollectionGroup = collectionGroup as jest.MockedFunction<typeof collectionGroup>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockWhere = where as jest.MockedFunction<typeof where>;

    // モックをリセット
    jest.clearAllMocks();
  });

  describe('アカウントID重複チェック成功時のテスト', () => {
    test('アカウントIDが重複している場合、trueが返される', async () => {
      const testAccountId = 'existing_account_id';

      // Firestoreクエリのモック設定
      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      // 重複ありの結果をモック（empty = false）
      const mockQuerySnapshot: MockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'doc1', data: () => ({ accountId: testAccountId }) }]
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      const result = await checkAccountId(testAccountId);

      // Firestoreの関数が正しい引数で呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', testAccountId);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);

      // 重複ありの場合trueが返されることを確認
      expect(result).toBe(true);
    });

    test('アカウントIDが重複していない場合、falseが返される', async () => {
      const testAccountId = 'unique_account_id';

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      // 重複なしの結果をモック（empty = true）
      const mockQuerySnapshot: MockQuerySnapshot = {
        empty: true,
        docs: []
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      const result = await checkAccountId(testAccountId);

      expect(mockCollectionGroup).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', testAccountId);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);

      // 重複なしの場合falseが返されることを確認
      expect(result).toBe(false);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、trueが返される', async () => {
      const testAccountId = 'test_account_id';
      const mockError = new Error('Firestore connection error');

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      // Firestoreエラーをモック
      mockGetDocs.mockRejectedValue(mockError);

      // console.errorをモック
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkAccountId(testAccountId);

      // エラーハンドリングの確認
      expect(consoleSpy).toHaveBeenCalledWith('ユーザーIDの重複チェックに失敗しました:', mockError);
      
      // エラー時はtrueが返されることを確認（安全側の動作）
      expect(result).toBe(true);

      consoleSpy.mockRestore();
    });

    test('クエリ構築時にエラーが発生した場合、trueが返される', async () => {
      const testAccountId = 'test_account_id';
      const mockError = new Error('Query construction error');

      // collectionGroupでエラーが発生
      mockCollectionGroup.mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkAccountId(testAccountId);

      expect(consoleSpy).toHaveBeenCalledWith('ユーザーIDの重複チェックに失敗しました:', mockError);
      expect(result).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('入力値のテスト', () => {
    test('空文字列のアカウントIDでもクエリが実行される', async () => {
      const testAccountId = '';

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      const mockQuerySnapshot: MockQuerySnapshot = { empty: true, docs: [] };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      const result = await checkAccountId(testAccountId);

      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', '');
      expect(result).toBe(false);
    });

    test('特殊文字を含むアカウントIDでもクエリが実行される', async () => {
      const testAccountId = 'test@account-id_123';

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      const mockQuerySnapshot: MockQuerySnapshot = { empty: false, docs: [{ id: 'doc1' }] };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      const result = await checkAccountId(testAccountId);

      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', testAccountId);
      expect(result).toBe(true);
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクション名でクエリが構築される', async () => {
      const testAccountId = 'test_account_id';

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      const mockQuerySnapshot: MockQuerySnapshot = { empty: true, docs: [] };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      await checkAccountId(testAccountId);

      // 正しいコレクション名でcollectionGroupが呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledWith(expect.any(Object), 'userInfo');
    });

    test('正しいフィールド名と演算子でwhereクエリが構築される', async () => {
      const testAccountId = 'test_account_id';

      const mockUsersRef: MockFirestoreRef = { collection: 'userInfo' };
      const mockWhereCondition: MockWhereCondition = { field: 'accountId', operator: '==', value: testAccountId };
      const mockQueryObj: MockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };

      mockCollectionGroup.mockReturnValue(mockUsersRef as unknown as ReturnType<typeof collectionGroup>);
      mockWhere.mockReturnValue(mockWhereCondition as unknown as ReturnType<typeof where>);
      mockQuery.mockReturnValue(mockQueryObj as unknown as ReturnType<typeof query>);

      const mockQuerySnapshot: MockQuerySnapshot = { empty: true, docs: [] };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);

      await checkAccountId(testAccountId);

      // 正しいフィールド名、演算子、値でwhereが呼ばれることを確認
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', testAccountId);
    });
  });
});