/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import createMentalHealthCheckResult from '../createMentalHealthCheckResult';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

describe('createMentalHealthCheckResult', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockAddDoc: jest.MockedFunction<typeof addDoc>;
  let mockTimestampFromDate: jest.MockedFunction<typeof Timestamp.fromDate>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
    mockTimestampFromDate = Timestamp.fromDate as jest.MockedFunction<typeof Timestamp.fromDate>;

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'mentalHealthChecks' });
    (mockAddDoc as any).mockResolvedValue({ id: 'mock-doc-id' });
    (mockTimestampFromDate as any).mockReturnValue({ timestamp: 'mock-timestamp' });
  });

  describe('正常保存処理のテスト', () => {
    test('全ての必須データが正常に保存される', async () => {
      const testAnswers = [1, 2, 3, 4, 5];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;
      const testUserId = 'user-123';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);

      // 正しいデータでaddDocが呼ばれることを確認
      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        {
          answers: testAnswers,
          evaluation: testEvaluation,
          scoreA: testScoreA,
          scoreB: testScoreB,
          createdAt: { timestamp: 'mock-timestamp' }
        }
      );

      // Timestamp.fromDateが現在時刻で呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(expect.any(Date));

      // 成功ログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      // エラーアラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('null値を含むデータでも正常に保存される', async () => {
      const testAnswers = [1, null, 3, null, 5];
      const testEvaluation = '異常なし';
      const testScoreA = null;
      const testScoreB = null;
      const testUserId = 'user-null-data';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        {
          answers: testAnswers,
          evaluation: testEvaluation,
          scoreA: null,
          scoreB: null,
          createdAt: { timestamp: 'mock-timestamp' }
        }
      );

      expect(consoleSpy).toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      consoleSpy.mockRestore();
    });

    test('userIdがundefinedでも正常に処理される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要経過観察';
      const testScoreA = 20;
      const testScoreB = 35;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        undefined
      );

      // userIdがundefinedの場合のパス
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/mentalHealthChecks');

      expect(consoleSpy).toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      consoleSpy.mockRestore();
    });

    test('空の回答配列でも正常に保存される', async () => {
      const testAnswers: (number | null)[] = [];
      const testEvaluation = '未実施';
      const testScoreA = 0;
      const testScoreB = 0;
      const testUserId = 'user-empty-answers';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        {
          answers: [],
          evaluation: testEvaluation,
          scoreA: testScoreA,
          scoreB: testScoreB,
          createdAt: { timestamp: 'mock-timestamp' }
        }
      );

      expect(consoleSpy).toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      consoleSpy.mockRestore();
    });
  });

  describe('評価タイプ別のテスト', () => {
    test('要治療の評価が正常に保存される', async () => {
      const testAnswers = [4, 4, 4, 4, 4, 4];
      const testEvaluation = '要治療';
      const testScoreA = 31;
      const testScoreB = 39;
      const testUserId = 'user-severe';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          evaluation: '要治療',
          scoreA: 31,
          scoreB: 39
        })
      );
    });

    test('異常なしの評価が正常に保存される', async () => {
      const testAnswers = [0, 1, 0, 1, 0, 1];
      const testEvaluation = '異常なし';
      const testScoreA = 3;
      const testScoreB = 3;
      const testUserId = 'user-normal';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          evaluation: '異常なし',
          scoreA: 3,
          scoreB: 3
        })
      );
    });

    test('要経過観察の評価が正常に保存される', async () => {
      const testAnswers = [2, 2, 2, 2, 2, 2];
      const testEvaluation = '要経過観察';
      const testScoreA = 18;
      const testScoreB = 42;
      const testUserId = 'user-observation';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          evaluation: '要経過観察',
          scoreA: 18,
          scoreB: 42
        })
      );
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('addDocでエラーが発生した場合、エラーアラートが表示される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;
      const testUserId = 'user-addDoc-error';
      const mockError = new Error('Firestore addDoc error');

      (mockAddDoc as any).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      // エラーログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);

      // エラーアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith('メンタルヘルスチェック結果の保存に失敗しました');

      // 成功ログは出力されないことを確認
      expect(consoleSpy).not.toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      consoleSpy.mockRestore();
    });

    test('collectionでエラーが発生した場合、エラーアラートが表示される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;
      const testUserId = 'user-collection-error';
      const mockError = new Error('Firestore collection error');

      (mockCollection as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('メンタルヘルスチェック結果の保存に失敗しました');

      consoleSpy.mockRestore();
    });

    test('Timestamp.fromDateでエラーが発生した場合、エラーアラートが表示される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;
      const testUserId = 'user-timestamp-error';
      const mockError = new Error('Timestamp conversion error');

      (mockTimestampFromDate as any).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(consoleSpy).toHaveBeenCalledWith('error', mockError);
      expect(mockAlert).toHaveBeenCalledWith('メンタルヘルスチェック結果の保存に失敗しました');

      consoleSpy.mockRestore();
    });
  });

  describe('ユーザーIDのテスト', () => {
    test('特殊文字を含むユーザーIDでも正常に処理される', async () => {
      const testUserId = 'user@email.com';
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
    });

    test('非常に長いユーザーIDでも正常に処理される', async () => {
      const testUserId = 'a'.repeat(100);
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
    });

    test('数値のみのユーザーIDでも正常に処理される', async () => {
      const testUserId = '1234567890';
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/mentalHealthChecks`);
    });
  });

  describe('データ型のテスト', () => {
    test('負のスコアでも正常に保存される', async () => {
      const testAnswers = [-1, -2, -3];
      const testEvaluation = '特殊ケース';
      const testScoreA = -10;
      const testScoreB = -15;
      const testUserId = 'user-negative';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          answers: [-1, -2, -3],
          scoreA: -10,
          scoreB: -15
        })
      );
    });

    test('大きな数値のスコアでも正常に保存される', async () => {
      const testAnswers = [100, 200, 300];
      const testEvaluation = '高スコア';
      const testScoreA = 1000;
      const testScoreB = 2000;
      const testUserId = 'user-large-numbers';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          answers: [100, 200, 300],
          scoreA: 1000,
          scoreB: 2000
        })
      );
    });

    test('特殊文字を含む評価でも正常に保存される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療（重度）- 緊急対応必要 🚨';
      const testScoreA = 50;
      const testScoreB = 50;
      const testUserId = 'user-special-chars';

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          evaluation: '要治療（重度）- 緊急対応必要 🚨'
        })
      );
    });
  });

  describe('タイムスタンプ処理のテスト', () => {
    test('createdAtが現在時刻で正しく設定される', async () => {
      const testAnswers = [1, 2, 3];
      const testEvaluation = '要治療';
      const testScoreA = 25;
      const testScoreB = 40;
      const testUserId = 'user-timestamp';

      const fixedTime = new Date('2023-10-15T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation((() => fixedTime) as any);

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      // Timestamp.fromDateが固定時刻で呼ばれることを確認
      expect(mockTimestampFromDate).toHaveBeenCalledWith(fixedTime);

      (global.Date as any).mockRestore();
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量の回答データでも正常に処理される', async () => {
      const testAnswers = Array(1000).fill(1);
      const testEvaluation = '大量データテスト';
      const testScoreA = 500;
      const testScoreB = 500;
      const testUserId = 'user-large-data';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createMentalHealthCheckResult(
        testAnswers,
        testEvaluation,
        testScoreA,
        testScoreB,
        testUserId
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        { collection: 'mentalHealthChecks' },
        expect.objectContaining({
          answers: testAnswers
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith('メンタルヘルスチェック結果を保存しました');

      consoleSpy.mockRestore();
    });
  });
});