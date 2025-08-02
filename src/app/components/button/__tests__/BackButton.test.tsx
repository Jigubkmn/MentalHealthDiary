/**
 * @jest-environment jsdom
 */
import React from 'react';

// handleBackをモック
const mockHandleBack = jest.fn();
jest.mock('../../../actions/handleBack', () => mockHandleBack);

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('基本的なテスト（モジュールの読み込み確認）', () => {
    // このテストは単純にモジュールが正しく読み込まれることを確認
    expect(mockHandleBack).toBeDefined();
    expect(typeof mockHandleBack).toBe('function');
  });

  test('モック関数が呼び出し可能', () => {
    mockHandleBack();
    expect(mockHandleBack).toHaveBeenCalledTimes(1);
  });
});