/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, updateDoc } from 'firebase/firestore';
import saveShowDiary from '../saveShowDiary';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log と console.error をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('saveShowDiary', () => {
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockSetIsViewEnabled: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockSetIsViewEnabled = jest.fn();

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
    mockSetIsViewEnabled.mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('showDiaryがtrueで正常に更新される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-456';
      const newValue = true;
      const isViewEnabled = false;

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      // Firestore操作の確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });

      // 成功ログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', newValue);

      // setIsViewEnabledが呼ばれないことを確認（エラー時のみ呼ばれる）
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('showDiaryがfalseで正常に更新される', async () => {
      const userId = 'user-789';
      const friendId = 'friend-012';
      const newValue = false;
      const isViewEnabled = true;

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });

      expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', newValue);
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('異なるuserIdとfriendIdで正しいパスが構築される', async () => {
      const testCases = [
        { userId: 'user-abc', friendId: 'friend-def', newValue: true, isViewEnabled: false },
        { userId: 'user-123', friendId: 'friend-789', newValue: false, isViewEnabled: true },
        { userId: 'user-xyz', friendId: 'friend-uvw', newValue: true, isViewEnabled: false }
      ];

      for (const testCase of testCases) {
        const { userId, friendId, newValue, isViewEnabled } = testCase;

        await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

        expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
        expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
          showDiary: newValue
        });
        expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', newValue);
      }

      // 各テストケースで1回ずつ呼ばれる
      expect(mockDoc).toHaveBeenCalledTimes(testCases.length);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(testCases.length);
      expect(mockConsoleLog).toHaveBeenCalledTimes(testCases.length);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('updateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-error';
      const friendId = 'friend-error';
      const newValue = true;
      const isViewEnabled = false;
      const mockError = new Error('UpdateDoc error');

      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      // Firestore操作は実行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });

      // エラーログの確認
      expect(mockConsoleError).toHaveBeenCalledWith('表示設定の更新に失敗しました:', mockError);

      // 成功ログは呼ばれない
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // エラー時は元の状態に戻す
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-doc-error';
      const friendId = 'friend-doc-error';
      const newValue = false;
      const isViewEnabled = true;
      const mockError = new Error('Doc error');

      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      // docは呼ばれるが、updateDocは呼ばれない
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).not.toHaveBeenCalled();

      // エラーログの確認
      expect(mockConsoleError).toHaveBeenCalledWith('表示設定の更新に失敗しました:', mockError);

      // 成功ログは呼ばれない
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // エラー時は元の状態に戻す
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);
    });

    test('異なるisViewEnabled値でエラー時の状態復元が正しく動作する', async () => {
      const testCases = [
        { isViewEnabled: true, description: 'isViewEnabledがtrueの場合' },
        { isViewEnabled: false, description: 'isViewEnabledがfalseの場合' }
      ];

      const mockError = new Error('Test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      for (const testCase of testCases) {
        const { isViewEnabled } = testCase;

        await saveShowDiary('user-test', 'friend-test', !isViewEnabled, mockSetIsViewEnabled, isViewEnabled);

        expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);

        // 次のテストのためにモックをリセット
        mockSetIsViewEnabled.mockClear();
      }
    });

    test('ネットワークエラーが発生した場合のハンドリング', async () => {
      const userId = 'user-network';
      const friendId = 'friend-network';
      const newValue = true;
      const isViewEnabled = false;
      const networkError = new Error('Network error: Unable to connect');

      (mockUpdateDoc as any).mockRejectedValue(networkError);

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockConsoleError).toHaveBeenCalledWith('表示設定の更新に失敗しました:', networkError);
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);
    });

    test('権限エラーが発生した場合のハンドリング', async () => {
      const userId = 'user-permission';
      const friendId = 'friend-permission';
      const newValue = false;
      const isViewEnabled = true;
      const permissionError = new Error('Permission denied');

      (mockUpdateDoc as any).mockRejectedValue(permissionError);

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockConsoleError).toHaveBeenCalledWith('表示設定の更新に失敗しました:', permissionError);
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);
    });
  });

  describe('パラメータのテスト', () => {
    test('空文字列のuserIdとfriendIdでも処理される', async () => {
      const userId = '';
      const friendId = '';
      const newValue = true;
      const isViewEnabled = false;

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });
    });

    test('特殊文字を含むIDでも正常に処理される', async () => {
      const userId = 'user-with-特殊文字-123';
      const friendId = 'friend-with-@#$%';
      const newValue = false;
      const isViewEnabled = true;

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', newValue);
    });

    test('長いIDでも正常に処理される', async () => {
      const userId = 'a'.repeat(100);
      const friendId = 'b'.repeat(100);
      const newValue = true;
      const isViewEnabled = false;

      await saveShowDiary(userId, friendId, newValue, mockSetIsViewEnabled, isViewEnabled);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        showDiary: newValue
      });
    });
  });

  describe('データ型のテスト', () => {
    test('boolean値のnewValueが正しく設定される', async () => {
      const testCases = [
        { newValue: true, description: 'newValueがtrue' },
        { newValue: false, description: 'newValueがfalse' }
      ];

      for (const testCase of testCases) {
        const { newValue } = testCase;

        await saveShowDiary('user-test', 'friend-test', newValue, mockSetIsViewEnabled, false);

        expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
          showDiary: newValue
        });

        // 次のテストのためにモックをリセット
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
      }
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

      const savePromise = saveShowDiary('user-async', 'friend-async', true, mockSetIsViewEnabled, false);

      // updateDocがまだ完了していないことを確認
      expect(updateDocResolved).toBe(false);
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // saveShowDiaryの完了を待つ
      await savePromise;

      // updateDocが完了したことを確認
      expect(updateDocResolved).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', true);
    });

    test('複数の並行実行でも正常に処理される', async () => {
      const promises = [
        saveShowDiary('user-1', 'friend-1', true, mockSetIsViewEnabled, false),
        saveShowDiary('user-2', 'friend-2', false, mockSetIsViewEnabled, true),
        saveShowDiary('user-3', 'friend-3', true, mockSetIsViewEnabled, false)
      ];

      await Promise.all(promises);

      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockConsoleLog).toHaveBeenCalledTimes(3);

      // 各呼び出しの引数を確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), 'users/user-1/friends/friend-1');
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), 'users/user-2/friends/friend-2');
      expect(mockDoc).toHaveBeenNthCalledWith(3, expect.any(Object), 'users/user-3/friends/friend-3');
    });
  });

  describe('ログのテスト', () => {
    test('成功時に正しいログが出力される', async () => {
      const testCases = [
        { newValue: true, description: 'trueの場合' },
        { newValue: false, description: 'falseの場合' }
      ];

      for (const testCase of testCases) {
        const { newValue } = testCase;

        await saveShowDiary('user-log', 'friend-log', newValue, mockSetIsViewEnabled, false);

        expect(mockConsoleLog).toHaveBeenCalledWith('表示設定を更新しました:', newValue);

        // 次のテストのためにモックをリセット
        mockConsoleLog.mockClear();
      }
    });

    test('エラー時に正しいログが出力される', async () => {
      const mockError = new Error('Test error for logging');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await saveShowDiary('user-error-log', 'friend-error-log', true, mockSetIsViewEnabled, false);

      expect(mockConsoleError).toHaveBeenCalledWith('表示設定の更新に失敗しました:', mockError);
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('コールバック関数のテスト', () => {
    test('setIsViewEnabledが正しい引数で呼ばれる', async () => {
      const testCases = [
        { isViewEnabled: true, description: 'isViewEnabledがtrueの場合' },
        { isViewEnabled: false, description: 'isViewEnabledがfalseの場合' }
      ];

      const mockError = new Error('Callback test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      for (const testCase of testCases) {
        const { isViewEnabled } = testCase;

        await saveShowDiary('user-callback', 'friend-callback', !isViewEnabled, mockSetIsViewEnabled, isViewEnabled);

        expect(mockSetIsViewEnabled).toHaveBeenCalledTimes(1);
        expect(mockSetIsViewEnabled).toHaveBeenCalledWith(isViewEnabled);

        // 次のテストのためにモックをリセット
        mockSetIsViewEnabled.mockClear();
      }
    });

    test('setIsViewEnabledが関数として呼び出し可能か確認', async () => {
      const mockError = new Error('Function test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await saveShowDiary('user-func', 'friend-func', true, mockSetIsViewEnabled, false);

      // mockSetIsViewEnabledが関数として呼ばれたことを確認
      expect(typeof mockSetIsViewEnabled).toBe('function');
      expect(mockSetIsViewEnabled).toHaveBeenCalled();
    });
  });
});