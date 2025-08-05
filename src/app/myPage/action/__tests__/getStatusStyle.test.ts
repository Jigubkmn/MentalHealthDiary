import getStatusStyle from '../getStatusStyle';

describe('getStatusStyle', () => {
  describe('既定のステータスのテスト', () => {
    test('blockステータスの場合、正しいスタイルが返される', () => {
      const result = getStatusStyle('block');
      expect(result).toEqual({
        text: 'ブロック中',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      });
    });

    test('unavailableステータスの場合、正しいスタイルが返される', () => {
      const result = getStatusStyle('unavailable');
      expect(result).toEqual({
        text: '閲覧不可',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      });
    });

    test('pendingステータスの場合、正しいスタイルが返される', () => {
      const result = getStatusStyle('pending');
      expect(result).toEqual({
        text: '申請中',
        backgroundColor: '#28C228',
        textColor: '#FFFFFF'
      });
    });

    test('awaitingApprovalステータスの場合、正しいスタイルが返される', () => {
      const result = getStatusStyle('awaitingApproval');
      expect(result).toEqual({
        text: '承認受付中 ',
        backgroundColor: '#28C228',
        textColor: '#FFFFFF'
      });
    });

    test('approvalステータスの場合、正しいスタイルが返される', () => {
      const result = getStatusStyle('approval');
      expect(result).toEqual({
        text: '承認済み',
        backgroundColor: '#FFA500',
        textColor: '#FFFFFF'
      });
    });
  });

  describe('未定義ステータスのテスト', () => {
    test('存在しないステータスの場合、デフォルトスタイルが返される', () => {
      const result = getStatusStyle('nonExistentStatus');
      expect(result).toEqual({
        text: '不明',
        backgroundColor: 'rgba(128, 128, 128, 0.6)',
        textColor: '#FFFFFF'
      });
    });

    test('空文字列の場合、デフォルトスタイルが返される', () => {
      const result = getStatusStyle('');
      expect(result).toEqual({
        text: '不明',
        backgroundColor: 'rgba(128, 128, 128, 0.6)',
        textColor: '#FFFFFF'
      });
    });

    test('ランダムな文字列の場合、デフォルトスタイルが返される', () => {
      const randomStatuses = ['random', 'test', 'invalid', '123', 'unknown'];
      randomStatuses.forEach(status => {
        const result = getStatusStyle(status);
        expect(result).toEqual({
          text: '不明',
          backgroundColor: 'rgba(128, 128, 128, 0.6)',
          textColor: '#FFFFFF'
        });
      });
    });
  });

  describe('大文字小文字のテスト', () => {
    test('大文字のステータスの場合、デフォルトスタイルが返される', () => {
      const upperCaseStatuses = ['BLOCK', 'PENDING', 'APPROVAL'];
      upperCaseStatuses.forEach(status => {
        const result = getStatusStyle(status);
        expect(result).toEqual({
          text: '不明',
          backgroundColor: 'rgba(128, 128, 128, 0.6)',
          textColor: '#FFFFFF'
        });
      });
    });

    test('混合ケースのステータスの場合、デフォルトスタイルが返される', () => {
      const mixedCaseStatuses = ['Block', 'Pending', 'Approval', 'AwaitingApproval'];
      mixedCaseStatuses.forEach(status => {
        const result = getStatusStyle(status);
        expect(result).toEqual({
          text: '不明',
          backgroundColor: 'rgba(128, 128, 128, 0.6)',
          textColor: '#FFFFFF'
        });
      });
    });
  });

  describe('特殊文字のテスト', () => {
    test('スペースを含むステータスの場合、デフォルトスタイルが返される', () => {
      const spacedStatuses = [' block', 'block ', ' pending ', 'awaiting approval'];
      spacedStatuses.forEach(status => {
        const result = getStatusStyle(status);
        expect(result).toEqual({
          text: '不明',
          backgroundColor: 'rgba(128, 128, 128, 0.6)',
          textColor: '#FFFFFF'
        });
      });
    });

    test('特殊文字を含むステータスの場合、デフォルトスタイルが返される', () => {
      const specialCharStatuses = ['block!', 'pending@', 'approval#', 'block-status', 'pending_status'];
      specialCharStatuses.forEach(status => {
        const result = getStatusStyle(status);
        expect(result).toEqual({
          text: '不明',
          backgroundColor: 'rgba(128, 128, 128, 0.6)',
          textColor: '#FFFFFF'
        });
      });
    });
  });

  describe('戻り値の型のテスト', () => {
    test('全ての戻り値がStatusStyle型の構造を持つ', () => {
      const validStatuses = ['block', 'unavailable', 'pending', 'awaitingApproval', 'approval'];
      validStatuses.forEach(status => {
        const result = getStatusStyle(status);
        // 型の構造を確認
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('backgroundColor');
        expect(result).toHaveProperty('textColor');
        // 値の型を確認
        expect(typeof result.text).toBe('string');
        expect(typeof result.backgroundColor).toBe('string');
        expect(typeof result.textColor).toBe('string');
        // 空文字列でないことを確認
        expect(result.text).toBeTruthy();
        expect(result.backgroundColor).toBeTruthy();
        expect(result.textColor).toBeTruthy();
      });
    });

    test('デフォルトの戻り値もStatusStyle型の構造を持つ', () => {
      const result = getStatusStyle('invalidStatus');
      // 型の構造を確認
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('backgroundColor');
      expect(result).toHaveProperty('textColor');
      // 値の型を確認
      expect(typeof result.text).toBe('string');
      expect(typeof result.backgroundColor).toBe('string');
      expect(typeof result.textColor).toBe('string');
      // 空文字列でないことを確認
      expect(result.text).toBeTruthy();
      expect(result.backgroundColor).toBeTruthy();
      expect(result.textColor).toBeTruthy();
    });
  });

  describe('スタイル値の検証', () => {
    test('backgroundColor値が有効な色形式である', () => {
      const validStatuses = ['block', 'unavailable', 'pending', 'awaitingApproval', 'approval'];
      validStatuses.forEach(status => {
        const result = getStatusStyle(status);
        // HEX色形式またはRGBA形式の検証
        const isValidColor = /^#[0-9A-F]{6}$/i.test(result.backgroundColor) || /^rgba?\([^)]+\)$/i.test(result.backgroundColor);
        expect(isValidColor).toBe(true);
      });
    });

    test('textColor値が有効な色形式である', () => {
      const validStatuses = ['block', 'unavailable', 'pending', 'awaitingApproval', 'approval'];
      validStatuses.forEach(status => {
        const result = getStatusStyle(status);
        // HEX色形式またはRGBA形式の検証
        const isValidColor = /^#[0-9A-F]{6}$/i.test(result.textColor) || /^rgba?\([^)]+\)$/i.test(result.textColor);
        expect(isValidColor).toBe(true);
      });
    });

    test('デフォルトスタイルの色値が有効な形式である', () => {
      const result = getStatusStyle('invalidStatus');
      // backgroundColor の検証（RGBA形式）
      expect(/^rgba?\([^)]+\)$/i.test(result.backgroundColor)).toBe(true);
      // textColor の検証（HEX形式）
      expect(/^#[0-9A-F]{6}$/i.test(result.textColor)).toBe(true);
    });
  });

  describe('同一ステータスの一貫性テスト', () => {
    test('同じステータスを複数回呼び出しても同じ結果が返される', () => {
      const statuses = ['block', 'pending', 'approval', 'invalidStatus'];
      statuses.forEach(status => {
        const result1 = getStatusStyle(status);
        const result2 = getStatusStyle(status);
        const result3 = getStatusStyle(status);
        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
        expect(result1).toEqual(result3);
      });
    });
  });

  describe('日本語テキストの検証', () => {
    test('返されるテキストが適切な日本語である', () => {
      const expectedTexts = {
        'block': 'ブロック中',
        'unavailable': '閲覧不可',
        'pending': '申請中',
        'awaitingApproval': '承認受付中 ',
        'approval': '承認済み',
        'default': '不明'
      };
      Object.entries(expectedTexts).forEach(([status, expectedText]) => {
        const result = status === 'default'
          ? getStatusStyle('invalidStatus')
          : getStatusStyle(status);
        expect(result.text).toBe(expectedText);
        // 日本語文字が含まれることを確認（ひらがな、カタカナ、漢字）
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(result.text);
        expect(hasJapanese).toBe(true);
      });
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量の呼び出しでも正常に動作する', () => {
      const statuses = ['block', 'unavailable', 'pending', 'awaitingApproval', 'approval', 'invalid'];
      // 1000回の呼び出しテスト
      for (let i = 0; i < 1000; i++) {
        const randomStatus = statuses[i % statuses.length];
        const result = getStatusStyle(randomStatus);
        // 基本的な構造の確認
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('backgroundColor');
        expect(result).toHaveProperty('textColor');
      }
    });
  });
});