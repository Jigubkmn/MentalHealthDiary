import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../../../../../config';

export default async function deleteImageFromFirebase(
  imageUrl: string
): Promise<boolean> {
  try {
    // URLが空文字またはnullの場合は削除不要
    if (!imageUrl || imageUrl.trim() === '') {
      console.log('画像URLが空のため、削除をスキップします');
      return true;
    }

    // Firebase StorageのURLから参照パスを抽出
    const imageRef = extractStorageReference(imageUrl);

    if (!imageRef) {
      console.warn('Firebase StorageのURLではないため、削除をスキップします:', imageUrl);
      return true;
    }

    // Firebase Storageから画像を削除
    console.log('Firebase Storageから画像を削除中:', imageRef);
    await deleteObject(imageRef);
    console.log('画像削除完了:', imageUrl);

    return true;
  } catch (error: unknown) {
    console.error('画像削除エラー:', error);

    // Firebase Storage特有のエラーハンドリング
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };

      switch (firebaseError.code) {
        case 'storage/object-not-found':
          // ファイルが存在しない場合は成功として扱う
          console.log('削除対象の画像が既に存在しません');
          return true;
        case 'storage/unauthorized':
          console.error('ストレージへのアクセス権限がありません');
          break;
        default:
          console.error('Firebase Storage削除エラー:', firebaseError.message);
          break;
      }
    }

    return false;
  }
}

function extractStorageReference(downloadUrl: string) {
  try {
    // Firebase StorageのURLパターンをチェック
    if (!downloadUrl.includes('firebasestorage.googleapis.com')) {
      return null;
    }

    // URLから「/o/」以降のパスを抽出
    const urlParts = downloadUrl.split('/o/');
    if (urlParts.length < 2) {
      return null;
    }

    // パス部分を取得し、クエリパラメータを除去
    const pathWithParams = urlParts[1];
    const pathOnly = pathWithParams.split('?')[0];

    // URLデコードしてパスを取得
    const decodedPath = decodeURIComponent(pathOnly);

    // Firebase Storageの参照を作成
    const storageRef = ref(storage, decodedPath);
    return storageRef;
  } catch (error) {
    console.error('URL解析エラー:', error);
    return null;
  }
}
