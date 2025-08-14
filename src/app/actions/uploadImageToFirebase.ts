import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config';
import { Alert } from 'react-native';

export default async function uploadImageToFirebase(
  imageUri: string,
  folder: 'userImages' | 'diaryImages',
  fileName: string
): Promise<string | null> {
  try {
    // ローカル画像をBlobに変換
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error('画像の読み込みに失敗しました');
    }
    const blob = await response.blob();
    console.log('Blob作成成功:', blob.size, 'bytes');

    // Firebase Storageの参照を作成
    const imageRef = ref(storage, `${folder}/${fileName}`);

    // メタデータを設定
    const metadata = {
      contentType: 'image/jpeg',
    };

    // 画像をアップロード
    console.log('Firebase Storageにアップロード中...');
    await uploadBytes(imageRef, blob, metadata);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(imageRef);
    console.log('アップロード完了:', downloadURL);

    return downloadURL;
  } catch (error: unknown) {
    console.error('画像アップロードエラー:', error);

    // より詳細なエラー情報を取得
    if (error && typeof error === 'object') {
      console.error('完全なエラーオブジェクト:', JSON.stringify(error, null, 2));

      // serverResponse がある場合は表示
      if ('serverResponse' in error) {
        console.error('サーバーレスポンス:', error.serverResponse);
      }
    }

    // エラーの詳細情報をログ出力
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      console.error('Firebase Storage エラーコード:', firebaseError.code);
      console.error('エラーメッセージ:', firebaseError.message);

      // Firebase Storage特有のエラーハンドリング
      switch (firebaseError.code) {
        case 'storage/unauthorized':
          Alert.alert('エラー', 'ストレージへのアクセス権限がありません');
          break;
        case 'storage/canceled':
          Alert.alert('エラー', 'アップロードがキャンセルされました');
          break;
        case 'storage/unknown':
          Alert.alert('エラー', 'アップロード中に不明なエラーが発生しました');
          break;
        default:
          Alert.alert('エラー', '画像のアップロードに失敗しました');
          break;
      }
    } else {
      Alert.alert('エラー', '画像の処理中にエラーが発生しました');
    }

    return null;
  }
}
