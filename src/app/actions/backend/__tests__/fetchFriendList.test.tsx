/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, collectionGroup, query, getDocs, onSnapshot } from 'firebase/firestore';
import fetchFriendList from '../fetchFriendList';
import { FriendInfoType } from '../../../../../type/friend';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  collectionGroup: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('fetchFriendList', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockCollectionGroup: jest.MockedFunction<typeof collectionGroup>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockSetFriendsData: jest.MockedFunction<(friendsData: FriendInfoType[]) => void>;
  let mockUnsubscribe: jest.MockedFunction<() => void>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockCollectionGroup = collectionGroup as jest.MockedFunction<typeof collectionGroup>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
    // コールバック関数のモック
    mockSetFriendsData = jest.fn();
    mockUnsubscribe = jest.fn();
    // モックをリセット
    jest.clearAllMocks();
    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'friends' });
    (mockCollectionGroup as any).mockReturnValue({ collectionGroup: 'userInfo' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  describe('正常ケースのテスト', () => {
    test('承認済みで日記共有がONの友人データが正常に取得される', async () => {
      const testUserId = 'test-user-123';
      // 友人データのモック
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-2',
            data: () => ({
              friendId: 'user-info-2',
              status: 'approval',
              showDiary: true
            })
          }
        ]
      };

      // userInfoデータのモック
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              userName: 'Friend One',
              userImage: 'image1.jpg'
            })
          },
          {
            id: 'user-info-2',
            data: () => ({
              userName: 'Friend Two',
              userImage: 'image2.jpg'
            })
          }
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      // onSnapshotのコールバックをキャプチャして実行
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      const result = fetchFriendList(testUserId, mockSetFriendsData);
      // onSnapshotが正しく呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/friends`);
      expect(mockOnSnapshot).toHaveBeenCalled();
      // スナップショットコールバックを実行
      await snapshotCallback(mockFriendsSnapshot);
      // setFriendsDataが正しいデータで呼ばれることを確認
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'user-info-1',
          friendId: 'friend-doc-1',
          status: 'approval',
          showDiary: true,
          userImage: 'image1.jpg',
          userName: 'Friend One'
        },
        {
          friendUsersId: 'user-info-2',
          friendId: 'friend-doc-2',
          status: 'approval',
          showDiary: true,
          userImage: 'image2.jpg',
          userName: 'Friend Two'
        }
      ]);

      // unsubscribe関数が返されることを確認
      expect(result).toBe(mockUnsubscribe);
    });

    test('友人がいない場合、空の配列が設定される', async () => {
      const testUserId = 'user-with-no-friends';
      const mockEmptySnapshot = {
        docs: []
      };
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockEmptySnapshot);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
    });

    test('userImageとuserNameがない場合、空文字列がデフォルト値として設定される', async () => {
      const testUserId = 'test-user-default-values';
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          }
        ]
      };
      // userImageとuserNameがないuserInfo
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              // userNameとuserImageなし
            })
          }
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'user-info-1',
          friendId: 'friend-doc-1',
          status: 'approval',
          showDiary: true,
          userImage: '',
          userName: ''
        }
      ]);
    });
  });

  describe('フィルタリングのテスト', () => {
    test('showDiaryがfalseの友人は除外される', async () => {
      const testUserId = 'test-user-filter';
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-2',
            data: () => ({
              friendId: 'user-info-2',
              status: 'approval',
              showDiary: false // 除外される
            })
          }
        ]
      };
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              userName: 'Friend One',
              userImage: 'image1.jpg'
            })
          }
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);

      // showDiaryがtrueの友人のみが含まれる
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'user-info-1',
          friendId: 'friend-doc-1',
          status: 'approval',
          showDiary: true,
          userImage: 'image1.jpg',
          userName: 'Friend One'
        }
      ]);
    });

    test('statusが"approval"でない友人は除外される', async () => {
      const testUserId = 'test-user-status-filter';
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-2',
            data: () => ({
              friendId: 'user-info-2',
              status: 'pending', // 除外される
              showDiary: true
            })
          }
        ]
      };
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              userName: 'Friend One',
              userImage: 'image1.jpg'
            })
          }
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);
      // statusが"approval"の友人のみが含まれる
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'user-info-1',
          friendId: 'friend-doc-1',
          status: 'approval',
          showDiary: true,
          userImage: 'image1.jpg',
          userName: 'Friend One'
        }
      ]);
    });

    test('対応するuserInfoが見つからない友人は除外される', async () => {
      const testUserId = 'test-user-no-userinfo';
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-2',
            data: () => ({
              friendId: 'nonexistent-user-info', // userInfoが存在しない
              status: 'approval',
              showDiary: true
            })
          }
        ]
      };
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              userName: 'Friend One',
              userImage: 'image1.jpg'
            })
          }
          // nonexistent-user-infoは存在しない
        ]
      };
      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);
      // userInfoが見つかった友人のみが含まれる
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'user-info-1',
          friendId: 'friend-doc-1',
          status: 'approval',
          showDiary: true,
          userImage: 'image1.jpg',
          userName: 'Friend One'
        }
      ]);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('userIdが未定義の場合、空配列が設定され空のunsubscribe関数が返される', () => {
      const result = fetchFriendList(undefined, mockSetFriendsData);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof result).toBe('function');
      expect(mockOnSnapshot).not.toHaveBeenCalled();
    });
    test('onSnapshotのエラーコールバックが正常に動作する', () => {
      const testUserId = 'test-user-error';
      const mockError = new Error('Firestore snapshot error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      let errorCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any, errorCb: any) => {
        errorCallback = errorCb;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      // エラーコールバックを実行
      errorCallback(mockError);
      expect(consoleSpy).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      consoleSpy.mockRestore();
    });

    test('try-catchブロックでエラーが発生した場合の処理', () => {
      const testUserId = 'test-user-trycatch-error';
      const mockError = new Error('Collection creation error');
      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = fetchFriendList(testUserId, mockSetFriendsData);
      expect(consoleSpy).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof result).toBe('function'); // 空のunsubscribe関数
      consoleSpy.mockRestore();
    });

    test('getUserDocsでエラーが発生した場合の処理', async () => {
      const testUserId = 'test-user-getdocs-error';
      const mockError = new Error('GetDocs error');
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          }
        ]
      };
      (mockGetDocs as any).mockRejectedValue(mockError);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      // スナップショットコールバックを実行（getDocs内でエラーが発生）
      // この実装ではエラーがcatchされずにPromiseがrejectされる
      try {
        await snapshotCallback(mockFriendsSnapshot);
      } catch (error) {
        // エラーが発生することを確認
        expect(error).toBe(mockError);
      }
      // エラーが発生した場合でも、onSnapshotコールバックが設定されていることを確認
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('空文字列のuserIdは未定義として扱われ、空配列が設定される', () => {
      const testUserId = '';
      const result = fetchFriendList(testUserId, mockSetFriendsData);
      // 空文字列は!userIdでtrueとなるため、早期リターンされる
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof result).toBe('function');
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
    });
    test('有効なuserIdでコレクションが正しく作成される', () => {
      const testUserId = 'valid-user-id';
      const result = fetchFriendList(testUserId, mockSetFriendsData);
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/friends`);
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('コンソールログのテスト', () => {
    test('成功時に正しいログメッセージが出力される', async () => {
      const testUserId = 'test-user-console';
      const mockFriendsSnapshot = {
        docs: []
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);
      expect(consoleSpy).toHaveBeenCalledWith('友人情報の取得に成功しました');
      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスとクエリが構築される', () => {
      const testUserId = 'specific-test-user';
      fetchFriendList(testUserId, mockSetFriendsData);
      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(
        expect.any(Object),
        `users/${testUserId}/friends`
      );
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
    test('collectionGroupとqueryが正しく呼ばれる', async () => {
      const testUserId = 'test-user-collectiongroup';

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'user-info-1',
              status: 'approval',
              showDiary: true
            })
          }
        ]
      };
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'user-info-1',
            data: () => ({
              userName: 'Friend One',
              userImage: 'image1.jpg'
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);
      let snapshotCallback: any;
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });
      fetchFriendList(testUserId, mockSetFriendsData);
      await snapshotCallback(mockFriendsSnapshot);
      // collectionGroupが'userInfo'で呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledWith(expect.any(Object), 'userInfo');
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });
});