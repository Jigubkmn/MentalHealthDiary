/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import handleImageSelect from '../../../../actions/handleImageSelect';
import updateUserImage from '../updateUserImage';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('../../../../actions/handleImageSelect', () => jest.fn());

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('../../../../../config', () => ({
  db: {},
}));

// console.log をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('updateUserImage', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockHandleImageSelect: jest.MockedFunction<typeof handleImageSelect>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockWriteBatch: jest.MockedFunction<typeof writeBatch>;
  let mockSetUserImage: jest.MockedFunction<any>;
  let mockBatch: any;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockHandleImageSelect = handleImageSelect as jest.MockedFunction<typeof handleImageSelect>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;
    mockSetUserImage = jest.fn();

    // バッチモックの設定
    mockBatch = {
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockHandleImageSelect as any).mockResolvedValue('https://example.com/new-image.jpg');
    (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
    (mockUpdateDoc as any).mockResolvedValue(undefined);
    (mockCollection as any).mockReturnValue({ collection: 'diaries' });
    (mockQuery as any).mockReturnValue({ query: 'mock-query' });
    (mockWhere as any).mockReturnValue({ where: 'mock-where' });
    (mockWriteBatch as any).mockReturnValue(mockBatch);
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
    (mockAlert as any).mockReset();
    (mockHandleImageSelect as any).mockReset();
    (mockDoc as any).mockReset();
    (mockUpdateDoc as any).mockReset();
    (mockCollection as any).mockReset();
    (mockQuery as any).mockReset();
    (mockWhere as any).mockReset();
    (mockGetDocs as any).mockReset();
    (mockWriteBatch as any).mockReset();
    mockSetUserImage.mockReset();
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
  });

  describe('正常系のテスト - 日記データありの場合', () => {
    test('ユーザー画像が正常に更新され、関連する日記データも一括更新される', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';

      // 日記データが存在する場合のモック
      const mockDiariesSnapshot = {
        empty: false,
        docs: [
          { id: 'diary-1' },
          { id: 'diary-2' },
          { id: 'diary-3' }
        ]
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // 画像選択の確認
      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);

      // ユーザー情報更新の確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userImage: newUserImage
      });

      // 日記データクエリの確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'diaries' }, { where: 'mock-where' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });

      // バッチ更新の確認
      expect(mockWriteBatch).toHaveBeenCalledWith(expect.any(Object));
      expect(mockBatch.update).toHaveBeenCalledTimes(3); // 3つの日記
      expect(mockBatch.update).toHaveBeenNthCalledWith(1, { id: 'mock-doc-ref' }, { userImage: newUserImage });
      expect(mockBatch.update).toHaveBeenNthCalledWith(2, { id: 'mock-doc-ref' }, { userImage: newUserImage });
      expect(mockBatch.update).toHaveBeenNthCalledWith(3, { id: 'mock-doc-ref' }, { userImage: newUserImage });
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // 成功時の処理確認
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });
  });

  describe('正常系のテスト - 日記データなしの場合', () => {
    test('日記データが存在しない場合、ユーザー情報のみが更新される', async () => {
      const userId = 'user-no-diaries';
      const newUserImage = 'https://example.com/new-image.jpg';

      // 日記データが存在しない場合のモック
      const mockDiariesSnapshot = {
        empty: true,
        docs: []
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // 画像選択とユーザー情報更新の確認
      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, {
        userImage: newUserImage
      });

      // 日記データクエリは実行される
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // バッチ処理は実行されない（日記データが空のため）
      expect(mockWriteBatch).not.toHaveBeenCalled();
      expect(mockBatch.update).not.toHaveBeenCalled();
      expect(mockBatch.commit).not.toHaveBeenCalled();

      // 成功時の処理確認
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });
  });

  describe('画像選択のテスト', () => {
    test('画像が選択されなかった場合、処理が中断される', async () => {
      const userId = 'user-123';

      // 画像選択がキャンセルされた場合
      (mockHandleImageSelect as any).mockResolvedValue(null);

      await updateUserImage(userId, mockSetUserImage);

      // 画像選択のみが実行される
      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);

      // その他の処理は実行されない
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockCollection).not.toHaveBeenCalled();
      expect(mockGetDocs).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('画像選択でundefinedが返された場合、処理が中断される', async () => {
      const userId = 'user-123';

      (mockHandleImageSelect as any).mockResolvedValue(undefined);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('画像選択で空文字列が返された場合、処理が中断される', async () => {
      const userId = 'user-123';

      (mockHandleImageSelect as any).mockResolvedValue('');

      await updateUserImage(userId, mockSetUserImage);

      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('handleImageSelectでエラーが発生した場合、エラーが外に伝播する', async () => {
      const userId = 'user-123';
      const mockError = new Error('Image selection error');

      (mockHandleImageSelect as any).mockRejectedValue(mockError);

      // handleImageSelectのエラーはtry-catchの外で発生するため、関数外に伝播する
      await expect(updateUserImage(userId, mockSetUserImage)).rejects.toThrow('Image selection error');

      // handleImageSelectは呼ばれるが、その他の処理は実行されない
      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('updateDocでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';
      const mockError = new Error('UpdateDoc error');

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateUserImage(userId, mockSetUserImage);

      // updateDocまでは実行される
      expect(mockHandleImageSelect).toHaveBeenCalledTimes(1);
      expect(mockDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('getDocsでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';
      const mockError = new Error('GetDocs error');

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockRejectedValue(mockError);

      await updateUserImage(userId, mockSetUserImage);

      // updateDocまでは成功
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      // getDocsでエラー
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('バッチコミットでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';
      const mockError = new Error('Batch commit error');

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-1' }]
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);
      mockBatch.commit.mockRejectedValue(mockError);

      await updateUserImage(userId, mockSetUserImage);

      // バッチ処理まで実行される
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像の更新に失敗しました');

      // 成功時の処理は実行されない
      expect(mockSetUserImage).not.toHaveBeenCalled();
    });

    test('docでエラーが発生した場合、エラーハンドリングされる', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';
      const mockError = new Error('Doc error');

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      await updateUserImage(userId, mockSetUserImage);

      // docでエラーが発生するため、updateDocは呼ばれない
      expect(mockDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).not.toHaveBeenCalled();

      // エラーログとアラートの確認
      expect(mockConsoleLog).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像の更新に失敗しました');
    });
  });

  describe('日記データバッチ更新のテスト', () => {
    test('大量の日記データが存在する場合でも正常に処理される', async () => {
      const userId = 'user-many-diaries';
      const newUserImage = 'https://example.com/new-image.jpg';

      // 100個の日記データ
      const mockDiariesSnapshot = {
        empty: false,
        docs: Array.from({ length: 100 }, (_, index) => ({ id: `diary-${index}` }))
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // バッチ更新が100回実行される
      expect(mockBatch.update).toHaveBeenCalledTimes(100);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      // 成功時の処理確認
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });

    test('日記データが1つの場合でも正常に処理される', async () => {
      const userId = 'user-single-diary';
      const newUserImage = 'https://example.com/new-image.jpg';

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-single' }]
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // バッチ更新が1回実行される
      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.update).toHaveBeenCalledWith({ id: 'mock-doc-ref' }, { userImage: newUserImage });
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);

      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });
  });

  describe('ドキュメントパスのテスト', () => {
    test('userIdに基づいて正しいドキュメントパスが構築される', async () => {
      const testCases = [
        { userId: 'user-123', expectedPath: 'users/user-123/userInfo/user-123' },
        { userId: 'user-abc', expectedPath: 'users/user-abc/userInfo/user-abc' },
        { userId: 'user-特殊文字', expectedPath: 'users/user-特殊文字/userInfo/user-特殊文字' }
      ];

      const newUserImage = 'https://example.com/test-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      for (const testCase of testCases) {
        const { userId, expectedPath } = testCase;

        await updateUserImage(userId, mockSetUserImage);

        expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), expectedPath);

        // 次のテストのためにモックをクリア
        jest.clearAllMocks();
        (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
        (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);
        (mockCollection as any).mockReturnValue({ collection: 'diaries' });
        (mockQuery as any).mockReturnValue({ query: 'mock-query' });
        (mockWhere as any).mockReturnValue({ where: 'mock-where' });
      }
    });

    test('日記ドキュメントの正しいパスが構築される', async () => {
      const userId = 'user-123';
      const newUserImage = 'https://example.com/new-image.jpg';

      const mockDiariesSnapshot = {
        empty: false,
        docs: [
          { id: 'diary-id-1' },
          { id: 'diary-id-2' }
        ]
      };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // 日記ドキュメントパスの確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'diaries', 'diary-id-1');
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'diaries', 'diary-id-2');
    });
  });

  describe('非同期処理のテスト', () => {
    test('各非同期処理が順次完了するまで待機する', async () => {
      const userId = 'user-async';
      const newUserImage = 'https://example.com/async-image.jpg';

      let imageSelectResolved = false;
      let updateDocResolved = false;
      let getDocsResolved = false;
      let batchCommitResolved = false;

      const mockDiariesSnapshot = {
        empty: false,
        docs: [{ id: 'diary-async' }]
      };

      (mockHandleImageSelect as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            imageSelectResolved = true;
            resolve(newUserImage);
          }, 50);
        });
      });

      (mockUpdateDoc as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            updateDocResolved = true;
            resolve(undefined);
          }, 50);
        });
      });

      (mockGetDocs as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            getDocsResolved = true;
            resolve(mockDiariesSnapshot);
          }, 50);
        });
      });

      mockBatch.commit.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            batchCommitResolved = true;
            resolve(undefined);
          }, 50);
        });
      });

      const updatePromise = updateUserImage(userId, mockSetUserImage);

      // 処理開始時点では全て未完了
      expect(imageSelectResolved).toBe(false);
      expect(updateDocResolved).toBe(false);
      expect(getDocsResolved).toBe(false);
      expect(batchCommitResolved).toBe(false);

      // 関数の完了を待つ
      await updatePromise;

      // 全ての非同期処理が完了したことを確認
      expect(imageSelectResolved).toBe(true);
      expect(updateDocResolved).toBe(true);
      expect(getDocsResolved).toBe(true);
      expect(batchCommitResolved).toBe(true);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });

    test('複数の並行実行でも正常に処理される', async () => {
      const newUserImage = 'https://example.com/parallel-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      const promises = [
        updateUserImage('user-1', mockSetUserImage),
        updateUserImage('user-2', mockSetUserImage),
        updateUserImage('user-3', mockSetUserImage)
      ];

      await Promise.all(promises);

      expect(mockHandleImageSelect).toHaveBeenCalledTimes(3);
      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockGetDocs).toHaveBeenCalledTimes(3);
      expect(mockAlert).toHaveBeenCalledTimes(3);
      expect(mockSetUserImage).toHaveBeenCalledTimes(3);
    });
  });

  describe('クエリ構築のテスト', () => {
    test('日記データクエリが正しく構築される', async () => {
      const userId = 'user-query-test';
      const newUserImage = 'https://example.com/query-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      // クエリ構築の確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockQuery).toHaveBeenCalledWith({ collection: 'diaries' }, { where: 'mock-where' });
      expect(mockGetDocs).toHaveBeenCalledWith({ query: 'mock-query' });
    });
  });

  describe('アラートとコールバックのテスト', () => {
    test('成功時に正しいメッセージでアラートが表示される', async () => {
      const userId = 'user-alert-test';
      const newUserImage = 'https://example.com/alert-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像を更新しました');
    });

    test('setUserImageが正しい引数で呼ばれる', async () => {
      const userId = 'user-callback-test';
      const newUserImage = 'https://example.com/callback-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockSetUserImage).toHaveBeenCalledTimes(1);
      expect(mockSetUserImage).toHaveBeenCalledWith(newUserImage);
    });

    test('try-catch内でのエラー時に正しいメッセージでアラートが表示される', async () => {
      const userId = 'user-error-test';
      const newUserImage = 'https://example.com/error-image.jpg';
      const mockError = new Error('Test error');

      // try-catch内でエラーが発生するケース（updateDocでエラー）
      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockUpdateDoc as any).mockRejectedValue(mockError);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('ユーザー画像の更新に失敗しました');
    });
  });

  describe('エッジケーステスト', () => {
    test('空文字列のuserIdでも処理される', async () => {
      const userId = '';
      const newUserImage = 'https://example.com/empty-user-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'users//userInfo/');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', '');
    });

    test('特殊文字を含むuserIdでも正常に処理される', async () => {
      const userId = 'user-with-特殊文字-@#$%';
      const newUserImage = 'https://example.com/special-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
    });

    test('長いuserIdでも正常に処理される', async () => {
      const userId = 'a'.repeat(100);
      const newUserImage = 'https://example.com/long-user-image.jpg';
      const mockDiariesSnapshot = { empty: true, docs: [] };

      (mockHandleImageSelect as any).mockResolvedValue(newUserImage);
      (mockGetDocs as any).mockResolvedValue(mockDiariesSnapshot);

      await updateUserImage(userId, mockSetUserImage);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/userInfo/${userId}`);
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);
    });
  });
});