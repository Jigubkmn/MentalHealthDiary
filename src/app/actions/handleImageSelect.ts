import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import uploadImageToFirebase from './uploadImageToFirebase';

// 画像選択ボタンの処理
export default async function handleImageSelect(
  userId?: string,
  folder: 'userImages' | 'diaryImages' = 'diaryImages'
): Promise<string | null> {
  try {
    // カメラロールへのアクセス許可をリクエスト
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('エラー', 'カメラロールへのアクセス許可が必要です');
      return null;
    }

    // 画像選択を実行
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;

      // Firebase Storageにアップロードする場合
      if (userId) {
        try {
          // ファイル名を生成（ユーザーID + タイムスタンプ + 拡張子）
          const timestamp = Date.now();
          const fileName = `${userId}_${timestamp}.jpg`;

          // Firebase Storageにアップロード
          const cloudUrl = await uploadImageToFirebase(localUri, folder, fileName);

          if (cloudUrl) {
            console.log('handleImageSelect: アップロード成功、クラウドURLを返します:', cloudUrl);
            return cloudUrl;
          } else {
            console.warn('Firebase Storageアップロードに失敗、ローカルURIを使用します');
            return localUri;
          }
        } catch (error) {
          console.error('クラウドアップロードエラー:', error);
          Alert.alert('警告', 'クラウドアップロードに失敗しました。ローカル保存を使用します。');
          return localUri;
        }
      }

      // userIdが指定されていない場合はローカルURIを返す
      return localUri;
    }

    // 画像が選択されなかった場合
    return null;
  } catch (error) {
    console.error('画像選択エラー:', error);
    Alert.alert('エラー', '画像の選択に失敗しました');
    return null;
  }
}