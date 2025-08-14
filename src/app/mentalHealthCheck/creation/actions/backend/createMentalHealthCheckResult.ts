import { Alert } from 'react-native';
import { db } from '../../../../../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function createMentalHealthCheckResult(
  answers: (number | null)[],
  evaluation: string,
  scoreA: number | null,
  scoreB: number | null,
  userId?: string
) {

  try {
    const ref = collection(db, `users/${userId}/mentalHealthChecks`);
    await addDoc(ref, {
      answers,
      evaluation,
      scoreA,
      scoreB,
      createdAt: serverTimestamp()
    });

    console.log("メンタルヘルスチェック結果を保存しました");
  } catch (error) {
    console.log("error", error);
    Alert.alert("メンタルヘルスチェック結果の保存に失敗しました");
  }
}