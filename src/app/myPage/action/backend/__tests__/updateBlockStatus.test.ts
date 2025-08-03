/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import updateBlockStatus from '../updateBlockStatus';

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

// console.error をモック
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('updateBlockStatus', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockSetStatus: jest.MockedFunction<any>;
  let mockSetIsBlocked: jest.MockedFunction<any>;
  let mockSetIsViewEnabled: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockSetStatus = jest.fn();
    mockSetIsBlocked = jest.fn();
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
    mockSetStatus.mockReset();
    mockSetIsBlocked.mockReset();
    mockSetIsViewEnabled.mockReset();
    (mockAlert as any).mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleError.mockRestore();
  });

  describe('正常系のテスト - ブロック解除', () => {
    test('フレンドのブロックが正常に解除される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-456';
      const friendUsersId = 'friend-user-789';
      const friendDocumentId = 'friend-doc-012';
      const isBlocked = true; // 現在ブロック中 → 解除する

      await updateBlockStatus(
        userId,
        friendId,
        friendUsersId,
        friendDocumentId,
        isBlocked,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 双方向のFirestore操作の確認
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);

      // ブロック解除時の更新内容確認
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, {
        status: 'approval', // isBlocked ? 'approval' : 'block'
        blocked: false, // !isBlocked
        showDiary: true, // isBlocked
      });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, {
        status: 'approval', // isBlocked ? 'approval' : 'unavailable'
        blocked: false, // !isBlocked
        showDiary: true, // isBlocked
      });

      // ブロック解除時の処理確認
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
      expect(mockSetStatus).toHaveBeenCalledWith('approval');
      expect(mockSetIsBlocked).toHaveBeenCalledWith(false); // !isBlocked
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(true); // isBlocked
    });
  });

  describe('正常系のテスト - ブロック実行', () => {
    test('フレンドが正常にブロックされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-456';
      const friendUsersId = 'friend-user-789';
      const friendDocumentId = 'friend-doc-012';
      const isBlocked = false; // 現在ブロックしていない → ブロックする

      await updateBlockStatus(
        userId,
        friendId,
        friendUsersId,
        friendDocumentId,
        isBlocked,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 双方向のFirestore操作の確認
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);

      // ブロック実行時の更新内容確認
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, {
        status: 'block', // isBlocked ? 'approval' : 'block'
        blocked: true, // !isBlocked
        showDiary: false, // isBlocked
      });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, {
        status: 'unavailable', // isBlocked ? 'approval' : 'unavailable'
        blocked: true, // !isBlocked
        showDiary: false, // isBlocked
      });

      // ブロック実行時の処理確認
      expect(mockAlert).toHaveBeenCalledWith('友人をブロックしました');
      expect(mockSetStatus).toHaveBeenCalledWith('block');
      expect(mockSetIsBlocked).toHaveBeenCalledWith(true); // !isBlocked
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(false); // isBlocked
    });
  });

  describe('パラメータ検証のテスト', () => {
    test('userIdがnullの場合、処理が中断される', async () => {
      await updateBlockStatus(
        null as any,
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('userIdがundefinedの場合、処理が実行される（nullチェックのみ）', async () => {
      await updateBlockStatus(
        undefined as any,
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // undefinedは null !== undefined なので処理が実行される
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
    });

    test('空文字列のuserIdの場合、処理が実行される', async () => {
      await updateBlockStatus(
        '',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        false,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 空文字列は null !== '' なので処理が実行される
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('友人をブロックしました');
    });

    test('friendDocumentIdがnullの場合でも処理が実行される', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        null,
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // friendDocumentIdのnullチェックはない
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/friend-user-789/friends/null`);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('ステータス計算のテスト', () => {
    test('ブロック解除時のステータス計算が正しい', async () => {
      const isBlocked = true; // 現在ブロック中

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        isBlocked,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // ブロック解除時の計算:
      // friendUpdateStatus = isBlocked ? 'approval' : 'block' = true ? 'approval' : 'block' = 'approval'
      // currentUserUpdateStatus = isBlocked ? 'approval' : 'unavailable' = true ? 'approval' : 'unavailable' = 'approval'
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, {
        status: 'approval',
        blocked: false, // !true = false
        showDiary: true, // true
      });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, {
        status: 'approval',
        blocked: false, // !true = false
        showDiary: true, // true
      });
    });

    test('ブロック実行時のステータス計算が正しい', async () => {
      const isBlocked = false; // 現在ブロックしていない

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        isBlocked,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // ブロック実行時の計算:
      // friendUpdateStatus = isBlocked ? 'approval' : 'block' = false ? 'approval' : 'block' = 'block'
      // currentUserUpdateStatus = isBlocked ? 'approval' : 'unavailable' = false ? 'approval' : 'unavailable' = 'unavailable'
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, {
        status: 'block',
        blocked: true, // !false = true
        showDiary: false, // false
      });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, {
        status: 'unavailable',
        blocked: true, // !false = true
        showDiary: false, // false
      });
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('最初のupdateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const mockError = new Error('First updateDoc error');
      (mockUpdateDoc as any).mockRejectedValueOnce(mockError);

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 最初のupdateDocでエラーが発生
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');

      // 成功時の処理は呼ばれない
      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('2番目のupdateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const mockError = new Error('Second updateDoc error');
      (mockUpdateDoc as any)
        .mockResolvedValueOnce(undefined) // 最初は成功
        .mockRejectedValueOnce(mockError); // 2番目でエラー

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        false,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 2回とも呼ばれるが、2番目でエラー
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);

      // エラーログとアラートの確認
      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');

      // 成功時の処理は呼ばれない
      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const mockError = new Error('Doc error');
      (mockDoc as any).mockImplementationOnce(() => {
        throw mockError;
      });

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // docでエラーが発生するため、updateDocは呼ばれない
      expect(mockUpdateDoc).not.toHaveBeenCalled();

      // エラーログとアラートの確認
      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');

      // 成功時の処理は呼ばれない
      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('ネットワークエラーが発生した場合のハンドリング', async () => {
      const networkError = new Error('Network error: Unable to connect');
      (mockUpdateDoc as any).mockRejectedValue(networkError);

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        false,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', networkError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');
    });

    test('権限エラーが発生した場合のハンドリング', async () => {
      const permissionError = new Error('Permission denied');
      (mockUpdateDoc as any).mockRejectedValue(permissionError);

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', permissionError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');
    });
  });

  describe('ドキュメントパスのテスト', () => {
    test('正しいドキュメントパスが双方向で構築される', async () => {
      const userId = 'user-path-test';
      const friendId = 'friend-path-test';
      const friendUsersId = 'friend-user-path-test';
      const friendDocumentId = 'friend-doc-path-test';

      await updateBlockStatus(
        userId,
        friendId,
        friendUsersId,
        friendDocumentId,
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // ログインユーザーのフレンドドキュメント
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `users/${userId}/friends/${friendId}`);
      // フレンドユーザーのフレンドドキュメント
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
    });

    test('特殊文字を含むIDでも正しいパスが構築される', async () => {
      const userId = 'user-with-特殊文字-@#$%';
      const friendId = 'friend-with-特殊文字-123';
      const friendUsersId = 'friend-user-with-特殊文字-456';
      const friendDocumentId = 'friend-doc-with-特殊文字-789';

      await updateBlockStatus(
        userId,
        friendId,
        friendUsersId,
        friendDocumentId,
        false,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
    });
  });

  describe('非同期処理のテスト', () => {
    test('両方のupdateDocが順次完了するまで待機する', async () => {
      let firstUpdateResolved = false;
      let secondUpdateResolved = false;

      (mockUpdateDoc as any)
        .mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              firstUpdateResolved = true;
              resolve(undefined);
            }, 50);
          });
        })
        .mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              secondUpdateResolved = true;
              resolve(undefined);
            }, 50);
          });
        });

      const updatePromise = updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 処理開始時点では両方とも未完了
      expect(firstUpdateResolved).toBe(false);
      expect(secondUpdateResolved).toBe(false);
      expect(mockAlert).not.toHaveBeenCalled();

      // 関数の完了を待つ
      await updatePromise;

      // 両方のupdateDocが完了したことを確認
      expect(firstUpdateResolved).toBe(true);
      expect(secondUpdateResolved).toBe(true);
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
    });

    test('複数の並行実行でも正常に処理される', async () => {
      const promises = [
        updateBlockStatus('user-1', 'friend-1', 'friend-user-1', 'friend-doc-1', true, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled),
        updateBlockStatus('user-2', 'friend-2', 'friend-user-2', 'friend-doc-2', false, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled),
        updateBlockStatus('user-3', 'friend-3', 'friend-user-3', 'friend-doc-3', true, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled)
      ];

      await Promise.all(promises);

      // 各実行で2回ずつdocとupdateDocが呼ばれる
      expect(mockDoc).toHaveBeenCalledTimes(6); // 3 × 2
      expect(mockUpdateDoc).toHaveBeenCalledTimes(6); // 3 × 2
      expect(mockAlert).toHaveBeenCalledTimes(3);
    });
  });

  describe('アラートのテスト', () => {
    test('ブロック解除時に正しいメッセージでアラートが表示される', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true, // ブロック中 → 解除
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
    });

    test('ブロック実行時に正しいメッセージでアラートが表示される', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        false, // ブロックしていない → ブロック
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('友人をブロックしました');
    });

    test('エラー時に正しいメッセージでアラートが表示される', async () => {
      const mockError = new Error('Test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');
    });

    test('userIdがnullの場合はアラートが表示されない', async () => {
      await updateBlockStatus(
        null as any,
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('コールバック関数のテスト', () => {
    test('ブロック解除時にコールバック関数が正しい引数で呼ばれる', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true, // ブロック中 → 解除
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockSetStatus).toHaveBeenCalledTimes(1);
      expect(mockSetStatus).toHaveBeenCalledWith('approval');

      expect(mockSetIsBlocked).toHaveBeenCalledTimes(1);
      expect(mockSetIsBlocked).toHaveBeenCalledWith(false); // !true

      expect(mockSetIsViewEnabled).toHaveBeenCalledTimes(1);
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(true); // isBlocked
    });

    test('ブロック実行時にコールバック関数が正しい引数で呼ばれる', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        false, // ブロックしていない → ブロック
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockSetStatus).toHaveBeenCalledTimes(1);
      expect(mockSetStatus).toHaveBeenCalledWith('block');

      expect(mockSetIsBlocked).toHaveBeenCalledTimes(1);
      expect(mockSetIsBlocked).toHaveBeenCalledWith(true); // !false

      expect(mockSetIsViewEnabled).toHaveBeenCalledTimes(1);
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(false); // isBlocked
    });

    test('エラー時はコールバック関数が呼ばれない', async () => {
      const mockError = new Error('Test error');
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });

    test('userIdがnullの場合はコールバック関数が呼ばれない', async () => {
      await updateBlockStatus(
        null as any,
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      expect(mockSetStatus).not.toHaveBeenCalled();
      expect(mockSetIsBlocked).not.toHaveBeenCalled();
      expect(mockSetIsViewEnabled).not.toHaveBeenCalled();
    });
  });

  describe('更新順序のテスト', () => {
    test('friendRefが最初に更新され、その後currentUserRefが更新される', async () => {
      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // doc呼び出し順序の確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), 'users/user-123/friends/friend-456');
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), 'users/friend-user-789/friends/friend-doc-012');

      // updateDoc呼び出し順序の確認（ブロック解除）
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, {
        status: 'approval',
        blocked: false,
        showDiary: true,
      });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, {
        status: 'approval',
        blocked: false,
        showDiary: true,
      });

      // 成功処理の順序確認
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
      expect(mockSetStatus).toHaveBeenCalledWith('approval');
      expect(mockSetIsBlocked).toHaveBeenCalledWith(false);
      expect(mockSetIsViewEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('エッジケーステスト', () => {
    test('最小限のパラメータでも正常に動作する', async () => {
      await updateBlockStatus('a', 'b', 'c', 'd', true, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled);

      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('友人のブロックを解除しました');
    });

    test('全てのパラメータが同じ値でも正常に動作する', async () => {
      await updateBlockStatus('same', 'same', 'same', 'same', false, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'users/same/friends/same');
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'users/same/friends/same');
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('友人をブロックしました');
    });

    test('2番目のdocでエラーが発生した場合のハンドリング', async () => {
      const mockError = new Error('Second doc error');
      (mockDoc as any)
        .mockReturnValueOnce({ id: 'mock-doc-ref-1' }) // 最初は成功
        .mockImplementationOnce(() => { throw mockError; }); // 2番目でエラー

      await updateBlockStatus(
        'user-123',
        'friend-456',
        'friend-user-789',
        'friend-doc-012',
        true,
        mockSetStatus,
        mockSetIsBlocked,
        mockSetIsViewEnabled
      );

      // 最初のdocは成功するが、2番目でエラー
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).not.toHaveBeenCalled(); // updateDocは呼ばれない

      // エラーハンドリング
      expect(mockConsoleError).toHaveBeenCalledWith('友人のステータス更新に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人のステータス更新に失敗しました。');
    });
  });

  describe('完全カバレッジのための追加テスト', () => {
    test('すべての分岐を網羅するテスト', async () => {
      // ブロック解除パス
      await updateBlockStatus('user-1', 'friend-1', 'friend-user-1', 'friend-doc-1', true, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled);
      expect(mockAlert).toHaveBeenLastCalledWith('友人のブロックを解除しました');

      // モッククリア
      jest.clearAllMocks();
      (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
      (mockUpdateDoc as any).mockResolvedValue(undefined);

      // ブロック実行パス
      await updateBlockStatus('user-2', 'friend-2', 'friend-user-2', 'friend-doc-2', false, mockSetStatus, mockSetIsBlocked, mockSetIsViewEnabled);
      expect(mockAlert).toHaveBeenLastCalledWith('友人をブロックしました');
    });
  });
});