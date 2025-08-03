/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import checkUserName from '../checkUserName';

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

describe('checkUserName', () => {
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

  describe('ユーザー名重複チェック成功時のテスト', () => {
    test('ユーザー名が重複している場合、trueが返される', async () => {
      const testUserName = 'existing_user';
      // Firestoreクエリのモック設定
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      // 重複ありの結果をモック（empty = false）
      const mockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'doc1', data: () => ({ userName: testUserName }) }]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      // console.logをモック
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      // Firestoreの関数が正しい引数で呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledWith('userName', '==', testUserName);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);
      // console.logが正しいメッセージで呼ばれることを確認
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は既に存在します。`);
      // 重複ありの場合trueが返されることを確認
      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });

    test('ユーザー名が重複していない場合、falseが返される', async () => {
      const testUserName = 'unique_user';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      // 重複なしの結果をモック（empty = true）
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      expect(mockCollectionGroup).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledWith('userName', '==', testUserName);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryObj);
      // console.logが正しいメッセージで呼ばれることを確認
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は使用可能です。`);
      // 重複なしの場合falseが返されることを確認
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、trueが返される', async () => {
      const testUserName = 'test_user';
      const mockError = new Error('Firestore connection error');
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      // Firestoreエラーをモック
      mockGetDocs.mockRejectedValue(mockError);
      // console.errorをモック
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      // エラーハンドリングの確認
      expect(consoleSpy).toHaveBeenCalledWith('ユーザー名の重複チェックに失敗しました:', mockError);
      // エラー時はtrueが返されることを確認（安全側の動作）
      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });

    test('クエリ構築時にエラーが発生した場合、trueが返される', async () => {
      const testUserName = 'test_user';
      const mockError = new Error('Query construction error');
      // collectionGroupでエラーが発生
      mockCollectionGroup.mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      expect(consoleSpy).toHaveBeenCalledWith('ユーザー名の重複チェックに失敗しました:', mockError);
      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('入力値のテスト', () => {
    test('空文字列のユーザー名でもクエリが実行される', async () => {
      const testUserName = '';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      const mockQuerySnapshot = { empty: true, docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      expect(mockWhere).toHaveBeenCalledWith('userName', '==', '');
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "" は使用可能です。`);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    test('日本語を含むユーザー名でもクエリが実行される', async () => {
      const testUserName = 'テストユーザー123';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      const mockQuerySnapshot = { empty: false, docs: [{ id: 'doc1' }] };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      expect(mockWhere).toHaveBeenCalledWith('userName', '==', testUserName);
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は既に存在します。`);
      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });

    test('特殊文字を含むユーザー名でもクエリが実行される', async () => {
      const testUserName = 'user@name-test_123!';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      const mockQuerySnapshot = { empty: true, docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await checkUserName(testUserName);
      expect(mockWhere).toHaveBeenCalledWith('userName', '==', testUserName);
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は使用可能です。`);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('ログ出力のテスト', () => {
    test('重複ありの場合、正しいログメッセージが出力される', async () => {
      const testUserName = 'duplicate_user';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      const mockQuerySnapshot = { empty: false, docs: [{ id: 'doc1' }] };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await checkUserName(testUserName);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は既に存在します。`);
      consoleSpy.mockRestore();
    });

    test('重複なしの場合、正しいログメッセージが出力される', async () => {
      const testUserName = 'available_user';
      const mockUsersRef = { collection: 'userInfo' };
      const mockWhereCondition = { field: 'userName', operator: '==', value: testUserName };
      const mockQueryObj = { ref: mockUsersRef, where: mockWhereCondition };
      (mockCollectionGroup as any).mockReturnValue(mockUsersRef);
      (mockWhere as any).mockReturnValue(mockWhereCondition);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      const mockQuerySnapshot = { empty: true, docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await checkUserName(testUserName);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(`ユーザー名 "${testUserName}" は使用可能です。`);
      consoleSpy.mockRestore();
    });
  });
});