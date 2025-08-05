/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import addFriend from '../addFriend';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('../../../../config', () => ({
  db: {},
}));

// console.log をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('addFriend', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockAddDoc: jest.MockedFunction<typeof addDoc>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;
  let mockRouterPush: jest.MockedFunction<typeof router.push>;
  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;
    mockRouterPush = router.push as jest.MockedFunction<typeof router.push>;
    // モックをリセット
    jest.clearAllMocks();
    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'mock-collection' });
    (mockAddDoc as any).mockResolvedValue({ id: 'mock-doc-id' });
    (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
  });
  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('必要なパラメータが全て揃っている場合、フレンド追加が成功する', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      // collection が正しいパスで2回呼ばれることを確認（ログインユーザーと友人のそれぞれ）
      expect(mockCollection).toHaveBeenCalledTimes(2);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.userId}/friends`);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.friendUsersId}/friends`);
      // addDoc が2回呼ばれることを確認
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      // ログインユーザーのfriendsコレクションへの追加確認
      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mock-collection' },
        {
          friendId: props.friendUserInfosId,
          accountId: props.accountId,
          blocked: false,
          showDiary: true,
          status: 'pending',
          createdAt: { timestamp: 'mock-timestamp' }
        }
      );
      // 友人のfriendsコレクションへの追加確認
      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mock-collection' },
        {
          friendId: props.userId,
          accountId: props.currentAccountId,
          blocked: false,
          showDiary: true,
          status: 'awaitingApproval',
          createdAt: { timestamp: 'mock-timestamp' }
        }
      );
      // Timestamp.fromDate が2回呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(2);
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expect.any(Date));
      // 成功時のAlert表示確認
      expect(mockAlert).toHaveBeenCalledWith('友人を追加しました');
      // ページ遷移確認
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/myPage');
    });

    test('異なるユーザーIDでも正しく処理される', async () => {
      const props = {
        userId: 'different-user-001',
        friendUsersId: 'different-friend-002',
        accountId: 'different-account-001',
        currentAccountId: 'different-current-001',
        friendUserInfosId: 'different-friendinfo-001'
      };
      await addFriend(props);
      // 正しいパスでコレクション参照が作成されることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.userId}/friends`);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.friendUsersId}/friends`);
      // データが正しく設定されることを確認
      const calls = mockAddDoc.mock.calls;
      expect(calls[0][1]).toEqual({
        friendId: props.friendUserInfosId,
        accountId: props.accountId,
        blocked: false,
        showDiary: true,
        status: 'pending',
        createdAt: { timestamp: 'mock-timestamp' }
      });
      expect(calls[1][1]).toEqual({
        friendId: props.userId,
        accountId: props.currentAccountId,
        blocked: false,
        showDiary: true,
        status: 'awaitingApproval',
        createdAt: { timestamp: 'mock-timestamp' }
      });
    });

    test('特殊文字を含むIDでも正しく処理される', async () => {
      const props = {
        userId: 'user@email.com',
        friendUsersId: 'friend#123',
        accountId: 'account-id@test',
        currentAccountId: 'current@account#123',
        friendUserInfosId: 'friend-info@special#456'
      };
      await addFriend(props);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.userId}/friends`);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.friendUsersId}/friends`);
      expect(mockAlert).toHaveBeenCalledWith('友人を追加しました');
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/myPage');
    });
  });

  describe('パラメータ不足のテスト', () => {
    test('userIdがundefinedの場合、早期リターンされる', async () => {
      const props = {
        userId: undefined,
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      // Firestore操作が呼ばれないことを確認
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockTimestampFromDate).not.toHaveBeenCalled();
      // Alert やページ遷移が呼ばれないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('friendUsersIdがundefinedの場合、早期リターンされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: undefined as any,
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('accountIdがundefinedの場合、早期リターンされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: undefined as any,
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('currentAccountIdがundefinedの場合、早期リターンされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: undefined,
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('friendUserInfosIdがnullの場合、早期リターンされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: null
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('複数のパラメータがundefinedの場合、早期リターンされる', async () => {
      const props = {
        userId: undefined,
        friendUsersId: undefined as any,
        accountId: 'friend-account-id',
        currentAccountId: undefined,
        friendUserInfosId: null
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('空文字列のパラメータも早期リターンされる', async () => {
      const props = {
        userId: '',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('最初のaddDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      const mockError = new Error('Firestore addDoc error');
      (mockAddDoc as any).mockRejectedValueOnce(mockError);
      await addFriend(props);
      // エラーがconsole.logに出力されることを確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      // エラー時のAlert表示確認
      expect(mockAlert).toHaveBeenCalledWith('友人の追加に失敗しました');
      // ページ遷移が呼ばれないことを確認
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('2回目のaddDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      const mockError = new Error('Second addDoc error');
      (mockAddDoc as any)
        .mockResolvedValueOnce({ id: 'first-doc' })
        .mockRejectedValueOnce(mockError);
      await addFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('友人の追加に失敗しました');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('collectionでエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      const mockError = new Error('Collection reference error');
      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });
      await addFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('友人の追加に失敗しました');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('Timestamp.fromDateでエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      const mockError = new Error('Timestamp conversion error');
      (mockTimestampFromDate as any).mockImplementation(() => {
        throw mockError;
      });
      await addFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('友人の追加に失敗しました');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test('router.pushでエラーが発生した場合もキャッチされる', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      const mockError = new Error('Router push error');
      (mockRouterPush as any).mockImplementation(() => {
        throw mockError;
      });
      await addFriend(props);
      // Firestore操作は成功しているはず
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      // エラーがキャッチされてconsole.logに出力される
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('友人の追加に失敗しました');
    });
  });

  describe('データ構造のテスト', () => {
    test('正しいフレンドデータ構造で保存される', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      const addDocCalls = mockAddDoc.mock.calls;
      // 1回目の呼び出し（ログインユーザーのfriendsコレクション）
      expect(addDocCalls[0][1]).toEqual({
        friendId: props.friendUserInfosId,
        accountId: props.accountId,
        blocked: false,
        showDiary: true,
        status: 'pending',
        createdAt: expect.any(Object)
      });
      // 2回目の呼び出し（友人のfriendsコレクション）
      expect(addDocCalls[1][1]).toEqual({
        friendId: props.userId,
        accountId: props.currentAccountId,
        blocked: false,
        showDiary: true,
        status: 'awaitingApproval',
        createdAt: expect.any(Object)
      });
    });
    test('ステータスが正しく設定される', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      const addDocCalls = mockAddDoc.mock.calls as any[];
      // ログインユーザー側は 'pending'
      expect(addDocCalls[0][1].status).toBe('pending');
      // 友人側は 'awaitingApproval'
      expect(addDocCalls[1][1].status).toBe('awaitingApproval');
    });

    test('デフォルト値が正しく設定される', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      const addDocCalls = mockAddDoc.mock.calls as any[];
      // 両方のレコードで共通のデフォルト値を確認
      addDocCalls.forEach((call: any) => {
        expect(call[1].blocked).toBe(false);
        expect(call[1].showDiary).toBe(true);
        expect(call[1].createdAt).toBeDefined();
      });
    });
  });

  describe('タイムスタンプのテスト', () => {
    test('現在時刻でTimestampが作成される', async () => {
      const mockDate = new Date('2023-10-15T12:00:00Z');
      const originalDate = global.Date;
      (global as any).Date = jest.fn(() => mockDate);
      (global as any).Date.now = originalDate.now;
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      await addFriend(props);
      // Timestamp.fromDateが正しい日付で呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(mockDate);
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(2);
      // グローバルDateを復元
      (global as any).Date = originalDate;
    });
  });

  describe('同期処理のテスト', () => {
    test('addDocが順序通りに実行される', async () => {
      const props = {
        userId: 'user-123',
        friendUsersId: 'friend-456',
        accountId: 'friend-account-id',
        currentAccountId: 'current-account-id',
        friendUserInfosId: 'friend-userinfo-789'
      };
      let firstCallCompleted = false;
      (mockAddDoc as any)
        .mockImplementationOnce(async () => {
          await new Promise<void>(resolve => setTimeout(resolve, 100));
          firstCallCompleted = true;
          return { id: 'first-doc' };
        })
        .mockImplementationOnce(async () => {
          expect(firstCallCompleted).toBe(true);
          return { id: 'second-doc' };
        });
      await addFriend(props);
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenCalledWith('友人を追加しました');
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/myPage');
    });
  });

  describe('長いIDのテスト', () => {
    test('非常に長いIDでも正しく処理される', async () => {
      const longString = 'a'.repeat(100);
      const props = {
        userId: longString,
        friendUsersId: longString + '2',
        accountId: longString + '3',
        currentAccountId: longString + '4',
        friendUserInfosId: longString + '5'
      };
      await addFriend(props);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.userId}/friends`);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${props.friendUsersId}/friends`);
      expect(mockAlert).toHaveBeenCalledWith('友人を追加しました');
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/myPage');
    });
  });
});