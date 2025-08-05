/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, getDoc } from 'firebase/firestore';
import fetchSelectedDiary from '../fetchSelectedDiary';
import { DiaryType } from '../../../../../type/diary';
import dayjs from 'dayjs';

// Firestoreの関数をモック
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

describe('fetchSelectedDiary', () => {
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockGetDoc: jest.MockedFunction<typeof getDoc>;
  let mockSetSelectedDiaryInfo: jest.MockedFunction<(diary: DiaryType) => void>;

  beforeEach(() => {
    // モック関数を取得
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
    // コールバック関数のモック
    mockSetSelectedDiaryInfo = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ doc: 'mock' });
  });

  describe('正常ケースのテスト', () => {
    test('日記データが正常に取得される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-456';
      const testDate = dayjs('2023-10-27');

      // Firestoreドキュメントのモック
      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: 'テスト日記の内容です。',
          diaryDate: testDate,
          feeling: 'excellent',
          diaryImage: 'test-image.jpg',
          updatedAt: {
            toDate: () => new Date('2023-10-27T10:00:00Z')
          },
          userId: testUserId,
          userName: 'テストユーザー',
          userImage: 'user-image.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数が正しい引数で呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalledWith(mockDiaryRef);

      // setSelectedDiaryInfoが正しいデータで呼ばれることを確認
      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith({
        id: testDiaryId,
        diaryText: 'テスト日記の内容です。',
        diaryDate: testDate,
        feeling: 'excellent',
        diaryImage: 'test-image.jpg',
        updatedAt: new Date('2023-10-27T10:00:00Z'),
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'user-image.jpg'
      });
    });

    test('feelingがnullの場合、nullが設定される', async () => {
      const testUserId = 'test-user-456';
      const testDiaryId = 'test-diary-789';
      const testDate = dayjs('2023-11-01');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: 'feelingなしの日記',
          diaryDate: testDate,
          feeling: undefined, // feelingがない場合
          diaryImage: null,
          updatedAt: {
            toDate: () => new Date('2023-11-01T15:30:00Z')
          },
          userId: testUserId,
          userName: 'テストユーザー2',
          userImage: 'user2-image.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith({
        id: testDiaryId,
        diaryText: 'feelingなしの日記',
        diaryDate: testDate,
        feeling: null, // 未定義の場合はnullが設定される
        diaryImage: null,
        updatedAt: new Date('2023-11-01T15:30:00Z'),
        userId: testUserId,
        userName: 'テストユーザー2',
        userImage: 'user2-image.jpg'
      });
    });

    test('diaryImageがnullの場合、nullが設定される', async () => {
      const testUserId = 'test-user-no-image';
      const testDiaryId = 'test-diary-no-image';
      const testDate = dayjs('2023-12-01');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: '画像なしの日記',
          diaryDate: testDate,
          feeling: 'good',
          diaryImage: null,
          updatedAt: {
            toDate: () => new Date('2023-12-01T09:00:00Z')
          },
          userId: testUserId,
          userName: 'ノーイメージユーザー',
          userImage: 'default-user.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith({
        id: testDiaryId,
        diaryText: '画像なしの日記',
        diaryDate: testDate,
        feeling: 'good',
        diaryImage: null,
        updatedAt: new Date('2023-12-01T09:00:00Z'),
        userId: testUserId,
        userName: 'ノーイメージユーザー',
        userImage: 'default-user.jpg'
      });
    });
  });

  describe('データが存在しない場合のテスト', () => {
    test('ドキュメントが存在しない場合、console.logが出力される', async () => {
      const testUserId = 'test-user-not-found';
      const testDiaryId = 'non-existent-diary';

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => false
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数は呼ばれる
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalledWith(mockDiaryRef);

      // console.logが出力される
      expect(consoleSpy).toHaveBeenCalledWith('対象データがありません。');

      // setSelectedDiaryInfoは呼ばれない
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdがnullの場合、早期リターンされる', async () => {
      const testDiaryId = 'test-diary-123';

      await fetchSelectedDiary({
        userId: null as any,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数は呼ばれない
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();
    });

    test('diaryIdがnullの場合、早期リターンされる', async () => {
      const testUserId = 'test-user-123';

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: null as any,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数は呼ばれない
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();
    });

    test('userIdとdiaryIdの両方がnullの場合、早期リターンされる', async () => {
      await fetchSelectedDiary({
        userId: null as any,
        diaryId: null as any,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();
    });

    test('userIdがundefinedの場合でも正常に処理される', async () => {
      const testDiaryId = 'test-diary-undefined-user';
      const testDate = dayjs('2023-10-15');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: 'undefinedユーザーの日記',
          diaryDate: testDate,
          feeling: 'bad',
          diaryImage: 'test.jpg',
          updatedAt: {
            toDate: () => new Date('2023-10-15T12:00:00Z')
          },
          userId: 'some-user-id',
          userName: 'Undefinedユーザー',
          userImage: 'undefined-user.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: undefined,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // userIdがundefinedでもnullでなければ処理が続行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockSetSelectedDiaryInfo).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、エラーログが出力される', async () => {
      const testUserId = 'test-user-error';
      const testDiaryId = 'test-diary-error';
      const mockError = new Error('Firestore getDoc error');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数は呼ばれる
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalledWith(mockDiaryRef);

      // エラーログが出力される
      expect(consoleSpy).toHaveBeenCalledWith('対象データの取得に失敗しました。', mockError);

      // setSelectedDiaryInfoは呼ばれない
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('docの作成時にエラーが発生した場合、エラーログが出力される', async () => {
      const testUserId = 'test-user-doc-error';
      const testDiaryId = 'test-diary-doc-error';
      const mockError = new Error('Doc creation error');

      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(consoleSpy).toHaveBeenCalledWith('対象データの取得に失敗しました。', mockError);
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('データの変換時にエラーが発生した場合、エラーログが出力される', async () => {
      const testUserId = 'test-user-data-error';
      const testDiaryId = 'test-diary-data-error';

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: 'エラーテスト日記',
          diaryDate: dayjs('2023-10-20'),
          feeling: 'good',
          diaryImage: 'error-test.jpg',
          updatedAt: {
            toDate: () => {
              throw new Error('toDate conversion error');
            }
          },
          userId: testUserId,
          userName: 'エラーテストユーザー',
          userImage: 'error-user.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(consoleSpy).toHaveBeenCalledWith('対象データの取得に失敗しました。', expect.any(Error));
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいドキュメントパスでクエリが構築される', async () => {
      const testUserId = 'specific-test-user';
      const testDiaryId = 'specific-test-diary';
      const testDate = dayjs('2023-09-15');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: '詳細テスト日記',
          diaryDate: testDate,
          feeling: 'excellent',
          diaryImage: 'detail-test.jpg',
          updatedAt: {
            toDate: () => new Date('2023-09-15T18:45:00Z')
          },
          userId: testUserId,
          userName: '詳細テストユーザー',
          userImage: 'detail-user.jpg'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // 正しいドキュメントパスでdocが呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(
        expect.any(Object),
        `diaries/${testDiaryId}`
      );
      expect(mockGetDoc).toHaveBeenCalledWith(mockDiaryRef);
    });
  });

  describe('データ型のテスト', () => {
    test('様々な型のデータが正しく処理される', async () => {
      const testUserId = 'test-user-types';
      const testDiaryId = 'test-diary-types';
      const testDate = dayjs('2023-08-10');

      const mockDiaryRef = { doc: `diaries/${testDiaryId}` };
      const mockDiarySnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => ({
          diaryText: '型テスト日記\n改行も含む\n複数行テキスト',
          diaryDate: testDate,
          feeling: 'neutral',
          diaryImage: 'https://example.com/image.jpg',
          updatedAt: {
            toDate: () => new Date('2023-08-10T14:22:33Z')
          },
          userId: testUserId,
          userName: '型テストユーザー@example.com',
          userImage: 'https://example.com/user-avatar.png'
        })
      };

      (mockDoc as any).mockReturnValue(mockDiaryRef);
      (mockGetDoc as any).mockResolvedValue(mockDiarySnap);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      const expectedDiary = {
        id: testDiaryId,
        diaryText: '型テスト日記\n改行も含む\n複数行テキスト',
        diaryDate: testDate,
        feeling: 'neutral',
        diaryImage: 'https://example.com/image.jpg',
        updatedAt: new Date('2023-08-10T14:22:33Z'),
        userId: testUserId,
        userName: '型テストユーザー@example.com',
        userImage: 'https://example.com/user-avatar.png'
      };

      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith(expectedDiary);
    });
  });
});