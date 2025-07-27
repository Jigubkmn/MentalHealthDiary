import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { db } from '../../../../../config';
import { collection, Timestamp, addDoc, setDoc, doc } from 'firebase/firestore';
import formatDate from '../../../../actions/formatData';
import { useRouter } from 'expo-router';
import checkExistingDiary from '../checkExistingDiary';
import feelings from '../../../../constants/feelings';
import fetchFeelingScoreForLast7Days from './fetchFeelingScoreForLast7Days';

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
    const diariesRef = collection(db, `users/${userId}/diaries`);
    // 日記を保存してIDを取得
    const diaryDocRef = await addDoc(diariesRef, {
      diaryText,
      diaryDate: Timestamp.fromDate(date.toDate()),
      feeling: selectedFeeling,
      diaryImage: selectedImage,
      userId,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    // feelingScoresを同じIDで保存
    const feelingScoresRef = doc(db, `users/${userId}/feelingScores`, diaryDocRef.id);
    await setDoc(feelingScoresRef, {
      feelingScore: feelingScore,
      diaryDate: Timestamp.fromDate(date.toDate()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
    setDiaryText("");
    setSelectedFeeling(null);
    setSelectedImage(null);
    // データ保存完了後、feelingScoreチェックを実行
    await fetchFeelingScoreForLast7Days(userId);
    router.push("/(tabs)");
  } catch (error) {
    console.log("error", error);
    Alert.alert("日記の保存に失敗しました");
  }
}