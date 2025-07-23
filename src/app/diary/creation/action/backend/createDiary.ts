import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { db } from '../../../../../config';
import { collection, Timestamp, addDoc } from 'firebase/firestore';
import formatDate from '../../../../actions/formatData';
import { useRouter } from 'expo-router';
import checkExistingDiary from '../checkExistingDiary';
import feelings from '../../../../constants/feelings';

export default async function createDiary(
  selectedFeeling: string | null,
  selectedImage: string | null,
  date: dayjs.Dayjs,
  diaryText: string,
  setDiaryText: (text: string) => void,
  setSelectedFeeling: (feeling: string | null) => void,
  setSelectedImage: (image: string | null) => void,
  userId?: string
) {
  const router = useRouter();
  if (!userId) return;
  if (!selectedFeeling) {
    Alert.alert("現在の感情を選択してください");
    return;
  }
  if (!diaryText || diaryText.trim() === '') {
    Alert.alert("日記内容を入力してください");
    return;
  }

  // 同じ日付のデータが既に存在するかチェック
  const hasExistingDiary = await checkExistingDiary(userId, date);
  if (hasExistingDiary) {
    Alert.alert("エラー", `${formatDate(date)}の日記は既に存在します。`);
    return;
  }

  try {
    // 体調のスコアを取得
    const feelingScore = feelings.find((feeling) => feeling.name === selectedFeeling)?.score;
    const feelingScoresRef = collection(db, `users/${userId}/feelingScores`);
    await addDoc(feelingScoresRef, {
      feelingScore: feelingScore,
      diaryDate: Timestamp.fromDate(date.toDate()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
    const diariesRef = collection(db, `users/${userId}/diaries`);
    await addDoc(diariesRef, {
      diaryText,
      diaryDate: Timestamp.fromDate(date.toDate()),
      feeling: selectedFeeling,
      diaryImage: selectedImage,
      userId,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    Alert.alert("日記を保存しました");
    setDiaryText("");
    setSelectedFeeling(null);
    setSelectedImage(null);
    router.push("/(tabs)");
  } catch (error) {
    console.log("error", error);
    Alert.alert("日記の保存に失敗しました");
  }
}