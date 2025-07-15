import { db } from '../../../../config';
import { doc, updateDoc } from 'firebase/firestore';

export default async function saveShowDiary(
  userId: string,
  friendId: string,
  newValue: boolean,
  setIsViewEnabled: (isViewEnabled: boolean) => void,
  isViewEnabled: boolean
) {
  try {
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    await updateDoc(friendRef, {
      showDiary: newValue
    });
    console.log('表示設定を更新しました:', newValue);
  } catch (error) {
    console.error('表示設定の更新に失敗しました:', error);
    // エラー時は元の状態に戻す
    setIsViewEnabled(isViewEnabled);
  }
}