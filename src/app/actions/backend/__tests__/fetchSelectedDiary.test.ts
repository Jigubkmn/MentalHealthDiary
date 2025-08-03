/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, getDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import fetchSelectedDiary from '../fetchSelectedDiary';
import { DiaryType } from '../../../../../type/diary';

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

// dayjsをモック
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return jest.fn().mockImplementation((date?: any) => {
    if (date && typeof date.toDate === 'function') {
      return originalDayjs(date.toDate());
    }
    return originalDayjs(date);
  });
});

describe('fetchSelectedDiary', () => {
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockGetDoc: jest.MockedFunction<typeof getDoc>;
  let mockSetSelectedDiaryInfo: jest.MockedFunction<(diary: DiaryType) => void>;
  let mockDayjs: jest.MockedFunction<typeof dayjs>;

  beforeEach(() => {
    // モック関数を取得
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
    mockSetSelectedDiaryInfo = jest.fn();
    mockDayjs = dayjs as jest.MockedFunction<typeof dayjs>;

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ doc: 'mock-doc-ref' });
  });

  describe('正常ケースのテスト', () => {
    test('日記データが正常に取得・整形される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-456';
      
      // Firestoreから返されるモックデータ
      const mockDiaryDate = new Date('2024-01-15T10:30:00Z');
      const mockUpdatedAt = new Date('2024-01-15T12:00:00Z');
      
      const mockFirestoreData = {
        diaryText: 'テスト日記の内容です。',
        diaryDate: {
          toDate: () => mockDiaryDate
        },
        feeling: 'excellent',
        diaryImage: 'https://example.com/image.jpg',
        updatedAt: {
          toDate: () => mockUpdatedAt
        },
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'https://example.com/user.jpg'
      };

      const mockDocSnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => mockFirestoreData
      };

      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      // dayjsのモック設定
      const mockDayjsInstance = {
        format: jest.fn(),
        toDate: jest.fn(),
        valueOf: jest.fn()
      };
      mockDayjs.mockReturnValue(mockDayjsInstance as any);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数が正しく呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalled();

      // dayjsが正しく呼ばれることを確認
      expect(mockDayjs).toHaveBeenCalledWith(mockDiaryDate);

      // setSelectedDiaryInfoが正しいデータで呼ばれることを確認
      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith({
        id: testDiaryId,
        diaryText: 'テスト日記の内容です。',
        diaryDate: mockDayjsInstance,
        feeling: 'excellent',
        diaryImage: 'https://example.com/image.jpg',
        updatedAt: mockUpdatedAt,
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'https://example.com/user.jpg'
      });
    });

    test('feelingがnullの場合、nullが設定される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-no-feeling';

      const mockDiaryDate = new Date('2024-01-15T10:30:00Z');
      const mockUpdatedAt = new Date('2024-01-15T12:00:00Z');

      const mockFirestoreData = {
        diaryText: 'feelingがない日記です。',
        diaryDate: {
          toDate: () => mockDiaryDate
        },
        feeling: null, // feelingがnull
        diaryImage: null,
        updatedAt: {
          toDate: () => mockUpdatedAt
        },
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'https://example.com/user.jpg'
      };

      const mockDocSnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => mockFirestoreData
      };

      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const mockDayjsInstance = { format: jest.fn() };
      mockDayjs.mockReturnValue(mockDayjsInstance as any);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          feeling: null
        })
      );
    });

    test('feelingが未定義の場合、nullが設定される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-undefined-feeling';

      const mockDiaryDate = new Date('2024-01-15T10:30:00Z');
      const mockUpdatedAt = new Date('2024-01-15T12:00:00Z');

      const mockFirestoreData = {
        diaryText: 'feelingが未定義の日記です。',
        diaryDate: {
          toDate: () => mockDiaryDate
        },
        // feelingプロパティなし
        diaryImage: null,
        updatedAt: {
          toDate: () => mockUpdatedAt
        },
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'https://example.com/user.jpg'
      };

      const mockDocSnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => mockFirestoreData
      };

      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const mockDayjsInstance = { format: jest.fn() };
      mockDayjs.mockReturnValue(mockDayjsInstance as any);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          feeling: null
        })
      );
    });
  });

  describe('データが存在しない場合のテスト', () => {
    test('日記ドキュメントが存在しない場合、ログが出力されsetSelectedDiaryInfoは呼ばれない', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'non-existent-diary';

      const mockDocSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestoreの関数は呼ばれる
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalled();

      // ログが出力される
      expect(consoleSpy).toHaveBeenCalledWith('対象データがありません。');

      // setSelectedDiaryInfoは呼ばれない
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdがnullの場合、早期リターンしFirestore操作は実行されない', async () => {
      const testDiaryId = 'test-diary-456';

      await fetchSelectedDiary({
        userId: null as any,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestore操作は実行されない
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();
    });

    test('diaryIdがnullの場合、早期リターンしFirestore操作は実行されない', async () => {
      const testUserId = 'test-user-123';

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: null as any,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Firestore操作は実行されない
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();
    });

    test('userIdが未定義の場合、Firestore操作は実行される', async () => {
      const testDiaryId = 'test-diary-456';

      const mockDocSnap = {
        exists: () => false
      };
      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: undefined,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // undefinedはnullチェックを通るため、Firestore操作は実行される
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('diaryIdが未定義の場合、Firestore操作は実行される', async () => {
      const testUserId = 'test-user-123';

      const mockDocSnap = {
        exists: () => false
      };
      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: undefined,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

             // undefinedはnullチェックを通るため、Firestore操作は実行される
       expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockGetDoc).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、エラーログが出力される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-error';
      const mockError = new Error('Firestore connection failed');

      (mockGetDoc as any).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // エラーログが出力される
      expect(consoleSpy).toHaveBeenCalledWith('対象データの取得に失敗しました。', mockError);

      // setSelectedDiaryInfoは呼ばれない
      expect(mockSetSelectedDiaryInfo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('docの作成時にエラーが発生した場合、エラーログが出力される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-doc-error';
      const mockError = new Error('Document reference creation failed');

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
  });

  describe('データ整合性のテスト', () => {
    test('特殊文字を含むdiaryIdでも正常に処理される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'diary@with-special_chars.123';

      const mockDocSnap = {
        exists: () => false
      };
      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);

      consoleSpy.mockRestore();
    });

    test('長いIDでも正常に処理される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'very-long-diary-id-with-many-characters-1234567890-abcdefghijklmnopqrstuvwxyz';

      const mockDocSnap = {
        exists: () => false
      };
      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);

      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいドキュメントパスでクエリが構築される', async () => {
      const testUserId = 'specific-test-user';
      const testDiaryId = 'specific-test-diary';

      const mockDocSnap = {
        exists: () => false
      };
      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

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
      expect(mockGetDoc).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('日付処理のテスト', () => {
    test('Timestamp型のdiaryDateとupdatedAtが正しく変換される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryId = 'test-diary-date';

      const mockDiaryDate = new Date('2024-01-15T10:30:00Z');
      const mockUpdatedAt = new Date('2024-01-15T12:00:00Z');

      const mockFirestoreData = {
        diaryText: '日付テスト日記',
        diaryDate: {
          toDate: jest.fn().mockReturnValue(mockDiaryDate)
        },
        feeling: 'good',
        diaryImage: null,
        updatedAt: {
          toDate: jest.fn().mockReturnValue(mockUpdatedAt)
        },
        userId: testUserId,
        userName: 'テストユーザー',
        userImage: 'https://example.com/user.jpg'
      };

      const mockDocSnap = {
        exists: () => true,
        id: testDiaryId,
        data: () => mockFirestoreData
      };

      (mockGetDoc as any).mockResolvedValue(mockDocSnap);

      const mockDayjsInstance = { format: jest.fn() };
      mockDayjs.mockReturnValue(mockDayjsInstance as any);

      await fetchSelectedDiary({
        userId: testUserId,
        diaryId: testDiaryId,
        setSelectedDiaryInfo: mockSetSelectedDiaryInfo
      });

      // Timestampのtodateメソッドが呼ばれることを確認
      expect(mockFirestoreData.diaryDate.toDate).toHaveBeenCalled();
      expect(mockFirestoreData.updatedAt.toDate).toHaveBeenCalled();

      // dayjsが正しい日付で呼ばれることを確認
      expect(mockDayjs).toHaveBeenCalledWith(mockDiaryDate);

      // 結果のupdatedAtが正しい日付であることを確認
      expect(mockSetSelectedDiaryInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: mockUpdatedAt
        })
      );
    });
  });
});