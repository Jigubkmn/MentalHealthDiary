/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import updateDiary from '../updateDiary';
import feelings from '../../../../../constants/feelings';

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
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockUpdateDoc: jest.MockedFunction<typeof updateDoc>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockRouter: { push: jest.MockedFunction<any> };
  
  // モック状態管理関数
  let mockSetDiaryText: jest.MockedFunction<any>;
  let mockSetSelectedFeeling: jest.MockedFunction<any>;
  let mockSetSelectedImage: jest.MockedFunction<any>;

  const defaultParams = {
    diaryText: '今日は良い一日でした。',
    diaryId: 'diary-123',
    date: dayjs('2023-10-15'),
    selectedFeeling: 'とても良い',
    selectedImage: 'https://example.com/image.jpg',
    userId: 'user-123',
  };

  beforeEach(() => {
    // モック関数を取得
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

    // ルーターのモック
    mockRouter = { push: jest.fn() };

    // 状態管理関数のモック
    mockSetDiaryText = jest.fn();
    mockSetSelectedFeeling = jest.fn();
    mockSetSelectedImage = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
    (mockUpdateDoc as any).mockResolvedValue(undefined);
    (mockTimestampFromDate as any).mockReturnValue({ seconds: 1697356800, nanoseconds: 0 });
    (mockUseRouter as any).mockReturnValue(mockRouter);
  });

  describe('正常ケースのテスト', () => {
    test('有効なデータで日記が正常に更新される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // 日記ドキュメントの更新が呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${defaultParams.diaryId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        {
          diaryText: defaultParams.diaryText,
          diaryDate: { seconds: 1697356800, nanoseconds: 0 },
          feeling: defaultParams.selectedFeeling,
          diaryImage: defaultParams.selectedImage,
          updatedAt: { seconds: 1697356800, nanoseconds: 0 }
        }
      );

      // 感情スコアドキュメントの更新が呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${defaultParams.userId}/feelingScores/${defaultParams.diaryId}`);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        {
          feelingScore: 10, // 'とても良い'のスコア
          diaryDate: { seconds: 1697356800, nanoseconds: 0 },
          updatedAt: { seconds: 1697356800, nanoseconds: 0 }
        }
      );

      // Timestampが正しく呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledTimes(4);

      // 成功アラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');

      // 状態がリセットされることを確認
      expect(mockSetDiaryText).toHaveBeenCalledWith('');
      expect(mockSetSelectedFeeling).toHaveBeenCalledWith(null);
      expect(mockSetSelectedImage).toHaveBeenCalledWith(null);

      // ナビゲーションが実行されることを確認
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
    });

    test('画像なしでも正常に更新される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        null, // 画像なし
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // diaryImageにnullが設定されることを確認
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        expect.objectContaining({
          diaryImage: null
        })
      );

      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('異なる感情スコアが正しく反映される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        'とても悪い', // スコア-10
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // 感情スコア-10が設定されることを確認
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        expect.objectContaining({
          feelingScore: -10
        })
      );
    });
  });

  describe('バリデーションエラーのテスト', () => {
    test('userIdがnullの場合、早期リターンされる', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        null // userIdがnull
      );

      // Firestoreの操作が呼ばれないことを確認
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('selectedFeelingが未選択の場合、アラートが表示される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        null, // 感情未選択
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // バリデーションエラーのアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith('現在の感情を選択してください');

      // Firestoreの操作が呼ばれないことを確認
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    test('diaryTextが空文字列の場合、アラートが表示される', async () => {
      await updateDiary(
        '', // 空文字列
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    test('diaryTextがスペースのみの場合、アラートが表示される', async () => {
      await updateDiary(
        '   ', // スペースのみ
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      expect(mockAlert).toHaveBeenCalledWith('日記内容を入力してください');
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    test('存在しない感情が選択された場合でも処理が継続される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        '存在しない感情', // 定義されていない感情
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // undefinedのスコアで更新されることを確認
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        expect.objectContaining({
          feelingScore: undefined
        })
      );

      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('日記ドキュメントの更新でエラーが発生した場合、エラーアラートが表示される', async () => {
      const mockError = new Error('Firestore update error');
      (mockUpdateDoc as any).mockRejectedValueOnce(mockError);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // エラーログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);

      // エラーアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');

      // 状態リセットとナビゲーションが実行されないことを確認
      expect(mockSetDiaryText).not.toHaveBeenCalled();
      expect(mockSetSelectedFeeling).not.toHaveBeenCalled();
      expect(mockSetSelectedImage).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('感情スコアドキュメントの更新でエラーが発生した場合、エラーアラートが表示される', async () => {
      const mockError = new Error('FeelingScore update error');
      (mockUpdateDoc as any)
        .mockResolvedValueOnce(undefined) // 最初の更新は成功
        .mockRejectedValueOnce(mockError); // 2回目の更新で失敗

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');
      expect(mockSetDiaryText).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('Timestampの作成でエラーが発生した場合、エラーアラートが表示される', async () => {
      const mockError = new Error('Timestamp creation error');
      (mockTimestampFromDate as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('日記の更新に失敗しました');

      consoleSpy.mockRestore();
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdがundefinedでも正常に処理される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        undefined // userIdがundefined
      );

      // undefinedのuserIdでFirestore操作が実行されることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/undefined/feelingScores/${defaultParams.diaryId}`);
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('異なる日付でも正常に処理される', async () => {
      const differentDate = dayjs('2024-01-01');

      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        differentDate,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // 異なる日付でTimestamp.fromDateが呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(differentDate.toDate());
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });

    test('特殊文字を含むテキストでも正常に処理される', async () => {
      const specialText = 'こんにちは！😊\n今日は\tとても良い日でした。\n"引用符"と\'アポストロフィ\'も含む。';

      await updateDiary(
        specialText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-ref' },
        expect.objectContaining({
          diaryText: specialText
        })
      );
      expect(mockAlert).toHaveBeenCalledWith('日記を更新しました');
    });
  });

  describe('Firestoreドキュメント参照のテスト', () => {
    test('正しいドキュメントパスでFirestore操作が実行される', async () => {
      const testDiaryId = 'custom-diary-456';
      const testUserId = 'custom-user-789';

      await updateDiary(
        defaultParams.diaryText,
        testDiaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        testUserId
      );

      // 正しいドキュメントパスでdocが呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores/${testDiaryId}`);

      // updateDocが2回呼ばれることを確認
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('感情スコアマッピングのテスト', () => {
    test('各感情タイプが正しいスコアにマッピングされる', async () => {
      const feelingTests = [
        { feeling: 'とても良い', expectedScore: 10 },
        { feeling: '良い', expectedScore: 5 },
        { feeling: '普通', expectedScore: 0 },
        { feeling: '悪い', expectedScore: -5 },
        { feeling: 'とても悪い', expectedScore: -10 },
      ];

      for (const { feeling, expectedScore } of feelingTests) {
        // モックをリセット
        jest.clearAllMocks();
        (mockDoc as any).mockReturnValue({ id: 'mock-doc-ref' });
        (mockUpdateDoc as any).mockResolvedValue(undefined);
        (mockTimestampFromDate as any).mockReturnValue({ seconds: 1697356800, nanoseconds: 0 });
        (mockUseRouter as any).mockReturnValue(mockRouter);

        await updateDiary(
          defaultParams.diaryText,
          defaultParams.diaryId,
          defaultParams.date,
          feeling,
          defaultParams.selectedImage,
          mockSetDiaryText,
          mockSetSelectedFeeling,
          mockSetSelectedImage,
          defaultParams.userId
        );

        expect(mockUpdateDoc).toHaveBeenCalledWith(
          { id: 'mock-doc-ref' },
          expect.objectContaining({
            feelingScore: expectedScore
          })
        );
      }
    });
  });

  describe('正常フローの処理順序テスト', () => {
    test('すべての処理が正しい順序で実行される', async () => {
      await updateDiary(
        defaultParams.diaryText,
        defaultParams.diaryId,
        defaultParams.date,
        defaultParams.selectedFeeling,
        defaultParams.selectedImage,
        mockSetDiaryText,
        mockSetSelectedFeeling,
        mockSetSelectedImage,
        defaultParams.userId
      );

      // 呼び出し順序を確認
      const allCalls = [
        ...mockDoc.mock.calls,
        ...mockUpdateDoc.mock.calls,
        ...mockAlert.mock.calls,
        ...mockSetDiaryText.mock.calls,
        ...mockSetSelectedFeeling.mock.calls,
        ...mockSetSelectedImage.mock.calls,
        ...mockRouter.push.mock.calls
      ];

      // すべての期待される操作が実行されることを確認
      expect(mockDoc).toHaveBeenCalledTimes(2); // diary + feelingScore
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2); // diary + feelingScore
      expect(mockAlert).toHaveBeenCalledTimes(1); // 成功メッセージ
      expect(mockSetDiaryText).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedFeeling).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedImage).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });
  });
});