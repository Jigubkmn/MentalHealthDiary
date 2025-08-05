import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import BackButton from '../BackButton';

// expo-routerをモック
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

describe('BackButton', () => {
  let mockRouterBack: jest.MockedFunction<typeof router.back>;

  beforeEach(() => {
    mockRouterBack = router.back as jest.MockedFunction<typeof router.back>;
    jest.clearAllMocks();
  });

  describe('レンダリングテスト', () => {
    test('コンポーネントが正しくレンダリングされる', () => {
      const { getByText } = render(<BackButton />);

      // "戻る"テキストが表示されることを確認
      expect(getByText('戻る')).toBeTruthy();
    });

    test('TouchableOpacityが存在する', () => {
      const { getByText } = render(<BackButton />);

      const backButtonText = getByText('戻る');
      expect(backButtonText).toBeTruthy();
    });
  });

  describe('ユーザーインタラクションテスト', () => {
    test('ボタンをタップするとrouter.back()が呼ばれる', () => {
      const { getByText } = render(<BackButton />);
      const backButton = getByText('戻る');
      fireEvent.press(backButton);
      // router.back()が1回呼ばれることを確認
      expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    test('複数回タップしても正しく動作する', () => {
      const { getByText } = render(<BackButton />);
      const backButton = getByText('戻る');

      // 3回タップ
      fireEvent.press(backButton);
      fireEvent.press(backButton);
      fireEvent.press(backButton);

      // router.back()が3回呼ばれることを確認
      expect(mockRouterBack).toHaveBeenCalledTimes(3);
    });
  });

  describe('スタイリングテスト', () => {
    test('正しいスタイルが適用されている', () => {
      const { getByText } = render(<BackButton />);
      const backButtonText = getByText('戻る');
      // テキストのスタイルを確認（color, fontSize等）
      expect(backButtonText.props.style).toMatchObject({
        fontSize: 16,
        lineHeight: 30,
        color: '#FFA500',
      });
    });
  });
});