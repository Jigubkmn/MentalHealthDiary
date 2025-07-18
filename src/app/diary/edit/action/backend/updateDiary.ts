import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { db } from '../../../../../config';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';

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
    const diaryRef = doc(db, `users/${userId}/diary/${diaryId}`);
    await updateDoc(diaryRef, {
      diaryText: diaryText,
      diaryDate: Timestamp.fromDate(date.toDate()),
      feeling: selectedFeeling,
      selectedImage: selectedImage,
      updatedAt: Timestamp.fromDate(new Date())
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