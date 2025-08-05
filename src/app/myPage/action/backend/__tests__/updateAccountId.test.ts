/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import updateAccountId from '../updateAccountId';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('updateAccountId', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockSetIsAccountIdEdit: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockSetIsAccountIdEdit = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
    (mockUpdateDoc as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
    (mockDoc as any).mockReset();
    (mockUpdateDoc as any).mockReset();
    mockSetIsAccountIdEdit.mockReset();
    (mockAlert as any).mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('正常にアカウントIDが更新される', async () => {
      const accountId = 'new-account-123';
      const errorAccountId = '';
      const userId = 'user-456';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      // Firestore操作の確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        accountId: accountId
      });

      // 成功時の処理確認
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');
    });

    test('異なるaccountIdでも正常に更新される', async () => {
      const testCases = [
        { accountId: 'user-abc', userId: 'user-123' },
        { accountId: 'test-user-789', userId: 'user-456' },
        { accountId: '新しいユーザーID', userId: 'user-789' }
      ];

      for (const testCase of testCases) {
        const { accountId, userId } = testCase;

        await updateAccountId(accountId, '', mockSetIsAccountIdEdit, userId);

        expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
        expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
          accountId: accountId
        });
        expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
        expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');

        // 次のテストのためにモックをクリア
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
      }
    });

    test('特殊文字を含むaccountIdでも正常に処理される', async () => {
      const accountId = 'user-with-特殊文字-@#$%-123';
      const userId = 'user-special';

      await updateAccountId(accountId, '', mockSetIsAccountIdEdit, userId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        accountId: accountId
      });
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');
    });
  });

  describe('パラメータ検証のテスト', () => {
    test('accountIdが空文字列の場合、処理が中断される', async () => {
      const accountId = '';
      const errorAccountId = '';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      // Firestore操作が呼ばれないことを確認
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('accountIdがundefinedの場合、処理が中断される', async () => {
      const accountId = undefined as any;
      const errorAccountId = '';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('accountIdがnullの場合、処理が中断される', async () => {
      const accountId = null as any;
      const errorAccountId = '';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('userIdが空文字列の場合、処理が中断される', async () => {
      const accountId = 'valid-account-id';
      const errorAccountId = '';
      const userId = '';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('userIdがundefinedの場合、処理が中断される', async () => {
      const accountId = 'valid-account-id';
      const errorAccountId = '';
      const userId = undefined;

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('userIdがnullの場合、処理が中断される', async () => {
      const accountId = 'valid-account-id';
      const errorAccountId = '';
      const userId = null as any;

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('errorAccountIdが存在する場合、処理が中断される', async () => {
      const accountId = 'valid-account-id';
      const errorAccountId = 'エラーメッセージ';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('errorAccountIdが空白文字の場合、処理が中断される', async () => {
      const accountId = 'valid-account-id';
      const errorAccountId = ' ';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('accountIdが空白文字の場合、処理が実行される（真値として扱われる）', async () => {
      const accountId = ' ';
      const errorAccountId = '';
      const userId = 'user-123';

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      // 空白文字は真値なので処理が実行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        accountId: accountId
      });
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('updateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const accountId = 'test-account';
      const errorAccountId = '';
      const userId = 'user-123';
      const mockError = new Error('UpdateDoc error');

      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      // Firestore操作は実行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        accountId: accountId
      });

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');

      // setIsAccountIdEditは呼ばれない（成功時のみ）
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const accountId = 'test-account';
      const errorAccountId = '';
      const userId = 'user-123';
      const mockError = new Error('Doc error');

      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      // docは呼ばれるが、updateDocは呼ばれない
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).not.toHaveBeenCalled();

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');

      // setIsAccountIdEditは呼ばれない
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });

    test('ネットワークエラーが発生した場合のハンドリング', async () => {
      const accountId = 'test-account';
      const errorAccountId = '';
      const userId = 'user-123';
      const networkError = new Error('Network error: Unable to connect');

      (mockUpdateDoc as any).mockRejectedValue(networkError);

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockConsoleLog).toHaveBeenCalledWith('error', networkError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });

    test('権限エラーが発生した場合のハンドリング', async () => {
      const accountId = 'test-account';
      const errorAccountId = '';
      const userId = 'user-123';
      const permissionError = new Error('Permission denied');

      (mockUpdateDoc as any).mockRejectedValue(permissionError);

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockConsoleLog).toHaveBeenCalledWith('error', permissionError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });

    test('Firestoreの制約エラーが発生した場合のハンドリング', async () => {
      const accountId = 'test-account';
      const errorAccountId = '';
      const userId = 'user-123';
      const constraintError = new Error('Firestore constraint violation');

      (mockUpdateDoc as any).mockRejectedValue(constraintError);

      await updateAccountId(accountId, errorAccountId, mockSetIsAccountIdEdit, userId);

      expect(mockConsoleLog).toHaveBeenCalledWith('error', constraintError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });
  });

  describe('ドキュメントパスのテスト', () => {
    test('userIdに基づいて正しいドキュメントパスが構築される', async () => {
      const testCases = [
        { userId: 'user-123', expectedPath: 'users/user-123/userInfo/user-123' },
        { userId: 'user-abc', expectedPath: 'users/user-abc/userInfo/user-abc' },
        { userId: 'user-特殊文字', expectedPath: 'users/user-特殊文字/userInfo/user-特殊文字' }
      ];

      for (const testCase of testCases) {
        const { userId, expectedPath } = testCase;

        await updateAccountId('test-account', '', mockSetIsAccountIdEdit, userId);

        expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), expectedPath);

        // 次のテストのためにモックをクリア
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
      }
    });

    test('長いuserIdでも正しいパスが構築される', async () => {
      const longUserId = 'a'.repeat(100);
      const expectedPath = `users/${longUserId}/userInfo/${longUserId}`;

      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, longUserId);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), expectedPath);
    });
  });

  describe('非同期処理のテスト', () => {
    test('updateDocが完了するまで待機する', async () => {
      let updateDocResolved = false;

      (mockUpdateDoc as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            updateDocResolved = true;
            resolve(undefined);
          }, 100);
        });
      });

      const updatePromise = updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      // updateDocがまだ完了していないことを確認
      expect(updateDocResolved).toBe(false);
      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();

      // updateAccountIdの完了を待つ
      await updatePromise;

      // updateDocが完了したことを確認
      expect(updateDocResolved).toBe(true);
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');
    });

    test('複数の並行実行でも正常に処理される', async () => {
      const promises = [
        updateAccountId('account-1', '', mockSetIsAccountIdEdit, 'user-1'),
        updateAccountId('account-2', '', mockSetIsAccountIdEdit, 'user-2'),
        updateAccountId('account-3', '', mockSetIsAccountIdEdit, 'user-3')
      ];

      await Promise.all(promises);

      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledTimes(3);
      expect(mockAlert).toHaveBeenCalledTimes(3);

      // 各呼び出しの引数を確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), 'users/user-1/userInfo/user-1');
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), 'users/user-2/userInfo/user-2');
      expect(mockDoc).toHaveBeenNthCalledWith(3, expect.any(Object), 'users/user-3/userInfo/user-3');

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, { accountId: 'account-1' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, { accountId: 'account-2' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(3, { id: 'mock-doc-ref' }, { accountId: 'account-3' });
    });
  });

  describe('アラートのテスト', () => {
    test('成功時に正しいメッセージでアラートが表示される', async () => {
      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に成功しました');
    });

    test('エラー時に正しいメッセージでアラートが表示される', async () => {
      const mockError = new Error('Test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザーIDの更新に失敗しました');
    });

    test('パラメータエラー時はアラートが表示されない', async () => {
      // accountIdが空の場合
      await updateAccountId('', '', mockSetIsAccountIdEdit, 'user-123');
      expect(mockAlert).not.toHaveBeenCalled();

      // userIdが空の場合
      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, '');
      expect(mockAlert).not.toHaveBeenCalled();

      // errorAccountIdが存在する場合
      await updateAccountId('test-account', 'error', mockSetIsAccountIdEdit, 'user-123');
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('コールバック関数のテスト', () => {
    test('setIsAccountIdEditが正しい引数で呼ばれる', async () => {
      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      expect(mockSetIsAccountIdEdit).toHaveBeenCalledTimes(1);
      expect(mockSetIsAccountIdEdit).toHaveBeenCalledWith(false);
    });

    test('setIsAccountIdEditが関数として呼び出し可能か確認', async () => {
      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      expect(typeof mockSetIsAccountIdEdit).toBe('function');
      expect(mockSetIsAccountIdEdit).toHaveBeenCalled();
    });

    test('エラー時はsetIsAccountIdEditが呼ばれない', async () => {
      const mockError = new Error('Test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateAccountId('test-account', '', mockSetIsAccountIdEdit, 'user-123');

      expect(mockSetIsAccountIdEdit).not.toHaveBeenCalled();
    });
  });

  describe('データ型のテスト', () => {
    test('様々な型のaccountIdでも正しく処理される', async () => {
      const testCases = [
        { accountId: 'simple-string', description: '単純な文字列' },
        { accountId: '123456', description: '数字文字列' },
        { accountId: 'user@example.com', description: 'メール形式' },
        { accountId: 'user_name-123', description: 'アンダースコアとハイフン' },
        { accountId: 'ユーザー名前', description: '日本語文字' }
      ];

      for (const testCase of testCases) {
        const { accountId } = testCase;

        await updateAccountId(accountId, '', mockSetIsAccountIdEdit, 'user-123');

        expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
          accountId: accountId
        });

        // 次のテストのためにモックをクリア
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
      }
    });
  });
});