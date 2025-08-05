/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, getDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import fetchSelectedMentalHealthCheck from '../fetchSelectedMentalHealthCheck';

// 外部依存をモック
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

// console.log と console.error をモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchSelectedMentalHealthCheck', () => {
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockGetDoc: jest.MockedFunction<typeof getDoc>;
  let mockSetSelectedMentalHealthCheckInfo: jest.MockedFunction<any>;

  beforeEach(() => {
    // モック関数を取得
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
    mockSetSelectedMentalHealthCheckInfo = jest.fn();

    // モックをリセット
    jest.clearAllMocks();

    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ ref: 'mock-ref' });
  });

  afterAll(() => {
    // console モックを復元
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('正常系のテスト', () => {
    test('メンタルヘルスチェックデータが正常に取得・設定される', async () => {
      const mentalHealthCheckId = 'check-123';
      const userId = 'user-123';

      // モックデータの準備
      const mockSnapData = {
        answers: [1, 2, 3, 4, 5],
        evaluation: '要治療',
        scoreA: 31,
        scoreB: 39,
        createdAt: {
          toDate: () => new Date('2023-10-15T12:00:00Z')
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      // docが正しいパラメータで呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks/${mentalHealthCheckId}`);

      // getDocが呼ばれることを確認
      expect(mockGetDoc).toHaveBeenCalledWith({ ref: 'mock-ref' });

      // setSelectedMentalHealthCheckInfoが期待されるデータで呼ばれることを確認
      expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
        id: mentalHealthCheckId,
        answers: [1, 2, 3, 4, 5],
        evaluation: '要治療',
        scoreA: 31,
        scoreB: 39,
        createdAt: expect.any(dayjs)
      });

      // 引数のcreatedAtがdayjsオブジェクトであることを確認
      const calledArgs = mockSetSelectedMentalHealthCheckInfo.mock.calls[0][0];
      expect(calledArgs.createdAt).toBeInstanceOf(dayjs);
    });

    test('null値を含むデータも正しく処理される', async () => {
      const mentalHealthCheckId = 'check-null';
      const userId = 'user-null';

      const mockSnapData = {
        answers: null,
        evaluation: undefined,
        scoreA: null,
        scoreB: undefined,
        createdAt: {
          toDate: () => new Date('2023-10-15T10:00:00Z')
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
        id: mentalHealthCheckId,
        answers: null,
        evaluation: undefined,
        scoreA: null,
        scoreB: undefined,
        createdAt: expect.any(dayjs)
      });
    });

    test('異なる評価タイプのデータも正しく処理される', async () => {
      const testCases = [
        { evaluation: '異常なし', scoreA: 5, scoreB: 10 },
        { evaluation: '要経過観察', scoreA: 18, scoreB: 25 },
        { evaluation: '要治療（軽度）', scoreA: 25, scoreB: 35 },
        { evaluation: '要治療（重度）', scoreA: 40, scoreB: 50 }
      ];

      for (const testCase of testCases) {
        const mentalHealthCheckId = `check-${testCase.evaluation}`;
        const userId = 'user-evaluation';

        const mockSnapData = {
          answers: [1, 2, 3],
          evaluation: testCase.evaluation,
          scoreA: testCase.scoreA,
          scoreB: testCase.scoreB,
          createdAt: {
            toDate: () => new Date('2023-10-15T10:00:00Z')
          }
        };

        const mockSnap = {
          exists: () => true,
          id: mentalHealthCheckId,
          data: () => mockSnapData
        };

        (mockGetDoc as any).mockResolvedValue(mockSnap);

        await fetchSelectedMentalHealthCheck({
          mentalHealthCheckId,
          setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
          userId
        });

        expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
          id: mentalHealthCheckId,
          answers: [1, 2, 3],
          evaluation: testCase.evaluation,
          scoreA: testCase.scoreA,
          scoreB: testCase.scoreB,
          createdAt: expect.any(dayjs)
        });
      }
    });

    test('大きな配列のanswersも正しく処理される', async () => {
      const mentalHealthCheckId = 'check-large-answers';
      const userId = 'user-large';

      const largeAnswers = Array.from({ length: 50 }, (_, i) => i % 5);

      const mockSnapData = {
        answers: largeAnswers,
        evaluation: 'テスト用大量データ',
        scoreA: 100,
        scoreB: 200,
        createdAt: {
          toDate: () => new Date('2023-10-15T10:00:00Z')
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
        id: mentalHealthCheckId,
        answers: largeAnswers,
        evaluation: 'テスト用大量データ',
        scoreA: 100,
        scoreB: 200,
        createdAt: expect.any(dayjs)
      });
    });
  });

  describe('データが存在しない場合のテスト', () => {
    test('ドキュメントが存在しない場合、コンソールにメッセージが出力される', async () => {
      const mentalHealthCheckId = 'non-existent-check';
      const userId = 'user-123';

      const mockSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      // docとgetDocが呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks/${mentalHealthCheckId}`);
      expect(mockGetDoc).toHaveBeenCalledWith({ ref: 'mock-ref' });

      // setSelectedMentalHealthCheckInfoが呼ばれないことを確認
      expect(mockSetSelectedMentalHealthCheckInfo).not.toHaveBeenCalled();

      // console.logが正しいメッセージで呼ばれることを確認
      expect(mockConsoleLog).toHaveBeenCalledWith('対象データがありません。');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('getDocでエラーが発生した場合、エラーがコンソールに出力される', async () => {
      const mentalHealthCheckId = 'error-check';
      const userId = 'user-error';
      const mockError = new Error('Firestore error');

      (mockGetDoc as any).mockRejectedValue(mockError);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      // docとgetDocが呼ばれることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks/${mentalHealthCheckId}`);
      expect(mockGetDoc).toHaveBeenCalledWith({ ref: 'mock-ref' });

      // setSelectedMentalHealthCheckInfoが呼ばれないことを確認
      expect(mockSetSelectedMentalHealthCheckInfo).not.toHaveBeenCalled();

      // console.errorが正しいメッセージとエラーで呼ばれることを確認
      expect(mockConsoleError).toHaveBeenCalledWith('対象データの取得に失敗しました。', mockError);
    });

    test('createdAt.toDate()でエラーが発生した場合、エラーがキャッチされる', async () => {
      const mentalHealthCheckId = 'date-error-check';
      const userId = 'user-date-error';

      const mockSnapData = {
        answers: [1, 2, 3],
        evaluation: '要治療',
        scoreA: 25,
        scoreB: 30,
        createdAt: {
          toDate: () => {
            throw new Error('Date conversion error');
          }
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      // エラーがキャッチされてconsole.errorが呼ばれることを確認
      expect(mockConsoleError).toHaveBeenCalledWith('対象データの取得に失敗しました。', expect.any(Error));

      // setSelectedMentalHealthCheckInfoが呼ばれないことを確認
      expect(mockSetSelectedMentalHealthCheckInfo).not.toHaveBeenCalled();
    });

    test('snap.data()でエラーが発生した場合、エラーがキャッチされる', async () => {
      const mentalHealthCheckId = 'data-error-check';
      const userId = 'user-data-error';

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => {
          throw new Error('Data extraction error');
        }
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      // エラーがキャッチされてconsole.errorが呼ばれることを確認
      expect(mockConsoleError).toHaveBeenCalledWith('対象データの取得に失敗しました。', expect.any(Error));

      // setSelectedMentalHealthCheckInfoが呼ばれないことを確認
      expect(mockSetSelectedMentalHealthCheckInfo).not.toHaveBeenCalled();
    });
  });

  describe('パラメータのテスト', () => {
    test('mentalHealthCheckIdがundefinedの場合も正しくパスが構築される', async () => {
      const userId = 'user-undefined-id';

      const mockSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId: undefined,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks/undefined`);
    });

    test('userIdがundefinedの場合も正しくパスが構築される', async () => {
      const mentalHealthCheckId = 'check-undefined-user';

      const mockSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId: undefined
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/undefined/mentalHealthChecks/${mentalHealthCheckId}`);
    });

    test('特殊文字を含むIDでも正しく処理される', async () => {
      const mentalHealthCheckId = 'check@special#123';
      const userId = 'user@email.com';

      const mockSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${userId}/mentalHealthChecks/${mentalHealthCheckId}`);
    });

    test('非常に長いIDでも正しく処理される', async () => {
      const longMentalHealthCheckId = 'a'.repeat(100);
      const longUserId = 'b'.repeat(100);

      const mockSnap = {
        exists: () => false
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId: longMentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId: longUserId
      });

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), `users/${longUserId}/mentalHealthChecks/${longMentalHealthCheckId}`);
    });
  });

  describe('日付変換のテスト', () => {
    test('異なる日付形式でも正しくdayjsオブジェクトに変換される', async () => {
      const testDates = [
        new Date('2023-01-01T00:00:00Z'),
        new Date('2023-12-31T23:59:59Z'),
        new Date('2024-02-29T12:00:00Z'), // うるう年
        new Date('2023-06-15T14:30:45.123Z') // ミリ秒付き
      ];

      for (const testDate of testDates) {
        const mentalHealthCheckId = `check-${testDate.getTime()}`;
        const userId = 'user-date-test';

        const mockSnapData = {
          answers: [1, 2, 3],
          evaluation: '要治療',
          scoreA: 25,
          scoreB: 30,
          createdAt: {
            toDate: () => testDate
          }
        };

        const mockSnap = {
          exists: () => true,
          id: mentalHealthCheckId,
          data: () => mockSnapData
        };

        (mockGetDoc as any).mockResolvedValue(mockSnap);

        await fetchSelectedMentalHealthCheck({
          mentalHealthCheckId,
          setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
          userId
        });

        const calledArgs = mockSetSelectedMentalHealthCheckInfo.mock.calls.slice(-1)[0][0];
        expect(calledArgs.createdAt).toBeInstanceOf(dayjs);
        expect(calledArgs.createdAt.toDate().getTime()).toBe(testDate.getTime());
      }
    });
  });

  describe('データ型のテスト', () => {
    test('数値のスコアが正しく処理される', async () => {
      const mentalHealthCheckId = 'check-numbers';
      const userId = 'user-numbers';

      const mockSnapData = {
        answers: [0, 1, 2, 3, 4],
        evaluation: '数値テスト',
        scoreA: 12.5, // 小数点
        scoreB: -5, // 負の数
        createdAt: {
          toDate: () => new Date('2023-10-15T10:00:00Z')
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
        id: mentalHealthCheckId,
        answers: [0, 1, 2, 3, 4],
        evaluation: '数値テスト',
        scoreA: 12.5,
        scoreB: -5,
        createdAt: expect.any(dayjs)
      });
    });

    test('日本語を含む評価文字列が正しく処理される', async () => {
      const mentalHealthCheckId = 'check-japanese';
      const userId = 'user-japanese';

      const mockSnapData = {
        answers: [1, 2, 3],
        evaluation: '要治療（精神的ストレスが非常に高い状態です）',
        scoreA: 35,
        scoreB: 45,
        createdAt: {
          toDate: () => new Date('2023-10-15T10:00:00Z')
        }
      };

      const mockSnap = {
        exists: () => true,
        id: mentalHealthCheckId,
        data: () => mockSnapData
      };

      (mockGetDoc as any).mockResolvedValue(mockSnap);

      await fetchSelectedMentalHealthCheck({
        mentalHealthCheckId,
        setSelectedMentalHealthCheckInfo: mockSetSelectedMentalHealthCheckInfo,
        userId
      });

      expect(mockSetSelectedMentalHealthCheckInfo).toHaveBeenCalledWith({
        id: mentalHealthCheckId,
        answers: [1, 2, 3],
        evaluation: '要治療（精神的ストレスが非常に高い状態です）',
        scoreA: 35,
        scoreB: 45,
        createdAt: expect.any(dayjs)
      });
    });
  });
});