/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import updateDiary from '../updateDiary';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

jest.mock('../../../../../constants/feelings', () => [
  { name: 'とても良い', score: 10 },
  { name: '良い', score: 5 },
  { name: '普通', score: 0 },
  { name: '悪い', score: -5 },
  { name: 'とても悪い', score: -10 },
]);

describe('updateDiary', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockRouter: { push: jest.MockedFunction<any> };
  let mockSetDiaryText: jest.MockedFunction<any>;
  let mockSetSelectedFeeling: jest.MockedFunction<any>;
  let mockSetSelectedImage: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

    // ルーターとstate setter関数のモック
    mockRouter = { push: jest.fn() };
    mockSetDiaryText = jest.fn();
    mockSetSelectedFeeling = jest.fn();
    mockSetSelectedImage = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockUseRouter as any).mockReturnValue(mockRouter);
    (mockDoc as any).mockReturnValue({ ref: 'mock-doc-ref' });
    (mockUpdateDoc as any).mockResolvedValue(undefined);
    (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
  });

  describe('入力バリデーションのテスト', () => {
    test('userIdがnullの場合、処理が中断される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        'テスト日記',
        'diary-id-123',
        testDate,
        'とても良い',
        'image-url.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        null as any
      );

      // Firestore操作が実行されないことを確認
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('selectedFeelingがnullの場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        'テスト日記',
        'diary-id-123',
        testDate,
        null,
        'image-url.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(mockAlert).toHaveBeenCalledWith('現在の感情を選択してください');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('diaryTextが空文字列の場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        '',
        'diary-id-123',
        testDate,
        'とても良い',
        'image-url.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('diaryTextが空白のみの場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        '   \n\t  ',
        'diary-id-123',
        testDate,
        'とても良い',
        'image-url.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('正常更新処理のテスト', () => {
    test('すべての入力が正常な場合、日記が更新される', async () => {
      const testDate = dayjs('2023-10-15T12:00:00');
      const testDiaryText = '今日は良い一日でした。';
      const testDiaryId = 'diary-id-123';
      const testUserId = 'user-123';
      const testSelectedFeeling = 'とても良い';
      const testSelectedImage = 'image-url.jpg';

      await updateDiary(
        testDiaryText,
        testDiaryId,
        testDate,
        testSelectedFeeling,
        testSelectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testUserId
      );

      // 感情スコアの取得確認（とても良い = 10）
      // diariesコレクションの更新確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { ref: 'mock-doc-ref' }, {
        diaryText: testDiaryText,
        diaryDate: { timestamp: 'mock-timestamp' },
        feeling: testSelectedFeeling,
        diaryImage: testSelectedImage,
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      // feelingScoresコレクションの更新確認
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${testUserId}/feelingScores/${testDiaryId}`);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { ref: 'mock-doc-ref' }, {
        feelingScore: 10,
        diaryDate: { timestamp: 'mock-timestamp' },
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      // Timestampの変換確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(testDate.toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expect.any(Date));

      // 成功アラートの表示確認
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');

      // 状態のリセット確認
      expect(mockSetDiaryText).toHaveBeenCalledWith('');
      expect(mockSetSelectedFeeling).toHaveBeenCalledWith(null);
      expect(mockSetSelectedImage).toHaveBeenCalledWith(null);

      // ナビゲーション確認
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
    });

    test('selectedImageがnullでも正常に更新される', async () => {
      const testDate = dayjs('2023-10-15T12:00:00');

      await updateDiary(
        '画像なしの日記です。',
        'diary-id-456',
        testDate,
        '普通',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-456'
      );

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { ref: 'mock-doc-ref' }, {
        diaryText: '画像なしの日記です。',
        diaryDate: { timestamp: 'mock-timestamp' },
        feeling: '普通',
        diaryImage: null,
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { ref: 'mock-doc-ref' }, {
        feelingScore: 0, // 普通 = 0
        diaryDate: { timestamp: 'mock-timestamp' },
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('userIdがundefinedでも正常に処理される', async () => {
      const testDate = dayjs('2023-10-15T12:00:00');

      await updateDiary(
        'ユーザーIDなしの日記',
        'diary-id-789',
        testDate,
        '良い',
        'image.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        undefined
      );

      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), 'users/undefined/feelingScores/diary-id-789');
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });
  });

  describe('feelingScore取得のテスト', () => {
    test('各感情に対応する正しいスコアが設定される', async () => {
      const testDate = dayjs('2023-10-15');
      const testCases = [
        { feeling: 'とても良い', expectedScore: 10 },
        { feeling: '良い', expectedScore: 5 },
        { feeling: '普通', expectedScore: 0 },
        { feeling: '悪い', expectedScore: -5 },
        { feeling: 'とても悪い', expectedScore: -10 },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        await updateDiary(
          'テスト日記',
          'diary-id',
          testDate,
          testCase.feeling,
          null,
          mockSetDiaryText,
          mockSetSelectedFeeling,
          mockSetSelectedImage,
          'user-123'
        );

        expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { ref: 'mock-doc-ref' }, {
          feelingScore: testCase.expectedScore,
          diaryDate: { timestamp: 'mock-timestamp' },
          updatedAt: { timestamp: 'mock-timestamp' }
        });
      }
    });

    test('存在しない感情名の場合、undefinedが設定される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        'テスト日記',
        'diary-id',
        testDate,
        '存在しない感情',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, { ref: 'mock-doc-ref' }, {
        feelingScore: undefined,
        diaryDate: { timestamp: 'mock-timestamp' },
        updatedAt: { timestamp: 'mock-timestamp' }
      });
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('diariesコレクションの更新でエラーが発生した場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Firestore diaries update error');

      (mockUpdateDoc as any).mockRejectedValueOnce(mockError);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        'テスト日記',
        'diary-id-error',
        testDate,
        'とても良い',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');
      
      // 状態はリセットされない
      expect(mockSetDiaryText).not.toHaveBeenCalled();
      expect(mockSetSelectedFeeling).not.toHaveBeenCalled();
      expect(mockSetSelectedImage).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('feelingScoresコレクションの更新でエラーが発生した場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Firestore feelingScores update error');

      (mockUpdateDoc as any)
        .mockResolvedValueOnce(undefined) // 最初の呼び出し（diaries）は成功
        .mockRejectedValueOnce(mockError); // 2回目の呼び出し（feelingScores）は失敗

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        'テスト日記',
        'diary-id-error2',
        testDate,
        '良い',
        'image.jpg',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');

      consoleSpy.mockRestore();
    });

    test('docの作成でエラーが発生した場合、エラーアラートが表示される', async () => {
      const testDate = dayjs('2023-10-15');
      const mockError = new Error('Firestore doc creation error');

      (mockDoc as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        'テスト日記',
        'diary-id-doc-error',
        testDate,
        '悪い',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-123'
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');

      consoleSpy.mockRestore();
    });
  });

  describe('タイムスタンプ処理のテスト', () => {
    test('日付とupdatedAtが正しくTimestamp形式で保存される', async () => {
      const testDate = dayjs('2023-10-15T15:30:45');
      const fixedCurrentTime = new Date('2023-10-15T16:00:00Z');
      
      // 現在時刻をモック
      jest.spyOn(global, 'Date').mockImplementation((() => fixedCurrentTime) as any);

      await updateDiary(
        'タイムスタンプテスト',
        'diary-timestamp',
        testDate,
        'とても良い',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-timestamp'
      );

      // Timestamp.fromDateが正確に呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(testDate.toDate());
      expect(mockTimestampFromDate).toHaveBeenCalledWith(fixedCurrentTime);
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(4); // diaries 2回 + feelingScores 2回

      (global.Date as any).mockRestore();
    });
  });

  describe('境界値とエッジケースのテスト', () => {
    test('非常に長いdiaryTextでも正常に処理される', async () => {
      const longText = 'あ'.repeat(10000);
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        longText,
        'diary-long-text',
        testDate,
        '普通',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-long'
      );

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { ref: 'mock-doc-ref' }, {
        diaryText: longText,
        diaryDate: { timestamp: 'mock-timestamp' },
        feeling: '普通',
        diaryImage: null,
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('特殊文字を含むdiaryTextでも正常に処理される', async () => {
      const specialText = '特殊文字テスト: !@#$%^&*()_+-=[]{}|;:,.<>? 絵文字: 😀😃😄 日本語: こんにちは';
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        specialText,
        'diary-special',
        testDate,
        'とても悪い',
        'special-image.png',
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        'user-special'
      );

      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, { ref: 'mock-doc-ref' }, {
        diaryText: specialText,
        diaryDate: { timestamp: 'mock-timestamp' },
        feeling: 'とても悪い',
        diaryImage: 'special-image.png',
        updatedAt: { timestamp: 'mock-timestamp' }
      });

      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('空文字列のuserIdでも処理される', async () => {
      const testDate = dayjs('2023-10-15');

      await updateDiary(
        'ユーザーIDが空文字',
        'diary-empty-user',
        testDate,
        '良い',
        null,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        ''
      );

      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), 'users//feelingScores/diary-empty-user');
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });
  });
});