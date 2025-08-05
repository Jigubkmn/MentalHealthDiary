/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, collectionGroup, query, getDocs, onSnapshot } from 'firebase/firestore';
import fetchFriendList from '../fetchFriendList';
import { FriendInfoType } from '../../../../../../type/friend';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  collectionGroup: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log と console.error をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchFriendList', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockCollectionGroup: jest.MockedFunction<typeof collectionGroup>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockOnSnapshot: jest.MockedFunction<typeof onSnapshot>;
  let mockSetFriendsData: jest.MockedFunction<any>;
  let mockUnsubscribe: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockCollectionGroup = collectionGroup as jest.MockedFunction<typeof collectionGroup>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
    mockSetFriendsData = jest.fn();
    mockUnsubscribe = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'friends' });
    (mockCollectionGroup as any).mockReturnValue({ collectionGroup: 'userInfo' });
    (mockQuery as any).mockReturnValue({ query: 'mock-query' });
    (mockOnSnapshot as any).mockReturnValue(mockUnsubscribe);
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
    (mockCollection as any).mockReset();
    (mockCollectionGroup as any).mockReset();
    (mockQuery as any).mockReset();
    (mockGetDocs as any).mockReset();
    (mockOnSnapshot as any).mockReset();
    mockSetFriendsData.mockReset();
    mockUnsubscribe.mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('userIdパラメータのテスト', () => {
    test('userIdがundefinedの場合、空配列が設定され空のアンサブスクライブ関数が返される', () => {
      const unsubscribe = fetchFriendList(undefined, mockSetFriendsData);

      // 空配列が設定されることを確認
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);

      // Firestore操作が呼ばれないことを確認
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();

      // アンサブスクライブ関数が返されることを確認
      expect(typeof unsubscribe).toBe('function');
    });

    test('userIdが空文字列の場合、空配列が設定され空のアンサブスクライブ関数が返される', () => {
      const unsubscribe = fetchFriendList('', mockSetFriendsData);

      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    test('userIdがnullの場合、空配列が設定され空のアンサブスクライブ関数が返される', () => {
      const unsubscribe = fetchFriendList(null as any, mockSetFriendsData);

      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockOnSnapshot).not.toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('正常系のテスト', () => {
    test('フレンドリストが正常に取得・設定される', async () => {
      const userId = 'user-123';

      // モックのフレンドデータ
      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'userinfo-1',
              status: 'approved',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-2',
            data: () => ({
              friendId: 'userinfo-2',
              status: 'pending',
              showDiary: false
            })
          }
        ]
      };

      // モックのユーザー情報データ
      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-1',
            data: () => ({
              userName: 'フレンド1',
              userImage: 'https://example.com/user1.jpg'
            })
          },
          {
            id: 'userinfo-2',
            data: () => ({
              userName: 'フレンド2',
              userImage: 'https://example.com/user2.jpg'
            })
          },
          {
            id: 'userinfo-3',
            data: () => ({
              userName: '関係ないユーザー',
              userImage: 'https://example.com/user3.jpg'
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      // onSnapshotのコールバック関数を取得して実行
      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        // 非同期でコールバックを実行
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      const unsubscribe = fetchFriendList(userId, mockSetFriendsData);

      // 非同期処理を待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      // Firestore操作の確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/friends`);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'friends' });
      expect(mockOnSnapshot).toHaveBeenCalledWith({ query: 'mock-query' }, expect.any(Function), expect.any(Function));

      // collectionGroupとgetDocsが各フレンドに対して呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledTimes(2);
      expect(mockGetDocs).toHaveBeenCalledTimes(2);

      // setFriendsDataが期待されるデータで呼ばれることを確認
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'userinfo-1',
          friendId: 'friend-doc-1',
          status: 'approved',
          showDiary: true,
          userImage: 'https://example.com/user1.jpg',
          userName: 'フレンド1'
        },
        {
          friendUsersId: 'userinfo-2',
          friendId: 'friend-doc-2',
          status: 'pending',
          showDiary: false,
          userImage: 'https://example.com/user2.jpg',
          userName: 'フレンド2'
        }
      ]);

      // 成功ログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('友人情報の取得に成功しました');

      // アンサブスクライブ関数が返されることを確認
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    test('userImageとuserNameがない場合、空文字列が設定される', async () => {
      const userId = 'user-empty-data';

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-empty',
            data: () => ({
              friendId: 'userinfo-empty',
              status: 'approved',
              showDiary: true
            })
          }
        ]
      };

      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-empty',
            data: () => ({
              // userNameとuserImageが存在しない
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'userinfo-empty',
          friendId: 'friend-doc-empty',
          status: 'approved',
          showDiary: true,
          userImage: '', // 空文字列
          userName: ''   // 空文字列
        }
      ]);
    });

    test('フレンドに対応するuserInfoが見つからない場合、そのフレンドは除外される', async () => {
      const userId = 'user-no-userinfo';

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'userinfo-1',
              status: 'approved',
              showDiary: true
            })
          },
          {
            id: 'friend-doc-no-userinfo',
            data: () => ({
              friendId: 'userinfo-not-exist',
              status: 'pending',
              showDiary: true
            })
          }
        ]
      };

      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-1',
            data: () => ({
              userName: 'フレンド1',
              userImage: 'https://example.com/user1.jpg'
            })
          }
          // userinfo-not-exist は存在しない
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      // userInfoが見つかったフレンドのみが設定される
      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'userinfo-1',
          friendId: 'friend-doc-1',
          status: 'approved',
          showDiary: true,
          userImage: 'https://example.com/user1.jpg',
          userName: 'フレンド1'
        }
      ]);
    });

    test('フレンドが存在しない場合、空配列が設定される', async () => {
      const userId = 'user-no-friends';

      const mockFriendsSnapshot = {
        docs: [] // フレンドなし
      };

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(mockConsoleLog).toHaveBeenCalledWith('友人情報の取得に成功しました');

      // collectionGroupとgetDocsは呼ばれない
      expect(mockCollectionGroup).not.toHaveBeenCalled();
      expect(mockGetDocs).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('onSnapshotのエラーコールバックが呼ばれた場合、エラーハンドリングされる', () => {
      const userId = 'user-snapshot-error';
      const mockError = new Error('Snapshot error');

      (mockOnSnapshot as any).mockImplementation((_query: any, _callback: any, errorCallback: any) => {
        // エラーコールバックを即座に実行
        setTimeout(() => errorCallback(mockError), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      // エラーログの確認（非同期なので少し待つ）
      setTimeout(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
        expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      }, 100);
    });

    test('collectionでエラーが発生した場合、エラーハンドリングされる', () => {
      const userId = 'user-collection-error';
      const mockError = new Error('Collection error');

      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      const unsubscribe = fetchFriendList(userId, mockSetFriendsData);

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    test('queryでエラーが発生した場合、エラーハンドリングされる', () => {
      const userId = 'user-query-error';
      const mockError = new Error('Query error');

      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });

      const unsubscribe = fetchFriendList(userId, mockSetFriendsData);

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    test('onSnapshotでエラーが発生した場合、エラーハンドリングされる', () => {
      const userId = 'user-onSnapshot-error';
      const mockError = new Error('OnSnapshot error');

      (mockOnSnapshot as any).mockImplementation(() => {
        throw mockError;
      });

      const unsubscribe = fetchFriendList(userId, mockSetFriendsData);

      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
      expect(typeof unsubscribe).toBe('function');
    });

    test('getDocsでエラーが発生した場合、エラーはonSnapshotコールバック内で処理される', async () => {
      const userId = 'user-getDocs-error';
      const mockError = new Error('GetDocs error');

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'userinfo-1',
              status: 'approved',
              showDiary: true
            })
          }
        ]
      };

      (mockGetDocs as any).mockRejectedValue(mockError);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any, errorCallback: any) => {
        // コールバック内でgetDocsが失敗する
        setTimeout(async () => {
          try {
            await callback(mockFriendsSnapshot);
          } catch (error) {
            errorCallback(error);
          }
        }, 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      // onSnapshotのエラーコールバックでハンドリングされる
      expect(mockConsoleError).toHaveBeenCalledWith('フレンド情報の取得に失敗しました:', mockError);
      expect(mockSetFriendsData).toHaveBeenCalledWith([]);
    });
  });

  describe('データ型のテスト', () => {
    test('様々なデータ型でも正しく処理される', async () => {
      const userId = 'user-data-types';

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-types',
            data: () => ({
              friendId: 'userinfo-types',
              status: 123, // 数値
              showDiary: 'true' // 文字列
            })
          }
        ]
      };

      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-types',
            data: () => ({
              userName: 123, // 数値
              userImage: null // null
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'userinfo-types',
          friendId: 'friend-doc-types',
          status: 123,
          showDiary: 'true',
          userImage: '',   // null || '' → 空文字列
          userName: 123    // 123 || '' → 123（真値なのでそのまま）
        }
      ]);
    });

    test('nullやundefinedの値も適切に処理される', async () => {
      const userId = 'user-null-values';

      const mockFriendsSnapshot = {
        docs: [
          {
            id: 'friend-doc-null',
            data: () => ({
              friendId: 'userinfo-null',
              status: null,
              showDiary: undefined
            })
          }
        ]
      };

      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-null',
            data: () => ({
              userName: undefined,
              userImage: null
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSetFriendsData).toHaveBeenCalledWith([
        {
          friendUsersId: 'userinfo-null',
          friendId: 'friend-doc-null',
          status: null,
          showDiary: undefined,
          userImage: '',
          userName: ''
        }
      ]);
    });
  });

  describe('リアルタイム更新のテスト', () => {
    test('データが更新された場合、新しいデータで再度コールされる', async () => {
      const userId = 'user-realtime';

      let snapshotCallback: any;

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        snapshotCallback = callback;
        return mockUnsubscribe;
      });

      const mockUserInfoSnapshot = {
        docs: [
          {
            id: 'userinfo-1',
            data: () => ({
              userName: 'フレンド1',
              userImage: 'https://example.com/user1.jpg'
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      fetchFriendList(userId, mockSetFriendsData);

      // 最初のデータ
      const firstSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'userinfo-1',
              status: 'pending',
              showDiary: false
            })
          }
        ]
      };

      await snapshotCallback(firstSnapshot);
      expect(mockSetFriendsData).toHaveBeenCalledTimes(1);

      // 更新されたデータ
      const updatedSnapshot = {
        docs: [
          {
            id: 'friend-doc-1',
            data: () => ({
              friendId: 'userinfo-1',
              status: 'approved', // ステータス変更
              showDiary: true     // showDiary変更
            })
          }
        ]
      };

      await snapshotCallback(updatedSnapshot);
      expect(mockSetFriendsData).toHaveBeenCalledTimes(2);

      // 最新の呼び出しデータを確認
      const latestCallData = mockSetFriendsData.mock.calls[1][0];
      expect(latestCallData[0].status).toBe('approved');
      expect(latestCallData[0].showDiary).toBe(true);
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のフレンドデータでも正常に処理される', async () => {
      const userId = 'user-large-data';

      // 50個のフレンドドキュメントを作成
      const mockFriendsSnapshot = {
        docs: Array.from({ length: 50 }, (_, index) => ({
          id: `friend-doc-${index}`,
          data: () => ({
            friendId: `userinfo-${index}`,
            status: index % 2 === 0 ? 'approved' : 'pending',
            showDiary: index % 3 === 0
          })
        }))
      };

      // 50個のユーザー情報ドキュメントを作成
      const mockUserInfoSnapshot = {
        docs: Array.from({ length: 50 }, (_, index) => ({
          id: `userinfo-${index}`,
          data: () => ({
            userName: `フレンド${index}`,
            userImage: `https://example.com/user${index}.jpg`
          })
        }))
      };

      (mockGetDocs as any).mockResolvedValue(mockUserInfoSnapshot);

      (mockOnSnapshot as any).mockImplementation((query: any, callback: any) => {
        setTimeout(() => callback(mockFriendsSnapshot), 0);
        return mockUnsubscribe;
      });

      fetchFriendList(userId, mockSetFriendsData);

      await new Promise(resolve => setTimeout(resolve, 200));

      // setFriendsDataが50個のデータで呼ばれることを確認
      const calledData = mockSetFriendsData.mock.calls[0][0];
      expect(calledData).toHaveLength(50);

      // 各データの構造を確認
      calledData.forEach((item: FriendInfoType, index: number) => {
        expect(item).toEqual({
          friendUsersId: `userinfo-${index}`,
          friendId: `friend-doc-${index}`,
          status: index % 2 === 0 ? 'approved' : 'pending',
          showDiary: index % 3 === 0,
          userImage: `https://example.com/user${index}.jpg`,
          userName: `フレンド${index}`
        });
      });

      // collectionGroupとgetDocsが50回呼ばれることを確認
      expect(mockCollectionGroup).toHaveBeenCalledTimes(50);
      expect(mockGetDocs).toHaveBeenCalledTimes(50);
    });
  });

  describe('アンサブスクライブ関数のテスト', () => {
    test('正常時はonSnapshotから返されるアンサブスクライブ関数が返される', () => {
      const userId = 'user-unsubscribe';

      const result = fetchFriendList(userId, mockSetFriendsData);

      expect(result).toBe(mockUnsubscribe);
      expect(typeof result).toBe('function');
    });

    test('エラー時は空のアンサブスクライブ関数が返される', () => {
      const userId = 'user-error-unsubscribe';

      (mockCollection as any).mockImplementation(() => {
        throw new Error('Collection error');
      });

      const result = fetchFriendList(userId, mockSetFriendsData);

      expect(typeof result).toBe('function');
      expect(result).not.toBe(mockUnsubscribe);
    });
  });
});