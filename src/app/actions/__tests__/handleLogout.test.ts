import { Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import UserLogout from '../handleLogout';

// モックの設定
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('../../../config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
    },
  },
}));

describe('UserLogout', () => {
  let mockSignOut: jest.MockedFunction<typeof signOut>;
  let mockRouterReplace: jest.MockedFunction<typeof router.replace>;
  let mockAlertAlert: jest.MockedFunction<typeof Alert.alert>;

  beforeEach(() => {
    // モック関数を取得
    mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
    mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;
    mockAlertAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

    // モックをリセット
    jest.clearAllMocks();
  });

  describe('ログアウト成功時のテスト', () => {
    test('ログアウトが成功した場合、ログインページにリダイレクトされる', async () => {
      // signOutが成功するようにモック
      mockSignOut.mockResolvedValue(undefined);

      // 関数を実行
      await UserLogout();

      // signOutが呼ばれたことを確認
      expect(mockSignOut).toHaveBeenCalledTimes(1);

      // router.replaceが正しいパスで呼ばれたことを確認
      expect(mockRouterReplace).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');

      // Alert.alertが呼ばれていないことを確認
      expect(mockAlertAlert).not.toHaveBeenCalled();
    });
  });

  describe('ログアウト失敗時のテスト', () => {
    test('ログアウトが失敗した場合、エラーメッセージが表示される', async () => {
      // signOutが失敗するようにモック
      const mockError = new Error('Authentication failed');
      mockSignOut.mockRejectedValue(mockError);

      // console.logをモック
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // 関数を実行
      UserLogout();

      // 非同期処理を待つ
      await new Promise(resolve => setTimeout(resolve, 0));

      // signOutが呼ばれたことを確認
      expect(mockSignOut).toHaveBeenCalledTimes(1);

      // console.logが呼ばれたことを確認
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);

      // Alert.alertが正しいメッセージで呼ばれたことを確認
      expect(mockAlertAlert).toHaveBeenCalledTimes(1);
      expect(mockAlertAlert).toHaveBeenCalledWith('ログアウト処理を失敗しました');

      // router.replaceが呼ばれていないことを確認
      expect(mockRouterReplace).not.toHaveBeenCalled();

      // モックを復元
      consoleSpy.mockRestore();
    });

    test('ネットワークエラーの場合、エラーメッセージが表示される', async () => {
      // ネットワークエラーをモック
      const networkError = new Error('Network error');
      mockSignOut.mockRejectedValue(networkError);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      UserLogout();

      // 非同期処理を待つ
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('error', networkError);
      expect(mockAlertAlert).toHaveBeenCalledWith('ログアウト処理を失敗しました');
      expect(mockRouterReplace).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('予期しないエラーの場合も適切にハンドリングされる', async () => {
      // 予期しないエラーをモック
      const unexpectedError = new Error('Unexpected error');
      mockSignOut.mockRejectedValue(unexpectedError);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      UserLogout();

      // 非同期処理を待つ
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('error', unexpectedError);
      expect(mockAlertAlert).toHaveBeenCalledWith('ログアウト処理を失敗しました');
      expect(mockRouterReplace).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});