/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import fetchFriend from '../fetchFriend';
import { UserInfoType } from '../../../../../type/userInfo';
import { noUserImage } from '../../../constants/userImage';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collectionGroup: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {},
}));

jest.mock('../../../constants/userImage', () => ({
  noUserImage: 'mock-no-user-image.png',
}));

// console.log をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('fetchFriend', () => {
  let mockCollectionGroup: jest.MockedFunction<typeof collectionGroup>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockSetSearchResult: jest.MockedFunction<any>;
  let mockSetUserImage: jest.MockedFunction<any>;
  let mockSetIsSearching: jest.MockedFunction<any>;
  let mockSetErrorMessage: jest.MockedFunction<any>;
  let mockSetFriendUsersId: jest.MockedFunction<any>;
  let mockSetFriendUserInfosId: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockCollectionGroup = collectionGroup as jest.MockedFunction<typeof collectionGroup>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockSetSearchResult = jest.fn();
    mockSetUserImage = jest.fn();
    mockSetIsSearching = jest.fn();
    mockSetErrorMessage = jest.fn();
    mockSetFriendUsersId = jest.fn();
    mockSetFriendUserInfosId = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollectionGroup as any).mockReturnValue({ collectionGroup: 'userInfo' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
  });

  const createMockProps = (overrides = {}) => ({
    accountId: 'test-account',
    userId: 'user-123',
    friendsAccountId: [],
    setSearchResult: mockSetSearchResult,
    setUserImage: mockSetUserImage,
    setIsSearching: mockSetIsSearching,
    setErrorMessage: mockSetErrorMessage,
    setFriendUsersId: mockSetFriendUsersId,
    setFriendUserInfosId: mockSetFriendUserInfosId,
    ...overrides,
  });

  describe('パラメータ検証のテスト', () => {
    test('accountIdが空文字列の場合、早期リターンされる', async () => {
      const props = createMockProps({ accountId: '' });
      await fetchFriend(props);
      // Firestore操作が呼ばれないことを確認
      expect(mockCollectionGroup).not.toHaveBeenCalled();
      expect(mockGetDocs).not.toHaveBeenCalled();
      // 状態更新が呼ばれないことを確認
      expect(mockSetIsSearching).not.toHaveBeenCalled();
      expect(mockSetErrorMessage).not.toHaveBeenCalled();
    });
    test('accountIdが空白のみの場合、早期リターンされる', async () => {
      const props = createMockProps({ accountId: '   ' });
      await fetchFriend(props);
      expect(mockCollectionGroup).not.toHaveBeenCalled();
      expect(mockGetDocs).not.toHaveBeenCalled();
      expect(mockSetIsSearching).not.toHaveBeenCalled();
    });

    test('accountIdの前後の空白がトリムされる', async () => {
      const props = createMockProps({ accountId: '  test-account  ' });
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // where句でトリムされたaccountIdが使用されることを確認
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', 'test-account');
    });
  });

  describe('userIdチェックのテスト', () => {
    test('userIdがundefinedの場合、エラーメッセージが設定される', async () => {
      const props = createMockProps({ userId: undefined });
      await fetchFriend(props);
      // 検索開始状態設定の確認
      expect(mockSetIsSearching).toHaveBeenCalledWith(true);
      expect(mockSetErrorMessage).toHaveBeenCalledWith(null);
      // エラーメッセージとログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('ログインユーザーが見つかりません');
      expect(mockSetErrorMessage).toHaveBeenCalledWith('ログインユーザーが見つかりません');
      // Firestore操作が呼ばれないことを確認
      expect(mockCollectionGroup).not.toHaveBeenCalled();
    });

    test('userIdが空文字列の場合、エラーメッセージが設定される', async () => {
      const props = createMockProps({ userId: '' });
      await fetchFriend(props);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('ログインユーザーが見つかりません');
      expect(mockCollectionGroup).not.toHaveBeenCalled();
    });
  });

  describe('正常検索のテスト', () => {
    test('ユーザーが見つかり、自分以外で未登録の場合、正常に結果が設定される', async () => {
      const props = createMockProps({
        accountId: 'friend-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData: UserInfoType = {
        userId: 'friend-user-id',
        accountId: 'friend-account',
        userName: 'フレンド太郎',
        userImage: 'https://example.com/image.jpg'
      };
      const mockDoc = {
        id: 'friend-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'friend-user-123' // 異なるユーザーID
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 検索状態の設定確認
      expect(mockSetIsSearching).toHaveBeenCalledWith(true);
      expect(mockSetErrorMessage).toHaveBeenCalledWith(null);
      // Firestore操作の確認
      expect(mockCollectionGroup).toHaveBeenCalledWith(expect.any(Object), 'userInfo');
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', 'friend-account');
      expect(mockQuery).toHaveBeenCalledWith({ collectionGroup: 'userInfo' }, { where: 'mock' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock' });
      // 結果の設定確認
      expect(mockSetSearchResult).toHaveBeenCalledWith(mockUserData);
      expect(mockSetUserImage).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(mockSetFriendUsersId).toHaveBeenCalledWith('friend-user-123');
      expect(mockSetFriendUserInfosId).toHaveBeenCalledWith('friend-userinfo-id');
    });

    test('ユーザー画像がない場合、noUserImageが設定される', async () => {
      const props = createMockProps({
        accountId: 'friend-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData: UserInfoType = {
        userId: 'friend-user-id',
        accountId: 'friend-account',
        userName: 'フレンド太郎',
        userImage: '' // 空文字列
      };
      const mockDoc = {
        id: 'friend-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'friend-user-123'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
    });

    test('ユーザー画像がnullの場合、noUserImageが設定される', async () => {
      const props = createMockProps({
        accountId: 'friend-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData: UserInfoType = {
        userId: 'friend-user-id',
        accountId: 'friend-account',
        userName: 'フレンド太郎',
        userImage: null as any // null
      };
      const mockDoc = {
        id: 'friend-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'friend-user-123'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
    });
  });

  describe('自分自身の検索テスト', () => {
    test('自分自身のアカウントIDを検索した場合、エラーメッセージが設定される', async () => {
      const props = createMockProps({
        accountId: 'my-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData: UserInfoType = {
        userId: 'user-123',
        accountId: 'my-account',
        userName: '自分',
        userImage: 'https://example.com/my-image.jpg'
      };
      const mockDoc = {
        id: 'my-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'user-123' // 同じユーザーID
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // エラーメッセージとログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('自分自身のアカウントIDです');
      expect(mockSetErrorMessage).toHaveBeenCalledWith('自分以外のIDを検索してください');
      // 結果のリセット確認
      expect(mockSetSearchResult).toHaveBeenCalledWith(null);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
      // フレンド情報は設定されない
      expect(mockSetFriendUsersId).not.toHaveBeenCalled();
      expect(mockSetFriendUserInfosId).not.toHaveBeenCalled();
    });
  });

  describe('既存フレンドの検索テスト', () => {
    test('既に登録されているアカウントIDを検索した場合、エラーメッセージが設定される', async () => {
      const props = createMockProps({
        accountId: 'existing-friend',
        userId: 'user-123',
        friendsAccountId: ['existing-friend', 'another-friend']
      });
      const mockUserData: UserInfoType = {
        userId: 'existing-friend-user-id',
        accountId: 'existing-friend',
        userName: '既存フレンド',
        userImage: 'https://example.com/friend-image.jpg'
      };
      const mockDoc = {
        id: 'existing-friend-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'existing-friend-user-123'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // エラーメッセージとログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('既に登録されているアカウントIDです');
      expect(mockSetErrorMessage).toHaveBeenCalledWith('既に登録されているアカウントIDです');
      // 結果が設定されないことを確認
      expect(mockSetSearchResult).not.toHaveBeenCalled();
      expect(mockSetUserImage).not.toHaveBeenCalled();
      expect(mockSetFriendUsersId).not.toHaveBeenCalled();
      expect(mockSetFriendUserInfosId).not.toHaveBeenCalled();
    });
  });

  describe('ユーザーが見つからない場合のテスト', () => {
    test('存在しないアカウントIDを検索した場合、適切なメッセージが設定される', async () => {
      const props = createMockProps({
        accountId: 'non-existent-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // エラーメッセージとログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('ユーザーが見つかりません');
      expect(mockSetErrorMessage).toHaveBeenCalledWith('ユーザーが見つかりません');
      // 結果のリセット確認
      expect(mockSetSearchResult).toHaveBeenCalledWith(null);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
      // フレンド情報は設定されない
      expect(mockSetFriendUsersId).not.toHaveBeenCalled();
      expect(mockSetFriendUserInfosId).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('getDocs でエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockError = new Error('Firestore error');
      (mockGetDocs as any).mockRejectedValue(mockError);
      await fetchFriend(props);
      // エラーログの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('検索エラー:', mockError);
      // エラーメッセージの設定確認
      expect(mockSetErrorMessage).toHaveBeenCalledWith('検索中にエラーが発生しました');
      // 結果のリセット確認
      expect(mockSetSearchResult).toHaveBeenCalledWith(null);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
    });

    test('collectionGroup でエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockError = new Error('CollectionGroup error');
      (mockCollectionGroup as any).mockImplementation(() => {
        throw mockError;
      });
      await fetchFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('検索エラー:', mockError);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('検索中にエラーが発生しました');
      expect(mockSetSearchResult).toHaveBeenCalledWith(null);
      expect(mockSetUserImage).toHaveBeenCalledWith(noUserImage);
    });

    test('query でエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockError = new Error('Query error');
      (mockQuery as any).mockImplementation(() => {
        throw mockError;
      });
      await fetchFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('検索エラー:', mockError);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('検索中にエラーが発生しました');
    });

    test('doc.data() でエラーが発生した場合、エラーハンドリングされる', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockDoc = {
        id: 'userinfo-id',
        data: () => {
          throw new Error('Data extraction error');
        },
        ref: {
          parent: {
            parent: {
              id: 'different-user-123'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      expect(mockConsoleLog).toHaveBeenCalledWith('検索エラー:', expect.any(Error));
      expect(mockSetErrorMessage).toHaveBeenCalledWith('検索中にエラーが発生しました');
    });
  });

  describe('複数検索結果のテスト', () => {
    test('複数のユーザーが見つかった場合、最初のユーザーが使用される', async () => {
      const props = createMockProps({
        accountId: 'duplicate-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData1: UserInfoType = {
        userId: 'user-1',
        accountId: 'duplicate-account',
        userName: '最初のユーザー',
        userImage: 'https://example.com/user1.jpg'
      };
      const mockUserData2: UserInfoType = {
        userId: 'user-2',
        accountId: 'duplicate-account',
        userName: '2番目のユーザー',
        userImage: 'https://example.com/user2.jpg'
      };
      const mockDoc1 = {
        id: 'userinfo-1',
        data: () => mockUserData1,
        ref: {
          parent: {
            parent: {
              id: 'different-user-1'
            }
          }
        }
      };
      const mockDoc2 = {
        id: 'userinfo-2',
        data: () => mockUserData2,
        ref: {
          parent: {
            parent: {
              id: 'different-user-2'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc1, mockDoc2]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 最初のユーザーのデータが使用されることを確認
      expect(mockSetSearchResult).toHaveBeenCalledWith(mockUserData1);
      expect(mockSetUserImage).toHaveBeenCalledWith('https://example.com/user1.jpg');
      expect(mockSetFriendUsersId).toHaveBeenCalledWith('different-user-1');
      expect(mockSetFriendUserInfosId).toHaveBeenCalledWith('userinfo-1');
    });
  });

  describe('特殊ケースのテスト', () => {
    test('doc.ref.parent.parentがnullの場合、空文字列が設定される', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockUserData: UserInfoType = {
        userId: 'friend-user-id',
        accountId: 'test-account',
        userName: 'フレンド',
        userImage: 'https://example.com/image.jpg'
      };
      const mockDoc = {
        id: 'userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: null // null の場合
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 空文字列がフォールバックとして使用される
      expect(mockSetFriendUsersId).toHaveBeenCalledWith('');
    });

    test('friendsAccountIdが大きな配列でも正しく処理される', async () => {
      const largeFriendsArray = Array.from({ length: 1000 }, (_, i) => `friend-${i}`);
      const props = createMockProps({
        accountId: 'new-friend',
        userId: 'user-123',
        friendsAccountId: largeFriendsArray
      });
      const mockUserData: UserInfoType = {
        userId: 'new-friend-user-id',
        accountId: 'new-friend',
        userName: '新しいフレンド',
        userImage: 'https://example.com/new-friend.jpg'
      };
      const mockDoc = {
        id: 'new-friend-userinfo-id',
        data: () => mockUserData,
        ref: {
          parent: {
            parent: {
              id: 'new-friend-user-123'
            }
          }
        }
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc]
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 新しいフレンドが正常に設定される
      expect(mockSetSearchResult).toHaveBeenCalledWith(mockUserData);
      expect(mockSetUserImage).toHaveBeenCalledWith('https://example.com/new-friend.jpg');
    });

    test('特殊文字を含むaccountIdでも正しく処理される', async () => {
      const specialAccountId = 'user@email.com#123';
      const props = createMockProps({
        accountId: specialAccountId,
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 特殊文字を含むaccountIdでもwhereクエリが正しく実行される
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', specialAccountId);
    });

    test('非常に長いaccountIdでも正しく処理される', async () => {
      const longAccountId = 'a'.repeat(1000);
      const props = createMockProps({
        accountId: longAccountId,
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      expect(mockWhere).toHaveBeenCalledWith('accountId', '==', longAccountId);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('ユーザーが見つかりません');
    });
  });

  describe('状態管理のテスト', () => {
    test('検索開始時に正しい状態が設定される', async () => {
      const props = createMockProps({
        accountId: 'test-account',
        userId: 'user-123',
        friendsAccountId: []
      });
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      (mockGetDocs as any).mockResolvedValue(mockQuerySnapshot);
      await fetchFriend(props);
      // 検索開始時の状態設定を確認
      expect(mockSetIsSearching).toHaveBeenCalledWith(true);
      expect(mockSetErrorMessage).toHaveBeenCalledWith(null);
      // 最初にnullでエラーメッセージをクリアし、後でエラーメッセージを設定
      expect(mockSetErrorMessage).toHaveBeenCalledTimes(2);
      expect(mockSetErrorMessage).toHaveBeenNthCalledWith(1, null);
      expect(mockSetErrorMessage).toHaveBeenNthCalledWith(2, 'ユーザーが見つかりません');
    });
  });
});