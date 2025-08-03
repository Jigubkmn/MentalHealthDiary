/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { collection, Timestamp, addDoc, setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import createDiary from '../createDiary';
import checkExistingDiary from '../../checkExistingDiary';
import fetchFeelingScoreForLast7Days from '../fetchFeelingScoreForLast7Days';
import formatWeekData from '../../../../../actions/formatWeekData';
import dayjs from 'dayjs';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../checkExistingDiary');
jest.mock('../fetchFeelingScoreForLast7Days');
jest.mock('../../../../../actions/formatWeekData');

jest.mock('../../../../../../config', () => ({
  db: {
    // モックのFirestoreデータベース
  },
}));

jest.mock('../../../../../constants/feelings', () => [
  { name: 'excellent', score: 10 },
  { name: 'good', score: 8 },
  { name: 'neutral', score: 5 },
  { name: 'bad', score: 3 },
  { name: 'terrible', score: 1 },
]);

describe('createDiary', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;
  let mockAddDoc: jest.MockedFunction<typeof addDoc>;
  let mockSetDoc: jest.MockedFunction<typeof setDoc>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockCheckExistingDiary: jest.MockedFunction<typeof checkExistingDiary>;
  let mockFetchFeelingScoreForLast7Days: jest.MockedFunction<typeof fetchFeelingScoreForLast7Days>;
  let mockFormatWeekData: jest.MockedFunction<typeof formatWeekData>;
  let mockRouter: { push: jest.MockedFunction<any> };
  let mockSetDiaryText: jest.MockedFunction<(text: string) => void>;
  let mockSetSelectedFeeling: jest.MockedFunction<(feeling: string | null) => void>;
  let mockSetSelectedImage: jest.MockedFunction<(image: string | null) => void>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;
    mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
    mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockCheckExistingDiary = checkExistingDiary as jest.MockedFunction<typeof checkExistingDiary>;
    mockFetchFeelingScoreForLast7Days = fetchFeelingScoreForLast7Days as jest.MockedFunction<typeof fetchFeelingScoreForLast7Days>;
    mockFormatWeekData = formatWeekData as jest.MockedFunction<typeof formatWeekData>;

    // コールバック関数とルーターのモック
    mockSetDiaryText = jest.fn();
    mockSetSelectedFeeling = jest.fn();
    mockSetSelectedImage = jest.fn();
    mockRouter = { push: jest.fn() };

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockUseRouter as any).mockReturnValue(mockRouter);
    (mockTimestampFromDate as any).mockImplementation((date: Date) => ({ fromDate: date }));
    (mockCollection as any).mockReturnValue({ collection: 'diaries' });
    (mockDoc as any).mockReturnValue({ doc: 'feelingScores' });
    (mockCheckExistingDiary as any).mockResolvedValue(false);
    (mockFormatWeekData as any).mockReturnValue('10月15日(日)');
    (mockFetchFeelingScoreForLast7Days as any).mockResolvedValue(undefined);
  });

  describe('正常ケースのテスト', () => {
    test('有効なデータで日記が正常に作成される', async () => {
      const testParams = {
        selectedFeeling: 'good',
        selectedImage: 'test-image.jpg',
        date: dayjs('2023-10-15'),
        diaryText: 'テスト日記の内容です。',
        userName: 'テストユーザー',
        userImage: 'user-image.jpg',
        userId: 'test-user-123'
      };
      // addDocが返すドキュメント参照をモック
      const mockDiaryDocRef = { id: 'diary-doc-id-123' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        testParams.selectedFeeling,
        testParams.selectedImage,
        testParams.date,
        testParams.diaryText,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testParams.userName,
        testParams.userImage,
        testParams.userId
      );
      // 既存日記チェックが実行される
      expect(mockCheckExistingDiary).toHaveBeenCalledWith(testParams.userId, testParams.date);
      // 日記データの保存が正しく実行される
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'diaries');
      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'diaries' },
        {
          diaryText: testParams.diaryText,
          diaryDate: { fromDate: testParams.date.toDate() },
          feeling: testParams.selectedFeeling,
          diaryImage: testParams.selectedImage,
          userName: testParams.userName,
          userImage: testParams.userImage,
          userId: testParams.userId,
          updatedAt: { fromDate: expect.any(Date) }
        }
      );
      // 感情スコアデータの保存が正しく実行される
      expect(mockDoc).toHaveBeenCalledWith(
        expect.any(Object),
        `users/${testParams.userId}/feelingScores`,
        mockDiaryDocRef.id
      );
      expect(mockSetDoc).toHaveBeenCalledWith(
        { doc: 'feelingScores' },
        {
          feelingScore: 8, // 'good'のスコア
          diaryDate: { fromDate: testParams.date.toDate() },
          updatedAt: { fromDate: expect.any(Date) }
        }
      );
      // 状態がリセットされる
      expect(mockSetDiaryText).toHaveBeenCalledWith('');
      expect(mockSetSelectedFeeling).toHaveBeenCalledWith(null);
      expect(mockSetSelectedImage).toHaveBeenCalledWith(null);
      // 感情スコア取得処理が実行される
      expect(mockFetchFeelingScoreForLast7Days).toHaveBeenCalledWith(
        testParams.userId,
        { fromDate: testParams.date.toDate() }
      );
      // ナビゲーションが実行される
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      // エラーアラートは表示されない
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('画像なしで日記が正常に作成される', async () => {
      const testParams = {
        selectedFeeling: 'excellent',
        selectedImage: null,
        date: dayjs('2023-11-01'),
        diaryText: '画像なしの日記です。',
        userName: 'ユーザー2',
        userImage: 'user2.jpg',
        userId: 'user-2'
      };
      const mockDiaryDocRef = { id: 'diary-no-image' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        testParams.selectedFeeling,
        testParams.selectedImage,
        testParams.date,
        testParams.diaryText,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testParams.userName,
        testParams.userImage,
        testParams.userId
      );
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          diaryImage: null,
          feeling: 'excellent'
        })
      );
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          feelingScore: 10 // 'excellent'のスコア
        })
      );
    });

    test('ユーザー情報がnullでも正常に処理される', async () => {
      const testParams = {
        selectedFeeling: 'neutral',
        selectedImage: 'test.jpg',
        date: dayjs('2023-12-01'),
        diaryText: 'ユーザー情報なしのテスト',
        userName: null,
        userImage: null,
        userId: 'user-null-info'
      };
      const mockDiaryDocRef = { id: 'diary-null-user-info' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        testParams.selectedFeeling,
        testParams.selectedImage,
        testParams.date,
        testParams.diaryText,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testParams.userName,
        testParams.userImage,
        testParams.userId
      );
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userName: null,
          userImage: null
        })
      );
    });
  });

  describe('バリデーションのテスト', () => {
    test('userIdが未定義の場合、早期リターンされる', async () => {
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        'テスト日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        undefined
      );
      // Firestoreの処理は実行されない
      expect(mockCheckExistingDiary).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('selectedFeelingが未選択の場合、アラートが表示される', async () => {
      await createDiary(
        null,
        'image.jpg',
        dayjs('2023-10-15'),
        'テスト日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(mockAlert).toHaveBeenCalledWith('現在の感情を選択してください');
      expect(mockCheckExistingDiary).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    test('diaryTextが空文字列の場合、アラートが表示される', async () => {
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        '',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockCheckExistingDiary).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    test('diaryTextが空白のみの場合、アラートが表示される', async () => {
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        '   \n\t   ',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockCheckExistingDiary).not.toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    test('同じ日付の日記が既に存在する場合、アラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');
      (mockCheckExistingDiary as any).mockResolvedValue(true);
      (mockFormatWeekData as any).mockReturnValue('10月15日(日)');
      await createDiary(
        'good',
        'image.jpg',
        testDate,
        'テスト日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(mockCheckExistingDiary).toHaveBeenCalledWith('user-id', testDate);
      expect(mockFormatWeekData).toHaveBeenCalledWith(testDate);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '10月15日(日)の日記は既に存在します。');
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  describe('感情スコアのテスト', () => {
    test('各感情に対応する正しいスコアが保存される', async () => {
      const feelingTestCases = [
        { feeling: 'excellent', expectedScore: 10 },
        { feeling: 'good', expectedScore: 8 },
        { feeling: 'neutral', expectedScore: 5 },
        { feeling: 'bad', expectedScore: 3 },
        { feeling: 'terrible', expectedScore: 1 }
      ];
      for (const testCase of feelingTestCases) {
        jest.clearAllMocks();
        (mockUseRouter as any).mockReturnValue(mockRouter);
        (mockCheckExistingDiary as any).mockResolvedValue(false);
        const mockDiaryDocRef = { id: `diary-${testCase.feeling}` };
        (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
        await createDiary(
          testCase.feeling,
          'image.jpg',
          dayjs('2023-10-15'),
          `${testCase.feeling}の日記`,
          mockSetDiaryText,
          mockSetSelectedFeeling,
          mockSetSelectedImage,
          'ユーザー',
          'user.jpg',
          'user-id'
        );
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            feelingScore: testCase.expectedScore
          })
        );
      }
    });

    test('存在しない感情の場合、undefinedのスコアが保存される', async () => {
      const mockDiaryDocRef = { id: 'diary-unknown' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        'unknown-feeling',
        'image.jpg',
        dayjs('2023-10-15'),
        '未知の感情の日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          feelingScore: undefined
        })
      );
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('addDocでエラーが発生した場合、エラーアラートが表示される', async () => {
      const mockError = new Error('Firestore addDoc error');
      (mockAddDoc as any).mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        'エラーテスト日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の保存に失敗しました');
      // 状態リセットやナビゲーションは実行されない
      expect(mockSetDiaryText).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('setDocでエラーが発生した場合、エラーアラートが表示される', async () => {
      const mockDiaryDocRef = { id: 'diary-setdoc-error' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      const mockError = new Error('Firestore setDoc error');
      (mockSetDoc as any).mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        'setDocエラーテスト',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の保存に失敗しました');
      consoleSpy.mockRestore();
    });

    test('checkExistingDiaryでエラーが発生した場合、処理が中断される', async () => {
      const mockError = new Error('checkExistingDiary error');
      (mockCheckExistingDiary as any).mockRejectedValue(mockError);
      // checkExistingDiaryはtry-catchの外で呼ばれるため、エラーはそのまま伝播する
      await expect(createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        'チェックエラーテスト',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      )).rejects.toThrow('checkExistingDiary error');
      // Firestoreの処理は実行されない
      expect(mockAddDoc).not.toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    test('fetchFeelingScoreForLast7Daysでエラーが発生しても処理は継続される', async () => {
      const mockDiaryDocRef = { id: 'diary-fetch-error' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      (mockSetDoc as any).mockResolvedValue(undefined);
      const mockError = new Error('fetchFeelingScoreForLast7Days error');
      (mockFetchFeelingScoreForLast7Days as any).mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await createDiary(
        'good',
        'image.jpg',
        dayjs('2023-10-15'),
        'フェッチエラーテスト',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      // エラーログとアラートが表示される
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の保存に失敗しました');
      consoleSpy.mockRestore();
    });
  });

  describe('Timestampの処理テスト', () => {
    test('日付とupdatedAtが正しくTimestamp形式で保存される', async () => {
      const testDate = dayjs('2023-07-20T15:30:00');
      const mockDiaryDocRef = { id: 'diary-timestamp-test' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        'neutral',
        'timestamp-test.jpg',
        testDate,
        'Timestampテスト日記',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'ユーザー',
        'user.jpg',
        'user-id'
      );
      // diaryDateとupdatedAtの両方でTimestamp.fromDateが呼ばれる
      expect(mockTimestampFromDate).toHaveBeenCalledWith(testDate.toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expect.any(Date));
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(5); // addDoc用2回 + setDoc用2回 + fetchFeelingScoreForLast7Days用1回
    });
  });

  describe('フロー全体のテスト', () => {
    test('正常フローでのすべての処理順序が正しい', async () => {
      const testParams = {
        selectedFeeling: 'good',
        selectedImage: 'flow-test.jpg',
        date: dayjs('2023-09-10'),
        diaryText: 'フロー全体のテスト日記',
        userName: 'フローユーザー',
        userImage: 'flow-user.jpg',
        userId: 'flow-test-user'
      };
      const mockDiaryDocRef = { id: 'diary-flow-test' };
      (mockAddDoc as any).mockResolvedValue(mockDiaryDocRef);
      await createDiary(
        testParams.selectedFeeling,
        testParams.selectedImage,
        testParams.date,
        testParams.diaryText,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testParams.userName,
        testParams.userImage,
        testParams.userId
      );
      // 実行順序の確認
      const allCalls = [
        mockCheckExistingDiary.mock.invocationCallOrder[0],
        mockAddDoc.mock.invocationCallOrder[0],
        mockSetDoc.mock.invocationCallOrder[0],
        mockSetDiaryText.mock.invocationCallOrder[0],
        mockSetSelectedFeeling.mock.invocationCallOrder[0],
        mockSetSelectedImage.mock.invocationCallOrder[0],
        mockFetchFeelingScoreForLast7Days.mock.invocationCallOrder[0],
        mockRouter.push.mock.invocationCallOrder[0]
      ];
      // 順序が正しいことを確認
      for (let i = 1; i < allCalls.length; i++) {
        expect(allCalls[i]).toBeGreaterThan(allCalls[i - 1]);
      }
    });
  });
});