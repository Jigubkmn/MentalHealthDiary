import { db } from '../../../../../config';
import { doc, getDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { MentalHealthCheckType } from '../../../../../../type/mentalHealthCheck';

type Props = {
  mentalHealthCheckId?: string;
  setSelectedMentalHealthCheckInfo: (selectedMentalHealthCheckInfo: MentalHealthCheckType) => void;
  userId?: string;
}

export default async function fetchSelectedMentalHealthCheck({ mentalHealthCheckId, setSelectedMentalHealthCheckInfo, userId }: Props) {
  try {
    const ref = doc(db, `users/${userId}/mentalHealthChecks/${mentalHealthCheckId}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const mentalHealthCheck: MentalHealthCheckType = {
        id: snap.id,
        answers: data.answers,
        evaluation: data.evaluation,
        scoreA: data.scoreA,
        scoreB: data.scoreB,
        createdAt: dayjs(data.createdAt.toDate()),
      };
      setSelectedMentalHealthCheckInfo(mentalHealthCheck);
    } else {
      console.log('対象データがありません。');
    }
  } catch (error) {
    console.error('対象データの取得に失敗しました。', error);
}
}