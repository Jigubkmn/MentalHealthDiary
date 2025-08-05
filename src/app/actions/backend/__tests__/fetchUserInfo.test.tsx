/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, query, onSnapshot } from 'firebase/firestore';
import fetchUserInfo from '../fetchUserInfo';
import { UserInfoType } from '../../../../../type/userInfo';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('fetchUserInfo', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockSetUserInfo: jest.MockedFunction<(userInfo: UserInfoType) => void>;
  let mockUnsubscribe: jest.MockedFunction<() => void>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;

    // コールバック関数のモック
    mockSetUserInfo = jest.fn();
    mockUnsubscribe = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'userInfo' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  describe('正常ケースのテスト', () => {
    test('ユーザー情報が正常に取得される', () => {
      const testUserId = 'test-user-123';
      // userInfoドキュメントのモック
      const mockSnapshot = {
        docs: [
          {
            id: 'user-info-doc-1',
            data: () => ({
              accountId: 'test-account-123',
              userName: 'テストユーザー',
              userImage: 'test-user-image.jpg'
            })
          }
        ]
      };
      // onSnapshotのコールバックをキャプチャして実行
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      const result = fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // Firestoreの関数が正しく呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/userInfo`);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
      // スナップショットコールバックを実行
      snapshotCallback(mockSnapshot);
      // setUserInfoが正しいデータで呼ばれることを確認
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'user-info-doc-1',
        accountId: 'test-account-123',
        userName: 'テストユーザー',
        userImage: 'test-user-image.jpg'
      });
      // unsubscribe関数が返されることを確認
      expect(result).toBe(mockUnsubscribe);
    });

    test('複数のドキュメントがある場合、全てのドキュメントが処理される', () => {
      const testUserId = 'test-user-multiple';
      const mockSnapshot = {
        docs: [
          {
            id: 'user-info-doc-1',
            data: () => ({
              accountId: 'account-1',
              userName: 'ユーザー1',
              userImage: 'user1.jpg'
            })
          },
          {
            id: 'user-info-doc-2',
            data: () => ({
              accountId: 'account-2',
              userName: 'ユーザー2',
              userImage: 'user2.jpg'
            })
          },
          {
            id: 'user-info-doc-3',
            data: () => ({
              accountId: 'account-3',
              userName: 'ユーザー3',
              userImage: 'user3.jpg'
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockSnapshot);
      // 全てのドキュメントに対してsetUserInfoが呼ばれることを確認
      expect(mockSetUserInfo).toHaveBeenCalledTimes(3);
      expect(mockSetUserInfo).toHaveBeenNthCalledWith(1, {
        userId: 'user-info-doc-1',
        accountId: 'account-1',
        userName: 'ユーザー1',
        userImage: 'user1.jpg'
      });
      expect(mockSetUserInfo).toHaveBeenNthCalledWith(2, {
        userId: 'user-info-doc-2',
        accountId: 'account-2',
        userName: 'ユーザー2',
        userImage: 'user2.jpg'
      });
      expect(mockSetUserInfo).toHaveBeenNthCalledWith(3, {
        userId: 'user-info-doc-3',
        accountId: 'account-3',
        userName: 'ユーザー3',
        userImage: 'user3.jpg'
      });
    });

    test('ドキュメントが存在しない場合、setUserInfoは呼ばれない', () => {
      const testUserId = 'test-user-no-docs';
      const mockEmptySnapshot = {
        docs: []
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockEmptySnapshot);
      // setUserInfoは呼ばれない
      expect(mockSetUserInfo).not.toHaveBeenCalled();
    });

    test('userImageが空文字列の場合でも正常に処理される', () => {
      const testUserId = 'test-user-no-image';
      const mockSnapshot = {
        docs: [
          {
            id: 'user-info-no-image',
            data: () => ({
              accountId: 'no-image-account',
              userName: 'ノーイメージユーザー',
              userImage: ''
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockSnapshot);
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'user-info-no-image',
        accountId: 'no-image-account',
        userName: 'ノーイメージユーザー',
        userImage: ''
      });
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdがundefinedでも正常に処理される', () => {
      const testUserId = undefined;
      const result = fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // undefinedでもコレクションパスが作成される
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/userInfo');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(mockUnsubscribe);
    });
    test('空文字列のuserIdでも正常に処理される', () => {
      const testUserId = '';
      const result = fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users//userInfo');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(mockUnsubscribe);
    });

    test('特殊文字を含むuserIdでも正常に処理される', () => {
      const testUserId = 'user@example.com';
      const result = fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/userInfo`);
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('データ整合性のテスト', () => {
    test('日本語のユーザー名でも正常に処理される', () => {
      const testUserId = 'japanese-user';
      const mockSnapshot = {
        docs: [
          {
            id: 'japanese-user-doc',
            data: () => ({
              accountId: '日本語アカウント123',
              userName: '田中太郎',
              userImage: 'japanese-user.jpg'
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockSnapshot);
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'japanese-user-doc',
        accountId: '日本語アカウント123',
        userName: '田中太郎',
        userImage: 'japanese-user.jpg'
      });
    });

    test('URLを含むuserImageでも正常に処理される', () => {
      const testUserId = 'url-image-user';
      const mockSnapshot = {
        docs: [
          {
            id: 'url-image-doc',
            data: () => ({
              accountId: 'url-account',
              userName: 'URLユーザー',
              userImage: 'https://example.com/images/user-avatar.png'
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockSnapshot);
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'url-image-doc',
        accountId: 'url-account',
        userName: 'URLユーザー',
        userImage: 'https://example.com/images/user-avatar.png'
      });
    });
    test('特殊文字を含むaccountIdでも正常に処理される', () => {
      const testUserId = 'special-chars-user';
      const mockSnapshot = {
        docs: [
          {
            id: 'special-chars-doc',
            data: () => ({
              accountId: 'special_account@test.com',
              userName: 'Special User',
              userImage: 'special-user.jpg'
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      snapshotCallback(mockSnapshot);
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'special-chars-doc',
        accountId: 'special_account@test.com',
        userName: 'Special User',
        userImage: 'special-user.jpg'
      });
    });
  });

  describe('リアルタイム更新のテスト', () => {
    test('データが更新された場合、新しいデータでsetUserInfoが呼ばれる', () => {
      const testUserId = 'realtime-user';
      // 初回データ
      const initialSnapshot = {
        docs: [
          {
            id: 'realtime-doc',
            data: () => ({
              accountId: 'initial-account',
              userName: '初期ユーザー',
              userImage: 'initial-image.jpg'
            })
          }
        ]
      };
      // 更新後データ
      const updatedSnapshot = {
        docs: [
          {
            id: 'realtime-doc',
            data: () => ({
              accountId: 'updated-account',
              userName: '更新されたユーザー',
              userImage: 'updated-image.jpg'
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // 初回データの処理
      snapshotCallback(initialSnapshot);
      expect(mockSetUserInfo).toHaveBeenNthCalledWith(1, {
        userId: 'realtime-doc',
        accountId: 'initial-account',
        userName: '初期ユーザー',
        userImage: 'initial-image.jpg'
      });
      // データ更新の処理
      snapshotCallback(updatedSnapshot);
      expect(mockSetUserInfo).toHaveBeenNthCalledWith(2, {
        userId: 'realtime-doc',
        accountId: 'updated-account',
        userName: '更新されたユーザー',
        userImage: 'updated-image.jpg'
      });
      expect(mockSetUserInfo).toHaveBeenCalledTimes(2);
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスとクエリが構築される', () => {
      const testUserId = 'query-test-user';
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(
        expect.any(Object),
        `users/${testUserId}/userInfo`
      );
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
    test('onSnapshotが正しい引数で呼ばれる', () => {
      const testUserId = 'snapshot-test-user';
      const mockRef = { collection: `users/${testUserId}/userInfo` };
      const mockQueryObj = { query: 'mock' };
      (mockCollection as any).mockReturnValue(mockRef);
      (mockQuery as any).mockReturnValue(mockQueryObj);
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // onSnapshotが正しいクエリオブジェクトで呼ばれることを確認
      expect(mockOnSnapshot).toHaveBeenCalledWith(mockQueryObj, expect.any(Function));
    });
    test('unsubscribe関数が正しく返される', () => {
      const testUserId = 'unsubscribe-test-user';
      const result = fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });
  });

  describe('エラーケースのテスト', () => {
    test('ドキュメントデータが不完全でもエラーにならない', () => {
      const testUserId = 'incomplete-data-user';
      const mockSnapshot = {
        docs: [
          {
            id: 'incomplete-doc',
            data: () => ({
              accountId: 'incomplete-account',
              userName: 'Incomplete User'
              // userImageが存在しない
            })
          }
        ]
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchUserInfo({
        userId: testUserId,
        setUserInfo: mockSetUserInfo
      });
      // エラーなく処理されることを確認
      expect(() => snapshotCallback(mockSnapshot)).not.toThrow();
      expect(mockSetUserInfo).toHaveBeenCalledWith({
        userId: 'incomplete-doc',
        accountId: 'incomplete-account',
        userName: 'Incomplete User',
        userImage: undefined
      });
    });
  });
});