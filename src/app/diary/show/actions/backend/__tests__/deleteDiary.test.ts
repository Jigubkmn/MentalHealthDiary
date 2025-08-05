/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import deleteDiary from '../deleteDiary';

// 外部依存をモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('../../../../../../config', () => ({
  db: {},
}));

describe('deleteDiary', () => {
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;
  let mockDoc: jest.MockedFunction<typeof doc>;
  let mockDeleteDoc: jest.MockedFunction<typeof deleteDoc>;
  let mockRouterBack: jest.MockedFunction<typeof router.back>;

  beforeEach(() => {
    // モック関数を取得
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    mockDoc = doc as jest.MockedFunction<typeof doc>;
    mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
    mockRouterBack = router.back as jest.MockedFunction<typeof router.back>;
    // モックをリセット
    jest.clearAllMocks();
    // デフォルトのモック設定
    (mockDoc as any).mockReturnValue({ ref: 'mock-doc-ref' });
    (mockDeleteDoc as any).mockResolvedValue(undefined);
  });

  describe('入力バリデーションのテスト', () => {
    test('userIdがundefinedの場合、処理が中断される', async () => {
      await deleteDiary(undefined, 'diary-123');
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockRouterBack).not.toHaveBeenCalled();
    });

    test('diaryIdがundefinedの場合、処理が中断される', async () => {
      await deleteDiary('user-123', undefined);
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockRouterBack).not.toHaveBeenCalled();
    });

    test('userIdとdiaryIdが両方undefinedの場合、処理が中断される', async () => {
      await deleteDiary(undefined, undefined);
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockRouterBack).not.toHaveBeenCalled();
    });

    test('userIdが空文字列の場合、処理が中断される', async () => {
      await deleteDiary('', 'diary-123');
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockRouterBack).not.toHaveBeenCalled();
    });
    test('diaryIdが空文字列の場合、処理が中断される', async () => {
      await deleteDiary('user-123', '');
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockRouterBack).not.toHaveBeenCalled();
    });
  });

  describe('確認アラートのテスト', () => {
    test('有効なパラメータの場合、確認アラートが表示される', async () => {
      await deleteDiary('user-123', 'diary-456');
      expect(mockAlert).toHaveBeenCalledWith(
        '日記を削除',
        'この日記を削除しますか？\nこの操作は取り消せません。',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '削除',
            style: 'destructive',
            onPress: expect.any(Function),
          },
        ]
      );
    });

    test('キャンセルボタンの設定が正しい', async () => {
      await deleteDiary('user-123', 'diary-456');
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const cancelButton = buttons![0];
      expect(cancelButton.text).toBe('キャンセル');
      expect(cancelButton.style).toBe('cancel');
      expect(cancelButton.onPress).toBeUndefined();
    });

    test('削除ボタンの設定が正しい', async () => {
      await deleteDiary('user-123', 'diary-456');
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      expect(deleteButton.text).toBe('削除');
      expect(deleteButton.style).toBe('destructive');
      expect(typeof deleteButton.onPress).toBe('function');
    });
  });

  describe('削除処理のテスト', () => {
    test('削除ボタンを押すと日記とfeelingScoreが正常に削除される', async () => {
      const testUserId = 'user-123';
      const testDiaryId = 'diary-456';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // 正しいドキュメント参照が作成されることを確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${testUserId}/feelingScores/${testDiaryId}`);
      // 削除処理が実行されることを確認
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockDeleteDoc).toHaveBeenNthCalledWith(1, { ref: 'mock-doc-ref' });
      expect(mockDeleteDoc).toHaveBeenNthCalledWith(2, { ref: 'mock-doc-ref' });
      // 成功ログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('日記を削除しました');
      // ナビゲーションが実行されることを確認
      expect(mockRouterBack).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    test('削除処理中にエラーが発生した場合、エラーハンドリングが実行される', async () => {
      const testUserId = 'user-error';
      const testDiaryId = 'diary-error';
      const mockError = new Error('Firestore delete error');
      (mockDeleteDoc as any).mockRejectedValueOnce(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // エラーログが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('日記の削除に失敗しました:', mockError);
      // エラーアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledTimes(2); // 最初の確認アラート + エラーアラート
      expect(mockAlert).toHaveBeenNthCalledWith(2, 'エラー', '日記の削除に失敗しました。');
      // ナビゲーションが実行されないことを確認
      expect(mockRouterBack).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('diaryの削除でエラーが発生した場合、feelingScoreの削除は実行されない', async () => {
      const testUserId = 'user-diary-error';
      const testDiaryId = 'diary-diary-error';
      const mockError = new Error('Diary delete error');
      (mockDeleteDoc as any).mockRejectedValueOnce(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // 1回目の削除（diary）でエラーが発生するため、2回目は実行されない
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('日記の削除に失敗しました:', mockError);
      consoleSpy.mockRestore();
    });

    test('feelingScoreの削除でエラーが発生した場合、エラーハンドリングが実行される', async () => {
      const testUserId = 'user-feeling-error';
      const testDiaryId = 'diary-feeling-error';
      const mockError = new Error('FeelingScore delete error');
      (mockDeleteDoc as any)
        .mockResolvedValueOnce(undefined) // 1回目（diary）は成功
        .mockRejectedValueOnce(mockError); // 2回目（feelingScore）は失敗
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // 両方の削除が試行されることを確認
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('日記の削除に失敗しました:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('ドキュメント参照のテスト', () => {
    test('正しいパスでドキュメント参照が作成される', async () => {
      const testUserId = 'special-user-123';
      const testDiaryId = 'special-diary-456';
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // 正確なパスでドキュメント参照が作成されることを確認
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${testUserId}/feelingScores/${testDiaryId}`);
    });

    test('特殊文字を含むIDでも正しくパスが構築される', async () => {
      const testUserId = 'user-with-special-chars_123';
      const testDiaryId = 'diary-with-special-chars_456';
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${testDiaryId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${testUserId}/feelingScores/${testDiaryId}`);
    });
  });

  describe('エッジケースのテスト', () => {
    test('非常に長いIDでも正常に処理される', async () => {
      const longUserId = 'a'.repeat(100);
      const longDiaryId = 'b'.repeat(100);
      await deleteDiary(longUserId, longDiaryId);
      expect(mockAlert).toHaveBeenCalledWith(
        '日記を削除',
        'この日記を削除しますか？\nこの操作は取り消せません。',
        expect.any(Array)
      );
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${longDiaryId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${longUserId}/feelingScores/${longDiaryId}`);
    });

    test('数値のみのIDでも正常に処理される', async () => {
      const numericUserId = '123456789';
      const numericDiaryId = '987654321';
      await deleteDiary(numericUserId, numericDiaryId);
      expect(mockAlert).toHaveBeenCalledTimes(1);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      expect(mockDoc).toHaveBeenNthCalledWith(1, expect.any(Object), `diaries/${numericDiaryId}`);
      expect(mockDoc).toHaveBeenNthCalledWith(2, expect.any(Object), `users/${numericUserId}/feelingScores/${numericDiaryId}`);
    });
  });

  describe('非同期処理のテスト', () => {
    test('削除処理が順次実行される', async () => {
      const testUserId = 'async-user';
      const testDiaryId = 'async-diary';
      // deleteDocの実行順序を追跡
      const executionOrder: string[] = [];
      (mockDeleteDoc as any).mockImplementation((ref: any) => {
        if (ref.ref === 'mock-doc-ref') {
          executionOrder.push('deleteDoc');
        }
        return Promise.resolve();
      });
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      // 両方の削除処理が実行されることを確認
      expect(executionOrder).toEqual(['deleteDoc', 'deleteDoc']);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
    });

    test('削除処理完了後にナビゲーションが実行される', async () => {
      const testUserId = 'nav-user';
      const testDiaryId = 'nav-diary';
      let deleteCompleted = false;
      (mockDeleteDoc as any).mockImplementation(() => {
        deleteCompleted = true;
        return Promise.resolve();
      });
      (mockRouterBack as any).mockImplementation(() => {
        // ナビゲーション実行時に削除が完了していることを確認
        expect(deleteCompleted).toBe(true);
      });
      await deleteDiary(testUserId, testDiaryId);
      // 削除ボタンのonPressを実行
      const alertCallArgs = mockAlert.mock.calls[0];
      const buttons = alertCallArgs[2];
      const deleteButton = buttons![1];
      await deleteButton.onPress!();
      expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });
  });
});