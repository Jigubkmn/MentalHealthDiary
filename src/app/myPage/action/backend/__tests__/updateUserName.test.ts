/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import updateUserName from '../updateUserName';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('updateUserName', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockWriteBatch: jest.MockedFunction<typeof writeBatch>;
  let mockSetIsUserNameEdit: jest.MockedFunction<any>;
  let mockBatch: any;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;
    mockSetIsUserNameEdit = jest.fn();

    // バッチモックの設定
    mockBatch = {
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
    (mockUpdateDoc as any).mockResolvedValue(undefined);
    (mockCollection as any).mockReturnValue({ collection: 'diaries' });
    (mockQuery as any).mockReturnValue({ query: 'mock-query' });
    (mockWhere as any).mockReturnValue({ where: 'mock-where' });
    (mockWriteBatch as any).mockReturnValue(mockBatch);
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
    (mockAlert as any).mockReset();
    (mockDoc as any).mockReset();
    (mockUpdateDoc as any).mockReset();
    (mockCollection as any).mockReset();
    (mockQuery as any).mockReset();
    (mockWhere as any).mockReset();
    (mockGetDocs as any).mockReset();
    (mockWriteBatch as any).mockReset();
    mockSetIsUserNameEdit.mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
  });

  describe('正常系のテスト - 日記データありの場合', () => {
    test('ユーザー名が正常に更新され、関連する日記データも一括更新される', async () => {
      const userName = '新しいユーザー名';
      const errorUserName = '';
      const userId = 'user-123';

      // 日記データが存在する場合のモック
      const mockDiariesSnapshot = {
        empty: false,
        docs: [
          { id: 'diary-1' },
          { id: 'diary-2' },
          { id: 'diary-3' }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // ユーザー情報更新の確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });

      // 日記データクエリの確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'diaries' }, { where: 'mock-where' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });

      // バッチ更新の確認
      expect(mockWriteBatch).toHaveBeenCalledWith(expect.any(Object));
      expect(mockBatch.update).toHaveBeenCalledTimes(3); // 3つの日記
      expect(mockBatch.update).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, { userName: userName });
      expect(mockBatch.update).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, { userName: userName });
      expect(mockBatch.update).toHaveBeenNthCalledWith(3, { id: 'mock-doc-ref' }, { userName: userName });
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // 成功時の処理確認
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });
  });

  describe('正常系のテスト - 日記データなしの場合', () => {
    test('日記データが存在しない場合、ユーザー情報のみが更新される', async () => {
      const userName = 'ユーザー名のみ更新';
      const errorUserName = '';
      const userId = 'user-no-diaries';

      // 日記データが存在しない場合のモック
      const mockDiariesSnapshot = {
        empty: true,
        docs: []
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // ユーザー情報更新の確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });

      // 日記データクエリは実行される
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // バッチ処理は実行されない（日記データが空のため）
      expect(mockWriteBatch).not.toHaveBeenCalled();
      expect(mockBatch.update).not.toHaveBeenCalled();
      expect(mockBatch.commit).not.toHaveBeenCalled();

      // 成功時の処理確認
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });
  });

  describe('パラメータ検証のテスト', () => {
    test('userNameが空文字列の場合、処理が中断される', async () => {
      await updateUserName('', '', mockSetIsUserNameEdit, 'user-123');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userNameがundefinedの場合、処理が中断される', async () => {
      await updateUserName(undefined as any, '', mockSetIsUserNameEdit, 'user-123');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userNameがnullの場合、処理が中断される', async () => {
      await updateUserName(null as any, '', mockSetIsUserNameEdit, 'user-123');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userIdが空文字列の場合、処理が中断される', async () => {
      await updateUserName('有効なユーザー名', '', mockSetIsUserNameEdit, '');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userIdがundefinedの場合、処理が中断される', async () => {
      await updateUserName('有効なユーザー名', '', mockSetIsUserNameEdit, undefined);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userIdがnullの場合、処理が中断される', async () => {
      await updateUserName('有効なユーザー名', '', mockSetIsUserNameEdit, null as any);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('errorUserNameが存在する場合、処理が中断される', async () => {
      await updateUserName('有効なユーザー名', 'エラーメッセージ', mockSetIsUserNameEdit, 'user-123');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('errorUserNameが空白文字の場合、処理が中断される', async () => {
      await updateUserName('有効なユーザー名', ' ', mockSetIsUserNameEdit, 'user-123');

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('userNameが空白文字の場合、処理が実行される（真値として扱われる）', async () => {
      const userName = ' ';
      const userId = 'user-123';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, '', mockSetIsUserNameEdit, userId);

      // 空白文字は真値なので処理が実行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('updateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userName = 'エラーテスト';
      const errorUserName = '';
      const userId = 'user-123';
      const mockError = new Error('UpdateDoc error');

      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // updateDocまでは実行される
      expect(mockDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('getDocsでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userName = 'エラーテスト';
      const errorUserName = '';
      const userId = 'user-123';
      const mockError = new Error('GetDocs error');

      (mockGetDocs as any).mockRejectedValue(mockError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // updateDocまでは成功
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      // getDocsでエラー
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('バッチコミットでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userName = 'バッチエラーテスト';
      const errorUserName = '';
      const userId = 'user-123';
      const mockError = new Error('Batch commit error');

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-1' }]
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);
      mockBatch.commit.mockRejectedValue(mockError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // バッチ処理まで実行される
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userName = 'docエラーテスト';
      const errorUserName = '';
      const userId = 'user-123';
      const mockError = new Error('Doc error');

      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // docでエラーが発生するため、updateDocは呼ばれない
      expect(mockDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).not.toHaveBeenCalled();

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');
    });

    test('ネットワークエラーが発生した場合のハンドリング', async () => {
      const userName = 'ネットワークエラー';
      const errorUserName = '';
      const userId = 'user-123';
      const networkError = new Error('Network error: Unable to connect');

      (mockUpdateDoc as any).mockRejectedValue(networkError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockConsoleLog).toHaveBeenCalledWith('error', networkError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });

    test('権限エラーが発生した場合のハンドリング', async () => {
      const userName = '権限エラー';
      const errorUserName = '';
      const userId = 'user-123';
      const permissionError = new Error('Permission denied');

      (mockUpdateDoc as any).mockRejectedValue(permissionError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockConsoleLog).toHaveBeenCalledWith('error', permissionError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');
      expect(mockSetIsUserNameEdit).not.toHaveBeenCalled();
    });
  });

  describe('日記データバッチ更新のテスト', () => {
    test('大量の日記データが存在する場合でも正常に処理される', async () => {
      const userName = '大量データテスト';
      const errorUserName = '';
      const userId = 'user-many-diaries';

      // 100個の日記データ
      const mockDiariesSnapshot = {
        empty: false,
        docs: Array.from({ length: 100 }, (_, index) => ({ id: `diary-${index}` }))
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // バッチ更新が100回実行される
      expect(mockBatch.update).toHaveBeenCalledTimes(100);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // 成功時の処理確認
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });

    test('日記データが1つの場合でも正常に処理される', async () => {
      const userName = '単一データテスト';
      const errorUserName = '';
      const userId = 'user-single-diary';

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-single' }]
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // バッチ更新が1回実行される
      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.update).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, { userName: userName });
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });
  });

  describe('ドキュメントパスのテスト', () => {
    test('userIdに基づいて正しいドキュメントパスが構築される', async () => {
      const testCases = [
        { userId: 'user-123', expectedPath: 'users/user-123/userInfo/user-123' },
        { userId: 'user-abc', expectedPath: 'users/user-abc/userInfo/user-abc' },
        { userId: 'user-特殊文字', expectedPath: 'users/user-特殊文字/userInfo/user-特殊文字' }
      ];

      const userName = 'テストユーザー';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      for (const testCase of testCases) {
        const { userId, expectedPath } = testCase;

        await updateUserName(userName, '', mockSetIsUserNameEdit, userId);

        expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), expectedPath);

        // 次のテストのためにモックをクリア
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
        (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);
        (mockCollection as any).mockReturnValue({ collection: 'diaries' });
        (mockQuery as any).mockReturnValue({ query: 'mock-query' });
        (mockWhere as any).mockReturnValue({ where: 'mock-where' });
      }
    });

    test('日記ドキュメントの正しいパスが構築される', async () => {
      const userName = 'パステスト';
      const errorUserName = '';
      const userId = 'user-123';

      const mockDiariesSnapshot = {
        empty: false,
        docs: [
          { id: 'diary-id-1' },
          { id: 'diary-id-2' }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // 日記ドキュメントパスの確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'diaries', 'diary-id-1');
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'diaries', 'diary-id-2');
    });
  });

  describe('非同期処理のテスト', () => {
    test('各非同期処理が順次完了するまで待機する', async () => {
      const userName = '非同期テスト';
      const errorUserName = '';
      const userId = 'user-async';

      let updateDocResolved = false;
      let getDocsResolved = false;
      let batchCommitResolved = false;

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-async' }]
      };

      (mockUpdateDoc as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            updateDocResolved = true;
            resolve(undefined);
          }, 50);
        });
      });

      (mockGetDocs as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            getDocsResolved = true;
            resolve(mockDiariesSnapshot);
          }, 50);
        });
      });

      mockBatch.commit.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            batchCommitResolved = true;
            resolve(undefined);
          }, 50);
        });
      });

      const updatePromise = updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // 処理開始時点では全て未完了
      expect(updateDocResolved).toBe(false);
      expect(getDocsResolved).toBe(false);
      expect(batchCommitResolved).toBe(false);

      // 関数の完了を待つ
      await updatePromise;

      // 全ての非同期処理が完了したことを確認
      expect(updateDocResolved).toBe(true);
      expect(getDocsResolved).toBe(true);
      expect(batchCommitResolved).toBe(true);
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });

    test('複数の並行実行でも正常に処理される', async () => {
      const userName = '並行テスト';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      const promises = [
        updateUserName(userName, '', mockSetIsUserNameEdit, 'user-1'),
        updateUserName(userName, '', mockSetIsUserNameEdit, 'user-2'),
        updateUserName(userName, '', mockSetIsUserNameEdit, 'user-3')
      ];

      await Promise.all(promises);

      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockGetDocs).toHaveBeenCalledTimes(3);
      expect(mockSetIsUserNameEdit).toHaveBeenCalledTimes(3);
      expect(mockAlert).toHaveBeenCalledTimes(3);
    });
  });

  describe('クエリ構築のテスト', () => {
    test('日記データクエリが正しく構築される', async () => {
      const userName = 'クエリテスト';
      const errorUserName = '';
      const userId = 'user-query-test';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      // クエリ構築の確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'diaries' }, { where: 'mock-where' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });
    });
  });

  describe('アラートとコールバックのテスト', () => {
    test('成功時に正しいメッセージでアラートが表示される', async () => {
      const userName = 'アラートテスト';
      const errorUserName = '';
      const userId = 'user-alert-test';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });

    test('setIsUserNameEditが正しい引数で呼ばれる', async () => {
      const userName = 'コールバックテスト';
      const errorUserName = '';
      const userId = 'user-callback-test';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockSetIsUserNameEdit).toHaveBeenCalledTimes(1);
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
    });

    test('エラー時に正しいメッセージでアラートが表示される', async () => {
      const userName = 'エラーアラートテスト';
      const errorUserName = '';
      const userId = 'user-error-test';
      const mockError = new Error('Test error');

      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に失敗しました');
    });

    test('パラメータエラー時はアラートが表示されない', async () => {
      // userNameが空の場合
      await updateUserName('', '', mockSetIsUserNameEdit, 'user-123');
      expect(mockAlert).not.toHaveBeenCalled();

      // userIdが空の場合
      await updateUserName('有効なユーザー名', '', mockSetIsUserNameEdit, '');
      expect(mockAlert).not.toHaveBeenCalled();

      // errorUserNameがある場合
      await updateUserName('有効なユーザー名', 'エラー', mockSetIsUserNameEdit, 'user-123');
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('エッジケーステスト', () => {
    test('特殊文字を含むuserNameでも正常に処理される', async () => {
      const userName = 'user-with-特殊文字-@#$%';
      const errorUserName = '';
      const userId = 'user-special';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });
      expect(mockSetIsUserNameEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });

    test('長いuserNameでも正常に処理される', async () => {
      const userName = 'a'.repeat(100);
      const errorUserName = '';
      const userId = 'user-long-name';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
    });

    test('長いuserIdでも正常に処理される', async () => {
      const userName = 'テストユーザー';
      const errorUserName = '';
      const userId = 'b'.repeat(100);
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
    });

    test('数値文字列のuserNameでも正常に処理される', async () => {
      const userName = '123456';
      const errorUserName = '';
      const userId = 'user-number-name';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });
    });

    test('絵文字を含むuserNameでも正常に処理される', async () => {
      const userName = 'テストユーザー😀🎉';
      const errorUserName = '';
      const userId = 'user-emoji';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserName(userName, errorUserName, mockSetIsUserNameEdit, userId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userName: userName
      });
    });
  });

  describe('完全カバレッジのための追加テスト', () => {
    test('すべての分岐を網羅するテスト', async () => {
      // 正常パス - 日記データあり
      const userName1 = '完全テスト1';
      const mockDiariesSnapshot1 = {
        empty: false,
        docs: [{ id: 'diary-complete-1' }]
      };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot1);
      await updateUserName(userName1, '', mockSetIsUserNameEdit, 'user-complete-1');

      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // モッククリア
      jest.clearAllMocks();
      (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
      (mockUpdateDoc as any).mockResolvedValue(undefined);
      (mockCollection as any).mockReturnValue({ collection: 'diaries' });
      (mockQuery as any).mockReturnValue({ query: 'mock-query' });
      (mockWhere as any).mockReturnValue({ where: 'mock-where' });

      // 正常パス - 日記データなし
      const userName2 = '完全テスト2';
      const mockDiariesSnapshot2 = { empty: true, docs: [] };

      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot2);
      await updateUserName(userName2, '', mockSetIsUserNameEdit, 'user-complete-2');

      expect(mockWriteBatch).not.toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith('ユーザー名の更新に成功しました');
    });
  });
});