import getScoreResult from '../getScoreResult';

describe('getScoreResult', () => {
  describe('スコア計算のテスト', () => {
    test('正常な数値配列でスコアが正しく計算される', () => {
      const pageQuestionCount = 3;
      const answers = [1, 2, 3, 4, 5, 6];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(6); // 1 + 2 + 3
      expect(result.scoreB).toBe(15); // 4 + 5 + 6
    });

    test('null値が含まれる場合、0として計算される', () => {
      const pageQuestionCount = 2;
      const answers = [1, null, 3, null, 5];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(1); // 1 + 0
      expect(result.scoreB).toBe(8); // 3 + 0 + 5
    });

    test('全てnull値の場合、スコアは0になる', () => {
      const pageQuestionCount = 2;
      const answers = [null, null, null, null];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });

    test('空配列の場合、スコアは0になる', () => {
      const pageQuestionCount = 0;
      const answers: (number | null)[] = [];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });

    test('pageQuestionCountが配列長より大きい場合も正しく処理される', () => {
      const pageQuestionCount = 5;
      const answers = [1, 2, 3];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(6); // 1 + 2 + 3
      expect(result.scoreB).toBe(0); // 空配列
    });

    test('pageQuestionCountが0の場合、全ての値がscoreBに含まれる', () => {
      const pageQuestionCount = 0;
      const answers = [1, 2, 3, 4, 5];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(15); // 1 + 2 + 3 + 4 + 5
    });

    test('負の数値も正しく計算される', () => {
      const pageQuestionCount = 2;
      const answers = [-1, -2, 3, -4];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(-3); // -1 + (-2)
      expect(result.scoreB).toBe(-1); // 3 + (-4)
    });

    test('大きな数値でも正しく計算される', () => {
      const pageQuestionCount = 1;
      const answers = [1000, 2000, 3000];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(1000);
      expect(result.scoreB).toBe(5000); // 2000 + 3000
    });
  });

  describe('評価判定のテスト - 要治療', () => {
    test('scoreA >= 31 && scoreB <= 38の場合、要治療と判定される', () => {
      const pageQuestionCount = 2;
      // scoreA = 31, scoreB = 38になるように設定
      const answers = [15, 16, 19, 19];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(31);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('要治療');
    });

    test('scoreA >= 23 && scoreB >= 39の場合、要治療と判定される', () => {
      const pageQuestionCount = 2;
      // scoreA = 23, scoreB = 39になるように設定
      const answers = [11, 12, 20, 19];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(23);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療');
    });

    test('scoreA = 31, scoreB = 38の境界値で要治療と判定される', () => {
      const pageQuestionCount = 1;
      const answers = [31, 38];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(31);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('要治療');
    });

    test('scoreA = 23, scoreB = 39の境界値で要治療と判定される', () => {
      const pageQuestionCount = 1;
      const answers = [23, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(23);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療');
    });

    test('非常に高いスコアでも要治療と判定される', () => {
      const pageQuestionCount = 1;
      const answers = [50, 50];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(50);
      expect(result.scoreB).toBe(50);
      expect(result.evaluation).toBe('要治療');
    });
  });

  describe('評価判定のテスト - 異常なし', () => {
    test('scoreA <= 15 && scoreB <= 38の場合、異常なしと判定される', () => {
      const pageQuestionCount = 2;
      // scoreA = 15, scoreB = 38になるように設定
      const answers = [7, 8, 19, 19];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(15);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('異常なし');
    });

    test('scoreA = 15, scoreB = 38の境界値で異常なしと判定される', () => {
      const pageQuestionCount = 1;
      const answers = [15, 38];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(15);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('異常なし');
    });

    test('scoreA = 0, scoreB = 0で異常なしと判定される', () => {
      const pageQuestionCount = 2;
      const answers = [0, 0, 0, 0];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
      expect(result.evaluation).toBe('異常なし');
    });

    test('非常に低いスコアでも異常なしと判定される', () => {
      const pageQuestionCount = 1;
      const answers = [1, 1];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(1);
      expect(result.scoreB).toBe(1);
      expect(result.evaluation).toBe('異常なし');
    });
  });

  describe('評価判定のテスト - 要経過観察', () => {
    test('scoreA = 16, scoreB = 38で要経過観察と判定される（異常なしの境界を超える）', () => {
      const pageQuestionCount = 1;
      const answers = [16, 38];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(16);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('要経過観察');
    });

    test('scoreA = 15, scoreB = 39で要経過観察と判定される（異常なしの境界を超える）', () => {
      const pageQuestionCount = 1;
      const answers = [15, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(15);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要経過観察');
    });

    test('scoreA = 30, scoreB = 38で要経過観察と判定される（要治療の境界未満）', () => {
      const pageQuestionCount = 1;
      const answers = [30, 38];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(30);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('要経過観察');
    });

    test('scoreA = 22, scoreB = 39で要経過観察と判定される（要治療の境界未満）', () => {
      const pageQuestionCount = 1;
      const answers = [22, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(22);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要経過観察');
    });

    test('中間的なスコアで要経過観察と判定される', () => {
      const pageQuestionCount = 2;
      const answers = [10, 10, 20, 20];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(20);
      expect(result.scoreB).toBe(40);
      expect(result.evaluation).toBe('要経過観察');
    });
  });

  describe('境界値テスト', () => {
    test('要治療の境界値（scoreA = 30, scoreB = 39）', () => {
      const pageQuestionCount = 1;
      const answers = [30, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(30);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療'); // scoreA >= 23 && scoreB >= 39の条件に該当
    });

    test('異常なしと要経過観察の境界値（scoreA = 16, scoreB = 37）', () => {
      const pageQuestionCount = 1;
      const answers = [16, 37];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(16);
      expect(result.scoreB).toBe(37);
      expect(result.evaluation).toBe('要経過観察');
    });

    test('要治療と要経過観察の境界値（scoreA = 22, scoreB = 39）', () => {
      const pageQuestionCount = 1;
      const answers = [22, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(22);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要経過観察'); // scoreA < 23なので要治療の条件に該当しない
    });

    test('要治療と要経過観察の境界値（scoreA = 31, scoreB = 39）', () => {
      const pageQuestionCount = 1;
      const answers = [31, 39];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(31);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療'); // scoreA >= 31 && scoreB <= 38 は false だが、scoreA >= 23 && scoreB >= 39 は true
    });
  });

  describe('複雑なシナリオのテスト', () => {
    test('null値が混在する要治療のケース', () => {
      const pageQuestionCount = 3;
      const answers = [10, null, 21, 20, null, 19]; // scoreA = 31, scoreB = 39

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(31);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療');
    });

    test('null値が混在する異常なしのケース', () => {
      const pageQuestionCount = 4;
      const answers = [5, null, 5, 5, 10, null, 10, 18]; // scoreA = 15, scoreB = 38

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(15);
      expect(result.scoreB).toBe(38);
      expect(result.evaluation).toBe('異常なし');
    });

    test('単一の質問で各評価が決まるケース', () => {
      // 要治療のケース
      const result1 = getScoreResult(1, [31, 38]);
      expect(result1.evaluation).toBe('要治療');

      // 異常なしのケース
      const result2 = getScoreResult(1, [15, 38]);
      expect(result2.evaluation).toBe('異常なし');

      // 要経過観察のケース
      const result3 = getScoreResult(1, [16, 38]);
      expect(result3.evaluation).toBe('要経過観察');
    });

    test('非常に多くの質問がある場合', () => {
      const pageQuestionCount = 10;
      const answers = Array(20).fill(1); // 各スコアは10

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(10);
      expect(result.scoreB).toBe(10);
      expect(result.evaluation).toBe('異常なし');
    });

    test('負の値が含まれる複雑なケース', () => {
      const pageQuestionCount = 2;
      const answers = [20, 15, -5, 44]; // scoreA = 35, scoreB = 39

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result.scoreA).toBe(35);
      expect(result.scoreB).toBe(39);
      expect(result.evaluation).toBe('要治療');
    });
  });

  describe('戻り値の型テスト', () => {
    test('戻り値に必要なプロパティが全て含まれている', () => {
      const pageQuestionCount = 1;
      const answers = [1, 1];

      const result = getScoreResult(pageQuestionCount, answers);

      expect(result).toHaveProperty('scoreA');
      expect(result).toHaveProperty('scoreB');
      expect(result).toHaveProperty('evaluation');
      expect(typeof result.scoreA).toBe('number');
      expect(typeof result.scoreB).toBe('number');
      expect(typeof result.evaluation).toBe('string');
    });

    test('評価値が期待される値のいずれかである', () => {
      const validEvaluations = ['要治療', '異常なし', '要経過観察'];
      // 様々なスコアでテスト
      const testCases = [
        [31, 38], // 要治療
        [15, 38], // 異常なし
        [20, 40], // 要経過観察
      ];

      testCases.forEach(([scoreA, scoreB]) => {
        const result = getScoreResult(1, [scoreA, scoreB]);
        expect(validEvaluations).toContain(result.evaluation);
      });
    });
  });
});