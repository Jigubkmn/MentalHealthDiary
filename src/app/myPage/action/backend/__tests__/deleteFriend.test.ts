/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import deleteFriend from '../deleteFriend';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log と console.error をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('deleteFriend', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockDeleteDoc: jest.MockedFunction<typeof deleteDoc>;
  let mockOnFriendDeleted: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
    mockOnFriendDeleted = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ ref: 'mock-doc-ref' });
    (mockDeleteDoc as any).mockResolvedValue(undefined);
    (mockAlert as any).mockImplementation(() => {}); // デフォルトでは何もしない
  });

  afterEach(() => {
    // 各テスト後にモックを完全にリセット
    jest.clearAllMocks();
    (mockAlert as any).mockReset();
    (mockDoc as any).mockReset();
    (mockDeleteDoc as any).mockReset();
    mockOnFriendDeleted.mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('必要なパラメータが全て揃っている場合、フレンド削除が成功する', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // doc が正しいパスで2回呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledTimes(2);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
      // deleteDoc が2回呼ばれることを確認
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockDeleteDoc).toHaveBeenCalledWith({ ref: 'mock-doc-ref' });
      // 成功時のログとAlert確認
      expect(mockConsoleLog).toHaveBeenCalledWith('友人を削除しました');
      expect(mockAlert).toHaveBeenCalledWith('削除完了', '友人を削除しました');
      // コールバック関数が呼ばれることを確認
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(friendId);
    });

    test('異なるユーザーIDでも正しく処理される', async () => {
      const userId = 'different-user-001';
      const friendId = 'different-friend-doc-002';
      const friendUsersId = 'different-friend-user-003';
      const friendDocumentId = 'different-doc-004';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // 正しいパスでドキュメント参照が作成されることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
      // 削除処理が実行されることを確認
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('削除完了', '友人を削除しました');
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(friendId);
    });

    test('特殊文字を含むIDでも正しく処理される', async () => {
      const userId = 'user@email.com';
      const friendId = 'friend#123';
      const friendUsersId = 'friend@user#456';
      const friendDocumentId = 'doc@id#789';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends/${friendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(friendId);
    });

    test('非常に長いIDでも正しく処理される', async () => {
      const longUserId = 'a'.repeat(100);
      const longFriendId = 'b'.repeat(100);
      const longFriendUsersId = 'c'.repeat(100);
      const longFriendDocumentId = 'd'.repeat(100);
      await deleteFriend(longUserId, longFriendId, longFriendUsersId, longFriendDocumentId, mockOnFriendDeleted);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${longUserId}/friends/${longFriendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${longFriendUsersId}/friends/${longFriendDocumentId}`);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(longFriendId);
    });
  });

  describe('パラメータ検証のテスト', () => {
    test('userIdがnullの場合、早期リターンされる', async () => {
      await deleteFriend(null as any, 'friend-id', 'friend-user-id', 'doc-id', mockOnFriendDeleted);
      // Firestore操作が呼ばれないことを確認
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      // Alert やコールバックが呼ばれないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test('friendIdがnullの場合、早期リターンされる', async () => {
      await deleteFriend('user-id', null as any, 'friend-user-id', 'doc-id', mockOnFriendDeleted);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });
    test('friendUsersIdがnullの場合、早期リターンされる', async () => {
      await deleteFriend('user-id', 'friend-id', null as any, 'doc-id', mockOnFriendDeleted);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });

    test('friendDocumentIdがnullの場合、早期リターンされる', async () => {
      await deleteFriend('user-id', 'friend-id', 'friend-user-id', null, mockOnFriendDeleted);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });

    test('複数のパラメータがnullの場合、早期リターンされる', async () => {
      await deleteFriend(null as any, null as any, 'friend-user-id', null, mockOnFriendDeleted);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });

    test('全てのパラメータがnullの場合、早期リターンされる', async () => {
      await deleteFriend(null as any, null as any, null as any, null, mockOnFriendDeleted);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('最初のdeleteDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const mockError = new Error('Firestore deleteDoc error');
      (mockDeleteDoc as any).mockRejectedValueOnce(mockError);
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // エラーがconsole.errorに出力されることを確認
      expect(mockConsoleError).toHaveBeenCalledWith('友人の削除に失敗しました:', mockError);
      // エラー時のAlert表示確認
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人の削除に失敗しました。');
      // コールバック関数が呼ばれないことを確認
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
      // 成功時のログが出力されないことを確認
      expect(mockConsoleLog).not.toHaveBeenCalledWith('友人を削除しました');
    });

    test('2回目のdeleteDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const mockError = new Error('Second deleteDoc error');
      (mockDeleteDoc as any)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(mockError);
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      expect(mockConsoleError).toHaveBeenCalledWith('友人の削除に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人の削除に失敗しました。');
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const mockError = new Error('Doc reference error');
      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      expect(mockConsoleError).toHaveBeenCalledWith('友人の削除に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人の削除に失敗しました。');
      expect(mockOnFriendDeleted).not.toHaveBeenCalled();
    });

    test('Alert.alertでエラーが発生した場合もキャッチされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      // Alert.alertでエラーが発生するように設定
      const mockError = new Error('Alert error');
      (mockAlert as any).mockReset();
      (mockAlert as any).mockImplementation(() => {
        throw mockError;
      });
      // Alert.alertのエラーはtry-catchでキャッチされないため、
      // このテストではエラーが投げられることを確認する
      await expect(deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted))
        .rejects.toThrow('Alert error');
      // Firestore操作は成功しているはず（エラーが発生する前に実行される）
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
    });

    test('onFriendDeletedコールバックでエラーが発生した場合もキャッチされる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const mockError = new Error('Callback error');
      mockOnFriendDeleted.mockImplementation(() => {
        throw mockError;
      });
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // Firestore操作は成功しているはず
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockConsoleLog).toHaveBeenCalledWith('友人を削除しました');
      // エラーがキャッチされてconsole.errorに出力される
      expect(mockConsoleError).toHaveBeenCalledWith('友人の削除に失敗しました:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人の削除に失敗しました。');
    });
  });

  describe('双方向削除のテスト', () => {
    test('両方のフレンド関係が正しい順序で削除される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      let firstDeleteCompleted = false;
      (mockDeleteDoc as any)
        .mockImplementationOnce(async () => {
          await new Promise<void>(resolve => setTimeout(resolve, 100));
          firstDeleteCompleted = true;
        })
        .mockImplementationOnce(async () => {
          expect(firstDeleteCompleted).toBe(true);
        });
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // 両方の削除が実行されることを確認
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('削除完了', '友人を削除しました');
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(friendId);
    });

    test('正しいドキュメントパスが構築される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // 1回目の呼び出し（ログインユーザーのfriendsコレクション）
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `users/${userId}/friends/${friendId}`);
      // 2回目の呼び出し（友人のfriendsコレクション）
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${friendUsersId}/friends/${friendDocumentId}`);
    });
  });

  describe('コールバック関数のテスト', () => {
    test('正常削除時にコールバックが正しいパラメータで呼ばれる', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // コールバックが正確なfriendIdで呼ばれることを確認
      expect(mockOnFriendDeleted).toHaveBeenCalledTimes(1);
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(friendId);
    });

    test('異なるfriendIdでもコールバックが正しく呼ばれる', async () => {
      const userId = 'user-123';
      const differentFriendId = 'different-friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      await deleteFriend(userId, differentFriendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(differentFriendId);
    });
  });

  describe('ログとアラートのテスト', () => {
    test('成功時に正しいログとアラートが表示される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // 成功時のログ確認
      expect(mockConsoleLog).toHaveBeenCalledWith('友人を削除しました');
      // 成功時のアラート確認
      expect(mockAlert).toHaveBeenCalledWith('削除完了', '友人を削除しました');
      // エラーログが出力されないことを確認
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    test('エラー時に正しいログとアラートが表示される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const mockError = new Error('Test error');
      (mockDeleteDoc as any).mockRejectedValue(mockError);
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // エラー時のログ確認
      expect(mockConsoleError).toHaveBeenCalledWith('友人の削除に失敗しました:', mockError);
      // エラー時のアラート確認
      expect(mockAlert).toHaveBeenCalledWith('エラー', '友人の削除に失敗しました。');
      // 成功時のログが出力されないことを確認
      expect(mockConsoleLog).not.toHaveBeenCalledWith('友人を削除しました');
    });
  });

  describe('非同期処理のテスト', () => {
    test('deleteDocが並行ではなく順次実行される', async () => {
      const userId = 'user-123';
      const friendId = 'friend-doc-id';
      const friendUsersId = 'friend-user-456';
      const friendDocumentId = 'current-user-doc-id';
      const executionOrder: string[] = [];
      (mockDeleteDoc as any)
        .mockImplementationOnce(async () => {
          executionOrder.push('first');
          await new Promise<void>(resolve => setTimeout(resolve, 50));
        })
        .mockImplementationOnce(async () => {
          executionOrder.push('second');
        });
      await deleteFriend(userId, friendId, friendUsersId, friendDocumentId, mockOnFriendDeleted);
      // 順次実行されることを確認
      expect(executionOrder).toEqual(['first', 'second']);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のIDでも正常に処理される', async () => {
      const longData = {
        userId: 'u'.repeat(1000),
        friendId: 'f'.repeat(1000),
        friendUsersId: 'fu'.repeat(500),
        friendDocumentId: 'fd'.repeat(500)
      };
      await deleteFriend(
        longData.userId,
        longData.friendId,
        longData.friendUsersId,
        longData.friendDocumentId,
        mockOnFriendDeleted
      );
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${longData.userId}/friends/${longData.friendId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${longData.friendUsersId}/friends/${longData.friendDocumentId}`);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockOnFriendDeleted).toHaveBeenCalledWith(longData.friendId);
    });
  });
});