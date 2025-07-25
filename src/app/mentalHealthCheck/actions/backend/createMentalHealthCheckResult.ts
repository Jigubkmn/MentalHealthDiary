import { Alert } from 'react-native';
import { db } from '../../../../config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default async function createMentalHealthCheckResult(
  answers: (number | null)[],
  ScoreA: number | null,
  ScoreB: number | null,
  userId?: string
) {

  try {
    const ref = collection(db, `users/${userId}/mentalHealthChecks`);
    await addDoc(ref, {
      answers,
      ScoreA,
      ScoreB,
      userId,
      createdAt: Timestamp.fromDate(new Date())
    });

    console.log("メンタルヘルスチェック結果を保存しました");
  } catch (error) {
    console.log("error", error);
    Alert.alert("メンタルヘルスチェック結果の保存に失敗しました");
  }
}