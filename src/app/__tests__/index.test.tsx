import React from 'react';
import { render } from '@testing-library/react-native';
import { Redirect, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import Index from '../index';

// モックの設定
jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../config', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('Index', () => {
  let mockOnAuthStateChanged: jest.MockedFunction<typeof onAuthStateChanged>;
  let mockRouterReplace: jest.MockedFunction<typeof router.replace>;
  let mockRedirect: jest.MockedFunction<typeof Redirect>;

  beforeEach(() => {
    // モック関数を取得
    mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;
    mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;
    mockRedirect = Redirect as jest.MockedFunction<typeof Redirect>;

    // モックをリセット
    jest.clearAllMocks();
  });

  describe('レンダリングのテスト', () => {
    test('Redirectコンポーネントが正しいhrefで表示される', () => {
      render(<Index />);

      // Redirectコンポーネントが/auth/loginへのhrefで呼ばれることを確認
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith(
        { href: '/auth/login' },
        {}
      );
    });

    test('onAuthStateChangedが呼ばれることを確認', () => {
      render(<Index />);

      // onAuthStateChangedが1回呼ばれることを確認
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('認証状態変化のテスト', () => {
    test('ユーザーがログインしている場合、タブページにリダイレクトされる', () => {
      // onAuthStateChangedのコールバックを取得するためのモック
      let authStateCallback: (user: any) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateCallback = callback;
        return jest.fn(); // unsubscribe関数のモック
      });

      render(<Index />);

      // ログインユーザーをシミュレート
      const mockUser = {
        uid: 'test-user-id',
        email: 'test@example.com',
      };

      // コールバックを実行
      authStateCallback!(mockUser);

      // router.replaceが正しいパスで呼ばれることを確認
      expect(mockRouterReplace).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
    });

    test('ユーザーがログインしていない場合、router.replaceは呼ばれない', () => {
      let authStateCallback: (user: any) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateCallback = callback;
        return jest.fn();
      });

      render(<Index />);

      // ログアウト状態をシミュレート（user = null）
      authStateCallback!(null);

      // router.replaceが呼ばれないことを確認
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    test('ユーザーがundefinedの場合、router.replaceは呼ばれない', () => {
      let authStateCallback: (user: any) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateCallback = callback;
        return jest.fn();
      });

      render(<Index />);

      // undefined状態をシミュレート
      authStateCallback!(undefined);

      // router.replaceが呼ばれないことを確認
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe('useEffectの依存配列のテスト', () => {
    test('useEffectが一度だけ実行される（依存配列が空配列）', () => {
      // 複数回レンダリングしてもonAuthStateChangedが一度だけ呼ばれることを確認
      const { rerender } = render(<Index />);
      
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
      
      // 再レンダリング
      rerender(<Index />);
      
      // まだ1回だけであることを確認（useEffectの依存配列が[]なので）
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('認証監視の設定確認', () => {
    test('onAuthStateChangedが正しい引数で呼ばれる', () => {
      render(<Index />);

      // onAuthStateChangedが正しい引数（auth、コールバック関数）で呼ばれることを確認
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
      
      const callArgs = mockOnAuthStateChanged.mock.calls[0];
      expect(callArgs[0]).toBeDefined(); // auth オブジェクト
      expect(typeof callArgs[1]).toBe('function'); // コールバック関数
    });

    test('コールバック関数が期待通りの動作をする', () => {
      let authStateCallback: (user: any) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authStateCallback = callback;
        return jest.fn();
      });

      render(<Index />);

      // 複数のユーザー状態をテスト
      const testUsers = [
        { uid: 'user1', email: 'user1@test.com' },
        { uid: 'user2', email: 'user2@test.com' },
      ];

      testUsers.forEach((user, index) => {
        authStateCallback!(user);
        expect(mockRouterReplace).toHaveBeenCalledTimes(index + 1);
        expect(mockRouterReplace).toHaveBeenLastCalledWith('/(tabs)');
      });
    });
  });

  describe('アンマウント時のクリーンアップ', () => {
    test('コンポーネントアンマウント時にunsubscribeが呼ばれる', () => {
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { unmount } = render(<Index />);

      // アンマウント
      unmount();

      // unsubscribe関数が呼ばれることを確認
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});