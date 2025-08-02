import { Alert } from 'react-native';
import { db } from '../../../../../config';
import { doc, deleteDoc } from 'firebase/firestore';
import { router } from 'expo-router';


export default async function deleteDiary(userId?: string, diaryId?: string) {
  if (!userId || !diaryId) return;
    Alert.alert(
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
          onPress: async () => {
            try {
              const diaryRef = doc(db, `diaries/${diaryId}`);
              const feelingScoreRef = doc(db, `users/${userId}/feelingScores/${diaryId}`);
              await deleteDoc(diaryRef);
              await deleteDoc(feelingScoreRef);
              console.log('日記を削除しました');
              router.back();
            } catch (error) {
              console.error('日記の削除に失敗しました:', error);
              Alert.alert('エラー', '日記の削除に失敗しました。');
            }
          },
        },
      ]
    );
}
