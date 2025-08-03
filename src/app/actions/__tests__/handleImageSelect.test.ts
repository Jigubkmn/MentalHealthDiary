import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import handleImageSelect from '../handleImageSelect';

// モックの設定
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('handleImageSelect', () => {
  let mockRequestPermissions: jest.MockedFunction<typeof ImagePicker.requestMediaLibraryPermissionsAsync>;
  let mockLaunchImageLibrary: jest.MockedFunction<typeof ImagePicker.launchImageLibraryAsync>;
  let mockAlert: jest.MockedFunction<typeof Alert.alert>;

  beforeEach(() => {
    // モック関数を取得
    mockRequestPermissions = ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<typeof ImagePicker.requestMediaLibraryPermissionsAsync>;
    mockLaunchImageLibrary = ImagePicker.launchImageLibraryAsync as jest.MockedFunction<typeof ImagePicker.launchImageLibraryAsync>;
    mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    // モックをリセット
    jest.clearAllMocks();
  });

  describe('画像選択成功時のテスト', () => {
    test('画像選択が成功した場合、画像URIが返される', async () => {
      // 権限許可をモック
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      // 画像選択成功をモック
      const mockImageUri = 'file://mock-image-uri.jpg';
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockImageUri }]
      } as unknown as ImagePicker.ImagePickerResult);
      const result = await handleImageSelect();
      // 権限リクエストが呼ばれることを確認
      expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
      // 画像選択が正しいオプションで呼ばれることを確認
      expect(mockLaunchImageLibrary).toHaveBeenCalledTimes(1);
      expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        aspect: [1, 1],
        quality: 0.8,
      });
      // 画像URIが返されることを確認
      expect(result).toBe(mockImageUri);
      // アラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('複数のアセットがある場合、最初のアセットのURIが返される', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      const mockImageUri1 = 'file://mock-image-uri-1.jpg';
      const mockImageUri2 = 'file://mock-image-uri-2.jpg';
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: [
          { uri: mockImageUri1 },
          { uri: mockImageUri2 }
        ]
      } as unknown as ImagePicker.ImagePickerResult);
      const result = await handleImageSelect();
      expect(result).toBe(mockImageUri1);
    });
  });

  describe('権限関連のテスト', () => {
    test('権限が拒否された場合、エラーアラートが表示されnullが返される', async () => {
      // 権限拒否をモック
      mockRequestPermissions.mockResolvedValue({ status: 'denied' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      const result = await handleImageSelect();
      // 権限リクエストが呼ばれることを確認
      expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
      // 画像選択が呼ばれないことを確認
      expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
      // エラーアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('エラー', 'カメラロールへのアクセス許可が必要です');
      // nullが返されることを確認
      expect(result).toBeNull();
    });

    test('権限が未決定の場合、エラーアラートが表示されnullが返される', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'undetermined' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      const result = await handleImageSelect();
      expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
      expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith('エラー', 'カメラロールへのアクセス許可が必要です');
      expect(result).toBeNull();
    });
  });

  describe('画像選択キャンセル時のテスト', () => {
    test('画像選択がキャンセルされた場合、nullが返される', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      // 画像選択キャンセルをモック
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: true,
        assets: []
      } as unknown as ImagePicker.ImagePickerResult);
      const result = await handleImageSelect();
      expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
      expect(mockLaunchImageLibrary).toHaveBeenCalledTimes(1);
      // nullが返されることを確認
      expect(result).toBeNull();
      // エラーアラートが表示されないことを確認
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('assetsが空の場合、nullが返される', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: []
      } as unknown as ImagePicker.ImagePickerResult);
      const result = await handleImageSelect();
      expect(result).toBeNull();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('assets[0]が存在しない場合、nullが返される', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: [null]
      } as unknown as ImagePicker.ImagePickerResult);
      const result = await handleImageSelect();
      expect(result).toBeNull();
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    test('権限リクエストでエラーが発生した場合、エラーハンドリングされる', async () => {
      const mockError = new Error('Permission request failed');
      mockRequestPermissions.mockRejectedValue(mockError);
      // console.errorをモック
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await handleImageSelect();
      // console.errorが呼ばれることを確認
      expect(consoleSpy).toHaveBeenCalledWith('画像選択エラー:', mockError);
      // エラーアラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith('エラー', '画像の選択に失敗しました');
      // nullが返されることを確認
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    test('画像選択でエラーが発生した場合、エラーハンドリングされる', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      const mockError = new Error('Image picker failed');
      mockLaunchImageLibrary.mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await handleImageSelect();
      expect(consoleSpy).toHaveBeenCalledWith('画像選択エラー:', mockError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '画像の選択に失敗しました');
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    test('予期しないエラーが発生した場合、適切にハンドリングされる', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockRequestPermissions.mockRejectedValue(unexpectedError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await handleImageSelect();
      expect(consoleSpy).toHaveBeenCalledWith('画像選択エラー:', unexpectedError);
      expect(mockAlert).toHaveBeenCalledWith('エラー', '画像の選択に失敗しました');
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('ImagePickerオプションのテスト', () => {
    test('正しいオプションでImagePickerが呼ばれる', async () => {
      mockRequestPermissions.mockResolvedValue({ status: 'granted' } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'mock-uri' }]
      } as unknown as ImagePicker.ImagePickerResult);
      await handleImageSelect();

      expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        aspect: [1, 1],
        quality: 0.8,
      });
    });
  });
});