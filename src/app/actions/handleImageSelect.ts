import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// 画像選択ボタンの処理
export default async function handleImageSelect(): Promise<string | null> {
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
      return result.assets[0].uri;
    }

    // 画像が選択されなかった場合
    return null;
  } catch (error) {
    console.error('画像選択エラー:', error);
    Alert.alert('エラー', '画像の選択に失敗しました');
    return null;
  }
}