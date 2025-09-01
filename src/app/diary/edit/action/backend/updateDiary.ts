import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { db } from '../../../../../config';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import feelings from '../../../../constants/feelings';
import deleteImageFromFirebase from '../../../show/actions/backend/deleteImageFromFirebase';

export default async function updateDiary(
  diaryText: string,
  diaryId: string,
  date: dayjs.Dayjs,
  selectedFeeling: string | null,
  selectedImage: string | null,
  setDiaryText: (text: string) => void,
  setSelectedFeeling: (feeling: string | null) => void,
  setSelectedImage: (image: string | null) => void,
  userId?: string,
  originalImageUrl?: string | null
) {
  const router = useRouter();
  if (userId === null) return;
  if (!selectedFeeling) {
    Alert.alert("現在の感情を選択してください");
    return;
  }
  if (!diaryText || diaryText.trim() === '') {
    Alert.alert("日記内容を入力してください");
    return;
  }

  try {
    // 画像が変更された場合、古い画像をStorageから削除
    if (originalImageUrl && originalImageUrl !== selectedImage) {
      console.log('古い画像を削除中:', originalImageUrl);
      const deleteSuccess = await deleteImageFromFirebase(originalImageUrl);
      if (deleteSuccess) {
        console.log('古い画像の削除が完了しました');
      } else {
        console.warn('古い画像の削除に失敗しましたが、更新処理を継続します');
      }
    }

    // 体調のスコアを取得
    const feelingScore = feelings.find((feeling) => feeling.name === selectedFeeling)?.score;
    const diaryRef = doc(db, `diaries/${diaryId}`);
    await updateDoc(diaryRef, {
      diaryText: diaryText,
      diaryDate: Timestamp.fromDate(date.toDate()),
      feeling: selectedFeeling,
      diaryImage: selectedImage,
      updatedAt: Timestamp.fromDate(new Date())
    });

    const feelingScoresRef = doc(db, `users/${userId}/feelingScores/${diaryId}`);
    await updateDoc(feelingScoresRef, {
      feelingScore: feelingScore,
      diaryDate: Timestamp.fromDate(date.toDate()),
      updatedAt: Timestamp.fromDate(new Date()),
    });

    Alert.alert("日記を更新しました");
    // 状態をリセット
    setDiaryText("");
    setSelectedFeeling(null);
    setSelectedImage(null);
    router.push("/(tabs)");
  } catch (error) {
    console.log("error", error);
    Alert.alert("日記の更新に失敗しました");
  }
}