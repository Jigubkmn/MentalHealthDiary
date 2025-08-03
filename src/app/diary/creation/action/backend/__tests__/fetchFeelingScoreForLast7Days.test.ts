/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import fetchFeelingScoreForLast7Days from '../fetchFeelingScoreForLast7Days';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

describe('fetchFeelingScoreForLast7Days', () => {
  let mockCollection: jest.MockedFunction<typeof collection>;
  let mockGetDocs: jest.MockedFunction<typeof getDocs>;
  let mockQuery: jest.MockedFunction<typeof query>;
  let mockOrderBy: jest.MockedFunction<typeof orderBy>;
  let mockWhere: jest.MockedFunction<typeof where>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockRouter: { push: jest.MockedFunction<any> };

  beforeEach(() => {
    // モック関数を取得
    mockCollection = collection as jest.MockedFunction<typeof collection>;
    mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
    mockWhere = where as jest.MockedFunction<typeof where>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

    // ルーターのモック
    mockRouter = { push: jest.fn() };

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockCollection as any).mockReturnValue({ collection: 'feelingScores' });
    (mockOrderBy as any).mockReturnValue({ orderBy: 'diaryDate' });
    (mockWhere as any).mockReturnValue({ where: 'mock' });
    (mockQuery as any).mockReturnValue({ query: 'mock' });
    (mockUseRouter as any).mockReturnValue(mockRouter);
  });

  describe('正常ケースのテスト', () => {
    test('過去7日間の感情スコアが正常に取得される', async () => {
      const testUserId = 'test-user-123';
      const testDiaryDate = { toDate: () => new Date('2023-10-15') } as any;

      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: { toDate: () => new Date('2023-10-15') },
              feelingScore: 8
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date('2023-10-14') },
              feelingScore: 6
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      // Firestoreクエリが正しく構築されることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores`);
      expect(mockOrderBy).toHaveBeenCalledWith('diaryDate', 'desc');
      expect(mockWhere).toHaveBeenCalledTimes(2);

      // 結果が配列として返される
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(7);
    });

    test('データが存在しない場合、nullの配列が返される', async () => {
      const testUserId = 'test-user-no-data';
      const testDiaryDate = { toDate: () => new Date('2023-10-15') } as any;

      const mockEmptySnapshot = { docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockEmptySnapshot);

      const result = await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      expect(result).toEqual([null, null, null, null, null, null, null]);
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('メンタルヘルスチェック条件のテスト', () => {
    test('条件を満たす場合、アラートが表示される', async () => {
      const testUserId = 'test-user-alert';
      
      // 今日の日付でテスト
      const today = new Date();
      const testDiaryDate = { toDate: () => today } as any;

      // 条件を満たすデータ：4個のデータで合計-30
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: { toDate: () => today },
              feelingScore: -10
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 24 * 60 * 60 * 1000) },
              feelingScore: -8
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
              feelingScore: -7
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
              feelingScore: -5
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      // アラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith(
        '日記を作成しました',
        '最近、体調が悪化しているようです。\n1度、メンタルヘルスチェックを行いませんか？',
        expect.arrayContaining([
          expect.objectContaining({
            text: '実施しない',
            style: 'cancel'
          }),
          expect.objectContaining({
            text: '実施する'
          })
        ])
      );
    });

    test('データ数が4個未満の場合、アラートは表示されない', async () => {
      const testUserId = 'test-user-insufficient-data';
      const today = new Date();
      const testDiaryDate = { toDate: () => today } as any;

      // 3個のデータで合計-30（条件の合計は満たすがデータ数が不足）
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: { toDate: () => today },
              feelingScore: -10
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 24 * 60 * 60 * 1000) },
              feelingScore: -10
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
              feelingScore: -10
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('合計スコアが-25を超える場合、アラートは表示されない', async () => {
      const testUserId = 'test-user-high-score';
      const today = new Date();
      const testDiaryDate = { toDate: () => today } as any;

      // 4個のデータで合計-20（データ数は満たすが合計が高すぎる）
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: { toDate: () => today },
              feelingScore: -5
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 24 * 60 * 60 * 1000) },
              feelingScore: -5
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
              feelingScore: -5
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
              feelingScore: -5
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('diaryDateが今日でない場合、アラートは表示されない', async () => {
      const testUserId = 'test-user-not-today';
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const testDiaryDate = { toDate: () => yesterday } as any;

      // 条件を満たすデータだが、作成日が今日でない
      const mockSnapshot = {
        docs: [
          {
            data: () => ({
              diaryDate: { toDate: () => yesterday },
              feelingScore: -10
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(yesterday.getTime() - 24 * 60 * 60 * 1000) },
              feelingScore: -8
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000) },
              feelingScore: -7
            })
          },
          {
            data: () => ({
              diaryDate: { toDate: () => new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000) },
              feelingScore: -5
            })
          }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('アラートのコールバック処理テスト', () => {
    test('「実施しない」を選択した場合、確認アラートが表示される', async () => {
      const testUserId = 'test-user-cancel';
      const today = new Date();
      const testDiaryDate = { toDate: () => today } as any;

      const mockSnapshot = {
        docs: [
          { data: () => ({ diaryDate: { toDate: () => today }, feelingScore: -10 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 24 * 60 * 60 * 1000) }, feelingScore: -8 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) }, feelingScore: -7 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) }, feelingScore: -5 }) }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      // 「実施しない」のonPressコールバックを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const cancelButton = buttons![0];
      
      cancelButton.onPress!();

      // 確認アラートが表示される
      expect(mockAlert).toHaveBeenCalledTimes(2);
      expect(mockAlert).toHaveBeenNthCalledWith(2,
        'かしこまりました',
        '無理せず、まずはゆっくり休んでくださいね。ご自身の心と体を一番に。'
      );
    });

    test('「実施する」を選択した場合、メンタルヘルスチェック画面に遷移する', async () => {
      const testUserId = 'test-user-proceed';
      const today = new Date();
      const testDiaryDate = { toDate: () => today } as any;

      const mockSnapshot = {
        docs: [
          { data: () => ({ diaryDate: { toDate: () => today }, feelingScore: -10 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 24 * 60 * 60 * 1000) }, feelingScore: -8 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) }, feelingScore: -7 }) },
          { data: () => ({ diaryDate: { toDate: () => new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) }, feelingScore: -5 }) }
        ]
      };

      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      // 「実施する」のonPressコールバックを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const proceedButton = buttons![1];
      
      proceedButton.onPress!();

      // ナビゲーションが実行される
      expect(mockRouter.push).toHaveBeenCalledWith('mentalHealthCheck/creation/mentalHealthCheckCreate');
    });
  });

  describe('入力パラメータのテスト', () => {
    test('userIdがundefinedでも正常に処理される', async () => {
      const testDiaryDate = { toDate: () => new Date('2023-10-15') } as any;

      const mockSnapshot = { docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFeelingScoreForLast7Days(undefined, testDiaryDate);

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'users/undefined/feelingScores');
      expect(result).toEqual([null, null, null, null, null, null, null]);
    });

    test('diaryDateがundefinedでも正常に処理される', async () => {
      const testUserId = 'test-user-no-date';

      const mockSnapshot = { docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      const result = await fetchFeelingScoreForLast7Days(testUserId, undefined);

      expect(result).toEqual([null, null, null, null, null, null, null]);
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('Firestoreエラーが発生した場合、空配列が返される', async () => {
      const testUserId = 'test-user-error';
      const testDiaryDate = { toDate: () => new Date('2023-10-15') } as any;
      const mockError = new Error('Firestore getDocs error');

      (mockGetDocs as any).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      expect(consoleSpy).toHaveBeenCalledWith('feelingScoreの取得に失敗しました:', mockError);
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('Firestoreクエリの詳細テスト', () => {
    test('正しいコレクションパスとクエリが構築される', async () => {
      const testUserId = 'query-test-user';
      const testDiaryDate = { toDate: () => new Date('2023-10-15') } as any;

      const mockSnapshot = { docs: [] };
      (mockGetDocs as any).mockResolvedValue(mockSnapshot);

      await fetchFeelingScoreForLast7Days(testUserId, testDiaryDate);

      // 正しいコレクションパスでcollectionが呼ばれることを確認
      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), `users/${testUserId}/feelingScores`);
      expect(mockOrderBy).toHaveBeenCalledWith('diaryDate', 'desc');
      expect(mockWhere).toHaveBeenCalledTimes(2);
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '>=', expect.any(Date));
      expect(mockWhere).toHaveBeenCalledWith('diaryDate', '<=', expect.any(Date));
    });
  });
});